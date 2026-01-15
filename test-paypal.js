// Test PayPal Live Credentials
const fs = require('fs');
const path = require('path');

// Read .env.local manually
const envPath = path.join(__dirname, '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
envContent.split('\n').forEach(line => {
  line = line.trim();
  if (line && !line.startsWith('#')) {
    const equalsIndex = line.indexOf('=');
    if (equalsIndex > 0) {
      const key = line.substring(0, equalsIndex).trim();
      const value = line.substring(equalsIndex + 1).trim();
      process.env[key] = value;
    }
  }
});

const PAYPAL_API = process.env.PAYPAL_API_URL || 'https://api-m.paypal.com';
const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_MODE = process.env.PAYPAL_MODE;

console.log('=== PayPal Configuration Test ===');
console.log('Mode:', PAYPAL_MODE);
console.log('API URL:', PAYPAL_API);
console.log('Client ID:', PAYPAL_CLIENT_ID ? PAYPAL_CLIENT_ID.substring(0, 20) + '...' : 'MISSING');
console.log('Client Secret:', PAYPAL_CLIENT_SECRET ? '***' + PAYPAL_CLIENT_SECRET.slice(-4) : 'MISSING');
console.log('');

async function testPayPalAuth() {
  try {
    console.log('Testing PayPal authentication...');
    
    const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');
    
    const response = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    const data = await response.json();
    
    if (response.ok) {
      console.log('✅ Authentication successful!');
      console.log('Access token received:', data.access_token ? '***' + data.access_token.slice(-10) : 'None');
      console.log('Token type:', data.token_type);
      console.log('Expires in:', data.expires_in, 'seconds');
      console.log('');
      return data.access_token;
    } else {
      console.log('❌ Authentication failed!');
      console.log('Status:', response.status);
      console.log('Error:', JSON.stringify(data, null, 2));
      return null;
    }
  } catch (error) {
    console.error('❌ Error during authentication:', error.message);
    return null;
  }
}

async function testCreateOrder(accessToken) {
  try {
    console.log('Testing order creation...');
    
    const response = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            amount: {
              currency_code: 'GBP',
              value: '1.00',
            },
            description: 'Test Order - CBTReach Workshop',
          },
        ],
        application_context: {
          brand_name: 'CBTReach',
          landing_page: 'NO_PREFERENCE',
          shipping_preference: 'NO_SHIPPING',
          user_action: 'PAY_NOW',
          return_url: 'http://localhost:3000/paypal-return',
          cancel_url: 'http://localhost:3000/paypal-cancel',
        },
      }),
    });

    const order = await response.json();
    
    if (response.ok) {
      console.log('✅ Order created successfully!');
      console.log('Order ID:', order.id);
      console.log('Status:', order.status);
      console.log('Approve URL:', order.links?.find(link => link.rel === 'approve')?.href);
      console.log('');
    } else {
      console.log('❌ Order creation failed!');
      console.log('Status:', response.status);
      console.log('Error:', JSON.stringify(order, null, 2));
    }
  } catch (error) {
    console.error('❌ Error creating order:', error.message);
  }
}

async function runTests() {
  console.log('Starting PayPal Live API tests...\n');
  
  if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
    console.error('❌ Missing PayPal credentials in .env.local');
    return;
  }
  
  const accessToken = await testPayPalAuth();
  
  if (accessToken) {
    console.log('---');
    await testCreateOrder(accessToken);
  }
  
  console.log('=== Test Complete ===');
}

runTests();
