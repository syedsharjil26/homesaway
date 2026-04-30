import type { Listing } from '@/src/data/listings';
import type { UserRole } from '@/src/services/profileService';

export type BookingPayload = {
  listing: Listing;
  requesterName: string;
  requesterRole: UserRole;
  phoneNumber: string;
  collegeOrWorkplace: string;
  moveInDate: string;
  budget: string;
  foodPreference: string;
  message: string;
};
