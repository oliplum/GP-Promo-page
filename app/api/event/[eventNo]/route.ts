import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ eventNo: string }> }
) {
  try {
    const { eventNo } = await params;
    
    // Fetch event data
    const eventResult = await pool.query(
      `SELECT * FROM events WHERE event_no = $1`,
      [eventNo]
    );
    
    const event = eventResult.rows[0];
    
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }
    
    // Fetch presenter data
    let presentersData = [];
    if (event.id) {
      try {
        const presenterResult = await pool.query(
          `SELECT * FROM presenters p
           JOIN event_presenters ep ON p.id = ep.presenter_id
           WHERE ep.event_id = $1
           ORDER BY ep.id`,
          [event.id]
        );
        presentersData = presenterResult.rows;
      } catch (err) {
        console.error('Error fetching presenters:', err);
      }
    }
    
    // Build presenter names
    const presenterNames = presentersData.length > 0
      ? presentersData.map(p => 
          [
            [p.title, p.first_name, p.last_name].filter(Boolean).join(' '),
            p.honors
          ]
            .filter(Boolean)
            .join(', ')
        ).join(' & ')
      : 'Presenter TBD';
    
    const presenterImage = presentersData[0]?.s3_url || presentersData[0]?.image_url || presentersData[0]?.s3_image || presentersData[0]?.image || '/barney-dunn.jpg';
    
    const cpdHours = event?.cpd_hours || event?.cpd || 0;
    const ticketPrice = event?.ticket_price || event?.price || 0;
    const currency = event?.currency || '£';
    const synopsis = event?.event_synopsis || event?.synopsis || '';
    
    return NextResponse.json({
      event,
      presenterName: presenterNames,
      presenterImage,
      cpdHours,
      ticketPrice,
      currency,
      synopsis,
      presenterDetails: presentersData // Pass all presenters
    });
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
