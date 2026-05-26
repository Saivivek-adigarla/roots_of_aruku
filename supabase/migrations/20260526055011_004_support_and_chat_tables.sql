/*
  # Add email to users, create support tickets and chat history tables

  ## Overview
  Adds email column to users table for Supabase Auth compatibility.
  Creates support_tickets and chat_history tables for AI assistant
  and customer support escalation.

  ## Tables Created
  - support_tickets: Customer support tickets with escalation
  - chat_history: AI chat conversation history

  ## Tables Modified
  - users: Added email column
*/

-- Add email to users table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'email'
  ) THEN
    ALTER TABLE public.users ADD COLUMN email text DEFAULT '';
  END IF;
END $$;

-- Support Tickets table
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  subject text NOT NULL,
  message text NOT NULL,
  status text DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  source text DEFAULT 'chat' CHECK (source IN ('chat', 'whatsapp', 'phone', 'email', 'web')),
  assigned_to text DEFAULT '',
  resolution text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own tickets"
  ON public.support_tickets FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own tickets"
  ON public.support_tickets FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all tickets"
  ON public.support_tickets FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- Chat History table
CREATE TABLE IF NOT EXISTS public.chat_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  session_id text NOT NULL,
  role text NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.chat_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own chat history"
  ON public.chat_history FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own chat history"
  ON public.chat_history FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_chat_history_user_session ON public.chat_history(user_id, session_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_user ON public.support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON public.support_tickets(status);
