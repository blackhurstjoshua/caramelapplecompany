# Twilio Console - Step-by-Step

Quick visual guide for setting up Twilio Proxy in the console.

## Step 1: Get Your Credentials ✅ (You probably have these)

1. Go to: https://console.twilio.com
2. Main dashboard shows:
   - **Account SID** (starts with `AC...`)
   - **Auth Token** (click eye icon to reveal)
3. Copy both to your `.env` file

---

## Step 2: Create Proxy Service

1. **Go to:** https://console.twilio.com/us1/develop/proxy/services
   
   Or navigate: **Develop** → **Messaging** → **Proxy** → **Services**

2. **Click:** "Create new Proxy Service"

3. **Enter name:** "Order Notifications" (or any name you want)

4. **Click:** "Create"

5. **Copy the Service SID** (starts with `KS...`)
   - It's shown at the top of the page
   - Add to `.env` as `TWILIO_PROXY_SERVICE_SID=KS...`

---

## Step 3: Add Your 2 Numbers to the Proxy Pool

1. **In your Proxy Service**, click the **"Phone Numbers"** tab

2. **Click:** "Add Phone Numbers"

3. **Select your 2 purchased numbers** from the list
   - If you don't have 2 numbers, go buy them first:
     - **Phone Numbers** → **Buy a number**
     - Make sure SMS capability is enabled

4. **Click:** "Add Selected"

5. **Verify:** You should see both numbers listed in the pool

---

## Step 4: Configure Environment Variables

Add to your `.env` file:

```bash
# From Step 1
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here

# From Step 2
TWILIO_PROXY_SERVICE_SID=KSxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Your personal/business phone (where you receive customer replies)
TWILIO_BUSINESS_PHONE=+15551234567

# Session timeout (5 min = 300 seconds for testing)
TWILIO_PROXY_SESSION_TTL=300
```

**Important:** 
- Use E.164 format for phone numbers: `+1234567890`
- No spaces, no dashes, no parentheses

---

## Step 5: Test It! 🚀

### Option A: Check Configuration
```bash
npm run dev
curl http://localhost:5173/api/test-sms
```

Expected response:
```json
{
  "configured": true,
  "message": "Twilio Proxy is configured and ready..."
}
```

### Option B: Send Test SMS

```bash
curl -X POST http://localhost:5173/api/test-sms \
  -H "Content-Type: application/json" \
  -d '{"phone": "+1YOUR_PHONE_NUMBER"}'
```

Replace `+1YOUR_PHONE_NUMBER` with your actual phone.

**What should happen:**
1. You receive an SMS from one of your Twilio numbers
2. Reply to that SMS
3. Your business phone receives the reply!
4. Reply from your business phone
5. You receive the reply on your test phone!

---

## Monitoring & Debugging

### View Active Sessions

1. Go to your Proxy Service in console
2. Click **"Sessions"** tab
3. See all active conversations, participants, and messages

### View Session Details

Click any session to see:
- Participants (customer + business)
- Which proxy number was assigned
- Full message history
- Session status and expiry time

### Common Issues

**No sessions appearing after test:**
- Check server logs for errors
- Verify all 5 env variables are correct
- Make sure you restarted dev server after adding env vars

**"No phone numbers available":**
- Both numbers are in active sessions
- Wait 5 minutes for sessions to expire
- Or manually end old sessions in the console

---

## That's It! 🎉

You now have:
- ✅ Twilio Proxy Service configured
- ✅ 2 numbers in the pool
- ✅ 2-way SMS conversations working
- ✅ Automatic number assignment and recycling

**Next:** Place a real order to see it in action!

---

## Quick Links

- **Twilio Console:** https://console.twilio.com
- **Proxy Services:** https://console.twilio.com/us1/develop/proxy/services
- **Phone Numbers:** https://console.twilio.com/phone-numbers/incoming
- **Usage & Billing:** https://console.twilio.com/billing
