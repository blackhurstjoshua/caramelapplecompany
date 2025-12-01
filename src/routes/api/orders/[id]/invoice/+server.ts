import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { chromium } from 'playwright';
import { OrderService } from '$lib/services/orders';

// Generate a simple token for invoice access
function generateInvoiceToken(orderId: string): string {
  const timestamp = Date.now();
  const tokenData = `${orderId}:${timestamp}`;
  return btoa(tokenData);
}

export const GET: RequestHandler = async ({ params, url }) => {
  try {
    const orderId = params.id;
    
    if (!orderId) {
      throw error(400, 'Order ID is required');
    }
    
    // Verify order exists
    const orderDetails = await OrderService.getOrderDetails(orderId);
    
    if (!orderDetails) {
      throw error(404, 'Order not found');
    }
    
    // Generate access token for the public invoice route
    const token = generateInvoiceToken(orderId);
    
    // Launch Playwright browser
    const browser = await chromium.launch({
      headless: true
    });
    
    try {
      const context = await browser.newContext({
        // Set viewport to A4 paper size
        viewport: {
          width: 794, // A4 width at 96 DPI
          height: 1123 // A4 height at 96 DPI
        },
        deviceScaleFactor: 2 // Higher quality rendering for better SVG output
      });
      
      const page = await context.newPage();
      
      // Navigate to the public invoice page with token (uses InvoiceTemplate.svelte)
      const protocol = url.protocol;
      const host = url.host;
      const invoiceUrl = `${protocol}//${host}/invoice/${orderId}?token=${token}`;
      
      await page.goto(invoiceUrl, {
        waitUntil: 'networkidle'
      });
      
      // Wait a moment for any fonts/images to load
      await page.waitForTimeout(1000);
      
      // Generate PDF
      const pdfBuffer = await page.pdf({
        format: 'A4',
        margin: {
          top: '0.5in',
          right: '0.5in',
          bottom: '0.5in',
          left: '0.5in'
        },
        printBackground: true,
        preferCSSPageSize: false,
        scale: 1
      });
      
      await context.close();
      
      // Convert Buffer to Uint8Array for Response
      const pdfData = new Uint8Array(pdfBuffer);
      
      // Return PDF as download
      return new Response(pdfData, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="invoice-${orderId.substring(0, 8)}.pdf"`,
          'Cache-Control': 'no-cache'
        }
      });
    } finally {
      await browser.close();
    }
  } catch (err) {
    console.error('Error generating PDF invoice:', err);
    
    if (err && typeof err === 'object' && 'status' in err) {
      throw err;
    }
    
    throw error(500, 'Failed to generate PDF invoice. Please try again.');
  }
};
