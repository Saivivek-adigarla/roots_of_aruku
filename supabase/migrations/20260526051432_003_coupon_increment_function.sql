/*
  # Add coupon increment helper function

  ## Overview
  Adds an RPC function to safely increment coupon used_count.

  ## Functions Created
  - increment_coupon_usage(code TEXT) - Atomically increments used_count for a coupon
*/

CREATE OR REPLACE FUNCTION increment_coupon_usage(coupon_code TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE public.coupons
  SET used_count = used_count + 1
  WHERE code = coupon_code AND is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
