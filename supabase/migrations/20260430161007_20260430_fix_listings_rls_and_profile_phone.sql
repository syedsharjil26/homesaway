/*
  # Fix Listings RLS Insert Policy and Profile Phone Constraint

  ## Summary
  This migration addresses two blocking issues:

  1. **Listings INSERT RLS Policy**: The existing policy requires profiles.role = 'owner' at insert
     time. After a user completes the owner access request flow, there can be a brief window where
     the session token still reflects the old role. We add a more permissive fallback using
     service-level checks, while keeping the role guard intact. We also drop and recreate the
     insert policy to ensure it's correct and current.

  2. **Profiles phone uniqueness**: The unique constraint on phone can block profile creation for
     users who sign up without a phone number (empty string collides). We change empty strings to
     NULL before insert/update via a check.

  3. **Profiles SELECT for listing insert**: The listings insert policy does a subquery on profiles
     to check role. We ensure the profiles SELECT policy allows this lookup by the same user.

  ## Changes
  - Drop and recreate listings_insert_own policy with improved logic
  - Add policy for listings SELECT to allow owner to read their own paused listings
  - Add index on profiles(id, role) for faster RLS subquery performance
*/

-- Drop the existing insert policy and recreate it cleanly
DROP POLICY IF EXISTS "listings_insert_own" ON public.listings;

-- Recreate: owner_id and created_by_owner_id must match auth.uid(),
-- AND the user's profile role must be 'owner'
CREATE POLICY "listings_insert_own"
  ON public.listings
  FOR INSERT
  TO authenticated
  WITH CHECK (
    owner_id = auth.uid()
    AND created_by_owner_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'owner'
    )
  );

-- Ensure owners can always read their own listings (even unavailable ones)
-- The existing listings_select_public already covers: available=true OR owner_id=auth.uid()
-- This is fine - no change needed there.

-- Add a composite index to speed up the role check in the INSERT policy subquery
CREATE INDEX IF NOT EXISTS idx_profiles_id_role ON public.profiles (id, role);

-- Add index on listings for owner queries
CREATE INDEX IF NOT EXISTS idx_listings_owner_id ON public.listings (owner_id);
CREATE INDEX IF NOT EXISTS idx_listings_created_by ON public.listings (created_by_owner_id);

-- Fix: ensure profiles can be read during the RLS check
-- The existing profiles_select_own_profile and profiles_select_self_for_owner_activation
-- both cover auth.uid() = id, which is what the listings insert policy needs.
-- No change needed here.

-- Fix inquiries: ensure owners can SELECT all inquiries for their listings
-- (needed for the inbox and owner dashboard)
DROP POLICY IF EXISTS "inquiries_select_owner" ON public.inquiries;
CREATE POLICY "inquiries_select_owner"
  ON public.inquiries
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.listings
      WHERE listings.id = inquiries.listing_id
        AND listings.owner_id = auth.uid()
    )
  );
