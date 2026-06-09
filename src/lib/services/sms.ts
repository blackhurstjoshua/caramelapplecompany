import twilio from 'twilio';
import { buildInvoiceUrl } from '$lib/invoice-access';
import type { CheckoutRequest } from './checkout';
import { adminOrderSmsBody, orderConfirmationSmsBody, type OrderSmsTotals } from '$lib/sms-templates/order-sms';

type ItemWithName = CheckoutRequest['items'][number] & { product_name: string; price_cents: number };

/** Read runtime env (Netlify Functions inject into process.env, not $env/dynamic/private). */
function envVar(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value || undefined;
}

function resolveSiteUrl(): string | undefined {
  const siteUrl = envVar('SITE_URL');
  if (siteUrl) return siteUrl;

  return envVar('URL') ?? envVar('DEPLOY_PRIME_URL');
}

function parseOwnerPhones(): string[] {
  const ownerPhones = envVar('OWNER_SMS_PHONES');
  const devPhone = envVar('DEVELOPER_SMS_PHONE');
  const phones: string[] = [];
  if (ownerPhones) {
    phones.push(...ownerPhones.split(',').map((p) => p.trim()).filter(Boolean));
  }
  if (devPhone) {
    phones.push(devPhone);
  }
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
      const accountSid = envVar('TWILIO_ACCOUNT_SID');
      const authToken = envVar('TWILIO_AUTH_TOKEN');
      const messagingServiceSid = envVar('TWILIO_MSG_SERVICE_SID');
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
