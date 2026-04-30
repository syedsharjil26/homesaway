-- Allow owners to update inquiry status for listings they own.

ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY inquiries_update_owner
ON public.inquiries
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM public.listings
    WHERE public.listings.id = public.inquiries.listing_id
      AND public.listings.owner_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.listings
    WHERE public.listings.id = public.inquiries.listing_id
      AND public.listings.owner_id = auth.uid()
  )
);
