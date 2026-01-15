-- Create table to store pending checkout data temporarily
-- This solves the sessionStorage issue with PayPal redirects

CREATE TABLE IF NOT EXISTS pending_orders (
    id SERIAL PRIMARY KEY,
    paypal_order_id VARCHAR(100) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    selected_events INTEGER[] NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    discount_percent INTEGER NOT NULL,
    discount_amount DECIMAL(10,2) NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) DEFAULT '£',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL '1 hour')
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_pending_orders_paypal_id ON pending_orders(paypal_order_id);
CREATE INDEX IF NOT EXISTS idx_pending_orders_expires ON pending_orders(expires_at);

-- Auto-delete expired orders (optional, for cleanup)
-- Note: This requires a cron job or scheduled task
-- For now, we'll handle cleanup in the application code
