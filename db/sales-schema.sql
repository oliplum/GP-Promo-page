-- Create sales tracking table

CREATE TABLE IF NOT EXISTS sales (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    event_ids INTEGER[] NOT NULL,
    event_titles TEXT[] NOT NULL,
    subtotal DECIMAL(10,2) NOT NULL,
    discount_percent INTEGER NOT NULL,
    discount_amount DECIMAL(10,2) NOT NULL,
    total_paid DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) DEFAULT '£',
    paypal_order_id VARCHAR(100),
    paypal_capture_id VARCHAR(100),
    purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed BOOLEAN DEFAULT FALSE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_sales_email ON sales(email);
CREATE INDEX IF NOT EXISTS idx_sales_purchase_date ON sales(purchase_date);
CREATE INDEX IF NOT EXISTS idx_sales_processed ON sales(processed);
CREATE INDEX IF NOT EXISTS idx_sales_paypal_order ON sales(paypal_order_id);
