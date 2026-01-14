import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    // Test the database connection
    const client = await pool.connect();
    
    // Run a simple query to verify connection
    const result = await client.query('SELECT NOW() as current_time, version() as postgres_version');
    
    // Release the client back to the pool
    client.release();
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful!',
      data: result.rows[0],
    });
  } catch (error) {
    console.error('Database connection error:', error);
    
    return NextResponse.json({
      success: false,
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
