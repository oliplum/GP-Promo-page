const { Pool } = require('pg');

// Use hardcoded connection for local PostgreSQL
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'GP_Promo',
  user: 'postgres',
  password: 'plum1234'
});

async function checkLatestSale() {
  try {
    console.log('=== LATEST SALE ===\n');
    
    const saleResult = await pool.query(
      `SELECT id, first_name, last_name, email, paypal_order_id, paypal_capture_id, processed, purchase_date 
       FROM sales 
       ORDER BY purchase_date DESC 
       LIMIT 1`
    );

    if (saleResult.rows.length > 0) {
      const sale = saleResult.rows[0];
      console.log('Sale ID:', sale.id);
      console.log('Customer:', sale.first_name, sale.last_name);
      console.log('Email:', sale.email);
      console.log('PayPal Order ID:', sale.paypal_order_id);
      console.log('PayPal Capture ID:', sale.paypal_capture_id);
      console.log('Processed:', sale.processed);
      console.log('Purchase Date:', sale.purchase_date);
      
      // Check if matching pending order exists
      if (sale.paypal_order_id) {
        console.log('\n=== CHECKING PENDING ORDER ===\n');
        const pendingResult = await pool.query(
          `SELECT id, paypal_order_id, created_at 
           FROM pending_orders 
           WHERE paypal_order_id = $1`,
          [sale.paypal_order_id]
        );
        
        if (pendingResult.rows.length > 0) {
          console.log('⚠️ PENDING ORDER STILL EXISTS:');
          console.log(pendingResult.rows[0]);
        } else {
          console.log('✅ Pending order was deleted correctly');
        }
      }
    } else {
      console.log('No sales found');
    }

    await pool.end();
  } catch (error) {
    console.error('Error:', error);
    await pool.end();
    process.exit(1);
  }
}

checkLatestSale();
