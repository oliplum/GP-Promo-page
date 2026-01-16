const { Pool } = require('pg');

// Use hardcoded connection for local PostgreSQL
const pool = new Pool({
  host: 'localhost',
  port: 5432,
  database: 'GP_Promo',
  user: 'postgres',
  password: 'plum1234'
});

async function checkPendingOrders() {
  try {
    console.log('=== CHECKING PENDING ORDERS ===\n');
    
    const result = await pool.query(
      `SELECT id, paypal_order_id, first_name, last_name, email, total, currency, created_at 
       FROM pending_orders 
       ORDER BY created_at DESC 
       LIMIT 50`
    );

    if (result.rows.length === 0) {
      console.log('No pending orders found.');
    } else {
      console.log(`Found ${result.rows.length} pending order(s):\n`);
      result.rows.forEach((order, i) => {
        console.log(`${i + 1}. Order ID: ${order.paypal_order_id}`);
        console.log(`   Name: ${order.first_name} ${order.last_name}`);
        console.log(`   Email: ${order.email}`);
        console.log(`   Total: ${order.currency} ${order.total}`);
        console.log(`   Created: ${order.created_at}`);
        console.log('');
      });
    }

    // Also check recent sales
    console.log('\n=== CHECKING RECENT SALES ===\n');
    const salesResult = await pool.query(
      `SELECT id, first_name, last_name, email, total_paid, currency, paypal_order_id, purchase_date 
       FROM sales 
       ORDER BY purchase_date DESC 
       LIMIT 10`
    );

    if (salesResult.rows.length === 0) {
      console.log('No sales found.');
    } else {
      console.log(`Found ${salesResult.rows.length} recent sale(s):\n`);
      salesResult.rows.forEach((sale, i) => {
        console.log(`${i + 1}. Sale ID: ${sale.id}`);
        console.log(`   Name: ${sale.first_name} ${sale.last_name}`);
        console.log(`   Email: ${sale.email}`);
        console.log(`   Total: ${sale.currency} ${sale.total_paid}`);
        console.log(`   PayPal Order: ${sale.paypal_order_id}`);
        console.log(`   Created: ${sale.purchase_date}`);
        console.log('');
      });
    }

    await pool.end();
  } catch (error) {
    console.error('Error:', error);
    await pool.end();
    process.exit(1);
  }
}

checkPendingOrders();
