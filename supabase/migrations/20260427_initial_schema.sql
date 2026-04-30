-- Initial Supabase schema for HomesAway
-- Run this in Supabase SQL editor or via your migrations workflow.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Auto-update updated_at timestamps on row changes
CREATE OR REPLACE FUNCTION public.trigger_set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TABLE public.profiles (
  id uuid NOT NULL,
  role text NOT NULL CHECK (role = ANY (ARRAY['student'::text, 'owner'::text, 'admin'::text])),
  full_name text,
  phone text UNIQUE,
  email text,
  city text NOT NULL DEFAULT 'Kolkata'::text,
  college text,
  avatar_url text,
  is_verified boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT profiles_pkey PRIMARY KEY (id),
  CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);

CREATE TABLE public.listings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  area text NOT NULL,
  locality text NOT NULL,
  city text NOT NULL DEFAULT 'Kolkata'::text,
  address text,
  rent integer NOT NULL,
  deposit integer NOT NULL DEFAULT 0,
  gender_type text NOT NULL CHECK (gender_type = ANY (ARRAY['Boys'::text, 'Girls'::text, 'Unisex'::text])),
  room_type text NOT NULL DEFAULT 'Double'::text CHECK (room_type = ANY (ARRAY['Single'::text, 'Double'::text, 'Triple'::text])),
  available_beds integer NOT NULL DEFAULT 1,
  food_preference text NOT NULL DEFAULT 'Both'::text CHECK (food_preference = ANY (ARRAY['Veg'::text, 'Non-Veg'::text, 'Both'::text])),
  property_type text CHECK (property_type = ANY (ARRAY['pg'::text, 'flat'::text, 'hostel'::text, 'room'::text])),
  owner_name text,
  owner_phone text,
  created_by_owner_id uuid NOT NULL,
  amenities text[] NOT NULL DEFAULT ARRAY[]::text[],
  image_color text NOT NULL DEFAULT '#D9E7FF'::text,
  available boolean NOT NULL DEFAULT true,
  occupied boolean NOT NULL DEFAULT false,
  verified boolean NOT NULL DEFAULT false,
  aura_score numeric,
  distance_to_metro text,
  distance_to_college text,
  views_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT listings_pkey PRIMARY KEY (id),
  CONSTRAINT listings_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.profiles(id)
);

CREATE TABLE public.listing_amenities (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL,
  amenity text NOT NULL,
  CONSTRAINT listing_amenities_pkey PRIMARY KEY (id),
  CONSTRAINT listing_amenities_listing_id_fkey FOREIGN KEY (listing_id) REFERENCES public.listings(id)
);

CREATE TABLE public.listing_images (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL,
  image_url text NOT NULL,
  sort_order integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT listing_images_pkey PRIMARY KEY (id),
  CONSTRAINT listing_images_listing_id_fkey FOREIGN KEY (listing_id) REFERENCES public.listings(id)
);

CREATE TABLE public.favorites (
  user_id uuid NOT NULL,
  listing_id uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT favorites_pkey PRIMARY KEY (user_id, listing_id),
  CONSTRAINT favorites_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id),
  CONSTRAINT favorites_listing_id_fkey FOREIGN KEY (listing_id) REFERENCES public.listings(id)
);

CREATE TABLE public.inquiries (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL,
  student_id uuid NOT NULL,
  full_name text,
  phone text,
  college text,
  move_in_date date,
  budget integer,
  message text,
  status text NOT NULL DEFAULT 'new'::text CHECK (status = ANY (ARRAY['new'::text, 'contacted'::text, 'visited'::text, 'closed'::text, 'rejected'::text])),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT inquiries_pkey PRIMARY KEY (id),
  CONSTRAINT inquiries_listing_id_fkey FOREIGN KEY (listing_id) REFERENCES public.listings(id),
  CONSTRAINT inquiries_student_id_fkey FOREIGN KEY (student_id) REFERENCES public.profiles(id)
);

CREATE TABLE public.reviews (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  listing_id uuid NOT NULL,
  user_id uuid NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT reviews_pkey PRIMARY KEY (id),
  CONSTRAINT reviews_listing_id_fkey FOREIGN KEY (listing_id) REFERENCES public.listings(id),
  CONSTRAINT reviews_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);

CREATE TABLE public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text,
  body text,
  type text,
  is_read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT notifications_pkey PRIMARY KEY (id),
  CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.profiles(id)
);

CREATE TABLE public.owner_documents (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL,
  doc_type text,
  file_url text,
  status text NOT NULL DEFAULT 'pending'::text,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT owner_documents_pkey PRIMARY KEY (id),
  CONSTRAINT owner_documents_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.profiles(id)
);

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_listings_owner_id ON public.listings (owner_id);
CREATE INDEX IF NOT EXISTS idx_listings_city_area ON public.listings (city, area);
CREATE INDEX IF NOT EXISTS idx_listings_available ON public.listings (available);
CREATE INDEX IF NOT EXISTS idx_listings_verified ON public.listings (verified);
CREATE INDEX IF NOT EXISTS idx_listings_food_preference ON public.listings (food_preference);
CREATE INDEX IF NOT EXISTS idx_listings_room_type ON public.listings (room_type);
CREATE INDEX IF NOT EXISTS idx_listings_locality ON public.listings (locality);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles (email);
CREATE INDEX IF NOT EXISTS idx_inquiries_listing_id ON public.inquiries (listing_id);
CREATE INDEX IF NOT EXISTS idx_inquiries_student_id ON public.inquiries (student_id);
CREATE INDEX IF NOT EXISTS idx_reviews_listing_id ON public.reviews (listing_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON public.favorites (user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_listing_id ON public.favorites (listing_id);

-- Trigger bindings
CREATE TRIGGER trigger_set_updated_at_profiles
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();

CREATE TRIGGER trigger_set_updated_at_listings
BEFORE UPDATE ON public.listings
FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();

CREATE TRIGGER trigger_set_updated_at_inquiries
BEFORE UPDATE ON public.inquiries
FOR EACH ROW EXECUTE FUNCTION public.trigger_set_updated_at();

-- Row Level Security policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY profiles_select_own_profile ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY profiles_update_own_profile ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY profiles_insert_own_profile ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

ALTER TABLE public.listings ENABLE ROW LEVEL SECURITY;
CREATE POLICY listings_select_public ON public.listings FOR SELECT USING (available = true OR owner_id = auth.uid());
CREATE POLICY listings_insert_own ON public.listings FOR INSERT WITH CHECK (owner_id = auth.uid() AND created_by_owner_id = auth.uid());
CREATE POLICY listings_update_own ON public.listings FOR UPDATE USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE POLICY listings_delete_own ON public.listings FOR DELETE USING (owner_id = auth.uid());

ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;
CREATE POLICY inquiries_insert_student ON public.inquiries FOR INSERT WITH CHECK (student_id = auth.uid());
CREATE POLICY inquiries_select_student ON public.inquiries FOR SELECT USING (student_id = auth.uid());
CREATE POLICY inquiries_select_owner ON public.inquiries FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.listings WHERE id = listing_id AND owner_id = auth.uid()
  )
);

ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;
CREATE POLICY favorites_select_own ON public.favorites FOR SELECT USING (user_id = auth.uid());
CREATE POLICY favorites_insert_own ON public.favorites FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY favorites_delete_own ON public.favorites FOR DELETE USING (user_id = auth.uid());

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY reviews_select_public ON public.reviews FOR SELECT USING (true);
CREATE POLICY reviews_insert_own ON public.reviews FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY reviews_update_own ON public.reviews FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY reviews_delete_own ON public.reviews FOR DELETE USING (user_id = auth.uid());

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY notifications_select_own ON public.notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY notifications_insert_own ON public.notifications FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY notifications_update_own ON public.notifications FOR UPDATE USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

ALTER TABLE public.listing_images ENABLE ROW LEVEL SECURITY;
CREATE POLICY listing_images_select_public ON public.listing_images FOR SELECT USING (true);

ALTER TABLE public.listing_amenities ENABLE ROW LEVEL SECURITY;
CREATE POLICY listing_amenities_select_public ON public.listing_amenities FOR SELECT USING (true);
