/*
  # Security Hardening - Fix all audit findings

  Fixes:
  1. Mutable search_path -> SET search_path = '' on all 4 functions
  2. contact_messages INSERT always true -> restricted policies
  3. SECURITY DEFINER anon access -> revoke EXECUTE from anon
  4. increment_coupon_usage -> switch to SECURITY INVOKER
*/

-- Fix current_user_id: add SET search_path = ''
CREATE OR REPLACE FUNCTION public.current_user_id()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN auth.uid();
END;
$$;

-- Fix is_admin: add SET search_path = ''
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$;

-- Fix increment_coupon_usage: switch to INVOKER + search_path
-- Must DROP first because changing security type requires it
-- Temporarily drop policies that depend on it (none do)
DROP FUNCTION IF EXISTS public.increment_coupon_usage(text);
CREATE FUNCTION public.increment_coupon_usage(p_coupon_code text)
RETURNS void
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.coupons
  SET used_count = used_count + 1
  WHERE code = p_coupon_code AND is_active = true;
END;
$$;

-- Fix update_updated_at_column: add SET search_path = ''
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Revoke EXECUTE from anon on all security-sensitive functions
REVOKE EXECUTE ON FUNCTION public.current_user_id() FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM anon;
REVOKE EXECUTE ON FUNCTION public.increment_coupon_usage(text) FROM anon;

-- Fix contact_messages: drop insecure "always true" INSERT policy
DROP POLICY IF EXISTS "Anyone can submit contact messages" ON public.contact_messages;

-- Restricted INSERT for authenticated users
CREATE POLICY "Authenticated users can submit contact messages"
  ON public.contact_messages
  FOR INSERT
  TO authenticated
  WITH CHECK (
    char_length(name) > 0
    AND char_length(email) > 0
    AND char_length(message) > 0
  );

-- Restricted INSERT for anon with validation (no bypass)
CREATE POLICY "Anon can submit contact messages with validation"
  ON public.contact_messages
  FOR INSERT
  TO anon
  WITH CHECK (
    char_length(name) BETWEEN 1 AND 200
    AND char_length(email) BETWEEN 1 AND 254
    AND char_length(message) BETWEEN 1 AND 2000
  );
