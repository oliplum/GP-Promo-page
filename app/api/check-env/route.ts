import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || 'NOT SET',
    NODE_ENV: process.env.NODE_ENV,
    hasPayPalClientId: !!process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID,
    timestamp: new Date().toISOString()
  });
}
