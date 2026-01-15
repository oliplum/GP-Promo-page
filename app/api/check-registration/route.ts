import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { email, eventIds } = await request.json();

    if (!email || !eventIds || !Array.isArray(eventIds)) {
      return NextResponse.json(
        { error: 'Email and event IDs are required' },
        { status: 400 }
      );
    }

    // Check if attendee exists and get their registrations
    const query = `
      SELECT er.event_id, e.title
      FROM attendees a
      JOIN event_registrations er ON a.id = er.attendee_id
      JOIN events e ON er.event_id = e.id
      WHERE a.email = $1 AND er.event_id = ANY($2::int[])
    `;

    const result = await pool.query(query, [email, eventIds]);

    if (result.rows.length > 0) {
      // User is already registered for some events
      return NextResponse.json({
        alreadyRegistered: true,
        registeredEvents: result.rows.map(row => ({
          id: row.event_id,
          title: row.title
        }))
      });
    }

    // No conflicts found
    return NextResponse.json({
      alreadyRegistered: false,
      registeredEvents: []
    });

  } catch (error) {
    console.error('Error checking registrations:', error);
    return NextResponse.json(
      { error: 'Failed to check registrations' },
      { status: 500 }
    );
  }
}
