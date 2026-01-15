import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const PAYPAL_API = process.env.PAYPAL_API_URL || 'https://api-m.sandbox.paypal.com';
const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('neon.tech') ? { rejectUnauthorized: false } : undefined
});

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
    const { amount, currency, checkoutData } = await request.json();

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

    // Store checkout data in database for retrieval after PayPal redirect
    if (checkoutData) {
      await pool.query(
        `INSERT INTO pending_orders 
        (paypal_order_id, first_name, last_name, email, selected_events, subtotal, discount_percent, discount_amount, total, currency)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (paypal_order_id) DO UPDATE SET
          first_name = EXCLUDED.first_name,
          last_name = EXCLUDED.last_name,
          email = EXCLUDED.email,
          selected_events = EXCLUDED.selected_events,
          subtotal = EXCLUDED.subtotal,
          discount_percent = EXCLUDED.discount_percent,
          discount_amount = EXCLUDED.discount_amount,
          total = EXCLUDED.total,
          currency = EXCLUDED.currency`,
        [
          order.id,
          checkoutData.firstName,
          checkoutData.lastName,
          checkoutData.email,
          checkoutData.selectedEvents,
          checkoutData.subtotal,
          checkoutData.discountPercent,
          checkoutData.discountAmount,
          checkoutData.total,
          checkoutData.currency
        ]
      );
    }

    return NextResponse.json({ 
      orderID: order.id, 
      approveUrl
    });
  } catch (error) {
    console.error('PayPal create order error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to create PayPal order';
    return NextResponse.json(
      { 
        error: errorMessage,
        details: error instanceof Error ? error.stack : String(error)
      },
      { status: 500 }
    );
  }
}
