import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    // Check pending orders
    const pendingResult = await pool.query(
      `SELECT id, paypal_order_id, first_name, last_name, email, total, currency, created_at 
       FROM pending_orders 
       ORDER BY created_at DESC 
       LIMIT 20`
    );

    // Check recent sales
    const salesResult = await pool.query(
      `SELECT id, first_name, last_name, email, total_paid, currency, paypal_order_id, paypal_capture_id, created_at 
       FROM sales 
       ORDER BY created_at DESC 
       LIMIT 10`
    );

    return NextResponse.json({
      success: true,
      pendingOrders: pendingResult.rows,
      recentSales: salesResult.rows
    });
  } catch (error) {
    console.error('Error checking orders:', error);
    return NextResponse.json(
      { error: 'Failed to check orders', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
