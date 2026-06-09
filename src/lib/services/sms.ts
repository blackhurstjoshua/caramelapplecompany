import twilio from 'twilio';
import { env } from '$env/dynamic/private';
import { buildInvoiceUrl } from '$lib/invoice-access';
import type { CheckoutRequest } from './checkout';
import { adminOrderSmsBody, orderConfirmationSmsBody, type OrderSmsTotals } from '$lib/sms-templates/order-sms';

type ItemWithName = CheckoutRequest['items'][number] & { product_name: string; price_cents: number };

function resolveSiteUrl(): string | undefined {
  const siteUrl = (env as Record<string, string | undefined>).SITE_URL?.trim();
  if (siteUrl) return siteUrl;

  const url = process.env.URL?.trim() || process.env.DEPLOY_PRIME_URL?.trim();
  return url || undefined;
}

function parseOwnerPhones(): string[] {
  const envVars = env as Record<string, string | undefined>;
  const ownerPhones = envVars.OWNER_SMS_PHONES?.trim();
  const devPhone = envVars.DEVELOPER_SMS_PHONE?.trim();
  const phones: string[] = [];
  if (ownerPhones) {
    phones.push(...ownerPhones.split(',').map((p) => p.trim()).filter(Boolean));
  }
  if (devPhone) {
    phones.push(devPhone);
  }
  console.log('phones:', phones);
  return phones;
}

export class SmsService {
  /**
   * Sends transactional order SMS via Twilio (Messaging Service = From identity).
   * Owner `to`: `OWNER_SMS_PHONES` plus optional `DEVELOPER_SMS_PHONE` (E.164); customer `to`: validated US mobile when set.
   * Failures are logged; callers should not fail the order on SMS errors.
   */
  static async sendOrderNotifications(
    request: CheckoutRequest,
    orderId: string,
    itemsWithNames: ItemWithName[],
    totals: OrderSmsTotals
  ): Promise<void> {
    try {
      const accountSid = env.TWILIO_ACCOUNT_SID?.trim();
      const authToken = env.TWILIO_AUTH_TOKEN?.trim();
      const messagingServiceSid = env.TWILIO_MSG_SERVICE_SID?.trim();
      const ownerPhones = parseOwnerPhones();

      if (!accountSid || !authToken || !messagingServiceSid) {
        console.warn('SMS skipped: Twilio env not fully configured');
        return;
      }

      const client = twilio(accountSid, authToken);
      const customerTo = request.customer.phone?.trim() || undefined;

      const siteUrl = resolveSiteUrl();
      const invoiceUrl = siteUrl ? buildInvoiceUrl(orderId, siteUrl) : undefined;
      if (!siteUrl) {
        console.warn('SMS: no SITE_URL or Netlify URL — admin SMS will omit invoice link');
      }

      const customerBody = orderConfirmationSmsBody(request.order);
      const ownerBody = adminOrderSmsBody(
        request.customer,
        request.order,
        itemsWithNames,
        orderId,
        totals,
        invoiceUrl
      );

      for (const ownerPhone of ownerPhones) {
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
          console.error(`❌ Failed to send owner order SMS to ${ownerPhone}:`, err);
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
