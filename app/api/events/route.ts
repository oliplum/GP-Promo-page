import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
  try {
    // Fetch all events where owner_id = 16 and status = 'published'
    const eventsResult = await pool.query(
      `SELECT * FROM events WHERE owner_id = 16 AND status = 'published' ORDER BY id`
    );
    
    const events = eventsResult.rows;
    
    if (!events || events.length === 0) {
      return NextResponse.json({ events: [] });
    }
    
    // Fetch presenter data for all events
    const eventsWithPresenters = await Promise.all(
      events.map(async (event) => {
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
            console.error('Error fetching presenters for event', event.id, err);
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
        
        return {
          event,
          presenterName: presenterNames,
          presenterImage,
          cpdHours,
          ticketPrice,
          currency,
          synopsis,
          presenterDetails: presentersData
        };
      })
    );
    
    return NextResponse.json({ events: eventsWithPresenters });
  } catch (error: any) {
    console.error('API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
