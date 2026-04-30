import type { BookingPayload } from '@/src/data/bookings';
import type { Listing } from '@/src/data/listings';
import { supabase } from '@/src/services/supabaseClient';

const INQUIRIES_TABLE = 'inquiries';

export type InquiryStatus = 'new' | 'approved' | 'contacted' | 'booked' | 'visited' | 'closed' | 'rejected';

export type OwnerInquiry = {
  id: string;
  listingId: string;
  listingTitle: string;
  fullName: string;
  phone: string;
  college: string;
  moveInDate: string;
  budget: number | null;
  message: string;
  status: InquiryStatus;
  createdAt: string;
};

type SupabaseInquiryRow = {
  id: string;
  listing_id: string;
  student_id: string;
  full_name: string | null;
  phone: string | null;
  college: string | null;
  move_in_date: string | null;
  budget: number | null;
  message: string | null;
  status: InquiryStatus;
  created_at: string;
  updated_at: string;
};

function mapOwnerInquiry(row: SupabaseInquiryRow, listingMap: Map<string, Listing>) {
  const listing = listingMap.get(row.listing_id);

  return {
    id: row.id,
    listingId: row.listing_id,
    listingTitle: listing?.title ?? 'Unknown listing',
    fullName: row.full_name ?? '',
    phone: row.phone ?? '',
    college: row.college ?? '',
    moveInDate: row.move_in_date ?? '',
    budget: row.budget ?? null,
    message: row.message ?? '',
    status: row.status,
    createdAt: row.created_at,
  } satisfies OwnerInquiry;
}

export async function submitInquiry(payload: BookingPayload, studentId: string) {
  const row = {
    listing_id: payload.listing.id,
    student_id: studentId,
    full_name: payload.requesterName.trim(),
    phone: payload.phoneNumber.trim(),
    college: payload.collegeOrWorkplace.trim(),
    move_in_date: payload.moveInDate.trim() || null,
    budget: Number(payload.budget.trim()) || null,
    message: payload.message.trim(),
    status: 'new',
  };

  const { data, error } = await supabase.from(INQUIRIES_TABLE).insert([row]).select().single();

  if (error) {
    throw error;
  }

  return data;
}

export async function fetchInquiriesForListings(listings: Listing[]): Promise<OwnerInquiry[]> {
  if (listings.length === 0) {
    return [];
  }

  const listingIds = listings.map((listing) => listing.id);
  const listingMap = new Map(listings.map((listing) => [listing.id, listing]));

  const { data, error } = await supabase
    .from(INQUIRIES_TABLE)
    .select('*')
    .in('listing_id', listingIds)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) => mapOwnerInquiry(row, listingMap));
}

export async function updateInquiryStatus(inquiryId: string, status: InquiryStatus) {
  const { data, error } = await supabase.from(INQUIRIES_TABLE).update({ status }).eq('id', inquiryId).select().single();

  if (error) {
    throw error;
  }

  return data as SupabaseInquiryRow;
}
