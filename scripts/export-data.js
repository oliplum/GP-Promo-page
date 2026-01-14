const { Pool } = require('pg');
const fs = require('fs');

const pool = new Pool({
  connectionString: 'postgresql://postgres:plum1234@localhost:5432/GP_Promo'
});

async function exportData() {
  let output = '-- Data export from GP_Promo\n\n';
  
  try {
    // Export events
    console.log('Exporting events...');
    const events = await pool.query('SELECT * FROM events WHERE owner_id = 16 AND status = \'published\' ORDER BY id');
    output += '-- Events\n';
    events.rows.forEach(row => {
      output += `INSERT INTO events (id, event_no, title, cpd_hours, ticket_price, currency, event_synopsis, owner_id, status, created_at, updated_at) VALUES (`;
      output += `${row.id}, `;
      output += `${row.event_no ? `'${row.event_no.replace(/'/g, "''")}'` : 'NULL'}, `;
      output += `'${row.title.replace(/'/g, "''")}', `;
      output += `${row.cpd_hours || 'NULL'}, `;
      output += `${row.ticket_price || 'NULL'}, `;
      output += `'${row.currency || '£'}', `;
      output += `${row.event_synopsis ? `'${row.event_synopsis.replace(/'/g, "''")}'` : 'NULL'}, `;
      output += `${row.owner_id}, `;
      output += `'${row.status}', `;
      output += `${row.created_at ? `'${row.created_at.toISOString()}'` : 'CURRENT_TIMESTAMP'}, `;
      output += `${row.updated_at ? `'${row.updated_at.toISOString()}'` : 'CURRENT_TIMESTAMP'}`;
      output += `);\n`;
    });
    
    // Export presenters
    console.log('Exporting presenters...');
    const presenters = await pool.query('SELECT DISTINCT p.* FROM presenters p JOIN event_presenters ep ON p.id = ep.presenter_id JOIN events e ON ep.event_id = e.id WHERE e.owner_id = 16 AND e.status = \'published\' ORDER BY p.id');
    output += '\n-- Presenters\n';
    presenters.rows.forEach(row => {
      output += `INSERT INTO presenters (id, title, first_name, last_name, honors, image_url, s3_url, bio, job_title, created_at, updated_at) VALUES (`;
      output += `${row.id}, `;
      output += `${row.title ? `'${row.title.replace(/'/g, "''")}'` : 'NULL'}, `;
      output += `${row.first_name ? `'${row.first_name.replace(/'/g, "''")}'` : 'NULL'}, `;
      output += `${row.last_name ? `'${row.last_name.replace(/'/g, "''")}'` : 'NULL'}, `;
      output += `${row.honors ? `'${row.honors.replace(/'/g, "''")}'` : 'NULL'}, `;
      output += `${row.image_url ? `'${row.image_url.replace(/'/g, "''")}'` : 'NULL'}, `;
      output += `${row.s3_url ? `'${row.s3_url.replace(/'/g, "''")}'` : 'NULL'}, `;
      output += `${row.bio ? `'${row.bio.replace(/'/g, "''")}'` : 'NULL'}, `;
      output += `${row.job_title ? `'${row.job_title.replace(/'/g, "''")}'` : 'NULL'}, `;
      output += `${row.created_at ? `'${row.created_at.toISOString()}'` : 'CURRENT_TIMESTAMP'}, `;
      output += `${row.updated_at ? `'${row.updated_at.toISOString()}'` : 'CURRENT_TIMESTAMP'}`;
      output += `);\n`;
    });
    
    // Export event_presenters
    console.log('Exporting event_presenters...');
    const eventPresenters = await pool.query('SELECT ep.* FROM event_presenters ep JOIN events e ON ep.event_id = e.id WHERE e.owner_id = 16 AND e.status = \'published\' ORDER BY ep.id');
    output += '\n-- Event Presenters\n';
    eventPresenters.rows.forEach(row => {
      output += `INSERT INTO event_presenters (event_id, presenter_id, created_at) VALUES (`;
      output += `${row.event_id}, `;
      output += `${row.presenter_id}, `;
      output += `${row.created_at ? `'${row.created_at.toISOString()}'` : 'CURRENT_TIMESTAMP'}`;
      output += `);\n`;
    });
    
    // Write to file
    fs.writeFileSync('db/data.sql', output);
    console.log('\nExport complete! File saved to: db/data.sql');
    console.log(`Exported ${events.rows.length} events, ${presenters.rows.length} presenters, ${eventPresenters.rows.length} relationships`);
    
  } catch (error) {
    console.error('Export error:', error);
  } finally {
    await pool.end();
  }
}

exportData();
