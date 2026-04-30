import type { Listing } from '@/src/data/listings';
import type { OwnerInquiry } from '@/src/services/supabaseInquiries';

export type OwnerListingStatus = 'Active' | 'Paused' | 'Full' | 'Draft';

export type OwnerListingPerformance = {
  totalViews: number;
  favorites: number;
  inquiries: number;
  conversionRate: number;
  last7DaysViews: number[];
};

export type OwnerListingControls = {
  hasFoodOptions: boolean;
  isFurnished: boolean;
  smokingAllowed: boolean;
  verifiedDocs: boolean;
  genderPreference: Listing['genderType'];
};

export type OwnerListingInsights = {
  mostViewsDay: string;
  demandLevel: 'Low' | 'Medium' | 'High';
  avgResponseTime: string;
};

export type OwnerListingManagementDetail = {
  listing: Listing;
  status: OwnerListingStatus;
  performance: OwnerListingPerformance;
  controls: OwnerListingControls;
  insights: OwnerListingInsights;
  inquiries: OwnerInquiry[];
};
