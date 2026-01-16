import { NextResponse } from 'next/server';

const PAYPAL_API = process.env.PAYPAL_API_URL || 'https://api-m.sandbox.paypal.com';
const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;

async function getAccessToken() {
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
  return data.access_token;
}

export async function POST(request: Request) {
  try {
    const { orderID } = await request.json();

    console.log('=== CAPTURING PAYPAL ORDER ===');
    console.log('Order ID:', orderID);

    const accessToken = await getAccessToken();
    console.log('Access token obtained');

    const response = await fetch(`${PAYPAL_API}/v2/checkout/orders/${orderID}/capture`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    const captureData = await response.json();
    
    console.log('Capture response status:', response.status);
    console.log('Capture response data:', JSON.stringify(captureData, null, 2));

    if (!response.ok) {
      console.error('❌ PayPal capture failed:', captureData);
      throw new Error(captureData.message || captureData.details?.[0]?.description || 'Failed to capture PayPal order');
    }

    // Check if capture was actually successful
    if (captureData.status !== 'COMPLETED') {
      console.error('❌ PayPal order not completed. Status:', captureData.status);
      throw new Error(`Order status is ${captureData.status}, expected COMPLETED`);
    }

    console.log('✅ PayPal capture successful');
    return NextResponse.json(captureData);
  } catch (error) {
    console.error('❌ PayPal capture order error:', error);
    return NextResponse.json(
      { error: 'Failed to capture PayPal order', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
