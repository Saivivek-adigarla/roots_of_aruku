/*
  # Add Coupons and Inventory Alerts Tables

  ## Overview
  This migration adds coupon/promo code system and inventory alert tracking.

  ## Tables Created

  ### 1. coupons
  - Promotional coupon codes with rules and usage tracking
  - Fields: id, code, description, discount_type, discount_value, min_order_value,
    max_discount, usage_limit, used_count, valid_from, valid_until, is_active,
    created_at, updated_at

  ### 2. inventory_alerts
  - Low stock notifications for admins
  - Fields: id, product_id, alert_type, message, is_read, created_at

  ## Security
  - coupons: Public read (for validation), admin-only write
  - inventory_alerts: Admin-only access
*/

-- Coupons table
CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  discount_type TEXT NOT NULL CHECK (discount_type IN ('percentage', 'flat')),
  discount_value INTEGER NOT NULL CHECK (discount_value > 0),
  min_order_value INTEGER NOT NULL DEFAULT 0 CHECK (min_order_value >= 0),
  max_discount INTEGER CHECK (max_discount IS NULL OR max_discount > 0),
  usage_limit INTEGER CHECK (usage_limit IS NULL OR usage_limit > 0),
  used_count INTEGER NOT NULL DEFAULT 0 CHECK (used_count >= 0),
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Inventory alerts table
CREATE TABLE IF NOT EXISTS public.inventory_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL CHECK (alert_type IN ('low_stock', 'out_of_stock')),
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_coupons_code ON public.coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_active ON public.coupons(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_inventory_alerts_product ON public.inventory_alerts(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_alerts_unread ON public.inventory_alerts(is_read) WHERE is_read = false;

-- RLS for coupons
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active coupons"
  ON public.coupons FOR SELECT
  USING (is_active = true AND valid_until > NOW());

CREATE POLICY "Admins can view all coupons"
  ON public.coupons FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can insert coupons"
  ON public.coupons FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update coupons"
  ON public.coupons FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete coupons"
  ON public.coupons FOR DELETE
  TO authenticated
  USING (is_admin());

-- RLS for inventory alerts
ALTER TABLE public.inventory_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view inventory alerts"
  ON public.inventory_alerts FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can insert inventory alerts"
  ON public.inventory_alerts FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update inventory alerts"
  ON public.inventory_alerts FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- Trigger for updated_at on coupons
CREATE TRIGGER update_coupons_updated_at BEFORE UPDATE ON public.coupons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample coupon
INSERT INTO public.coupons (code, description, discount_type, discount_value, min_order_value, max_discount, usage_limit, valid_until, is_active) VALUES
('WELCOME10', '10% off on your first order', 'percentage', 10, 199, 100, 1000, NOW() + INTERVAL '6 months', true),
('ARAKU20', 'Flat 20% off on all coffee products', 'percentage', 20, 299, 150, 500, NOW() + INTERVAL '3 months', true);
