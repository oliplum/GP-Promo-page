const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'plum1234',
  database: 'GP_Promo'
});

async function setupPendingOrders() {
  try {
    const sqlFile = path.join(__dirname, '../db/pending-orders-schema.sql');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    console.log('Creating pending_orders table...');
    await pool.query(sql);
    console.log('✅ pending_orders table created successfully!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

setupPendingOrders();
