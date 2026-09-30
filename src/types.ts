export type ChannelType = 'offline' | 'online';

export type OfflineSource = 'walk_in' | 'phone_call' | 'whatsapp' | 'direct_ref';
export type OnlineSource = 'booking_com' | 'makemytrip' | 'agoda' | 'airbnb' | 'goibibo' | 'expedia' | 'other';
export type BookingSource = OfflineSource | OnlineSource;

export type BookingStatus = 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled';
export type PaymentStatus = 'paid' | 'partial' | 'pending';
export type PaymentMethod = 'cash' | 'upi' | 'card' | 'online_portal';

export interface Room {
  id: string;
  roomNumber: string;
  name?: string;
  type: 'Standard' | 'Deluxe AC' | 'Premium Sea View' | 'Family Suite' | 'Cottage';
  floor: number;
  basePrice: number;
  capacity: number;
  amenities: string[];
  isMaintenance?: boolean;
}

export type IdDocumentType = 'aadhaar' | 'passport' | 'voter_id' | 'driving_license' | 'other';
export type PoliceReportStatus = 'pending' | 'submitted' | 'exempt';

export interface GuestVerificationData {
  id: string;
  bookingId?: string;
  roomNumber: string;
  guestName: string;
  age?: number | string;
  gender?: 'Male' | 'Female' | 'Other';
  dob?: string;
  idType: IdDocumentType;
  idNumber: string;
  address: string;
  nationality: string;
  phone: string;
  email?: string;
  checkInDate: string; // YYYY-MM-DD
  checkInTime?: string;
  checkOutDate: string; // YYYY-MM-DD
  purposeOfVisit?: 'Tourism / Leisure' | 'Business / Work' | 'Medical / Treatment' | 'Family / Personal' | 'Transit' | 'Other';
  vehicleNumber?: string;
  idPhotoUrl?: string; // base64 or preview URL
  policeReportStatus: PoliceReportStatus;
  submittedAt?: string;
  dispatchMethod?: 'whatsapp' | 'email' | 'printed';
  notes?: string;
}

export interface Booking {
  id: string;
  roomId: string;
  roomNumber: string;
  guestName: string;
  guestPhone: string;
  guestEmail?: string;
  channel: ChannelType;
  source: BookingSource;
  checkInDate: string; // YYYY-MM-DD
  checkOutDate: string; // YYYY-MM-DD
  checkInTime?: string;
  checkOutTime?: string;
  guestCount: number;
  totalAmount: number;
  advancePaid: number;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  status: BookingStatus;
  notes?: string;
  createdAt: string;
  portalBookingId?: string;
  idVerification?: GuestVerificationData;
}

export interface HotelProfile {
  name: string;
  tagline: string;
  phone: string;
  whatsappNumber: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  currency: string;
  upiId: string;
  checkInStandardTime: string;
  checkOutStandardTime: string;
  policeStationName?: string;
  policeStationWhatsApp?: string;
  policeStationEmail?: string;
  policeStationIncharge?: string;
  hotelLicenseNumber?: string;
}

export interface ConflictResult {
  hasConflict: boolean;
  conflictingBooking?: Booking;
  message?: string;
}

export interface SubscriptionState {
  plan: 'trial' | 'monthly' | 'annual';
  trialDaysLeft: number;
  isActive: boolean;
  expiresAt: string;
}

export type ExpenseCategory =
  | 'supplies'
  | 'food_beverage'
  | 'utilities'
  | 'maintenance'
  | 'staff'
  | 'other';

export interface Expense {
  id: string;
  title: string;
  category: ExpenseCategory;
  amount: number;
  date: string; // YYYY-MM-DD
  paymentMethod: 'cash' | 'upi' | 'bank';
  notes?: string;
  createdAt: string;
}

