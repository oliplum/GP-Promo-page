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
    const { amount, currency } = await request.json();

    const accessToken = await getAccessToken();

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
              currency_code: currency === '£' ? 'GBP' : currency,
              value: amount.toFixed(2),
            },
            description: 'CBTReach Workshop Purchase',
          },
        ],
        application_context: {
          brand_name: 'CBTReach',
          landing_page: 'NO_PREFERENCE',
          shipping_preference: 'NO_SHIPPING',
          user_action: 'PAY_NOW',
          return_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/paypal-return`,
          cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/paypal-cancel`,
        },
      }),
    });

    const order = await response.json();
    
    console.log('PayPal order response status:', response.status);
    console.log('PayPal order response:', JSON.stringify(order, null, 2));

    if (!response.ok) {
      console.error('PayPal order creation failed:', order);
      throw new Error(order.message || 'Failed to create PayPal order');
    }

    const approveUrl = order.links?.find((link: any) => link.rel === 'approve')?.href;
    
    console.log('Approve URL:', approveUrl);

    return NextResponse.json({ 
      orderID: order.id, 
      approveUrl
    });
  } catch (error) {
    console.error('PayPal create order error:', error);
    return NextResponse.json(
      { error: 'Failed to create PayPal order' },
      { status: 500 }
    );
  }
}
