$env:PGPASSWORD = "plum1234"

Write-Host "`n=== PENDING ORDERS ===" -ForegroundColor Cyan
psql -h localhost -U postgres -d GP_Promo -c "SELECT id, paypal_order_id, first_name, last_name, email, total, currency, created_at FROM pending_orders ORDER BY created_at DESC LIMIT 10;"

Write-Host "`n=== RECENT SALES ===" -ForegroundColor Cyan
psql -h localhost -U postgres -d GP_Promo -c "SELECT id, first_name, last_name, email, total_paid, currency, paypal_order_id, paypal_capture_id, created_at FROM sales ORDER BY created_at DESC LIMIT 10;"

$env:PGPASSWORD = $null
