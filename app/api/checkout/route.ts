import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import nodemailer from 'nodemailer';

// Configure email transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function POST(request: Request) {
  const client = await pool.connect();
  
  try {
    const body = await request.json();
    console.log('Checkout request body:', body);
    
    const { firstName, lastName, email, selectedEvents, total, currency, discountPercent, subtotal, discountAmount, paypalOrderId, paypalCaptureId } = body;

    if (!firstName || !lastName || !email || !selectedEvents || selectedEvents.length === 0) {
      console.error('Missing fields:', { firstName, lastName, email, selectedEvents });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await client.query('BEGIN');

    // Get event details for the selected events
    const eventsResult = await client.query(
      `SELECT e.id, e.title, e.ticket_price, e.currency, e.event_no,
              array_agg(p.title || ' ' || p.first_name || ' ' || p.last_name || COALESCE(' ' || p.honors, '')) as presenters
       FROM events e
       LEFT JOIN event_presenters ep ON e.id = ep.event_id
       LEFT JOIN presenters p ON ep.presenter_id = p.id
       WHERE e.id = ANY($1::int[])
       GROUP BY e.id, e.title, e.ticket_price, e.currency, e.event_no`,
      [selectedEvents]
    );

    const events = eventsResult.rows;
    const eventTitles = events.map(e => e.title);
    
    // Save sale to sales table
    const saleResult = await client.query(
      `INSERT INTO sales (first_name, last_name, email, event_ids, event_titles, subtotal, discount_percent, discount_amount, total_paid, currency, paypal_order_id, paypal_capture_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING id`,
      [firstName, lastName, email, selectedEvents, eventTitles, subtotal, discountPercent, discountAmount, total, currency, paypalOrderId, paypalCaptureId]
    );

    const saleId = saleResult.rows[0].id;

    await client.query('COMMIT');

    // Return success immediately - emails are optional
    const response = {
      success: true,
      message: 'Purchase completed successfully',
      saleId
    };

    // Send emails in background (non-blocking)
    setImmediate(async () => {
      try {
        // Send email to purchaser
        const purchaserEmailHtml = `
        <h2>Thank you for your purchase!</h2>
        <p>Dear ${firstName} ${lastName},</p>
        <p>Thank you for using the CBTReach promotions page. We need to create these logins for you manually, and this will take up to 24 hours - we will mail confirmation to you when complete.</p>
        <p>Here is the complete list of your workshops for your reference:</p>
        <ul>
          ${events.map(e => `
            <li>
              <strong>${e.title}</strong><br>
              ${e.presenters.join(', ')}<br>
              <span style="text-decoration: line-through;">${e.currency} ${parseFloat(e.ticket_price).toFixed(2)}</span> 
              <strong>${e.currency} ${(parseFloat(e.ticket_price) * (1 - discountPercent / 100)).toFixed(2)}</strong> (${discountPercent}% off)<br>
              <a href="https://app-4.globalpodium.com/watch/${e.event_no}" style="color: #0070f3; text-decoration: none;">Access Event →</a>
            </li>
          `).join('')}
        </ul>
        <p><strong>Total: ${currency} ${total.toFixed(2)}</strong> (${discountPercent}% discount applied)</p>
        <p>Best regards,<br>CBTReach Team</p>
      `;

      await transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: email,
        cc: 'oli@globalpodium.com',
        subject: 'CBTReach Workshop Purchase Confirmation',
        html: purchaserEmailHtml,
      });

      // Send email to admin
      const adminEmailHtml = `
        <h2>New Purchase Alert</h2>
        <p><strong>Customer:</strong> ${firstName} ${lastName} (${email})</p>
        <p><strong>Total:</strong> ${currency} ${total.toFixed(2)} (${discountPercent}% discount)</p>
        <p><strong>Workshops purchased:</strong></p>
        <ul>
          ${events.map(e => `
            <li>
              <strong>${e.event_no}: ${e.title}</strong><br>
              ${e.presenters.join(', ')}<br>
              ${e.currency} ${(parseFloat(e.ticket_price) * (1 - discountPercent / 100)).toFixed(2)}
            </li>
          `).join('')}
        </ul>
        <p>Please set up access for this user.</p>
      `;

      await transporter.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: process.env.ADMIN_EMAIL,
        subject: `New CBTReach Purchase - ${firstName} ${lastName}`,
        html: adminEmailHtml,
      });
      
      console.log('Emails sent successfully');
    } catch (emailError) {
      console.error('Email sending failed (non-critical):', emailError);
    }
    });

    return NextResponse.json(response);

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Checkout error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
    return NextResponse.json(
      { error: 'Failed to process checkout', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}
