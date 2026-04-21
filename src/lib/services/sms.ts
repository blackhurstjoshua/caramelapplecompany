import twilio from 'twilio';
import { env } from '$env/dynamic/private';
import type { CheckoutRequest } from './checkout';
import { adminOrderSmsBody, orderConfirmationSmsBody } from '$lib/sms-templates/order-sms';

type ItemWithName = CheckoutRequest['items'][number] & { product_name: string };

export class SmsService {
  /**
   * Sends transactional order SMS to owner (if configured) and optionally to customer (US E.164 + opt-in via validated phone).
   * Failures are logged; callers should not fail the order on SMS errors.
   */
  static async sendOrderNotifications(
    request: CheckoutRequest,
    orderId: string,
    itemsWithNames: ItemWithName[]
  ): Promise<void> {
    try {
      const accountSid = env.TWILIO_ACCOUNT_SID?.trim();
      const authToken = env.TWILIO_AUTH_TOKEN?.trim();
      const messagingServiceSid = env.TWILIO_MSG_SERVICE_SID?.trim();
      const ownerPhone = env.OWNER_SMS_PHONE?.trim();

      if (!accountSid || !authToken || !messagingServiceSid) {
        console.warn('SMS skipped: Twilio env not fully configured');
        return;
      }

      const client = twilio(accountSid, authToken);
      const customerTo = request.customer.phone?.trim() || undefined;

      const customerBody = orderConfirmationSmsBody(request.customer, request.order, orderId);
      const ownerBody = adminOrderSmsBody(request.customer, request.order, itemsWithNames, orderId);

      if (ownerPhone) {
        try {
          const msg = await client.messages.create({
            messagingServiceSid,
            to: ownerPhone,
            body: ownerBody
          });
          console.log(
            `✅ Owner SMS accepted by Twilio: sid=${msg.sid} status=${msg.status} to=${ownerPhone}`
          );
        } catch (err) {
          console.error('❌ Failed to send owner order SMS:', err);
        }
      }

      if (customerTo) {
        try {
          const msg = await client.messages.create({
            messagingServiceSid,
            to: customerTo,
            body: customerBody
          });
          console.log(
            `✅ Customer SMS accepted by Twilio: sid=${msg.sid} status=${msg.status} to=${customerTo}` +
              (msg.errorMessage ? ` errorMessage=${msg.errorMessage}` : '')
          );
        } catch (err) {
          console.error('❌ Failed to send customer order SMS:', err);
        }
      }
    } catch (err) {
      console.error('❌ SMS order notifications failed (non-fatal):', err);
    }
  }
}
