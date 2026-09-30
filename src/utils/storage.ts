import { Room, Booking, HotelProfile, SubscriptionState, Expense, GuestVerificationData } from '../types';
export type { SubscriptionState, Expense, GuestVerificationData };

export const STORAGE_KEYS = {
  ROOMS: 'orderfix_rooms',
  BOOKINGS: 'orderfix_bookings',
  HOTEL: 'orderfix_hotel',
  SUBSCRIPTION: 'orderfix_subscription',
  EXPENSES: 'orderfix_expenses',
  VERIFICATIONS: 'orderfix_police_verifications'
};

export const DEFAULT_HOTEL: HotelProfile = {
  name: 'Seashell Palms Homestay & Resort',
  tagline: 'Peaceful Hospitality & Verified Safe Stay',
  phone: '+91 98234 56789',
  whatsappNumber: '+91 98234 56789',
  email: 'contact@seashellpalms.in',
  address: 'Near Brahmaputra Heritage / Beach Road',
  city: 'Guwahati',
  state: 'Assam',
  pincode: '781006',
  currency: '₹',
  upiId: 'seashellpalms@okaxis',
  checkInStandardTime: '12:00 PM',
  checkOutStandardTime: '11:00 AM',
  policeStationName: 'Dispur Police Station, Guwahati',
  policeStationWhatsApp: '+91 94350 12345',
  policeStationEmail: 'dispur-ps@assampolice.gov.in',
  policeStationIncharge: 'Inspector B. Borah, OC Dispur',
  hotelLicenseNumber: 'ASM/GHY/HTL/2024-912'
};

export const DEFAULT_ROOMS: Room[] = [
  {
    id: '101',
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
    roomNumber: '108',
    name: 'Sunset Vista',
    type: 'Deluxe AC',
    floor: 2,
    basePrice: 2400,
    capacity: 2,
    amenities: ['AC', 'Sunset View', 'Smart TV', 'Free Wi-Fi']
  }
];

export function getTodayString(): string {
  // Use local date or fall back gracefully
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

  return [
    {
      id: 'bk-101',
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
      roomId: '103',
      roomNumber: '103',
      guestName: 'Priya Nair',
      guestPhone: '9845012345',
      guestEmail: 'priya.nair@outlook.com',
      channel: 'online',
      source: 'booking_com',
      portalBookingId: 'BC-928174',
      checkInDate: yesterday,
      checkOutDate: tomorrow,
      checkInTime: '02:00 PM',
      guestCount: 2,
      totalAmount: 4800,
      advancePaid: 4800,
      paymentStatus: 'paid',
      paymentMethod: 'online_portal',
      status: 'checked_in',
      notes: 'Late arrival confirmed by portal.',
      createdAt: new Date().toISOString()
    },
    {
      id: 'bk-104',
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
    if (raw) return JSON.parse(raw);
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
    if (raw) return JSON.parse(raw);
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
    trialDaysLeft: 12,
    isActive: true,
    expiresAt: getOffsetDateString(12)
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

  return [
    {
      id: 'exp-1',
      title: 'Linen laundry & dry clean (Bed sheets, pillow covers)',
      category: 'supplies',
      amount: 650,
      date: today,
      paymentMethod: 'cash',
      notes: 'Paid to local laundry service',
      createdAt: new Date().toISOString()
    },
    {
      id: 'exp-2',
      title: 'Breakfast supplies (Bread, eggs, milk, fruits, coffee)',
      category: 'food_beverage',
      amount: 1120,
      date: today,
      paymentMethod: 'upi',
      notes: 'Morning buffet items for in-house guests',
      createdAt: new Date().toISOString()
    },
    {
      id: 'exp-3',
      title: 'Room 103 bathroom tap repair & plumber service',
      category: 'maintenance',
      amount: 450,
      date: yesterday,
      paymentMethod: 'cash',
      notes: 'Washer replaced and leakage fixed',
      createdAt: new Date().toISOString()
    },
    {
      id: 'exp-4',
      title: 'Cleaning supplies & room freshner refill',
      category: 'supplies',
      amount: 580,
      date: yesterday,
      paymentMethod: 'upi',
      notes: 'Floor cleaner, toilet rolls, room sprays',
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
  const tomorrow = getOffsetDateString(1);
  const dayAfter = getOffsetDateString(2);

  return [
    {
      id: 'ver-101',
      bookingId: 'bk-101',
      roomNumber: '101',
      guestName: 'Rajesh Sharma',
      age: 38,
      gender: 'Male',
      dob: '1988-04-12',
      idType: 'aadhaar',
      idNumber: '7823 4519 8832',
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


