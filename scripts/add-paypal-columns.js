const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:plum1234@localhost:5432/GP_Promo'
});

async function addPayPalColumns() {
  try {
    await pool.query(`
      ALTER TABLE sales ADD COLUMN IF NOT EXISTS paypal_order_id VARCHAR(100);
      ALTER TABLE sales ADD COLUMN IF NOT EXISTS paypal_capture_id VARCHAR(100);
      CREATE INDEX IF NOT EXISTS idx_sales_paypal_order ON sales(paypal_order_id);
    `);
    
    console.log('✓ PayPal columns added successfully');
    
  } catch (error) {
    console.error('Error adding PayPal columns:', error.message);
  } finally {
    await pool.end();
  }
}

addPayPalColumns();
