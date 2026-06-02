/*
  # Security Fix - Revoke RPC access to SECURITY DEFINER functions

  ## Issues Fixed
  - current_user_id() was callable by anon and authenticated via /rest/v1/rpc
  - is_admin() was callable by anon and authenticated via /rest/v1/rpc
  
  These functions should NOT be directly invoked by clients. They're internal
  utilities used only by RLS policies. Revoke all grants and leave only
  authenticated sessions with internal RLS permission.
  
  ## Solution
  - Revoke EXECUTE from anon (blocks /rest/v1/rpc access)
  - Revoke EXECUTE from authenticated (blocks /rest/v1/rpc access)
  - These functions remain available to RLS policies (not blocked by REVOKE)
*/

-- Revoke EXECUTE from anon role (blocks /rest/v1/rpc/current_user_id)
REVOKE EXECUTE ON FUNCTION public.current_user_id() FROM anon;
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM anon;

-- Revoke EXECUTE from authenticated role (blocks /rest/v1/rpc access)
REVOKE EXECUTE ON FUNCTION public.current_user_id() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM authenticated;

-- These functions remain available for RLS policies to use internally
-- (RLS evaluation happens server-side as the original authenticated user)
