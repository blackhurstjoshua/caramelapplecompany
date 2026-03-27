import PDFDocument from 'pdfkit';
import type { OrderDetails } from './orders';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const TEXT_COLOR = '#3a3a3a';
const LIGHT_COLOR = '#666666';

const LEFT = 54;
const RIGHT = 558;
const CONTENT_WIDTH = RIGHT - LEFT; // 504pt

const COL_DESC_X = LEFT;
const COL_DESC_W = 254;
const COL_PRICE_X = COL_DESC_X + COL_DESC_W;
const COL_PRICE_W = 90;
const COL_QTY_X = COL_PRICE_X + COL_PRICE_W;
const COL_QTY_W = 60;
const COL_TOTAL_X = COL_QTY_X + COL_QTY_W;
const COL_TOTAL_W = 100;

function formatPrice(cents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(cents / 100);
}

function formatDate(dateString: string): string {
  const isTimestamp = dateString.includes('T');
  const date = isTimestamp
    ? new Date(dateString)
    : (() => { const [y, m, d] = dateString.split('-').map(Number); return new Date(y, m - 1, d); })();
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

function formatAddress(address: any): string[] {
  if (!address) return [];
  return [
    address.addressLine1,
    address.addressLine2,
    `${address.city}, ${address.state} ${address.zip}`
  ].filter(Boolean);
}

async function getLogoPng(): Promise<Buffer | null> {
  try {
    const sharp = (await import('sharp')).default;
    const logoPath = resolve('static/logo.svg');
    const svgBuffer = readFileSync(logoPath);
    return await sharp(svgBuffer).resize(120, 120).png().toBuffer();
  } catch {
    return null;
  }
}

function drawHLine(doc: PDFKit.PDFDocument, y: number) {
  doc.strokeColor(TEXT_COLOR).lineWidth(0.5)
    .moveTo(LEFT, y).lineTo(RIGHT, y).stroke();
}

export async function generateInvoicePdf(order: OrderDetails): Promise<Buffer> {
  const invoiceNumber = `INV-${order.id.substring(0, 8).toUpperCase()}`;
  const logoPng = await getLogoPng();

  return new Promise<Buffer>((res, rej) => {
    const doc = new PDFDocument({
      size: 'LETTER',
      margins: { top: 36, bottom: 36, left: LEFT, right: 54 }
    });

    const chunks: Buffer[] = [];
    doc.on('data', (c: Buffer) => chunks.push(c));
    doc.on('end', () => res(Buffer.concat(chunks)));
    doc.on('error', rej);

    let y = 36;

    // ── Header ──
    if (logoPng) {
      const logoSize = 90;
      doc.image(logoPng, (612 - logoSize) / 2, y, { width: logoSize, height: logoSize });
      y += logoSize + 6;
    }

    doc.font('Helvetica').fontSize(9).fillColor(TEXT_COLOR);
    doc.text('CARAMEL APPLE COMPANY', LEFT, y, {
      width: CONTENT_WIDTH,
      align: 'center',
      characterSpacing: 2
    });
    y += 16;

    doc.fontSize(8).fillColor(LIGHT_COLOR);
    doc.text('www.caramelapplecompany.com', LEFT, y, {
      width: CONTENT_WIDTH,
      align: 'center'
    });
    y += 28;

    // ── Customer / Invoice Info ──
    const infoTopY = y;

    doc.font('Helvetica-Bold').fontSize(9).fillColor(TEXT_COLOR);
    doc.text('ISSUED TO:', LEFT, y, { characterSpacing: 1 });
    y += 18;

    doc.font('Helvetica').fontSize(10);
    doc.text(order.customer.name, LEFT, y);
    y += 14;

    if (order.address && order.retrieval_method === 'delivery') {
      for (const line of formatAddress(order.address)) {
        doc.text(line, LEFT, y);
        y += 14;
      }
    }

    if (order.customer.phone) {
      doc.text(order.customer.phone, LEFT, y);
      y += 14;
    }

    // Right column: invoice number + date
    let rightY = infoTopY;
    doc.font('Helvetica-Bold').fontSize(9);
    doc.text('INVOICE NO:', COL_TOTAL_X, rightY, {
      width: COL_TOTAL_W,
      align: 'right',
      characterSpacing: 1
    });
    rightY += 18;

    doc.font('Helvetica-Bold').fontSize(10);
    doc.text(`#${invoiceNumber}`, COL_PRICE_X, rightY, {
      width: COL_PRICE_W + COL_QTY_W + COL_TOTAL_W,
      align: 'right'
    });
    rightY += 16;

    doc.font('Helvetica').fontSize(10);
    doc.text(formatDate(order.order_date), COL_PRICE_X, rightY, {
      width: COL_PRICE_W + COL_QTY_W + COL_TOTAL_W,
      align: 'right'
    });
    rightY += 14;

    const dateLabel = order.retrieval_method === 'pickup' ? 'Pickup' : 'Delivery';
    doc.text(`${dateLabel} Date: ${formatDate(order.delivery_date)}`, COL_PRICE_X, rightY, {
      width: COL_PRICE_W + COL_QTY_W + COL_TOTAL_W,
      align: 'right'
    });

    y = Math.max(y, rightY + 14) + 10;
    drawHLine(doc, y);
    y += 18;

    // ── Items Table Header ──
    doc.font('Helvetica-Bold').fontSize(9).fillColor(TEXT_COLOR);
    doc.text('DESCRIPTION', COL_DESC_X, y, { width: COL_DESC_W, characterSpacing: 1 });
    doc.text('UNIT PRICE', COL_PRICE_X, y, { width: COL_PRICE_W, align: 'right', characterSpacing: 1 });
    doc.text('QTY', COL_QTY_X, y, { width: COL_QTY_W, align: 'right', characterSpacing: 1 });
    doc.text('TOTAL', COL_TOTAL_X, y, { width: COL_TOTAL_W, align: 'right', characterSpacing: 1 });
    y += 16;
    drawHLine(doc, y);
    y += 14;

    // ── Item Rows ──
    doc.font('Helvetica').fontSize(10).fillColor(TEXT_COLOR);

    for (const item of order.order_items) {
      const name = item.product_snapshot?.name || item.product?.name || 'Unknown Product';
      doc.text(name, COL_DESC_X, y, { width: COL_DESC_W });
      doc.text(formatPrice(item.unit_price_cents), COL_PRICE_X, y, { width: COL_PRICE_W, align: 'right' });
      doc.text(String(item.quantity), COL_QTY_X, y, { width: COL_QTY_W, align: 'right' });
      doc.text(formatPrice(item.unit_price_cents * item.quantity), COL_TOTAL_X, y, { width: COL_TOTAL_W, align: 'right' });

      const nameHeight = doc.heightOfString(name, { width: COL_DESC_W });
      y += nameHeight;

      if (item.item_notes) {
        doc.fontSize(9).fillColor(LIGHT_COLOR);
        doc.text(item.item_notes, COL_DESC_X, y, { width: COL_DESC_W });
        y += doc.heightOfString(item.item_notes, { width: COL_DESC_W });
        doc.fontSize(10).fillColor(TEXT_COLOR);
      }

      y += 10;
    }

    if (order.delivery_fee_cents > 0) {
      doc.text('Delivery charge', COL_DESC_X, y, { width: COL_DESC_W });
      doc.text('n/a', COL_QTY_X, y, { width: COL_QTY_W, align: 'right' });
      doc.text(formatPrice(order.delivery_fee_cents), COL_TOTAL_X, y, { width: COL_TOTAL_W, align: 'right' });
      y += 24;
    }

    if (order.customizations) {
      doc.text('Special Instructions', COL_DESC_X, y, { width: COL_DESC_W });
      doc.text('Included', COL_TOTAL_X, y, { width: COL_TOTAL_W, align: 'right' });
      y += 14;
      doc.fontSize(9).fillColor(LIGHT_COLOR);
      doc.text(order.customizations, COL_DESC_X, y, { width: COL_DESC_W });
      y += doc.heightOfString(order.customizations, { width: COL_DESC_W });
      doc.fontSize(10).fillColor(TEXT_COLOR);
      y += 10;
    }

    // ── Totals ──
    y += 6;
    drawHLine(doc, y);
    y += 14;

    doc.font('Helvetica-Bold').fontSize(10);
    doc.text('TOTAL', LEFT, y, { characterSpacing: 1 });
    doc.font('Helvetica').fontSize(12);
    doc.text(formatPrice(order.total_cents), COL_PRICE_X, y, {
      width: COL_PRICE_W + COL_QTY_W + COL_TOTAL_W,
      align: 'right'
    });
    y += 20;
    drawHLine(doc, y);
    y += 18;

    const subtotalLabelX = RIGHT - 200;
    const subtotalValueX = RIGHT - 80;
    const subtotalValueW = 80;

    doc.font('Helvetica').fontSize(10).fillColor(TEXT_COLOR);

    doc.text('Subtotal', subtotalLabelX, y);
    doc.text(formatPrice(order.subtotal_cents), subtotalValueX, y, { width: subtotalValueW, align: 'right' });
    y += 16;

    if (order.delivery_fee_cents > 0) {
      doc.text('Delivery Fee', subtotalLabelX, y);
      doc.text(formatPrice(order.delivery_fee_cents), subtotalValueX, y, { width: subtotalValueW, align: 'right' });
      y += 16;
    }

    doc.text('Tax (8%)', subtotalLabelX, y);
    doc.text(formatPrice(order.tax_cents), subtotalValueX, y, { width: subtotalValueW, align: 'right' });
    y += 20;

    doc.font('Helvetica-Bold');
    doc.text('Amount due', subtotalLabelX, y);
    doc.text(formatPrice(order.total_cents), subtotalValueX, y, { width: subtotalValueW, align: 'right' });
    y += 30;

    // ── Payment Details ──
    doc.font('Helvetica-Bold').fontSize(9);
    doc.text('PAYMENT DETAILS', LEFT, y, { characterSpacing: 1 });
    y += 18;

    doc.font('Helvetica').fontSize(10);
    const paymentMethod = order.payment_method === 'stripe'
      ? 'Card (Stripe)'
      : `Pay on ${order.retrieval_method === 'pickup' ? 'Pickup' : 'Delivery'}`;
    doc.text(`Payment Method: ${paymentMethod}`, LEFT, y);
    y += 14;

    if (order.retrieval_method === 'pickup') {
      doc.text('Pickup at store location', LEFT, y);
    } else {
      doc.text(`Delivery Date: ${formatDate(order.delivery_date)}`, LEFT, y);
    }

    doc.end();
  });
}
