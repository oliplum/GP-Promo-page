const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  connectionString: 'postgresql://postgres:plum1234@localhost:5432/GP_Promo'
});

async function runSchema() {
  try {
    const schemaSQL = fs.readFileSync(
      path.join(__dirname, '..', 'db', 'sales-schema.sql'),
      'utf8'
    );

    await pool.query(schemaSQL);
    console.log('✓ Sales table created successfully');
    
    // Verify table exists
    const result = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'sales' 
      ORDER BY ordinal_position
    `);
    
    console.log('\nTable structure:');
    result.rows.forEach(row => {
      console.log(`  ${row.column_name}: ${row.data_type}`);
    });
    
  } catch (error) {
    console.error('Error creating sales table:', error.message);
  } finally {
    await pool.end();
  }
}

runSchema();
