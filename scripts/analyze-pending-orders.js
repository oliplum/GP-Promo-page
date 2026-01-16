const fs = require('fs');
const path = require('path');

const csvPath = path.join(__dirname, '..', 'pending_orders.csv');

try {
  const content = fs.readFileSync(csvPath, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim());
  
  console.log('=== PENDING ORDERS ANALYSIS ===\n');
  console.log(`Total rows: ${lines.length - 1}\n`); // -1 for header
  
  const header = lines[0].split(',');
  console.log('Columns:', header.join(' | '));
  console.log('='.repeat(100));
  
  // Parse and display each order
  const orders = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    if (values.length >= 3) {
      const order = {
        id: values[0],
        paypalOrderId: values[1],
        firstName: values[2],
        lastName: values[3],
        email: values[4],
        selectedEvents: values[5],
        subtotal: values[6],
        discountPercent: values[7],
        discountAmount: values[8],
        total: values[9],
        currency: values[10],
        createdAt: values[11],
        expiresAt: values[12]
      };
      orders.push(order);
    }
  }
  
  console.log(`\nFound ${orders.length} pending orders:\n`);
  
  orders.forEach((order, i) => {
    console.log(`${i + 1}. Order ID: ${order.paypalOrderId}`);
    console.log(`   Name: ${order.firstName} ${order.lastName}`);
    console.log(`   Email: ${order.email}`);
    console.log(`   Total: ${order.currency} ${order.total}`);
    console.log(`   Created: ${order.createdAt}`);
    console.log(`   Expires: ${order.expiresAt}`);
    console.log('');
  });
  
  // Show unique customers
  const uniqueEmails = [...new Set(orders.map(o => o.email))];
  console.log(`\n=== SUMMARY ===`);
  console.log(`Total pending orders: ${orders.length}`);
  console.log(`Unique customers: ${uniqueEmails.length}`);
  console.log(`\nUnique customer emails:`);
  uniqueEmails.forEach(email => {
    const count = orders.filter(o => o.email === email).length;
    console.log(`  - ${email}: ${count} pending order(s)`);
  });
  
  // Show most recent
  console.log(`\n=== MOST RECENT PENDING ORDERS ===`);
  orders.slice(0, 10).forEach((order, i) => {
    console.log(`${i + 1}. ${order.paypalOrderId} - ${order.firstName} ${order.lastName} - ${order.currency} ${order.total} - ${order.createdAt}`);
  });
  
} catch (error) {
  console.error('Error reading CSV:', error.message);
}
