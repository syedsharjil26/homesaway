import type { Listing } from '@/src/data/listings';
import {
  deleteOwnerListingRecord,
  fetchOwnerListings,
  toggleListingAvailabilityRecord,
  updateOwnerListingFields,
} from '@/src/services/supabaseListings';
import { fetchInquiriesForListings, InquiryStatus, updateInquiryStatus } from '@/src/services/supabaseInquiries';
import type {
  OwnerListingControls,
  OwnerListingInsights,
  OwnerListingManagementDetail,
  OwnerListingPerformance,
  OwnerListingStatus,
} from '@/src/types/owner';

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const COVER_COLORS = ['#D9E7FF', '#E4F7EA', '#FDEAD7', '#E7E4FF', '#D8F1F4', '#FFE3E3', '#E8FBE7'];

function hashText(value: string) {
  return value.split('').reduce((sum, char, index) => sum + char.charCodeAt(0) * (index + 3), 17);
}

function getListingStatus(listing: Listing): OwnerListingStatus {
  if (!listing.title.trim() || !listing.description.trim()) {
    return 'Draft';
  }

  if (listing.availableBeds <= 0) {
    return 'Full';
  }

  if (!listing.isAvailable) {
    return 'Paused';
  }

  return 'Active';
}

function getLast7DaysViews(listing: Listing) {
  if (listing.last7DaysViews?.length === 7) {
    return listing.last7DaysViews;
  }

  const seed = hashText(listing.id);
  const totalViews = listing.viewsCount && listing.viewsCount > 0 ? listing.viewsCount : 140 + (seed % 180);
  const recentShare = Math.max(34, Math.round(totalViews * 0.28));
  const weights = [0.09, 0.13, 0.1, 0.18, 0.15, 0.22, 0.13];
  const wobble = seed % 4;

  return weights.map((weight, index) => Math.max(3, Math.round(recentShare * weight) + ((index + wobble) % 3)));
}

function getPerformance(listing: Listing, inquiryCount: number): OwnerListingPerformance {
  const seed = hashText(listing.id);
  const last7DaysViews = getLast7DaysViews(listing);
  const totalViews = listing.viewsCount && listing.viewsCount > 0 ? listing.viewsCount : last7DaysViews.reduce((sum, views) => sum + views, 0) * 3;
  const favorites = listing.favoritesCount ?? Math.max(0, Math.round(totalViews * 0.14) + (seed % 7) - 2);
  const conversionRate = totalViews > 0 ? Number(((inquiryCount / totalViews) * 100).toFixed(1)) : 0;

  return {
    totalViews,
    favorites,
    inquiries: inquiryCount,
    conversionRate,
    last7DaysViews,
  };
}

function getControls(listing: Listing): OwnerListingControls {
  const normalizedAmenities = listing.amenities.map((amenity) => amenity.toLowerCase());

  return {
    hasFoodOptions: normalizedAmenities.some((amenity) => amenity.includes('food') || amenity.includes('meal')),
    isFurnished: normalizedAmenities.some((amenity) => amenity.includes('furnished') || amenity.includes('wardrobe')),
    smokingAllowed: normalizedAmenities.some((amenity) => amenity.includes('smoking allowed')),
    verifiedDocs: listing.verified,
    genderPreference: listing.genderType,
  };
}

function getInsights(performance: OwnerListingPerformance): OwnerListingInsights {
  const bestIndex = performance.last7DaysViews.reduce(
    (best, views, index, days) => (views > days[best] ? index : best),
    0
  );
  const demandScore = performance.inquiries * 9 + performance.favorites * 2 + performance.conversionRate * 12;
  const demandLevel = demandScore >= 90 ? 'High' : demandScore >= 38 ? 'Medium' : 'Low';
  const avgResponseTime = performance.inquiries === 0 ? 'No inquiries yet' : demandLevel === 'High' ? '48 min' : '2h 15m';

  return {
    mostViewsDay: DAY_LABELS[bestIndex],
    demandLevel,
    avgResponseTime,
  };
}

function withAmenity(amenities: string[], amenity: string, enabled: boolean) {
  const filtered = amenities.filter((item) => item.toLowerCase() !== amenity.toLowerCase());
  return enabled ? [...filtered, amenity] : filtered;
}

export function buildOwnerListingDetail(listing: Listing, inquiries = [] as OwnerListingManagementDetail['inquiries']) {
  const performance = getPerformance(listing, inquiries.length);

  return {
    listing,
    status: getListingStatus(listing),
    performance,
    controls: getControls(listing),
    insights: getInsights(performance),
    inquiries,
  } satisfies OwnerListingManagementDetail;
}

export async function fetchOwnerListingManagementDetail(ownerId: string, listingId: string): Promise<OwnerListingManagementDetail> {
  const ownerListings = await fetchOwnerListings(ownerId);
  const listing = ownerListings.find((item) => item.id === listingId);

  if (!listing) {
    throw new Error('Listing not found for this owner account.');
  }

  const inquiries = await fetchInquiriesForListings([listing]);
  return buildOwnerListingDetail(listing, inquiries);
}

export async function updateOwnerListingRent(listing: Listing, rent: number) {
  return updateOwnerListingFields(listing.id, { rent });
}

export async function updateOwnerListingControls(listing: Listing, controls: OwnerListingControls) {
  let amenities = withAmenity(listing.amenities, 'Food Included', controls.hasFoodOptions);
  amenities = withAmenity(amenities, 'Furnished', controls.isFurnished);
  amenities = withAmenity(amenities, 'Smoking Allowed', controls.smokingAllowed);

  return updateOwnerListingFields(listing.id, {
    amenities,
    gender_type: controls.genderPreference,
  });
}

export async function rotateOwnerListingCover(listing: Listing) {
  const currentIndex = COVER_COLORS.indexOf(listing.imageColor);
  const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % COVER_COLORS.length : hashText(listing.id) % COVER_COLORS.length;
  return updateOwnerListingFields(listing.id, { image_color: COVER_COLORS[nextIndex] });
}

export async function setOwnerListingPaused(listing: Listing, paused: boolean) {
  if (listing.isAvailable === !paused) {
    return listing;
  }

  return toggleListingAvailabilityRecord(listing);
}

export async function deleteOwnerListing(listingId: string) {
  await deleteOwnerListingRecord(listingId);
}

export async function updateOwnerInquiryAction(inquiryId: string, status: InquiryStatus) {
  return updateInquiryStatus(inquiryId, status);
}
