# Twilio Proxy Setup Guide

This guide explains how to configure Twilio Proxy for order notifications with 2-way SMS conversations.

## What is Twilio Proxy?

Twilio Proxy allows you to:
- Send SMS from a pool of numbers (automatically assigns available numbers)
- Enable 2-way conversations between customers and business owner
- Keep phone numbers private (customers never see business owner's real number)
- Automatically expire sessions and recycle numbers
- Handle everything through native SMS apps (no special apps needed)

## Prerequisites

1. A Twilio account (sign up at https://www.twilio.com/try-twilio)
2. At least 2 Twilio phone numbers with SMS capability (you have 2)
3. Your Account SID and Auth Token from the Twilio Console
4. Your business phone number (where you want to receive customer replies)

## Configuration Steps

### 1. Get Your Twilio Credentials

1. Log in to your [Twilio Console](https://console.twilio.com)
2. From the dashboard, copy your:
   - **Account SID** (starts with `AC...`)
   - **Auth Token** (click "Show" to reveal it)

### 2. Buy or Verify Phone Numbers

1. Go to **Phone Numbers** > **Manage** > **Active numbers**
2. Verify you have at least 2 numbers with **SMS** capability
3. If you need more:
   - Click **Buy a Number**
   - Select **SMS** capability (Voice is optional)
   - Choose local numbers
   - Complete the purchase

### 3. Create a Proxy Service

1. Go to **Proxy** > **Services** in the Twilio Console
   - Direct link: https://console.twilio.com/us1/develop/proxy/services
2. Click **Create new Proxy Service**
3. Enter a name (e.g., "Order Notifications")
4. Click **Create**
5. Copy the **Service SID** (starts with `KS...`)

### 4. Add Phone Numbers to Proxy Pool

1. In your new Proxy Service, go to **Phone Numbers** tab
2. Click **Add Phone Numbers**
3. Select your 2 purchased phone numbers from the list
4. Click **Add Selected**

**Important:** Your numbers are now in the pool and will be automatically assigned to sessions!

### 5. Add Environment Variables

Add these variables to your `.env` file:

```bash
# Twilio Proxy Configuration
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PROXY_SERVICE_SID=KSxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_BUSINESS_PHONE=+1234567890
TWILIO_PROXY_SESSION_TTL=300
```

**Variable Explanations:**
- `TWILIO_ACCOUNT_SID`: Your Twilio account identifier
- `TWILIO_AUTH_TOKEN`: Your auth token (keep secret!)
- `TWILIO_PROXY_SERVICE_SID`: The Service SID from step 3 (starts with `KS...`)
- `TWILIO_BUSINESS_PHONE`: Your personal/business phone in E.164 format (+1234567890)
- `TWILIO_PROXY_SESSION_TTL`: Session lifetime in seconds (300 = 5 minutes for testing)

**Important:** 
- All phone numbers must be in E.164 format (e.g., `+1234567890`)
- Keep your Auth Token secret! Never commit it to version control

### 6. (Optional) A2P 10DLC Registration

For production use in the US with high volume:

1. Go to **Messaging** > **Regulatory compliance** in Twilio Console
2. Complete your **Business Profile** registration
3. Register a **10DLC Brand** (your business)
4. Create a **10DLC Campaign** (e.g., "Order notifications and customer support")
5. Assign your phone numbers to the campaign

**Note:** You can test without completing A2P 10DLC, but deliverability may be limited until registration is complete.

## How It Works

### Order Placement Flow

1. **Customer places order** with phone number
2. **System creates Proxy session**
   - Picks an available number from your 2-number pool
   - Adds customer as participant
   - Adds business owner as participant
   - Sets TTL (5 min for testing, configurable)

3. **Customer receives SMS** from the assigned Twilio number:
   ```
   Thanks for your order! Your order #a1b2c3d4 is confirmed for pickup on 
   Friday, December 20, 2025. Reply to this message if you have any questions!
   ```

4. **Customer can reply** to that number

5. **Proxy routes the reply** to your business phone

6. **You reply** from your normal SMS app

7. **Customer receives your reply** from the same Twilio number

8. **Session expires** after TTL seconds of inactivity

9. **Number returns to pool** for the next order

### Session Management

- **Active sessions**: Each active order "locks" one number from the pool
- **Concurrent limit**: With 2 numbers, you can have 2 simultaneous conversations
- **Auto-expiry**: After `TWILIO_PROXY_SESSION_TTL` seconds of no messages, the session closes
- **Number recycling**: Expired sessions release their numbers back to the pool

### Example Timeline (5 min TTL)

```
12:00 PM - Order placed, Session A starts, uses Number 1
12:01 PM - Customer replies
12:02 PM - You reply
12:03 PM - Another order placed, Session B starts, uses Number 2
12:05 PM - Session A: 5 min since last message → expires, Number 1 freed
12:06 PM - Third order placed, Session C starts, uses Number 1 (now available)
```

## Testing

### Test the Proxy Service

1. Make sure your `.env` file has all 5 Twilio variables
2. Restart your dev server: `npm run dev`
3. Check configuration:
   ```bash
   curl http://localhost:5173/api/test-sms
   ```

4. Send a test SMS (use your phone as customer):
   ```bash
   curl -X POST http://localhost:5173/api/test-sms \
     -H "Content-Type: application/json" \
     -d '{"phone": "+1YOUR_PHONE"}'
   ```

5. **Test the 2-way flow:**
   - You'll receive SMS from a Twilio number
   - Reply to that message
   - Check your business phone - you should receive the reply!
   - Reply from your business phone
   - Check your customer phone - you should receive the response!

6. **Wait 5 minutes** and send another message - the session should be expired

### Test with Real Order

1. Go to checkout page
2. Use phone contact method with your number
3. Complete the order
4. Test the back-and-forth conversation

### Troubleshooting

**"Twilio Proxy is not configured"**
- Check all 5 env variables are in `.env`
- Verify `TWILIO_PROXY_SERVICE_SID` starts with `KS...`
- Restart dev server after adding variables

**SMS not sending:**
- Check server logs for detailed errors
- Verify your 2 numbers are added to the Proxy service phone pool
- Check Twilio Console > Proxy > Services > [Your Service] > Phone Numbers
- Ensure your Twilio account has sufficient balance

**Replies not being forwarded:**
- Verify `TWILIO_BUSINESS_PHONE` is in E.164 format (+1234567890)
- Check that both customer and business phones are in correct format
- Look at Proxy session logs in Twilio Console for routing info

**"No phone numbers available"**
- Both numbers are in active sessions
- Check active sessions: Twilio Console > Proxy > Services > [Your Service] > Sessions
- Either wait for TTL expiry or manually close old sessions
- Consider adding more numbers to the pool

**Phone number format issues:**
- The system automatically formats US phone numbers (10 digits → +1XXXXXXXXXX)
- International numbers should already include the country code
- Business phone must be in E.164 format

**Trial account limitations:**
- Trial accounts can only send to verified phone numbers
- Verify both customer and business phones in Twilio Console
- Upgrade your account to send to any number

## Cost Estimates

- **US Local Number:** ~$1/month per number
- **Outbound SMS (US):** ~$0.0079 per message segment  
- **Inbound SMS (US):** ~$0.0079 per message segment
- **Proxy Sessions:** Usually included in base pricing (check your account)

### Example Costs

**With 2 numbers, 100 orders/month:**
- 2 numbers: $2/month
- 100 outbound confirmations: $0.79
- ~50 customer replies: $0.40
- ~50 business replies: $0.40
- **Total: ~$3.59/month**

**Scaling up (10 numbers, 500 orders/month):**
- 10 numbers: $10/month
- 500 outbound confirmations: $3.95
- ~250 customer replies: $2.00
- ~250 business replies: $2.00
- **Total: ~$17.95/month**

## Scaling Your Pool

### Determining Pool Size

Your pool size depends on:
1. **Peak concurrent orders** needing active conversations
2. **Session TTL** (longer TTL = more numbers needed)

**Formula:** `Numbers needed ≈ (Peak orders per day × TTL in days)`

**Examples:**

| Daily Orders | TTL | Numbers Needed |
|--------------|-----|----------------|
| 15/day | 5 min (testing) | 2-3 |
| 15/day | 1 day | 15 |
| 15/day | 3 days | 45 |
| 50/day | 1 day | 50 |
| 50/day | 7 days | 350 |

**Recommendations:**
- Start with 2-5 numbers for testing
- Monitor usage in Twilio Console > Proxy > Sessions
- Add more numbers if you see "no numbers available" errors
- For production, use formula above with 20% buffer

### Session TTL Recommendations

| Order Type | Recommended TTL | Seconds |
|------------|----------------|---------|
| Testing | 5 minutes | 300 |
| Same-day pickup | 12-24 hours | 43200-86400 |
| Next-day pickup | 1-2 days | 86400-172800 |
| 3-5 day orders | 3-5 days | 259200-432000 |
| Weekly orders | 7 days | 604800 |

**Note:** Sessions auto-extend on each message, so TTL is "time since last message"

## Advanced Features

### Manual Session Management

Close a session early (optional):
```typescript
import { SMSService } from '$lib/services/sms';

await SMSService.closeSession('KCxxxxxxxxxxxxx');
```

### Monitor Active Sessions

View in Twilio Console:
- Go to Proxy > Services > [Your Service] > Sessions
- See all active sessions, participants, and message history
- Manually close sessions if needed

### Webhook Callbacks (Optional)

You can configure Proxy webhooks to:
- Log all messages to your database
- Trigger notifications
- Custom business logic on replies

See: https://www.twilio.com/docs/proxy/api/webhooks

## Support

- [Twilio Proxy Documentation](https://www.twilio.com/docs/proxy)
- [Twilio Console](https://console.twilio.com)
- [Proxy API Reference](https://www.twilio.com/docs/proxy/api)
- [A2P 10DLC Registration Guide](https://www.twilio.com/docs/sms/a2p-10dlc)
