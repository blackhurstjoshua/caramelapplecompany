import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { env } from '$env/dynamic/private';
import type { CheckoutRequest } from './checkout';
import { orderConfirmationEmail } from '$lib/email-templates/order-confirmation';
import { adminOrderNotificationEmail } from '$lib/email-templates/admin-order-notification';
import { OrderService } from './orders';
import { generateInvoicePdf } from './invoice-pdf';

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

export class EmailService {

  static async generateInvoiceAttachment(
    orderId: string
  ): Promise<nodemailer.SendMailOptions['attachments']> {
    try {
      const orderDetails = await OrderService.getOrderDetails(orderId);
      if (orderDetails) {
        const pdfBuffer = await generateInvoicePdf(orderDetails);
        return [{
          filename: `Invoice-${orderId.slice(0, 8).toUpperCase()}.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }];
      }
    } catch (pdfError) {
      console.warn('⚠️ Failed to generate invoice PDF, emails will send without attachment:', pdfError);
    }
    return [];
  }

  static async sendOrderConfirmationToCustomer(
    request: CheckoutRequest,
    orderId: string,
    attachments: nodemailer.SendMailOptions['attachments'] = []
  ): Promise<void> {
    try {
      const from = env.SMTP_FROM || env.SMTP_USER;
      const { subject, html } = orderConfirmationEmail(request.customer, request.order, orderId);

      await getTransporter().sendMail({
        from: `"Caramel Apple Co." <${from}>`,
        to: request.customer.email,
        subject,
        html,
        attachments
      });

      console.log(`✅ Order confirmation email sent to ${request.customer.email}`);
    } catch (error) {
      console.error('❌ Failed to send customer confirmation email:', error);
    }
  }

  static async sendOrderNotificationToAdmin(
    request: CheckoutRequest,
    orderId: string,
    attachments: nodemailer.SendMailOptions['attachments'] = []
  ): Promise<void> {
    try {
      const from = env.SMTP_FROM || env.SMTP_USER;
      const { subject, html } = adminOrderNotificationEmail(
        request.customer, request.order, request.items, orderId
      );

      await getTransporter().sendMail({
        from: `"Caramel Apple Co. Orders" <${from}>`,
        to: ADMIN_EMAIL,
        subject,
        html,
        attachments
      });

      console.log(`✅ Admin notification email sent to ${ADMIN_EMAIL}`);
    } catch (error) {
      console.error('❌ Failed to send admin notification email:', error);
    }
  }
}
