import type { User } from '@supabase/supabase-js';

import { supabase } from '@/src/services/supabaseClient';

export type UserRole = 'student' | 'owner' | 'admin';

export type UserProfile = {
  id: string;
  role: UserRole;
  fullName: string;
  phone: string;
  email: string;
  city: string;
  college: string | null;
  avatarUrl: string | null;
  isVerified: boolean;
};

type SupabaseProfileRow = {
  id: string;
  role: UserRole | null;
  full_name: string | null;
  phone: string | null;
  email: string | null;
  city: string | null;
  college: string | null;
  avatar_url: string | null;
  is_verified: boolean | null;
};

const PROFILES_TABLE = 'profiles';

type SupabaseErrorLike = {
  code?: string;
  message?: string;
  details?: string;
  hint?: string;
};

function isValidRole(value: unknown): value is UserRole {
  return value === 'student' || value === 'owner' || value === 'admin';
}

function mapProfileRow(row: SupabaseProfileRow): UserProfile {
  return {
    id: row.id,
    role: isValidRole(row.role) ? row.role : 'student',
    fullName: row.full_name ?? '',
    phone: row.phone ?? '',
    email: row.email ?? '',
    city: row.city ?? 'Kolkata',
    college: row.college ?? null,
    avatarUrl: row.avatar_url ?? null,
    isVerified: row.is_verified ?? false,
  };
}

function buildProfileInsert(user: User) {
  return {
    id: user.id,
    role: 'student',
    full_name: typeof user.user_metadata?.full_name === 'string' ? user.user_metadata.full_name.trim() : '',
    phone: typeof user.user_metadata?.phone === 'string' ? user.user_metadata.phone.trim() : '',
    email: user.email ?? '',
    city: 'Kolkata',
    college: null,
    avatar_url: null,
    is_verified: false,
  };
}

function getReadableProfileError(error: unknown) {
  const supabaseError = error as SupabaseErrorLike;
  const code = supabaseError?.code ?? 'unknown';
  const message = supabaseError?.message ?? 'Unknown profile error';

  if (code === '42501') {
    return 'Profile access blocked by Supabase RLS policy. Please apply the profiles RLS SQL policy.';
  }

  return message;
}

function buildProfileUpdatePayload(user: User, existing: UserProfile | null) {
  const insertPayload = buildProfileInsert(user);

  return {
    role: existing && isValidRole(existing.role) ? existing.role : insertPayload.role,
    full_name: existing?.fullName || insertPayload.full_name,
    phone: existing?.phone || insertPayload.phone,
    email: existing?.email || insertPayload.email,
    city: existing?.city || insertPayload.city,
    college: existing?.college ?? insertPayload.college,
    avatar_url: existing?.avatarUrl ?? insertPayload.avatar_url,
    is_verified: existing?.isVerified ?? insertPayload.is_verified,
  };
}

export async function fetchProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase.from(PROFILES_TABLE).select('*').eq('id', userId).maybeSingle();

  if (error) {
    throw error;
  }

  return data ? mapProfileRow(data) : null;
}

export async function ensureProfileForUser(user: User): Promise<UserProfile> {
  let existing: UserProfile | null = null;
  try {
    existing = await fetchProfile(user.id);
  } catch (error) {
    throw new Error(getReadableProfileError(error));
  }

  if (!existing) {
    const insertPayload = buildProfileInsert(user);
    const { error: insertError } = await supabase.from(PROFILES_TABLE).insert([insertPayload]);

    if (insertError && insertError.code !== '23505') {
      throw new Error(getReadableProfileError(insertError));
    }

    try {
      existing = await fetchProfile(user.id);
    } catch (error) {
      throw new Error(getReadableProfileError(error));
    }

    if (!existing) {
      throw new Error('Profile creation did not complete. Please retry.');
    }
  }

  const needsRepair = !isValidRole(existing.role) || !existing.email || !existing.city;
  if (!needsRepair) {
    return existing;
  }

  const { data, error } = await supabase
    .from(PROFILES_TABLE)
    .update(buildProfileUpdatePayload(user, existing))
    .eq('id', user.id)
    .select()
    .single();

  if (error) {
    throw new Error(getReadableProfileError(error));
  }

  return mapProfileRow(data);
}
