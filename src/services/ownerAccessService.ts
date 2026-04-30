import type { UserProfile } from '@/src/services/profileService';
import { supabase } from '@/src/services/supabaseClient';

const OWNER_ACCESS_REQUESTS_TABLE = 'owner_access_requests';
const PROFILES_TABLE = 'profiles';

export type OwnerPgEnquiryInput = {
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  propertyName: string;
  locality: string;
  roomCount: number;
  notes: string;
  existingBusiness: boolean;
};

type SupabaseErrorLike = {
  code?: string;
  message?: string;
  details?: string;
  hint?: string;
};

function getOwnerAccessError(action: string, error: unknown) {
  const supabaseError = error as SupabaseErrorLike;
  const parts = [
    supabaseError.message || `Unable to ${action}.`,
    supabaseError.details ? `Details: ${supabaseError.details}` : '',
    supabaseError.hint ? `Hint: ${supabaseError.hint}` : '',
    supabaseError.code ? `Code: ${supabaseError.code}` : '',
  ].filter(Boolean);

  if (supabaseError.code === '42P01' || supabaseError.code === 'PGRST205') {
    return `${parts.join(' ')} The owner_access_requests table is missing in Supabase. Apply the owner access migration.`;
  }

  if (supabaseError.code === '42501') {
    return `${parts.join(' ')} RLS blocked the request. Confirm user_id equals the signed-in auth user id.`;
  }

  return parts.join(' ');
}

export async function submitOwnerPgEnquiry(input: OwnerPgEnquiryInput) {
  const { data, error } = await supabase
    .from(OWNER_ACCESS_REQUESTS_TABLE)
    .insert({
      user_id: input.userId,
      full_name: input.fullName.trim(),
      email: input.email.trim().toLowerCase(),
      phone: input.phone.trim(),
      property_name: input.propertyName.trim(),
      locality: input.locality.trim(),
      room_count: input.roomCount,
      notes: input.notes.trim() || null,
      existing_business: input.existingBusiness,
      status: 'approved',
    })
    .select('id')
    .single();

  if (error) {
    throw new Error(getOwnerAccessError('store PG enquiry', error));
  }

  return data;
}

export async function promoteProfileToOwner(profile: UserProfile, userId: string) {
  if (profile.id !== userId) {
    throw new Error('Owner login failed: profile id does not match the signed-in auth user.');
  }

  const { error } = await supabase.from(PROFILES_TABLE).update({ role: 'owner' }).eq('id', userId);

  if (error) {
    throw new Error(getOwnerAccessError('activate owner login', error));
  }
}
