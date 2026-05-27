// The Herb Souk — Stripe Payment Handler
// Netlify Serverless Function
// Deploy: add STRIPE_SECRET_KEY to Netlify environment variables

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': 'https://herbsouk.co.uk',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  // Handle preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const { paymentMethodId, email, name, amount, currency, description } = JSON.parse(event.body);

    // Validate inputs
    if (!paymentMethodId || !email || !amount) {
      return { statusCode: 400, headers,
        body: JSON.stringify({ error: 'Missing required fields' }) };
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: 499, // £4.99 in pence — hardcoded for security
      currency: 'gbp',
      payment_method: paymentMethodId,
      confirm: true,
      description: 'The Herb Souk — AI Global Edition v2.0',
      receipt_email: email,
      metadata: {
        customer_name: name,
        product: 'The Herb Souk',
        version: '2.0',
        purchased_at: new Date().toISOString()
      },
      return_url: 'https://herbsouk.co.uk/success.html'
    });

    if (paymentIntent.status === 'succeeded') {
      // Send confirmation email via Netlify/SendGrid (optional — add later)
      // For now, Stripe sends a receipt automatically if receipt_email is set
      return {
        statusCode: 200, headers,
        body: JSON.stringify({
          success: true,
          paymentIntentId: paymentIntent.id,
          email
        })
      };
    } else if (paymentIntent.status === 'requires_action') {
      return {
        statusCode: 200, headers,
        body: JSON.stringify({
          requiresAction: true,
          clientSecret: paymentIntent.client_secret
        })
      };
    } else {
      return {
        statusCode: 400, headers,
        body: JSON.stringify({ error: 'Payment failed — please try again.' })
      };
    }
  } catch (error) {
    console.error('Stripe error:', error);
    const msg = error.type === 'StripeCardError'
      ? error.message
      : 'Payment processing error. Please try again.';
    return { statusCode: 400, headers, body: JSON.stringify({ error: msg }) };
  }
};
