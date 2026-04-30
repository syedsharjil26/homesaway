-- Store "List Your PG" enquiries and allow temporary owner activation.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS public.owner_access_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  full_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  property_name text NOT NULL,
  locality text NOT NULL,
  room_count integer NOT NULL,
  notes text,
  existing_business boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT owner_access_requests_pkey PRIMARY KEY (id),
  CONSTRAINT owner_access_requests_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT owner_access_requests_room_count_check CHECK (room_count > 0),
  CONSTRAINT owner_access_requests_status_check CHECK (status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text]))
);

ALTER TABLE public.owner_access_requests
ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();

ALTER TABLE public.owner_access_requests
ALTER COLUMN user_id SET NOT NULL,
ALTER COLUMN existing_business SET DEFAULT false,
ALTER COLUMN existing_business SET NOT NULL,
ALTER COLUMN status SET DEFAULT 'pending',
ALTER COLUMN status SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'owner_access_requests_room_count_check'
      AND conrelid = 'public.owner_access_requests'::regclass
  ) THEN
    ALTER TABLE public.owner_access_requests
    ADD CONSTRAINT owner_access_requests_room_count_check CHECK (room_count > 0);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'trigger_set_updated_at_owner_access_requests'
  ) THEN
    CREATE TRIGGER trigger_set_updated_at_owner_access_requests
    BEFORE UPDATE ON public.owner_access_requests
    FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();
  END IF;
END $$;

ALTER TABLE public.owner_access_requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert their own requests" ON public.owner_access_requests;
DROP POLICY IF EXISTS "Users can view their own requests" ON public.owner_access_requests;
DROP POLICY IF EXISTS "Admins can manage all requests" ON public.owner_access_requests;
DROP POLICY IF EXISTS owner_access_requests_insert_own ON public.owner_access_requests;
DROP POLICY IF EXISTS owner_access_requests_select_own ON public.owner_access_requests;
DROP POLICY IF EXISTS owner_access_requests_admin_all ON public.owner_access_requests;

CREATE POLICY owner_access_requests_insert_own
ON public.owner_access_requests
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY owner_access_requests_select_own
ON public.owner_access_requests
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY owner_access_requests_admin_all
ON public.owner_access_requests
FOR ALL
USING (
  EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE public.profiles.id = auth.uid()
      AND public.profiles.role = 'admin'
  )
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS profiles_select_self_for_owner_activation ON public.profiles;
DROP POLICY IF EXISTS profiles_update_self_for_owner_activation ON public.profiles;

CREATE POLICY profiles_select_self_for_owner_activation
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY profiles_update_self_for_owner_activation
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
