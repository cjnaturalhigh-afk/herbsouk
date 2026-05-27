// The Herb Souk — Server-Side Unlock Code Validation
// Netlify Serverless Function
// Validates unlock codes server-side so hashes never appear in client JS

const crypto = require('crypto');

// Unlock code hashes stored server-side (NEVER in client JS)
// These are SHA-256 hashes of the actual codes
const VALID_HASHES = process.env.UNLOCK_CODE_HASHES
  ? process.env.UNLOCK_CODE_HASHES.split(',')
  : []; // Set UNLOCK_CODE_HASHES in Netlify environment variables

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': 'https://herbsouk.co.uk',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const { code } = JSON.parse(event.body || '{}');

    if (!code || typeof code !== 'string') {
      return { statusCode: 400, headers, body: JSON.stringify({ valid: false, error: 'No code provided' }) };
    }

    // Hash the submitted code
    const clean = code.toUpperCase().replace(/-/g, '');
    const hash = crypto.createHash('sha256').update(clean).digest('hex').slice(0, 16);

    const valid = VALID_HASHES.includes(hash);

    // Log for monitoring (not the actual code)
    console.log('Unlock attempt:', valid ? 'SUCCESS' : 'FAILED', 'hash:', hash.slice(0,8));

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        valid,
        message: valid ? 'Unlocked' : 'Invalid code',
        timestamp: new Date().toISOString()
      })
    };

  } catch (err) {
    console.error('Unlock validation error:', err);
    return { statusCode: 500, headers, body: JSON.stringify({ valid: false, error: 'Server error' }) };
  }
};
