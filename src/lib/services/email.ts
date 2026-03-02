import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { env } from '$env/dynamic/private';
import type { CheckoutRequest } from './checkout';

const ADMIN_EMAIL = 'kristaleecook5@gmail.com';

let transporter: Transporter | null = null;

function getTransporter(): Transporter {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: Number(env.SSL_SMTP_PORT) || 465,
      secure: true,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS
      }
    });
  }
  return transporter;
}

function formatAddress(address: NonNullable<CheckoutRequest['order']['address']>): string {
  let line = address.addressLine1;
  if (address.addressLine2) line += `, ${address.addressLine2}`;
  line += `\n${address.city}, ${address.state} ${address.zip}`;
  return line;
}

function formatItemsHtml(items: CheckoutRequest['items']): string {
  return items
    .map(item => `<li>Product ID: ${item.product_id} &times; ${item.quantity}</li>`)
    .join('\n');
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return dateStr;
  }
}

export class EmailService {

  static async sendOrderConfirmationToCustomer(
    request: CheckoutRequest,
    orderId: string
  ): Promise<void> {
    try {
      const from = env.SMTP_FROM || env.SMTP_USER;
      const { customer, order } = request;

      const retrieval = order.retrieval_method === 'delivery'
        ? `Delivery to: ${order.address ? formatAddress(order.address) : 'address on file'}`
        : 'Pickup';

      await getTransporter().sendMail({
        from: `"Caramel Apple Co." <${from}>`,
        to: customer.email,
        subject: `Order Confirmed – Caramel Apple Co. (#${orderId.slice(0, 8)})`,
        html: `
          <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; color: #333;">
            <h1 style="color: #222; font-size: 24px;">Thank you, ${customer.name}!</h1>
            <p>Your order with Caramel Apple Co. has been confirmed.</p>

            <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
              <tr>
                <td style="padding: 8px 0; font-weight: 600;">Order ID</td>
                <td style="padding: 8px 0;">${orderId.slice(0, 8)}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: 600;">${order.retrieval_method === 'delivery' ? 'Delivery' : 'Pickup'} Date</td>
                <td style="padding: 8px 0;">${formatDate(order.delivery_date)}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: 600;">Retrieval</td>
                <td style="padding: 8px 0;">${retrieval}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: 600;">Payment</td>
                <td style="padding: 8px 0;">${order.payment_method === 'stripe' ? 'Paid online' : 'Pay on ' + order.retrieval_method}</td>
              </tr>
            </table>

            ${order.customizations ? `<p><strong>Special instructions:</strong> ${order.customizations}</p>` : ''}

            <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 24px 0;" />

            <h2 style="font-size: 16px; color: #222;">What happens next?</h2>
            <ol style="padding-left: 20px; line-height: 1.8;">
              <li>We'll prepare your order for ${formatDate(order.delivery_date)}.</li>
              <li>${order.retrieval_method === 'delivery' ? "We'll deliver it to the address you provided." : "You can pick it up at our location."}</li>
              <li>If we have any questions, we'll reach out to you.</li>
            </ol>

            <p style="margin-top: 24px; font-size: 14px; color: #666;">
              Questions? Reply to this email or call us at (801) 787-7288.
            </p>

            <p style="margin-top: 32px; font-size: 13px; color: #999;">
              &mdash; Caramel Apple Co.
            </p>
          </div>
        `
      });

      console.log(`✅ Order confirmation email sent to ${customer.email}`);
    } catch (error) {
      console.error('❌ Failed to send customer confirmation email:', error);
    }
  }

  static async sendOrderNotificationToAdmin(
    request: CheckoutRequest,
    orderId: string
  ): Promise<void> {
    try {
      const from = env.SMTP_FROM || env.SMTP_USER;
      const { customer, order, items } = request;

      const retrieval = order.retrieval_method === 'delivery'
        ? `Delivery to:\n${order.address ? formatAddress(order.address) : 'N/A'}`
        : 'Pickup';

      await getTransporter().sendMail({
        from: `"Caramel Apple Co. Orders" <${from}>`,
        to: ADMIN_EMAIL,
        subject: `New Order #${orderId.slice(0, 8)} – ${customer.name}`,
        html: `
          <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; color: #333;">
            <h1 style="color: #222; font-size: 24px;">New Order Received</h1>

            <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
              <tr>
                <td style="padding: 8px 0; font-weight: 600;">Order ID</td>
                <td style="padding: 8px 0;">${orderId}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: 600;">Customer</td>
                <td style="padding: 8px 0;">${customer.name}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: 600;">Email</td>
                <td style="padding: 8px 0;"><a href="mailto:${customer.email}">${customer.email}</a></td>
              </tr>
              ${customer.phone ? `
              <tr>
                <td style="padding: 8px 0; font-weight: 600;">Phone</td>
                <td style="padding: 8px 0;"><a href="tel:${customer.phone}">${customer.phone}</a></td>
              </tr>` : ''}
              <tr>
                <td style="padding: 8px 0; font-weight: 600;">${order.retrieval_method === 'delivery' ? 'Delivery' : 'Pickup'} Date</td>
                <td style="padding: 8px 0;">${formatDate(order.delivery_date)}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: 600;">Retrieval</td>
                <td style="padding: 8px 0;">${retrieval}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: 600;">Payment</td>
                <td style="padding: 8px 0;">${order.payment_method === 'stripe' ? 'Paid online (Stripe)' : 'Pay on ' + order.retrieval_method}</td>
              </tr>
            </table>

            <h2 style="font-size: 16px; color: #222;">Items</h2>
            <ul style="padding-left: 20px; line-height: 1.8;">
              ${formatItemsHtml(items)}
            </ul>

            ${order.customizations ? `<p><strong>Special instructions:</strong> ${order.customizations}</p>` : ''}
          </div>
        `
      });

      console.log(`✅ Admin notification email sent to ${ADMIN_EMAIL}`);
    } catch (error) {
      console.error('❌ Failed to send admin notification email:', error);
    }
  }
}
