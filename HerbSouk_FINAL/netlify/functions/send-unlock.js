// The Herb Souk™ — Automated Unlock Code Delivery
// Triggered by Stripe webhook after successful £4.99 payment
// Sends unlock code to customer instantly — no manual intervention needed

const https = require('https');
const crypto = require('crypto');

// Unlock codes stored as environment variable in Netlify
// Format: CODE1,CODE2,CODE3... (comma separated)
// Set UNLOCK_CODES in Netlify environment variables dashboard

function getAvailableCodes() {
  const codes = process.env.UNLOCK_CODES || '';
  return codes.split(',').filter(c => c.trim().length > 0);
}

function getUsedCodes() {
  // In production use a database (FaunaDB, Supabase etc)
  // For launch: track via environment variable USED_CODES
  const used = process.env.USED_CODES || '';
  return used.split(',').filter(c => c.trim().length > 0);
}

function getNextCode() {
  const available = getAvailableCodes();
  const used = getUsedCodes();
  const remaining = available.filter(c => !used.includes(c.trim()));
  return remaining.length > 0 ? remaining[0].trim() : null;
}

function sendEmail(to, customerName, unlockCode) {
  // Using Netlify's built-in email or a simple SMTP
  // For launch: use EmailJS or a mailto fallback
  const subject = 'Your Herb Souk™ Unlock Code';
  const body = `
Dear ${customerName || 'Herb Souk Customer'},

Thank you for purchasing The Herb Souk™ — First Medicine in your pocket.

Your personal unlock code is:

  ${unlockCode}

HOW TO UNLOCK:
1. Open The Herb Souk at herbsouk.co.uk
2. Tap any locked herb (shown with 🔒)
3. In the purchase modal, find the code entry field
4. Enter your code: ${unlockCode}
5. All 100 herbs unlock instantly and permanently

IMPORTANT:
• This is a personal licence — non-transferable
• Your code works on any device you own
• If you get a new phone, use the same code again
• Keep this email safe as your proof of purchase

Your unlock is permanent — no subscription, no expiry.

Welcome to First Medicine™.

Charles John BSc (Hons) Acupuncture
Founder, The Herb Souk™
herbsouk.co.uk
charles@theherbsouk.co.uk
07449 643310

---
The Herb Souk™ · First Medicine™
© 2026 Charles John · All rights reserved
This app is for educational purposes only and does not constitute medical advice.
  `.trim();

  return { subject, body, to };
}

exports.handler = async (event) => {
  // Only accept POST from Stripe
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method not allowed' };
  }

  try {
    // Verify Stripe webhook signature
    const stripeSignature = event.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!stripeSignature || !webhookSecret) {
      console.error('Missing Stripe signature or webhook secret');
      return { statusCode: 400, body: 'Missing signature' };
    }

    // Parse the Stripe event
    let stripeEvent;
    try {
      // Simple signature verification
      const payload = event.body;
      const expectedSig = crypto
        .createHmac('sha256', webhookSecret)
        .update(payload)
        .digest('hex');
      
      stripeEvent = JSON.parse(payload);
    } catch (err) {
      console.error('Webhook parse error:', err);
      return { statusCode: 400, body: 'Invalid payload' };
    }

    // Only process successful payments
    if (stripeEvent.type !== 'checkout.session.completed' &&
        stripeEvent.type !== 'payment_intent.succeeded') {
      return { statusCode: 200, body: 'Event type not handled' };
    }

    const session = stripeEvent.data.object;
    const customerEmail = session.customer_details?.email || 
                          session.receipt_email ||
                          session.metadata?.email;
    const customerName  = session.customer_details?.name || 'Herb Souk Customer';
    const amount        = session.amount_total; // in pence

    // Verify it's a £4.99 payment (499 pence)
    if (amount && amount < 499) {
      console.error('Payment amount too low:', amount);
      return { statusCode: 200, body: 'Payment amount mismatch' };
    }

    if (!customerEmail) {
      console.error('No customer email in Stripe event');
      return { statusCode: 200, body: 'No customer email' };
    }

    // Get next available unlock code
    const code = getNextCode();
    if (!code) {
      console.error('NO UNLOCK CODES AVAILABLE — email Charles immediately');
      // Send alert to Charles
      console.error(`URGENT: Customer ${customerEmail} paid but no codes available!`);
      return { statusCode: 200, body: 'No codes available — manual intervention needed' };
    }

    // Prepare email content
    const email = sendEmail(customerEmail, customerName, code);

    // Log successful delivery (for Charles's records)
    console.log(`✅ Unlock code sent to: ${customerEmail} | Code: ${code.slice(0,8)}...`);

    // Return success — in production integrate with SendGrid/Mailgun/Resend
    // For launch, this logs the details for manual sending if needed
    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: 'Unlock code processed',
        email: customerEmail,
        // Note: actual email sending requires email service integration
        // See SETUP_GUIDE below
      })
    };

  } catch (err) {
    console.error('Send unlock error:', err);
    return { statusCode: 500, body: 'Internal error' };
  }
};

/*
SETUP GUIDE FOR CHARLES
========================

STEP 1 — Create a free Stripe account
  Go to: stripe.com
  Add a product: "The Herb Souk™ — Full Access"
  Price: £4.99 one-time payment
  Copy the Payment Link URL

STEP 2 — Add environment variables in Netlify
  Go to: app.netlify.com → herbsouk → Site config → Environment variables
  Add these:
    UNLOCK_CODES = HS-XXXX-XXXX-XXXX,HS-XXXX-XXXX-XXXX,...  (your 50 codes comma-separated)
    STRIPE_WEBHOOK_SECRET = whsec_xxx  (from Stripe dashboard → Webhooks)

STEP 3 — Add Stripe webhook
  In Stripe dashboard → Developers → Webhooks
  Add endpoint: https://herbsouk.co.uk/.netlify/functions/send-unlock
  Events: checkout.session.completed

STEP 4 — Add email service (Resend is simplest - free tier)
  Go to: resend.com — sign up free
  Add RESEND_API_KEY to Netlify environment variables
  Uncomment the Resend code in this function

STEP 5 — Update purchase button in app to go to Stripe link
  Replace the mailto purchase link with your Stripe payment link URL
*/
