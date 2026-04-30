-- Create owner access requests table
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS public.owner_access_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  property_name TEXT NOT NULL,
  locality TEXT NOT NULL,
  room_count INTEGER NOT NULL,
  notes TEXT,
  existing_business BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.owner_access_requests ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "Users can insert their own requests" ON public.owner_access_requests;
DROP POLICY IF EXISTS "Users can view their own requests" ON public.owner_access_requests;
DROP POLICY IF EXISTS "Admins can manage all requests" ON public.owner_access_requests;

CREATE POLICY "Users can insert their own requests" ON public.owner_access_requests
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own requests" ON public.owner_access_requests
  FOR SELECT USING (auth.uid() = user_id);

-- Admin can view and update all
CREATE POLICY "Admins can manage all requests" ON public.owner_access_requests
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
