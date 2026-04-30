import type { Listing } from '@/src/data/listings';
import type { UserProfile } from '@/src/services/profileService';
import { ListingInput, updateOwnerListing, validateListingInput } from '@/src/services/listingService';
import { supabase } from '@/src/services/supabaseClient';

const LISTINGS_TABLE = 'listings';

type SupabaseListingRow = {
  id: string;
  owner_id: string;
  title: string;
  description: string | null;
  area: string;
  locality: string;
  city: string;
  address: string | null;
  rent: number;
  deposit: number;
  gender_type: 'Boys' | 'Girls' | 'Unisex';
  room_type: 'Single' | 'Double' | 'Triple';
  available_beds: number;
  food_preference: 'Veg' | 'Non-Veg' | 'Both';
  property_type: string | null;
  owner_name: string | null;
  owner_phone: string | null;
  created_by_owner_id: string;
  amenities: string[];
  image_color: string;
  available: boolean;
  occupied: boolean;
  verified: boolean;
  aura_score: number | null;
  distance_to_metro: string | null;
  distance_to_college: string | null;
  views_count: number;
  created_at: string;
  updated_at: string;
};

type SupabaseListingUpdate = Partial<{
  title: string;
  description: string;
  area: string;
  locality: string;
  rent: number;
  deposit: number;
  gender_type: Listing['genderType'];
  room_type: Listing['roomType'];
  available_beds: number;
  food_preference: Listing['foodPreference'];
  amenities: string[];
  image_color: string;
  available: boolean;
  occupied: boolean;
  verified: boolean;
}>;

type SupabaseErrorLike = {
  code?: string;
  message?: string;
  details?: string;
  hint?: string;
};

function getSupabaseListingError(action: string, error: unknown) {
  const supabaseError = error as SupabaseErrorLike;
  const parts = [
    supabaseError.message || `Unable to ${action}.`,
    supabaseError.details ? `Details: ${supabaseError.details}` : '',
    supabaseError.hint ? `Hint: ${supabaseError.hint}` : '',
    supabaseError.code ? `Code: ${supabaseError.code}` : '',
  ].filter(Boolean);

  if (supabaseError.code === '42501') {
    return `${parts.join(' ')} RLS check failed. Confirm the signed-in user id matches listings.owner_id and created_by_owner_id.`;
  }

  if (supabaseError.code === '23503') {
    return `${parts.join(' ')} Owner profile is missing for the signed-in auth user.`;
  }

  if (supabaseError.code === '23514') {
    return `${parts.join(' ')} One of the listing fields does not match the database constraints.`;
  }

  return parts.join(' ');
}

function mapListingRow(row: SupabaseListingRow): Listing {
  return {
    id: row.id,
    title: row.title,
    area: row.area as Listing['area'],
    locality: row.locality as Listing['locality'],
    rent: row.rent,
    deposit: row.deposit,
    foodPreference: row.food_preference,
    roomType: row.room_type,
    availableBeds: row.available_beds,
    genderType: row.gender_type,
    verified: row.verified,
    auraScore: row.aura_score ?? 0,
    distanceToMetro: row.distance_to_metro ?? '',
    distanceToCollege: row.distance_to_college ?? '',
    amenities: row.amenities ?? [],
    imageColor: row.image_color ?? '#D9E7FF',
    description: row.description ?? '',
    ownerName: row.owner_name ?? '',
    ownerPhone: row.owner_phone ?? '',
    createdByOwnerId: row.created_by_owner_id,
    viewsCount: row.views_count ?? 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    isAvailable: row.available,
    reviews: [],
  };
}

function buildListingInsert(input: ListingInput, owner: UserProfile, authUserId: string) {
  const validation = validateListingInput(input);
  if (!validation.ok) {
    throw new Error(validation.message ?? 'Invalid listing input');
  }

  if (!authUserId) {
    throw new Error('No authenticated owner session found. Please sign in again before creating a listing.');
  }

  if (owner.id !== authUserId) {
    throw new Error('Owner profile mismatch: signed-in user does not match the loaded owner profile.');
  }

  const locality = input.locality as Listing['locality'];

  return {
    owner_id: authUserId,
    title: input.title.trim(),
    description: input.description.trim(),
    area: locality,
    locality,
    city: owner.city || 'Kolkata',
    rent: Number(input.rent.trim()),
    deposit: Number(input.deposit.trim()),
    gender_type: input.genderType,
    room_type: input.roomType,
    available_beds: Number(input.availableBeds.trim()),
    food_preference: input.foodPreference as Listing['foodPreference'],
    property_type: 'pg',
    owner_name: owner.fullName,
    owner_phone: owner.phone,
    created_by_owner_id: authUserId,
    amenities: ['WiFi', 'Laundry', 'CCTV'],
    image_color: '#D9E7FF',
    available: true,
    occupied: false,
    verified: false,
    aura_score: 0,
    distance_to_metro: '',
    distance_to_college: '',
  };
}

export async function fetchPublicListings(): Promise<Listing[]> {
  const { data, error } = await supabase
    .from(LISTINGS_TABLE)
    .select('*')
    .eq('available', true)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(getSupabaseListingError('load public listings', error));
  }

  return (data ?? []).map(mapListingRow);
}

export async function fetchOwnerListings(ownerId: string): Promise<Listing[]> {
  const { data, error } = await supabase
    .from(LISTINGS_TABLE)
    .select('*')
    .eq('owner_id', ownerId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(getSupabaseListingError('load owner listings', error));
  }

  return (data ?? []).map(mapListingRow);
}

export async function fetchListingById(listingId: string): Promise<Listing> {
  const { data, error } = await supabase.from(LISTINGS_TABLE).select('*').eq('id', listingId).single();

  if (error) {
    throw new Error(getSupabaseListingError('load listing', error));
  }

  return mapListingRow(data);
}

export async function insertOwnerListing(input: ListingInput, owner: UserProfile, authUserId: string): Promise<Listing> {
  const payload = buildListingInsert(input, owner, authUserId);
  const { data, error } = await supabase.from(LISTINGS_TABLE).insert([payload]).select('*').single();

  if (error) {
    throw new Error(getSupabaseListingError('create listing', error));
  }

  return mapListingRow(data);
}

export async function updateOwnerListingRecord(listingId: string, input: ListingInput): Promise<Listing> {
  const { data: existingListing, error: fetchError } = await supabase.from(LISTINGS_TABLE).select('*').eq('id', listingId).single();

  if (fetchError || !existingListing) {
    throw fetchError ? new Error(getSupabaseListingError('load listing before update', fetchError)) : new Error('Listing not found');
  }

  const updatedListing = updateOwnerListing(mapListingRow(existingListing), input);
  const updates = {
    title: updatedListing.title,
    description: updatedListing.description,
    area: updatedListing.area,
    locality: updatedListing.locality,
    rent: updatedListing.rent,
    deposit: updatedListing.deposit,
    gender_type: updatedListing.genderType,
    room_type: updatedListing.roomType,
    available_beds: updatedListing.availableBeds,
    food_preference: updatedListing.foodPreference,
    distance_to_metro: updatedListing.distanceToMetro,
    distance_to_college: updatedListing.distanceToCollege,
    amenities: updatedListing.amenities,
    image_color: updatedListing.imageColor,
  };

  const { data, error } = await supabase.from(LISTINGS_TABLE).update(updates).eq('id', listingId).select().single();

  if (error) {
    throw new Error(getSupabaseListingError('update listing', error));
  }

  return mapListingRow(data);
}

export async function deleteOwnerListingRecord(listingId: string) {
  const { error } = await supabase.from(LISTINGS_TABLE).delete().eq('id', listingId);

  if (error) {
    throw new Error(getSupabaseListingError('delete listing', error));
  }
}

export async function toggleListingAvailabilityRecord(listing: Listing): Promise<Listing> {
  const { data, error } = await supabase
    .from(LISTINGS_TABLE)
    .update({ available: !listing.isAvailable })
    .eq('id', listing.id)
    .select()
    .single();

  if (error) {
    throw new Error(getSupabaseListingError('update listing availability', error));
  }

  return mapListingRow(data);
}

export async function updateOwnerListingFields(listingId: string, updates: SupabaseListingUpdate): Promise<Listing> {
  const { data, error } = await supabase.from(LISTINGS_TABLE).update(updates).eq('id', listingId).select().single();

  if (error) {
    throw new Error(getSupabaseListingError('update listing fields', error));
  }

  return mapListingRow(data);
}
