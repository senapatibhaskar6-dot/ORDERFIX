export type ChannelType = 'offline' | 'online';

export type OfflineSource = 'walk_in' | 'phone_call' | 'whatsapp' | 'direct_ref';
export type OnlineSource = 'orderfix_portal' | 'booking_com' | 'makemytrip' | 'agoda' | 'airbnb' | 'goibibo' | 'expedia' | 'other';
export type BookingSource = OfflineSource | OnlineSource;

export type BookingStatus = 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled';
export type PaymentStatus = 'paid' | 'partial' | 'pending';
export type PaymentMethod = 'cash' | 'upi' | 'card' | 'online_portal';

export interface Room {
  id: string;
  hotelId?: string;
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
  hotelId?: string;
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
  idPhotoUrl?: string;
  policeReportStatus: PoliceReportStatus;
  submittedAt?: string;
  dispatchMethod?: 'whatsapp' | 'email' | 'printed';
  notes?: string;
}

export interface Booking {
  id: string;
  hotelId?: string;
  roomId: string;
  roomNumber: string;
  guestName: string;
  guestPhone: string;
  guestEmail?: string;
  channel: ChannelType; // 'offline' | 'online'
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
  
  // 5% Platform Commission & 100% Hotel Room Tariff Fields
  commissionRate: number; // e.g., 0.05 (5% for online, 0 for offline walk-in)
  platformCommission: number; // 5% commission on top of room tariff for platform owner
  hotelPayoutAmount: number; // 100% full room tariff for hotel owner
}

export interface HotelProfile {
  id: string;
  name: string;
  tagline: string;
  propertyType?: string;
  description?: string;
  ownerName: string;
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
  
  // Multi-vendor Images (up to 4 high-quality property/room images)
  images: string[];
  
  // Facilities & Amenities
  amenities: string[];
  
  // ₹99 Entry Fee & 1-Month Free Subscription Status
  entryFeePaid: boolean;
  entryFeeAmount?: number; // ₹99
  entryFeeTxnId?: string;
  entryFeePaidAt?: string;
  subscriptionPlan: 'trial_free_month' | 'monthly' | 'annual';
  subscriptionExpiresAt: string; // 30 days after registration
  trialDaysLeft: number;
  
  // Police Station details
  policeStationName?: string;
  policeStationWhatsApp?: string;
  policeStationEmail?: string;
  policeStationIncharge?: string;
  hotelLicenseNumber?: string;
  
  isRegistered: boolean;
  createdAt: string;
}

export interface FirstTimeRegistrationPayload {
  hotelName: string;
  ownerName: string;
  propertyType: string;
  phone: string;
  whatsappNumber: string;
  email?: string;
  address: string;
  city: string;
  state: string;
  pincode?: string;
  description?: string;
  images: string[];
  amenities: string[];
  policeStationName?: string;
  policeStationWhatsApp?: string;
  roomCount: number;
  basePrice: number;
  entryFeeTxnId?: string;
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
  | 'platform_fee'
  | 'other';

export interface Expense {
  id: string;
  hotelId?: string;
  title: string;
  category: ExpenseCategory;
  amount: number;
  date: string; // YYYY-MM-DD
  paymentMethod: 'cash' | 'upi' | 'bank';
  notes?: string;
  createdAt: string;
}

export interface PlatformCommissionSummary {
  totalPlatformRevenue: number; // 5% collected on top of room tariff from online bookings
  totalHotelPayouts: number; // 100% full room tariff sent to hotels
  totalOnlineBookingsCount: number;
  entryFeesCollected: number; // Number of hotels * ₹99
}

export type UserRole = 'owner' | 'customer' | 'admin';

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: UserRole;
  hotelId?: string;
}

export interface AuthSession {
  user: User | null;
  isAuthenticated: boolean;
}

export interface PropertyMonthlyReport {
  hotelId: string;
  hotelName: string;
  propertyType: string;
  city: string;
  phone: string;
  onlineBookingsCount: number;
  monthlyRevenue: number;
  platformCommission: number;
  netHotelPayout: number;
}

export interface AdminPlatformMetrics {
  totalPropertiesCount: number;
  hotelsCount: number;
  guestHousesCount: number;
  hallsCount: number;
  totalOnlineBookingsCount: number;
  totalOnlineRevenue: number;
  totalPlatformCommissionCollected: number;
  totalEntryFeesCollected: number;
  totalPlatformEarnings: number;
}
