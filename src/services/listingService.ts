import { FOOD_FILTERS, Listing, LOCALITY_FILTERS } from '@/src/data/listings';
import { validatePositiveInteger, validateRequired, ValidationResult } from '@/src/services/validationService';

export const VALID_LOCALITIES = LOCALITY_FILTERS.filter((locality) => locality !== 'All') as Listing['locality'][];
export const VALID_FOOD_PREFERENCES = FOOD_FILTERS.filter((food) => food !== 'Any') as Listing['foodPreference'][];
export const VALID_ROOM_TYPES: Listing['roomType'][] = ['Single', 'Double', 'Triple'];
export const VALID_GENDER_TYPES: Listing['genderType'][] = ['Boys', 'Girls', 'Unisex'];

export type ListingFilters = {
  searchQuery: string;
  locality: string;
  foodPreference: string;
  maxRent: string;
};

export type ListingInput = {
  title: string;
  locality: string;
  rent: string;
  deposit: string;
  genderType: Listing['genderType'];
  foodPreference: Listing['foodPreference'];
  roomType: Listing['roomType'];
  availableBeds: string;
  description: string;
};

export function filterListings(listings: Listing[], filters: ListingFilters) {
  const normalizedQuery = filters.searchQuery.trim().toLowerCase();
  const maxRentNumber = Number(filters.maxRent.trim());

  return listings.filter((listing) => {
    const localityMatch = filters.locality === 'All' || listing.locality === filters.locality;
    const foodMatch = filters.foodPreference === 'Any' || listing.foodPreference === filters.foodPreference;
    const rentMatch = !filters.maxRent.trim() || (!Number.isNaN(maxRentNumber) && listing.rent <= maxRentNumber);
    const searchMatch =
      !normalizedQuery ||
      listing.title.toLowerCase().includes(normalizedQuery) ||
      listing.area.toLowerCase().includes(normalizedQuery) ||
      listing.locality.toLowerCase().includes(normalizedQuery);

    return localityMatch && foodMatch && rentMatch && searchMatch;
  });
}

function formatAllowed(values: readonly string[]) {
  return values.join(', ');
}

export function validateListingInput(input: ListingInput): ValidationResult {
  const checks = [
    validateRequired('Title', input.title),
    validateRequired('Locality', input.locality),
    validateRequired('Rent', input.rent),
    validateRequired('Deposit', input.deposit),
    validateRequired('Available beds', input.availableBeds),
    validateRequired('Description', input.description),
    validatePositiveInteger('Rent', input.rent),
    validatePositiveInteger('Deposit', input.deposit),
    validatePositiveInteger('Available beds', input.availableBeds),
  ];

  const failingCheck = checks.find((check) => !check.ok);
  if (failingCheck) {
    return failingCheck;
  }

  if (!VALID_LOCALITIES.includes(input.locality as Listing['locality'])) {
    return { ok: false, message: `Locality must be one of: ${formatAllowed(VALID_LOCALITIES)}` };
  }

  if (!VALID_ROOM_TYPES.includes(input.roomType)) {
    return { ok: false, message: `Room type must be one of: ${formatAllowed(VALID_ROOM_TYPES)}` };
  }

  if (!VALID_GENDER_TYPES.includes(input.genderType)) {
    return { ok: false, message: `Gender must be one of: ${formatAllowed(VALID_GENDER_TYPES)}` };
  }

  if (!VALID_FOOD_PREFERENCES.includes(input.foodPreference)) {
    return { ok: false, message: `Food preference must be one of: ${formatAllowed(VALID_FOOD_PREFERENCES)}` };
  }

  return { ok: true };
}

export function updateOwnerListing(existing: Listing, input: ListingInput): Listing {
  const locality = input.locality as Exclude<(typeof LOCALITY_FILTERS)[number], 'All'>;

  return {
    ...existing,
    title: input.title.trim(),
    area: locality,
    locality,
    rent: Number(input.rent.trim()),
    deposit: Number(input.deposit.trim()),
    foodPreference: input.foodPreference as Listing['foodPreference'],
    roomType: input.roomType,
    availableBeds: Number(input.availableBeds.trim()),
    genderType: input.genderType,
    description: input.description.trim(),
  };
}
