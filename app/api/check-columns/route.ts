import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    // Get columns for events table
    const eventsColumns = await pool.query(
      `SELECT column_name, data_type 
       FROM information_schema.columns 
       WHERE table_name = 'events' 
       ORDER BY ordinal_position`
    );
    
    // Get columns for event_presenters table
    const eventPresentersColumns = await pool.query(
      `SELECT column_name, data_type 
       FROM information_schema.columns 
       WHERE table_name = 'event_presenters' 
       ORDER BY ordinal_position`
    );
    
    // Get columns for presenters table
    const presentersColumns = await pool.query(
      `SELECT column_name, data_type 
       FROM information_schema.columns 
       WHERE table_name = 'presenters' 
       ORDER BY ordinal_position`
    );
    
    // Get sample data
    const sampleEvent = await pool.query('SELECT * FROM events WHERE event_no = 193 LIMIT 1');
    const samplePresenter = await pool.query('SELECT * FROM presenters LIMIT 1');
    const sampleJoin = await pool.query('SELECT * FROM event_presenters LIMIT 1');
    
    return NextResponse.json({ 
      tables: {
        events: eventsColumns.rows,
        event_presenters: eventPresentersColumns.rows,
        presenters: presentersColumns.rows
      },
      samples: {
        event: sampleEvent.rows[0],
        presenter: samplePresenter.rows[0],
        join: sampleJoin.rows[0]
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
