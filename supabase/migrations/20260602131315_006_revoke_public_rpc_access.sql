/*
  # Security Fix - Revoke PUBLIC access to SECURITY DEFINER functions

  PUBLIC role grant inherited by anon/authenticated via role hierarchy.
  Must revoke from PUBLIC to block all client-side RPC access.
*/

REVOKE EXECUTE ON FUNCTION public.current_user_id() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC;
