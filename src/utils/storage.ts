import { Room, Booking, HotelProfile, SubscriptionState, Expense, GuestVerificationData, ChannelType } from '../types';
export type { SubscriptionState, Expense, GuestVerificationData };

export const STORAGE_KEYS = {
  ROOMS: 'orderfix_rooms',
  BOOKINGS: 'orderfix_bookings',
  HOTEL: 'orderfix_hotel',
  HOTELS: 'orderfix_multi_hotels',
  ACTIVE_HOTEL_ID: 'orderfix_active_hotel_id',
  SUBSCRIPTION: 'orderfix_subscription',
  EXPENSES: 'orderfix_expenses',
  VERIFICATIONS: 'orderfix_police_verifications',
  IS_REGISTERED: 'orderfix_is_registered',
  AUTH_USER: 'orderfix_auth_user'
};

export function loadAuthUser(): import('../types').User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AUTH_USER);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load auth user', e);
  }
  return null;
}

export function saveAuthUser(user: import('../types').User | null): void {
  try {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.AUTH_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.AUTH_USER);
    }
  } catch (e) {
    console.error('Failed to save auth user', e);
  }
}

export const SAMPLE_HOTEL_IMAGES = [
  'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80', // Deluxe Room Bed
  'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80', // Wooden Suite Bedroom
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80', // Resort Balcony Green View
  'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1200&q=80'  // Luxury Attached Bath
];

export const KAZIRANGA_HOTEL_IMAGES = [
  'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=1200&q=80'
];

export const DEFAULT_HOTELS: HotelProfile[] = [
  {
    id: 'htl-seashell-01',
    name: 'Seashell Palms Homestay & Resort',
    tagline: 'Peaceful Brahmaputra Hospitality & Verified Safe Stay',
    description: 'Charming boutique homestay and riverside resort located near Brahmaputra Heritage in Guwahati. Features peaceful air-conditioned deluxe rooms, authentic Assamese breakfast, and scenic balcony views.',
    ownerName: 'Bhaskar Jyoti Baruah',
    phone: '+91 98234 56789',
    whatsappNumber: '+91 98234 56789',
    email: 'contact@seashellpalms.in',
    address: 'Near Brahmaputra Heritage / Beach Road, Uzan Bazar',
    city: 'Guwahati',
    state: 'Assam',
    pincode: '781001',
    currency: '₹',
    upiId: 'seashellpalms@okaxis',
    checkInStandardTime: '12:00 PM',
    checkOutStandardTime: '11:00 AM',
    images: SAMPLE_HOTEL_IMAGES,
    amenities: ['AC', 'Free High-speed Wi-Fi', 'Free Parking', 'Geyser / Hot Water', 'Smart TV', 'Private Balcony', 'Power Backup', 'In-house Dining'],
    entryFeePaid: true,
    entryFeeAmount: 99,
    entryFeeTxnId: 'ORD-REG-99-88129',
    entryFeePaidAt: '2026-09-15',
    subscriptionPlan: 'trial_free_month',
    subscriptionExpiresAt: '2026-10-15',
    trialDaysLeft: 26,
    policeStationName: 'Panbazar Police Station, Guwahati',
    policeStationWhatsApp: '+91 94350 12345',
    policeStationEmail: 'panbazar-ps@assampolice.gov.in',
    policeStationIncharge: 'Inspector B. Borah, OC Panbazar',
    hotelLicenseNumber: 'ASM/KAM/HTL/2024-912',
    isRegistered: true,
    createdAt: '2026-09-15T10:00:00.000Z'
  },
  {
    id: 'htl-kaziranga-02',
    name: 'Kaziranga Wild Orchid Heritage Lodge',
    tagline: 'Serene Wildlife Eco-Resort & Homestay',
    description: 'Eco-friendly forest retreat situated on the edge of Kaziranga National Park Central Range. Enjoy traditional cottages, tea garden walks, and guided safari coordination.',
    ownerName: 'Pranab Saikia',
    phone: '+91 94351 98765',
    whatsappNumber: '+91 94351 98765',
    email: 'stay@kazirangawildorchid.com',
    address: 'Kohora Central Range, Near Safari Gate',
    city: 'Kaziranga',
    state: 'Assam',
    pincode: '785609',
    currency: '₹',
    upiId: 'wildorchid@upi',
    checkInStandardTime: '01:00 PM',
    checkOutStandardTime: '11:00 AM',
    images: KAZIRANGA_HOTEL_IMAGES,
    amenities: ['AC', 'Free High-speed Wi-Fi', 'Free Parking', 'Geyser / Hot Water', 'Tea Maker', 'Safari Desk', 'Garden Hammocks', 'Bonfire Area'],
    entryFeePaid: true,
    entryFeeAmount: 99,
    entryFeeTxnId: 'ORD-REG-99-91402',
    entryFeePaidAt: '2026-09-20',
    subscriptionPlan: 'trial_free_month',
    subscriptionExpiresAt: '2026-10-20',
    trialDaysLeft: 28,
    policeStationName: 'Bokakhat Police Station, Golaghat',
    policeStationWhatsApp: '+91 94350 44556',
    policeStationEmail: 'bokakhat-ps@assampolice.gov.in',
    policeStationIncharge: 'Inspector R. Gogoi, OC Bokakhat',
    hotelLicenseNumber: 'ASM/GLG/HTL/2024-411',
    isRegistered: true,
    createdAt: '2026-09-20T11:30:00.000Z'
  }
];

export const DEFAULT_HOTEL: HotelProfile = DEFAULT_HOTELS[0];

export const DEFAULT_ROOMS: Room[] = [
  {
    id: '101',
    hotelId: 'htl-seashell-01',
    roomNumber: '101',
    name: 'Garden Breeze',
    type: 'Deluxe AC',
    floor: 1,
    basePrice: 2200,
    capacity: 2,
    amenities: ['AC', 'King Bed', 'Attached Balcony', 'Free Wi-Fi', 'Geyser']
  },
  {
    id: '102',
    hotelId: 'htl-seashell-01',
    roomNumber: '102',
    name: 'Coconut Grove',
    type: 'Standard',
    floor: 1,
    basePrice: 1500,
    capacity: 2,
    amenities: ['Fan', 'Queen Bed', 'Attached Bath', 'Free Wi-Fi']
  },
  {
    id: '103',
    hotelId: 'htl-seashell-01',
    roomNumber: '103',
    name: 'Coral Deluxe',
    type: 'Deluxe AC',
    floor: 1,
    basePrice: 2400,
    capacity: 2,
    amenities: ['AC', 'Balcony', 'Smart TV', 'Free Wi-Fi', 'Mini Fridge']
  },
  {
    id: '104',
    hotelId: 'htl-seashell-01',
    roomNumber: '104',
    name: 'Ocean Whisper',
    type: 'Premium Sea View',
    floor: 1,
    basePrice: 3200,
    capacity: 3,
    amenities: ['AC', 'Sea View Balcony', 'Bathtub', 'Smart TV', 'Tea Maker']
  },
  {
    id: '105',
    hotelId: 'htl-seashell-01',
    roomNumber: '105',
    name: 'Heritage Suite',
    type: 'Family Suite',
    floor: 2,
    basePrice: 3800,
    capacity: 4,
    amenities: ['2 AC Bedrooms', 'Living Room', 'Pantry', 'Free Wi-Fi']
  },
  {
    id: '106',
    hotelId: 'htl-seashell-01',
    roomNumber: '106',
    name: 'Palm Shade',
    type: 'Deluxe AC',
    floor: 2,
    basePrice: 2200,
    capacity: 2,
    amenities: ['AC', 'Queen Bed', 'Hot Water', 'Work Desk']
  },
  {
    id: '107',
    hotelId: 'htl-seashell-01',
    roomNumber: '107',
    name: 'Fisherman Cottage',
    type: 'Cottage',
    floor: 2,
    basePrice: 2900,
    capacity: 3,
    amenities: ['AC', 'Private Porch', 'Garden View', 'Hammock Outside']
  },
  {
    id: '108',
    hotelId: 'htl-seashell-01',
    roomNumber: '108',
    name: 'Sunset Vista',
    type: 'Deluxe AC',
    floor: 2,
    basePrice: 2400,
    capacity: 2,
    amenities: ['AC', 'Sunset View', 'Smart TV', 'Free Wi-Fi']
  }
];

export function calculatePlatformCommission(roomTariff: number, channel: ChannelType): {
  commissionRate: number;
  platformCommission: number;
  hotelPayoutAmount: number;
  totalWithCommission: number;
} {
  if (channel === 'online') {
    const commissionRate = 0.05; // 5% platform commission charged on top of room tariff
    const platformCommission = Math.round(roomTariff * commissionRate);
    const hotelPayoutAmount = roomTariff; // 100% of room tariff goes directly to hotel owner!
    const totalWithCommission = roomTariff + platformCommission;
    return { commissionRate, platformCommission, hotelPayoutAmount, totalWithCommission };
  }
  // Direct offline walk-in bookings: 0% platform fee, 100% hotel owner payout
  return { commissionRate: 0, platformCommission: 0, hotelPayoutAmount: roomTariff, totalWithCommission: roomTariff };
}

export function isHotelRegistered(): boolean {
  try {
    const val = localStorage.getItem(STORAGE_KEYS.IS_REGISTERED);
    if (val === 'true') return true;
    const hotelRaw = localStorage.getItem(STORAGE_KEYS.HOTEL);
    if (hotelRaw) {
      const h = JSON.parse(hotelRaw);
      if (h.isRegistered) return true;
    }
  } catch (e) {
    console.error('Failed to read registration status', e);
  }
  return false;
}

export function setHotelRegistered(registered: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEYS.IS_REGISTERED, registered ? 'true' : 'false');
  } catch (e) {
    console.error('Failed to set registration status', e);
  }
}

export function loadHotels(): HotelProfile[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HOTELS);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Failed to load multi-vendor hotels', e);
  }
  saveHotels(DEFAULT_HOTELS);
  return DEFAULT_HOTELS;
}

export function saveHotels(hotels: HotelProfile[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.HOTELS, JSON.stringify(hotels));
  } catch (e) {
    console.error('Failed to save multi-vendor hotels', e);
  }
}

export function loadActiveHotelId(): string {
  try {
    const id = localStorage.getItem(STORAGE_KEYS.ACTIVE_HOTEL_ID);
    if (id) return id;
  } catch {}
  return DEFAULT_HOTELS[0].id;
}

export function saveActiveHotelId(id: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_HOTEL_ID, id);
  } catch {}
}

export function getTodayString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getOffsetDateString(offsetDays: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function generateInitialBookings(): Booking[] {
  const today = getTodayString();
  const tomorrow = getOffsetDateString(1);
  const dayAfter = getOffsetDateString(2);
  const threeDaysAfter = getOffsetDateString(3);
  const yesterday = getOffsetDateString(-1);

  const rawList: Array<Omit<Booking, 'commissionRate' | 'platformCommission' | 'hotelPayoutAmount'>> = [
    {
      id: 'bk-101',
      hotelId: 'htl-seashell-01',
      roomId: '101',
      roomNumber: '101',
      guestName: 'Rajesh Sharma',
      guestPhone: '9820112233',
      guestEmail: 'rajesh.sharma@gmail.com',
      channel: 'offline',
      source: 'walk_in',
      checkInDate: today,
      checkOutDate: dayAfter,
      checkInTime: '12:30 PM',
      guestCount: 2,
      totalAmount: 4400,
      advancePaid: 2000,
      paymentStatus: 'partial',
      paymentMethod: 'cash',
      status: 'checked_in',
      notes: 'Requested extra towel and breakfast package.',
      createdAt: new Date().toISOString()
    },
    {
      id: 'bk-103',
      hotelId: 'htl-seashell-01',
      roomId: '103',
      roomNumber: '103',
      guestName: 'Priya Nair',
      guestPhone: '9845012345',
      guestEmail: 'priya.nair@outlook.com',
      channel: 'online',
      source: 'orderfix_portal',
      portalBookingId: 'OF-928174',
      checkInDate: yesterday,
      checkOutDate: tomorrow,
      checkInTime: '02:00 PM',
      guestCount: 2,
      totalAmount: 4800,
      advancePaid: 4800,
      paymentStatus: 'paid',
      paymentMethod: 'online_portal',
      status: 'checked_in',
      notes: 'Direct online booking via Orderfix Guest Portal (5% Platform Commission deducted).',
      createdAt: new Date().toISOString()
    },
    {
      id: 'bk-104',
      hotelId: 'htl-seashell-01',
      roomId: '104',
      roomNumber: '104',
      guestName: 'Amit & Neha Verma',
      guestPhone: '9988776655',
      channel: 'online',
      source: 'makemytrip',
      portalBookingId: 'MMT-782190',
      checkInDate: today,
      checkOutDate: threeDaysAfter,
      checkInTime: '01:15 PM',
      guestCount: 2,
      totalAmount: 9600,
      advancePaid: 9600,
      paymentStatus: 'paid',
      paymentMethod: 'online_portal',
      status: 'confirmed',
      notes: 'Anniversary celebration trip. Sea view requested.',
      createdAt: new Date().toISOString()
    },
    {
      id: 'bk-105',
      hotelId: 'htl-seashell-01',
      roomId: '105',
      roomNumber: '105',
      guestName: 'Dr. Ramesh Patel & Family',
      guestPhone: '9426543210',
      channel: 'offline',
      source: 'phone_call',
      checkInDate: today,
      checkOutDate: dayAfter,
      checkInTime: '12:00 PM',
      guestCount: 4,
      totalAmount: 7600,
      advancePaid: 3800,
      paymentStatus: 'partial',
      paymentMethod: 'upi',
      status: 'confirmed',
      notes: 'Direct phone booking. Will arrive by car at 3 PM.',
      createdAt: new Date().toISOString()
    },
    {
      id: 'bk-107',
      hotelId: 'htl-seashell-01',
      roomId: '107',
      roomNumber: '107',
      guestName: 'Sarah & John Miller',
      guestPhone: '9811223344',
      guestEmail: 'john.miller@traveler.com',
      channel: 'online',
      source: 'airbnb',
      portalBookingId: 'AB-449102',
      checkInDate: yesterday,
      checkOutDate: tomorrow,
      checkInTime: '03:40 PM',
      guestCount: 2,
      totalAmount: 5800,
      advancePaid: 5800,
      paymentStatus: 'paid',
      paymentMethod: 'online_portal',
      status: 'checked_in',
      notes: 'Need bike rental assistance on arrival.',
      createdAt: new Date().toISOString()
    }
  ];

  return rawList.map((b) => {
    const split = calculatePlatformCommission(b.totalAmount, b.channel);
    return {
      ...b,
      totalAmount: split.totalWithCommission,
      commissionRate: split.commissionRate,
      platformCommission: split.platformCommission,
      hotelPayoutAmount: split.hotelPayoutAmount
    };
  });
}

export function loadRooms(): Room[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.ROOMS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load rooms from storage', e);
  }
  saveRooms(DEFAULT_ROOMS);
  return DEFAULT_ROOMS;
}

export function saveRooms(rooms: Room[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(rooms));
  } catch (e) {
    console.error('Failed to save rooms', e);
  }
}

export function loadBookings(): Booking[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BOOKINGS);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Ensure platform commission & 100% room tariff fields exist
      return parsed.map((b: any) => {
        if (b.platformCommission === undefined || b.hotelPayoutAmount === undefined || (b.channel === 'online' && b.hotelPayoutAmount < (b.totalAmount - b.platformCommission))) {
          const roomTariff = b.hotelPayoutAmount || (b.channel === 'online' && b.platformCommission ? (b.totalAmount - b.platformCommission) : b.totalAmount);
          const split = calculatePlatformCommission(roomTariff, b.channel);
          return {
            ...b,
            totalAmount: split.totalWithCommission,
            commissionRate: split.commissionRate,
            platformCommission: split.platformCommission,
            hotelPayoutAmount: split.hotelPayoutAmount
          };
        }
        return b;
      });
    }
  } catch (e) {
    console.error('Failed to load bookings from storage', e);
  }
  const initial = generateInitialBookings();
  saveBookings(initial);
  return initial;
}

export function saveBookings(bookings: Booking[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
  } catch (e) {
    console.error('Failed to save bookings', e);
  }
}

export function loadHotel(): HotelProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.HOTEL);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.images === undefined) {
        parsed.images = SAMPLE_HOTEL_IMAGES;
      }
      if (parsed.entryFeePaid === undefined) {
        parsed.entryFeePaid = true;
        parsed.entryFeeAmount = 99;
      }
      return parsed;
    }
  } catch (e) {
    console.error('Failed to load hotel profile', e);
  }
  saveHotel(DEFAULT_HOTEL);
  return DEFAULT_HOTEL;
}

export function saveHotel(hotel: HotelProfile): void {
  try {
    localStorage.setItem(STORAGE_KEYS.HOTEL, JSON.stringify(hotel));
  } catch (e) {
    console.error('Failed to save hotel profile', e);
  }
}

export function loadSubscription(): SubscriptionState {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SUBSCRIPTION);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load subscription', e);
  }
  const defaultSub: SubscriptionState = {
    plan: 'trial',
    trialDaysLeft: 30, // First 1 Month Free Subscription
    isActive: true,
    expiresAt: getOffsetDateString(30)
  };
  saveSubscription(defaultSub);
  return defaultSub;
}

export function saveSubscription(sub: SubscriptionState): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SUBSCRIPTION, JSON.stringify(sub));
  } catch (e) {
    console.error('Failed to save subscription', e);
  }
}

export function generateInitialExpenses(): Expense[] {
  const today = getTodayString();
  const yesterday = getOffsetDateString(-1);
  const fiveDaysAgo = getOffsetDateString(-5);

  return [
    {
      id: 'exp-1',
      title: 'Linen Laundry & Dry Cleaning',
      category: 'supplies',
      amount: 1200,
      date: today,
      paymentMethod: 'upi',
      notes: 'Bed sheets, pillow covers, and fresh bath towels cleaned.',
      createdAt: new Date().toISOString()
    },
    {
      id: 'exp-2',
      title: 'Electricity & Inverter Battery Maintenance',
      category: 'utilities',
      amount: 3500,
      date: yesterday,
      paymentMethod: 'bank',
      notes: 'APDCL monthly commercial electricity meter bill.',
      createdAt: new Date().toISOString()
    },
    {
      id: 'exp-3',
      title: 'Orderfix Hotel Platform Onboarding Fee',
      category: 'platform_fee',
      amount: 99,
      date: fiveDaysAgo,
      paymentMethod: 'upi',
      notes: 'Non-refundable ₹99 hotel registration fee (1st month free subscription included).',
      createdAt: new Date().toISOString()
    }
  ];
}

export function loadExpenses(): Expense[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.EXPENSES);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load expenses', e);
  }
  const initial = generateInitialExpenses();
  saveExpenses(initial);
  return initial;
}

export function saveExpenses(expenses: Expense[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
  } catch (e) {
    console.error('Failed to save expenses', e);
  }
}

export function generateInitialVerifications(): GuestVerificationData[] {
  const today = getTodayString();
  const yesterday = getOffsetDateString(-1);
  const dayAfter = getOffsetDateString(2);
  const tomorrow = getOffsetDateString(1);

  return [
    {
      id: 'ver-101',
      bookingId: 'bk-101',
      roomNumber: '101',
      guestName: 'Rajesh Sharma',
      age: 38,
      gender: 'Male',
      dob: '1986-04-12',
      idType: 'aadhaar',
      idNumber: '8921 4455 1092',
      address: 'Flat 402, Nilachal Heights, Zoo Road, Guwahati, Assam - 781024',
      nationality: 'Indian',
      phone: '9820112233',
      email: 'rajesh.sharma@gmail.com',
      checkInDate: today,
      checkInTime: '12:30 PM',
      checkOutDate: dayAfter,
      purposeOfVisit: 'Tourism / Leisure',
      vehicleNumber: 'AS-01-EF-4921',
      policeReportStatus: 'submitted',
      submittedAt: `${today} 14:15`,
      dispatchMethod: 'whatsapp',
      notes: 'Verified with original Aadhaar physical card.'
    },
    {
      id: 'ver-103',
      bookingId: 'bk-103',
      roomNumber: '103',
      guestName: 'Priya Nair',
      age: 29,
      gender: 'Female',
      dob: '1997-09-24',
      idType: 'passport',
      idNumber: 'Z5819420',
      address: 'Panampilly Nagar, Kochi, Kerala - 682036',
      nationality: 'Indian',
      phone: '9845012345',
      email: 'priya.nair@outlook.com',
      checkInDate: yesterday,
      checkInTime: '02:00 PM',
      checkOutDate: tomorrow,
      purposeOfVisit: 'Business / Work',
      policeReportStatus: 'submitted',
      submittedAt: `${yesterday} 15:30`,
      dispatchMethod: 'email',
      notes: 'Official corporate conference at Guwahati.'
    }
  ];
}

export function loadVerifications(): GuestVerificationData[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.VERIFICATIONS);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load police verifications', e);
  }
  const initial = generateInitialVerifications();
  saveVerifications(initial);
  return initial;
}

export function saveVerifications(list: GuestVerificationData[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.VERIFICATIONS, JSON.stringify(list));
  } catch (e) {
    console.error('Failed to save police verifications', e);
  }
}
