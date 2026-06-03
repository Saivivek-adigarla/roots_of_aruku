/*
  # Enhance Orders Table for Advanced Tracking and Analytics

  ## Changes
  1. Add `coupon_code` column to track applied coupons
  2. Add `whatsapp_sent` column to track WhatsApp notification delivery
  3. Add `customer_name` and `customer_phone` for faster queries
  4. Create index on `status` for analytics queries
  5. Create index on `payment_method` for payment analytics
  6. Create index on `created_at` for date range queries

  ## Purpose
  - Track WhatsApp notifications separately from order status
  - Enable efficient filtering by status and payment method
  - Improve analytics query performance
  - Store customer info denormalized for faster access
*/

-- Add new columns to orders table if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'coupon_code'
  ) THEN
    ALTER TABLE orders ADD COLUMN coupon_code TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'whatsapp_sent'
  ) THEN
    ALTER TABLE orders ADD COLUMN whatsapp_sent BOOLEAN DEFAULT FALSE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'customer_name'
  ) THEN
    ALTER TABLE orders ADD COLUMN customer_name TEXT;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'customer_phone'
  ) THEN
    ALTER TABLE orders ADD COLUMN customer_phone TEXT;
  END IF;
END $$;

-- Create indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_payment_method ON orders(payment_method);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_user_id_status ON orders(user_id, status);

-- Create a materialized view for daily sales analytics
CREATE MATERIALIZED VIEW IF NOT EXISTS daily_sales_summary AS
SELECT
  DATE(created_at) AS date,
  COUNT(*) AS total_orders,
  SUM(total_amount + delivery_charge) AS total_revenue,
  COUNT(CASE WHEN status = 'delivered' THEN 1 END) AS delivered_orders,
  COUNT(CASE WHEN payment_method = 'cod' THEN 1 END) AS cod_orders,
  COUNT(CASE WHEN payment_method = 'upi' THEN 1 END) AS upi_orders,
  SUM(CASE WHEN payment_method = 'cod' THEN total_amount + delivery_charge ELSE 0 END) AS cod_revenue,
  SUM(CASE WHEN payment_method = 'upi' THEN total_amount + delivery_charge ELSE 0 END) AS upi_revenue
FROM orders
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Create index on the materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_daily_sales_date ON daily_sales_summary(date);

-- Grant permissions for RLS
GRANT SELECT ON daily_sales_summary TO authenticated;
