-- Ensure owner listing creation matches the mobile payload and RLS auth mapping.

ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS listings_insert_own ON public.listings;

CREATE POLICY listings_insert_own
ON public.listings
FOR INSERT
WITH CHECK (
  owner_id = auth.uid()
  AND created_by_owner_id = auth.uid()
  AND EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE public.profiles.id = auth.uid()
      AND public.profiles.role = 'owner'
  )
);
