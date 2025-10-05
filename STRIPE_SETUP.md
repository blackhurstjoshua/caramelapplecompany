# Stripe Checkout Setup Guide

## Quick Setup Steps

### 1. Get API Keys from Stripe Dashboard

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. **Switch to Test Mode** (toggle in top-right corner)
3. Navigate to: **Developers** → **API keys**
4. Copy your keys:
   - **Secret key** (sk_test_...)
   - **Publishable key** (pk_test_...) - Not needed for server-only setup

### 2. Set Up Webhook Endpoint

1. Go to: **Developers** → **Webhooks**
2. Click **"Add endpoint"**
3. For local testing, you'll use Stripe CLI (see below)
4. For production: `https://yourdomain.com/api/stripe/webhook`
5. Select event: `checkout.session.completed`
6. Save and copy the **Signing secret** (whsec_...)

### 3. Add Environment Variables

Add to your `.env` file:

```bash
# Stripe Configuration (Test Mode)
STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET_HERE
```

---

## Local Testing with Stripe CLI

For local development, Stripe can't reach `http://localhost:5173`. Use the Stripe CLI to forward webhooks:

### Install Stripe CLI

**macOS:**
```bash
brew install stripe/stripe-cli/stripe
```

**Windows:**
```bash
scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git
scoop install stripe
```

**Linux:**
Download from: https://github.com/stripe/stripe-cli/releases/latest

### Login to Stripe

```bash
stripe login
```

This opens your browser to authorize the CLI with your Stripe account.

### Forward Webhooks to Local Server

```bash
# Start your dev server first
npm run dev

# In a separate terminal, run:
stripe listen --forward-to localhost:5173/api/stripe/webhook
```

**Important**: The CLI will output a webhook signing secret starting with `whsec_...`
Use this secret in your `.env` file as `STRIPE_WEBHOOK_SECRET` for local testing.

### Trigger Test Webhooks

You can manually trigger test webhooks:

```bash
stripe trigger checkout.session.completed
```

---

## Test Credit Cards

Stripe provides test cards that simulate different scenarios:

### Successful Payments
- **Card Number**: `4242 4242 4242 4242`
- **Expiry**: Any future date (e.g., 12/34)
- **CVC**: Any 3 digits (e.g., 123)
- **ZIP**: Any 5 digits (e.g., 12345)

### Other Test Cards
- **Declined**: `4000 0000 0000 0002`
- **Insufficient funds**: `4000 0000 0000 9995`
- **3D Secure required**: `4000 0025 0000 3155`
- **3D Secure (auth fails)**: `4000 0000 0000 9235`

Full list: https://stripe.com/docs/testing#cards

---

## Testing the Integration

### Complete Test Flow

1. **Start your dev server**: `npm run dev`
2. **Start Stripe webhook forwarding** (in separate terminal):
   ```bash
   stripe listen --forward-to localhost:5173/api/stripe/webhook
   ```
3. Go to `http://localhost:5173/order`
4. Add items to cart
5. Go through checkout and select **"Pay Now with Credit Card"**
6. You should redirect to Stripe's checkout page
7. Use test card: `4242 4242 4242 4242`
8. Complete payment
9. You should redirect back to success page
10. Check your terminal - you should see webhook logs
11. Check Supabase - order should be created in `orders` table

### What to Look For

**In Terminal:**
- ✅ Webhook received log
- ✅ Order created successfully message with order ID

**In Stripe Dashboard:**
- Go to **Payments** → You should see the test payment
- Go to **Developers** → **Webhooks** → Click your endpoint → See successful webhook deliveries

**In Supabase:**
- Check `customers` table - customer should be created/updated
- Check `orders` table - order should exist with `payment_method = 'stripe'`
- Check `order_items` table - items should be linked to order

---

## Troubleshooting

### Webhook Not Firing
- Make sure Stripe CLI is running: `stripe listen --forward-to localhost:5173/api/stripe/webhook`
- Check the signing secret matches between CLI output and `.env` file
- Look for errors in terminal where you're running `stripe listen`

### Order Not Created
- Check browser console for errors
- Check server terminal for error logs
- Verify webhook secret is correct in `.env`
- Check Stripe Dashboard → Webhooks → View logs

### "Signature verification failed"
- Your `STRIPE_WEBHOOK_SECRET` doesn't match
- For local testing, use the secret from `stripe listen` command output
- For production, use the secret from Stripe Dashboard webhook settings

---

## Production Deployment

When deploying to production:

1. **Switch to Live Mode** in Stripe Dashboard
2. Get **live API keys** (start with `sk_live_...`)
3. Create webhook endpoint with your production URL
4. Update environment variables in your hosting platform with live keys
5. Test with **real credit card** (your own) in small amount
6. Monitor webhook deliveries in Stripe Dashboard

### Security Checklist
- ✅ Never commit `.env` file
- ✅ Use live keys only in production environment
- ✅ Verify webhook signatures (already implemented)
- ✅ Validate prices server-side (already implemented)
- ✅ Use HTTPS in production for webhook endpoint

---

## Quick Reference

### Environment Variables Needed
```bash
STRIPE_SECRET_KEY=sk_test_...              # From Stripe Dashboard → API keys
STRIPE_WEBHOOK_SECRET=whsec_...            # From Stripe CLI or Dashboard Webhooks
PUBLIC_SUPABASE_URL=https://...            # Already configured
PUBLIC_SUPABASE_ANON_KEY=...               # Already configured
```

### Key Stripe Dashboard URLs
- API Keys: https://dashboard.stripe.com/test/apikeys
- Webhooks: https://dashboard.stripe.com/test/webhooks
- Payments: https://dashboard.stripe.com/test/payments
- Logs: https://dashboard.stripe.com/test/logs

### Test Cards
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
