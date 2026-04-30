export const LOCALITY_FILTERS = ['All', 'Ballygunge', 'Park Circus', 'Salt Lake', 'New Town', 'Gariahat'] as const;
export const FOOD_FILTERS = ['Any', 'Veg', 'Non-Veg', 'Both'] as const;

export type LocalityFilter = (typeof LOCALITY_FILTERS)[number];
export type FoodPreference = (typeof FOOD_FILTERS)[number];

export type Listing = {
  id: string;
  title: string;
  area: Exclude<LocalityFilter, 'All'>;
  locality: Exclude<LocalityFilter, 'All'>;
  rent: number;
  deposit: number;
  foodPreference: Exclude<FoodPreference, 'Any'>;
  roomType: 'Single' | 'Double' | 'Triple';
  availableBeds: number;
  genderType: 'Boys' | 'Girls' | 'Unisex';
  verified: boolean;
  auraScore: number;
  distanceToMetro: string;
  distanceToCollege: string;
  amenities: string[];
  imageColor: string;
  description: string;
  ownerName: string;
  ownerPhone: string;
  createdByOwnerId?: string;
  viewsCount?: number;
  favoritesCount?: number;
  last7DaysViews?: number[];
  createdAt?: string;
  updatedAt?: string;
  isAvailable: boolean;
  reviews: {
    name: string;
    rating: number;
    comment: string;
    stayType: 'Student' | 'Intern';
  }[];
};

const makeReviews = (listingTitle: string) => [
  {
    name: 'Riya S.',
    rating: 4.6,
    comment: `${listingTitle} felt safe, clean, and very student-friendly.`,
    stayType: 'Student' as const,
  },
  {
    name: 'Arjun M.',
    rating: 4.4,
    comment: 'Commute and food quality were solid for my daily routine.',
    stayType: 'Intern' as const,
  },
  {
    name: 'Neha P.',
    rating: 4.7,
    comment: 'Owner support was quick and move-in was hassle free.',
    stayType: 'Student' as const,
  },
];

export const KOLKATA_LISTINGS: Listing[] = [
  {
    id: 'kol-1',
    title: 'Sunrise PG',
    area: 'Ballygunge',
    locality: 'Ballygunge',
    rent: 6500,
    deposit: 6500,
    foodPreference: 'Both',
    roomType: 'Double',
    availableBeds: 4,
    genderType: 'Unisex',
    verified: true,
    auraScore: 8.4,
    distanceToMetro: '0.9 km to Ballygunge Metro',
    distanceToCollege: '1.4 km to Gokhale Memorial',
    amenities: ['WiFi', 'Food Included', 'AC', 'Laundry', 'CCTV'],
    imageColor: '#D9E7FF',
    description: 'Well-maintained PG with daily cleaning, home-style meals, and calm study spaces ideal for students.',
    ownerName: 'Ananya Das',
    ownerPhone: '+91 98765 11001',
    isAvailable: true,
    reviews: makeReviews('Sunrise PG'),
  },
  {
    id: 'kol-2',
    title: 'Park Circus Student Nest',
    area: 'Park Circus',
    locality: 'Park Circus',
    rent: 5800,
    deposit: 5000,
    foodPreference: 'Veg',
    roomType: 'Triple',
    availableBeds: 6,
    genderType: 'Boys',
    verified: true,
    auraScore: 8.1,
    distanceToMetro: '0.8 km to Park Circus Metro',
    distanceToCollege: '1.2 km to Lady Brabourne College',
    amenities: ['WiFi', 'Food Included', 'Laundry', 'CCTV', 'Water Purifier'],
    imageColor: '#E4F7EA',
    description: 'Budget-friendly rooms with strong student community, secure entry, and quick access to nearby eateries.',
    ownerName: 'Sohini Ghosh',
    ownerPhone: '+91 98765 11002',
    isAvailable: true,
    reviews: makeReviews('Park Circus Student Nest'),
  },
  {
    id: 'kol-3',
    title: 'Metro Stay',
    area: 'Salt Lake',
    locality: 'Salt Lake',
    rent: 7200,
    deposit: 7200,
    foodPreference: 'Both',
    roomType: 'Single',
    availableBeds: 2,
    genderType: 'Unisex',
    verified: true,
    auraScore: 8.6,
    distanceToMetro: '1.1 km to Sector V Metro',
    distanceToCollege: '2.0 km to Techno India University',
    amenities: ['WiFi', 'Food Included', 'AC', 'Power Backup', 'CCTV'],
    imageColor: '#FDEAD7',
    description: 'Modern co-living setup with furnished rooms, biometric access, and high-speed internet for study sessions.',
    ownerName: 'Ritwik Sen',
    ownerPhone: '+91 98765 11003',
    isAvailable: true,
    reviews: makeReviews('Metro Stay'),
  },
  {
    id: 'kol-4',
    title: 'Gariahat Comfort Rooms',
    area: 'Gariahat',
    locality: 'Gariahat',
    rent: 5400,
    deposit: 5000,
    foodPreference: 'Veg',
    roomType: 'Double',
    availableBeds: 5,
    genderType: 'Girls',
    verified: true,
    auraScore: 7.9,
    distanceToMetro: '1.0 km to Kalighat Metro',
    distanceToCollege: '1.3 km to South City College',
    amenities: ['WiFi', 'Food Included', 'Laundry', 'CCTV', 'Housekeeping'],
    imageColor: '#E7E4FF',
    description: 'Comfortable twin-sharing rooms with strict security and women-friendly environment near transport links.',
    ownerName: 'Poulomi Dey',
    ownerPhone: '+91 98765 11004',
    isAvailable: true,
    reviews: makeReviews('Gariahat Comfort Rooms'),
  },
  {
    id: 'kol-5',
    title: 'Ballygunge Prime Hostel',
    area: 'Ballygunge',
    locality: 'Ballygunge',
    rent: 6900,
    deposit: 6000,
    foodPreference: 'Non-Veg',
    roomType: 'Single',
    availableBeds: 1,
    genderType: 'Boys',
    verified: false,
    auraScore: 7.8,
    distanceToMetro: '1.0 km to Ballygunge Metro',
    distanceToCollege: '2.1 km to Asutosh College',
    amenities: ['WiFi', 'AC', 'Laundry', 'CCTV', 'Gym Access'],
    imageColor: '#D8F1F4',
    description: 'Energetic student hostel with spacious common areas, gym tie-up, and convenient transit options.',
    ownerName: 'Arijit Roy',
    ownerPhone: '+91 98765 11005',
    isAvailable: true,
    reviews: makeReviews('Ballygunge Prime Hostel'),
  },
  {
    id: 'kol-6',
    title: 'Park Circus Residency',
    area: 'Park Circus',
    locality: 'Park Circus',
    rent: 6100,
    deposit: 5500,
    foodPreference: 'Both',
    roomType: 'Double',
    availableBeds: 3,
    genderType: 'Unisex',
    verified: true,
    auraScore: 8.0,
    distanceToMetro: '0.6 km to Park Circus Metro',
    distanceToCollege: "2.1 km to St. Xavier's College",
    amenities: ['WiFi', 'Food Included', 'AC', 'Laundry', 'CCTV'],
    imageColor: '#FFE3E3',
    description: 'Neat and airy property with elevator access, hygienic kitchen setup, and reliable maintenance support.',
    ownerName: 'Madhumita Paul',
    ownerPhone: '+91 98765 11006',
    isAvailable: true,
    reviews: makeReviews('Park Circus Residency'),
  },
  {
    id: 'kol-7',
    title: 'New Town Smart Living',
    area: 'New Town',
    locality: 'New Town',
    rent: 7600,
    deposit: 8000,
    foodPreference: 'Both',
    roomType: 'Single',
    availableBeds: 3,
    genderType: 'Unisex',
    verified: true,
    auraScore: 8.8,
    distanceToMetro: '1.5 km to New Town Metro',
    distanceToCollege: '2.4 km to Amity University Kolkata',
    amenities: ['WiFi', 'AC', 'Laundry', 'CCTV', 'Power Backup'],
    imageColor: '#E0EDFF',
    description: 'Premium student housing with study pods, smart lock rooms, and dedicated support staff on site.',
    ownerName: 'Neel Dutta',
    ownerPhone: '+91 98765 11007',
    isAvailable: true,
    reviews: makeReviews('New Town Smart Living'),
  },
  {
    id: 'kol-8',
    title: 'Gariahat Study Hub',
    area: 'Gariahat',
    locality: 'Gariahat',
    rent: 5600,
    deposit: 5000,
    foodPreference: 'Veg',
    roomType: 'Triple',
    availableBeds: 7,
    genderType: 'Girls',
    verified: false,
    auraScore: 7.6,
    distanceToMetro: '1.3 km to Kalighat Metro',
    distanceToCollege: '0.8 km to Gariahat campus cluster',
    amenities: ['WiFi', 'Food Included', 'Laundry', 'CCTV', 'RO Water'],
    imageColor: '#F7E5D8',
    description: 'Affordable and peaceful PG with meal plans, in-house caretaker, and dedicated quiet hours for study.',
    ownerName: 'Shreya Chakraborty',
    ownerPhone: '+91 98765 11008',
    isAvailable: true,
    reviews: makeReviews('Gariahat Study Hub'),
  },
  {
    id: 'kol-9',
    title: 'Lakeview Student Homes',
    area: 'Salt Lake',
    locality: 'Salt Lake',
    rent: 7000,
    deposit: 7000,
    foodPreference: 'Non-Veg',
    roomType: 'Double',
    availableBeds: 4,
    genderType: 'Boys',
    verified: true,
    auraScore: 8.3,
    distanceToMetro: '0.9 km to Karunamoyee Metro',
    distanceToCollege: '1.8 km to Bidhannagar College',
    amenities: ['WiFi', 'Food Included', 'AC', 'Laundry', 'CCTV'],
    imageColor: '#DDF3FF',
    description: 'Popular among engineering students for strong internet, optional meal packages, and late-entry assistance.',
    ownerName: 'Kaustav Banerjee',
    ownerPhone: '+91 98765 11009',
    isAvailable: true,
    reviews: makeReviews('Lakeview Student Homes'),
  },
  {
    id: 'kol-10',
    title: 'New Town Green Lane PG',
    area: 'New Town',
    locality: 'New Town',
    rent: 6800,
    deposit: 6500,
    foodPreference: 'Veg',
    roomType: 'Double',
    availableBeds: 5,
    genderType: 'Girls',
    verified: true,
    auraScore: 8.2,
    distanceToMetro: '1.2 km to New Town Metro',
    distanceToCollege: '1.6 km to Amity University Kolkata',
    amenities: ['WiFi', 'Food Included', 'AC', 'Laundry', 'CCTV'],
    imageColor: '#E8FBE7',
    description: 'Bright and secure girls PG with curated meal menu, wardrobe storage, and attentive wardens.',
    ownerName: 'Moumita Saha',
    ownerPhone: '+91 98765 11010',
    isAvailable: true,
    reviews: makeReviews('New Town Green Lane PG'),
  },
];
