export type LanguageCode = 'en' | 'as' | 'bn' | 'hi';

export interface Translations {
  // Brand & General
  brandTitle: string;
  brandTagline: string;
  liveSystem: string;
  dbConnected: string;
  oneMonthFree: string;
  trialDaysLeft: string;
  
  // Navigation
  rooms: string;
  addBooking: string;
  grid: string;
  list: string;
  accounting: string;
  policeVerification: string;
  guestPortal: string;
  compactMode: string;
  normalMode: string;
  today: string;
  login: string;
  logout: string;
  adminPanel: string;
  adminSwitch: string;
  billing: string;
  
  // Admin Panel
  adminTitle: string;
  adminSubtitle: string;
  registeredHotelsCount: string;
  registeredHotelsDesc: string;
  onlineBookingsCount: string;
  onlineBookingsDesc: string;
  totalPlatformCommission: string;
  totalPlatformCommissionDesc: string;
  totalHotelPayout: string;
  totalHotelPayoutDesc: string;
  totalEntryFees: string;
  totalEntryFeesDesc: string;
  netPlatformEarnings: string;
  netPlatformEarningsDesc: string;
  zeroCommissionOffline: string;
  zeroCommissionOfflineDesc: string;
  
  // Admin Tabs
  tabOverview: string;
  tabHotels: string;
  tabOnlineBookings: string;
  tabMonthlyAccounts: string;
  
  // Hotel Directory Table
  hotelName: string;
  propertyType: string;
  ownerName: string;
  contactNumber: string;
  location: string;
  registeredOn: string;
  entryFeeStatus: string;
  trialStatus: string;
  actions: string;
  viewDetails: string;
  switchHotel: string;
  addPropertyBtn: string;
  
  // Monthly Ledger
  month: string;
  monthlyBookings: string;
  monthlyTariff: string;
  monthlyCommission: string;
  monthlyTotalPaid: string;
  monthlyNewHotels: string;
  monthlyEntryFees: string;
  monthlyNetProfit: string;
  exportReport: string;
  
  // Online Bookings Table
  bookingId: string;
  guestDetails: string;
  roomDetails: string;
  dates: string;
  roomTariff100: string;
  platformFee5: string;
  totalPaid: string;
  paymentStatus: string;
  
  // Security & Password
  securitySettings: string;
  changePassword: string;
  enterCurrentPassword: string;
  enterNewPassword: string;
  confirmNewPassword: string;
  saveNewPassword: string;
  forgotPassword: string;
  enterRecoveryKey: string;
  recoveryKeyHelp: string;
  resetPasswordBtn: string;
  passwordMismatch: string;
  passwordChangedSuccess: string;
  invalidPassword: string;
  invalidRecoveryKey: string;
  
  // Language Names
  english: string;
  assamese: string;
  bengali: string;
  hindi: string;

  // Portal & Navigation
  ownerDashboard: string;
  hotelDirectory: string;
  browseRooms: string;
  findMyBooking: string;
  searchLocation: string;
  viewOnMap: string;
  bookNow: string;
  registrationTitle: string;
  registrationSubtitle: string;
  propertyDetails: string;
  locationDetails: string;
  quickFillDemo: string;
  signIn: string;
  close: string;
  proceedPayment: string;
  entryFee: string;
  mobileNavRooms: string;
  mobileNavPolice: string;
  mobileNavBook: string;
  mobileNavAccounts: string;
  mobileNavBilling: string;
  mobileNavGuest: string;

  // Trial Banner & Badges
  trialBannerBadge: string;
  trialBannerTitle: string;
  trialBannerDesc: string;
  upgradeBtn: string;
  oneMonthFreeBadge: string;
  entryFeeNotice: string;

  // Metrics Cards
  totalRooms: string;
  availableRooms: string;
  offlineBooked: string;
  onlineBooked: string;
  todayArrivals: string;
  occupied: string;
  busy: string;

  // Room Grid
  roomStatusGrid: string;
  greenAvailable: string;
  redOffline: string;
  blueOnline: string;
  quickBook: string;
  viewBooking: string;
  checkOut: string;
  invoice: string;
  noRoomsMatch: string;
  trySwitchingTotal: string;

  // Guest Portal
  guestPortalSubtitle: string;
  searchPlaceholder: string;
  allDestinations: string;
  filterAvailableOnly: string;
  checkInDateLabel: string;
  checkOutDateLabel: string;
  guestsCountLabel: string;
  nightCount: string;
  nightsCount: string;
  perNight: string;
  verifiedHotel: string;
  roomsAvailable: string;
  viewRoomsBtn: string;
  selectHotelBtn: string;
  directBookingTitle: string;
  directBookingSubtitle: string;
  guestFullName: string;
  guestMobile: string;
  guestEmail: string;
  specialRequests: string;
  confirmAndBook: string;
  bookingConfirmedTitle: string;
  bookingConfirmedSubtitle: string;
  myBookingTitle: string;
  myBookingSubtitle: string;
  enterPhoneNumber: string;
  lookupBtn: string;

  // Registration & Onboarding
  hotelNameLabel: string;
  ownerNameLabel: string;
  contactPhoneLabel: string;
  cityLabel: string;
  areaLabel: string;
  landmarkLabel: string;
  fullAddressLabel: string;
  googleMapsLinkLabel: string;
  generateMapBtn: string;
  guestLocationPreview: string;
  alreadyRegistered: string;
  logInHere: string;
  addNewHotelBtn: string;
  editHotelInfo: string;
}

export const translations: Record<LanguageCode, Translations> = {
  en: {
    brandTitle: 'ORDERFIX',
    brandTagline: 'Multi-Vendor Hotel Management, Dual Booking & 5% Platform Commission System',
    liveSystem: 'LIVE PRODUCTION SYSTEM',
    dbConnected: 'Neon PostgreSQL Connected',
    oneMonthFree: '1st Month Free Subscription',
    trialDaysLeft: 'days left in free trial',
    
    rooms: 'Rooms',
    addBooking: '+ Book Room',
    grid: 'Room Grid',
    list: 'List View',
    accounting: 'Accounting & 5% Commission',
    policeVerification: 'Police Verification',
    guestPortal: 'Guest Portal 📱',
    compactMode: 'Compact',
    normalMode: 'Standard',
    today: 'Today',
    login: 'Sign In',
    logout: 'Sign Out',
    adminPanel: 'Platform Admin',
    adminSwitch: 'Master Admin Panel',
    billing: 'Billing & Invoices 🧾',
    
    adminTitle: 'Platform Master Admin Dashboard',
    adminSubtitle: 'Central Multi-Vendor Hotel Network, Online Booking Ledger & Monthly Financial Accounts',
    registeredHotelsCount: 'Total Registered Properties',
    registeredHotelsDesc: 'Active hotels, homestays & resorts on Orderfix',
    onlineBookingsCount: 'Online Customer Bookings',
    onlineBookingsDesc: 'Direct bookings made via online customer portal',
    totalPlatformCommission: '5% Platform Commission',
    totalPlatformCommissionDesc: 'Calculated at 5% on top of room tariff for platform owner',
    totalHotelPayout: '100% Hotel Room Tariff',
    totalHotelPayoutDesc: 'Full 100% tariff revenue disbursed to hotel owners',
    totalEntryFees: '₹99 Registration Fees',
    totalEntryFeesDesc: 'Non-refundable onboarding fee per registered hotel',
    netPlatformEarnings: 'Total Platform Revenue',
    netPlatformEarningsDesc: 'Combined 5% Commission + ₹99 Entry Fees',
    zeroCommissionOffline: '₹0 Commission (Offline)',
    zeroCommissionOfflineDesc: '100% Free walk-in / direct phone bookings',
    
    tabOverview: 'Platform Overview',
    tabHotels: 'Hotel Registrations',
    tabOnlineBookings: 'Online Customer Bookings',
    tabMonthlyAccounts: 'Monthly Accounts & Ledger',
    
    hotelName: 'Property / Hotel',
    propertyType: 'Type',
    ownerName: 'Owner Name',
    contactNumber: 'Phone / WhatsApp',
    location: 'City / Location',
    registeredOn: 'Registered Date',
    entryFeeStatus: '₹99 Entry Fee',
    trialStatus: '1-Month Free Trial',
    actions: 'Actions',
    viewDetails: 'View Details',
    switchHotel: 'Open in Dashboard',
    addPropertyBtn: '+ Register New Hotel (₹99)',
    
    month: 'Month',
    monthlyBookings: 'Online Bookings',
    monthlyTariff: '100% Hotel Tariff (₹)',
    monthlyCommission: '5% Commission (₹)',
    monthlyTotalPaid: 'Total Customer Paid (₹)',
    monthlyNewHotels: 'New Hotels',
    monthlyEntryFees: 'Entry Fees (₹)',
    monthlyNetProfit: 'Platform Net Earnings (₹)',
    exportReport: 'Export / Print Monthly Report',
    
    bookingId: 'Booking ID',
    guestDetails: 'Guest Details',
    roomDetails: 'Hotel & Room',
    dates: 'Check-in / Check-out',
    roomTariff100: 'Room Tariff (100% Hotel)',
    platformFee5: '5% Commission (Platform)',
    totalPaid: 'Total Paid by Customer',
    paymentStatus: 'Payment Status',
    
    securitySettings: 'Security & Password',
    changePassword: 'Change Admin Password',
    enterCurrentPassword: 'Enter Current Password',
    enterNewPassword: 'Enter New Password',
    confirmNewPassword: 'Confirm New Password',
    saveNewPassword: 'Save New Password',
    forgotPassword: 'Forgot Password / Reset with Key',
    enterRecoveryKey: 'Enter Master Recovery Key',
    recoveryKeyHelp: 'Enter the master recovery key provided to reset your admin access.',
    resetPasswordBtn: 'Reset Password',
    passwordMismatch: 'New passwords do not match.',
    passwordChangedSuccess: 'Admin password changed successfully!',
    invalidPassword: 'Incorrect admin password. Please try again.',
    invalidRecoveryKey: 'Invalid master recovery key.',
    
    english: 'English',
    assamese: 'অসমীয়া (Assamese)',
    bengali: 'বাংলা (Bengali)',
    hindi: 'हिन्दी (Hindi)',

    ownerDashboard: 'Owner Dashboard',
    hotelDirectory: 'Hotels Directory',
    browseRooms: 'Browse Rooms',
    findMyBooking: 'Find My Booking',
    searchLocation: 'Search City, Destination, or Landmark',
    viewOnMap: 'View on Google Maps',
    bookNow: 'Select Room & Book',
    registrationTitle: 'Hotel & Homestay Registration',
    registrationSubtitle: 'Multi-Vendor Property Onboarding & Instant Dual-Booking Management',
    propertyDetails: '1. Property & Owner Details',
    locationDetails: 'Hotel Location & Landmark Details',
    quickFillDemo: '⚡ Quick Fill Demo',
    signIn: 'Sign In',
    close: 'Close',
    proceedPayment: 'Proceed to Payment (₹99)',
    entryFee: 'Entry Fee: ₹99',
    mobileNavRooms: 'Rooms',
    mobileNavPolice: 'Police',
    mobileNavBook: '+Book',
    mobileNavAccounts: 'Accounts',
    mobileNavBilling: 'Invoices',
    mobileNavGuest: 'Guest',

    // Trial Banner & Badges
    trialBannerBadge: '1st Month Free (30 Days Free Trial)',
    trialBannerTitle: 'Prevent Online & Offline Double-Bookings — 1st Month 100% Free',
    trialBannerDesc: 'Full 100% room tariff directly to hotel owners. Only 5% transparent commission on online bookings. 0% commission on offline walk-ins.',
    upgradeBtn: 'Upgrade to Pro (₹99)',
    oneMonthFreeBadge: '1st Month Free • 30 Days Trial',
    entryFeeNotice: '₹99 Registration Fee • 5% Transparent Commission',

    // Metrics Cards
    totalRooms: 'Total Rooms',
    availableRooms: 'Available Rooms',
    offlineBooked: 'Offline Booked',
    onlineBooked: 'Online Bookings',
    todayArrivals: 'Today Arrivals',
    occupied: 'Occupied',
    busy: 'Busy',

    // Room Grid
    roomStatusGrid: 'Room Status Grid',
    greenAvailable: 'Green: Available',
    redOffline: 'Red: Offline',
    blueOnline: 'Blue: Online',
    quickBook: 'Book',
    viewBooking: 'View',
    checkOut: 'Check Out',
    invoice: 'Invoice',
    noRoomsMatch: 'No rooms match the current filter',
    trySwitchingTotal: 'Try switching to "Total Rooms".',

    // Guest Portal
    guestPortalSubtitle: 'Verified Hotels & Homestays with Instant Confirmation',
    searchPlaceholder: 'Search by city, area, tourist spot or hotel name...',
    allDestinations: 'All Locations',
    filterAvailableOnly: 'Available Only',
    checkInDateLabel: 'Check-in',
    checkOutDateLabel: 'Check-out',
    guestsCountLabel: 'Guests',
    nightCount: 'night',
    nightsCount: 'nights',
    perNight: '/ night',
    verifiedHotel: 'Verified Property',
    roomsAvailable: 'rooms available',
    viewRoomsBtn: 'Select Room & Book',
    selectHotelBtn: 'View Hotel Rooms',
    directBookingTitle: 'Instant Online Room Reservation',
    directBookingSubtitle: 'Direct booking with the property • Instant WhatsApp & SMS confirmation',
    guestFullName: 'Full Name of Guest',
    guestMobile: 'Mobile / WhatsApp Number',
    guestEmail: 'Email Address (Optional)',
    specialRequests: 'Special Requests / Arrival Notes',
    confirmAndBook: 'Confirm & Complete Booking',
    bookingConfirmedTitle: 'Booking Confirmed Successfully!',
    bookingConfirmedSubtitle: 'Your reservation is confirmed. The hotel has been notified.',
    myBookingTitle: 'Lookup Your Reservation',
    myBookingSubtitle: 'Enter your phone number to check active bookings',
    enterPhoneNumber: 'Enter 10-digit mobile number',
    lookupBtn: 'Find Booking',

    // Registration & Onboarding
    hotelNameLabel: 'Property / Hotel / Homestay Name',
    ownerNameLabel: 'Owner / Host Full Name',
    contactPhoneLabel: 'Contact Phone Number',
    cityLabel: 'City / Tourist Destination',
    areaLabel: 'Locality / Area',
    landmarkLabel: 'Prominent Landmark',
    fullAddressLabel: 'Full Street Address',
    googleMapsLinkLabel: 'Google Maps Link (Optional)',
    generateMapBtn: 'Generate Maps Link',
    guestLocationPreview: 'Live Guest Location Search Preview',
    alreadyRegistered: 'Already registered?',
    logInHere: 'Sign In Here',
    addNewHotelBtn: '+ Add New Hotel (₹99)',
    editHotelInfo: 'Edit Hotel Profile'
  },
  
  as: {
    brandTitle: 'ORDERFIX',
    brandTagline: 'মাল্টি-ভেণ্ডৰ হোটেল ব্যৱস্থাপনা, দ্বৈত বুকিং আৰু ৫% প্লেটফৰ্ম কমিছন ব্যৱস্থা',
    liveSystem: 'লাইভ প্ৰডাকচন চিষ্টেম',
    dbConnected: 'নিয়ন প’ষ্টগ্ৰেছ ডাটাবেচ সংযুক্ত',
    oneMonthFree: '১ম মাহ বিনামূলীয়া চাবস্ক্ৰিপচন',
    trialDaysLeft: 'দিন বাকী আছে',
    
    rooms: 'কোঠাসমূহ',
    addBooking: '+ কোঠা বুক কৰক',
    grid: 'ৰূম গ্ৰিড',
    list: 'বুকিং তালিকা',
    accounting: 'হিচাপ আৰু ৫% কমিছন',
    policeVerification: 'পুলিচ ভেৰিফিকেচন',
    guestPortal: 'গ্ৰাহক পৰ্টেল 📱',
    compactMode: 'সৰু স্ক্ৰীণ',
    normalMode: 'সাধাৰণ দৃশ্য',
    today: 'আজি',
    login: 'প্ৰৱেশ / লগইন',
    logout: 'লগআউট',
    adminPanel: 'এডমিন পেনেল',
    adminSwitch: 'প্লেটফৰ্ম মাষ্টাৰ এডমিন পেনেল',
    billing: 'চালান আৰু বিলিং 🧾',
    
    adminTitle: 'প্লেটফৰ্ম মাষ্টাৰ এডমিন ডেশ্ববৰ্ড',
    adminSubtitle: 'কেন্দ্ৰীয় মাল্টি-ভেণ্ডৰ হোটেল নেটৱৰ্ক, অনলাইন বুকিং আৰু মাহেকীয়া বিত্তীয় হিচাপ',
    registeredHotelsCount: 'মুঠ পঞ্জীকৃত হোটেল',
    registeredHotelsDesc: 'Orderfix ত পঞ্জীয়ন কৰা হোটেল আৰু ৰিজৰ্ট',
    onlineBookingsCount: 'অনলাইন গ্ৰাহক বুকিং',
    onlineBookingsDesc: 'অনলাইন পৰ্টেলৰ পৰা পোৱা প্ৰত্যক্ষ বুকিং',
    totalPlatformCommission: '৫% প্লেটফৰ্ম কমিছন',
    totalPlatformCommissionDesc: 'ৰূম চাৰ্জৰ ওপৰত প্লেটফৰ্ম মালিকৰ ৫% কমিছন',
    totalHotelPayout: '১০০% হোটেল ৰাজহ',
    totalHotelPayoutDesc: 'হোটেল মালিকে পোৱা ১০০% ৰূম টেৰিফ',
    totalEntryFees: '₹৯৯ এণ্ট্ৰী মাচুল সংগ্ৰহ',
    totalEntryFeesDesc: 'প্ৰতিখন হোটেল পঞ্জীয়নৰ এককালীন মাচুল',
    netPlatformEarnings: 'মুঠ প্লেটফৰ্ম উপাৰ্জন',
    netPlatformEarningsDesc: '৫% কমিছন + ₹৯৯ পঞ্জীয়ন মাচুল',
    zeroCommissionOffline: '₹০ অফলাইন কমিছন',
    zeroCommissionOfflineDesc: 'হোটেলৰ ৱাক-ইন বুকিঙত কোনো কমিছন নাই',
    
    tabOverview: 'প্লেটফৰ্ম অৱলোকন',
    tabHotels: 'হোটেল পঞ্জীয়ন তালিকা',
    tabOnlineBookings: 'অনলাইন গ্ৰাহক বুকিং',
    tabMonthlyAccounts: 'মাহেকীয়া হিচাপ-নিকাচ',
    
    hotelName: 'হোটেল / সম্পত্তি',
    propertyType: 'প্ৰকাৰ',
    ownerName: 'মালিকৰ নাম',
    contactNumber: 'ফোন / হোৱাটছএপ',
    location: 'চহৰ / ঠিকনা',
    registeredOn: 'পঞ্জীয়নৰ তাৰিখ',
    entryFeeStatus: '₹৯৯ মাচুল',
    trialStatus: '১ মাহ ফ্ৰী চাবস্ক্ৰিপচন',
    actions: 'কাৰ্য্যসমূহ',
    viewDetails: 'বিৱৰণ চাওক',
    switchHotel: 'ডেশ্ববৰ্ডত খোলক',
    addPropertyBtn: '+ নতুন হোটেল পঞ্জীয়ন (₹৯৯)',
    
    month: 'মাহ',
    monthlyBookings: 'অনলাইন বুকিং',
    monthlyTariff: '১০০% হোটেল টেৰিফ (₹)',
    monthlyCommission: '৫% কমিছন (₹)',
    monthlyTotalPaid: 'মুঠ গ্ৰাহকে পৰিশোধ কৰা (₹)',
    monthlyNewHotels: 'নতুন হোটেল',
    monthlyEntryFees: 'এণ্ট্ৰী মাচুল (₹)',
    monthlyNetProfit: 'প্লেটফৰ্মৰ নিকা উপাৰ্জন (₹)',
    exportReport: 'ৰিপৰ্ট সংৰক্ষণ / প্ৰিণ্ট কৰক',
    
    bookingId: 'বুকিং নম্বৰ',
    guestDetails: 'অতিথিৰ বিৱৰণ',
    roomDetails: 'হোটেল আৰু কোঠা',
    dates: 'চেক-ইন / চেক-আউট',
    roomTariff100: 'ৰূম টেৰিফ (১০০% হোটেল)',
    platformFee5: '৫% কমিছন (প্লেটফৰ্ম)',
    totalPaid: 'মুঠ পৰিশোধিত মূল্য',
    paymentStatus: 'পৰিশোধৰ অৱস্থা',
    
    securitySettings: 'সুৰক্ষা আৰু পাছৱৰ্ড',
    changePassword: 'এডমিন পাছৱৰ্ড সলনি কৰক',
    enterCurrentPassword: 'বৰ্তমানৰ পাছৱৰ্ড দিয়ক',
    enterNewPassword: 'নতুন পাছৱৰ্ড দিয়ক',
    confirmNewPassword: 'নতুন পাছৱৰ্ড নিশ্চিত কৰক',
    saveNewPassword: 'নতুন পাছৱৰ্ড সংৰক্ষণ কৰক',
    forgotPassword: 'পাছৱৰ্ড পাহৰিলে? ৰিকভাৰী কীৰে ৰিচেট কৰক',
    enterRecoveryKey: 'মাষ্টাৰ ৰিকভাৰী কী দিয়ক',
    recoveryKeyHelp: 'এডমিন এক্সেছ ৰিচেট কৰিবলৈ দিয়া বিশেষ মাষ্টাৰ কী দিয়ক।',
    resetPasswordBtn: 'পাছৱৰ্ড ৰিচেট কৰক',
    passwordMismatch: 'নতুন পাছৱৰ্ড দুয়োটা মিলি যোৱা নাই।',
    passwordChangedSuccess: 'এডমিন পাছৱৰ্ড সফলভাৱে সলনি হ’ল!',
    invalidPassword: 'ভুল পাছৱৰ্ড। অনুগ্ৰহ কৰি পুনৰ চেষ্টা কৰক।',
    invalidRecoveryKey: 'ভুল মাষ্টাৰ ৰিকভাৰী কী।',
    
    english: 'English',
    assamese: 'অসমীয়া (Assamese)',
    bengali: 'বাংলা (Bengali)',
    hindi: 'हिन्दी (Hindi)',

    ownerDashboard: 'মালিকৰ ডেশ্ববৰ্ড',
    hotelDirectory: 'হোটেল তালিকা',
    browseRooms: 'কোঠা বাছনি',
    findMyBooking: 'মোৰ বুকিং চাওক',
    searchLocation: 'চহৰ, স্থান বা লেণ্ডমাৰ্ক বিচাৰক',
    viewOnMap: 'Google Maps ত চাওক',
    bookNow: 'কোঠা বাছনি & বুকিং',
    registrationTitle: 'হোটেল আৰু হোমষ্টে’ পঞ্জীয়ন',
    registrationSubtitle: 'মাল্টি-ভেণ্ডৰ পঞ্জীয়ন আৰু দ্বৈত বুকিং ব্যৱস্থা',
    propertyDetails: '১. প্ৰতিষ্ঠান আৰু মালিকৰ তথ্য',
    locationDetails: 'হোটেলৰ অৱস্থান আৰু ঠিকনা',
    quickFillDemo: '⚡ নমুনা তথ্য',
    signIn: 'লগইন',
    close: 'বাতিল',
    proceedPayment: 'মাচুল পৰিশোধ আৰু পঞ্জীয়ন (₹৯৯)',
    entryFee: 'প্ৰৱেশ মাচুল: ₹৯৯',
    mobileNavRooms: 'ৰূম',
    mobileNavPolice: 'পুলিচ',
    mobileNavBook: '+বুক',
    mobileNavAccounts: 'হিচাপ',
    mobileNavBilling: 'চালান',
    mobileNavGuest: 'গ্ৰাহক',

    // Trial Banner & Badges
    trialBannerBadge: 'প্ৰথম ১ মাহ বিনামূলীয়া (৩০ দিন ফ্ৰী ট্ৰায়াল)',
    trialBannerTitle: 'অনলাইন আৰু অফলাইন ডাবল-বুকিং ৰোধ কৰক — প্ৰথম মাহ সম্পূৰ্ণ ফ্ৰী',
    trialBannerDesc: 'হোটেলৰ সম্পূৰ্ণ ১০০% কোঠাৰ ভাৰা হোটেল মালিকৰ হাতলৈ। অনলাইন বুকিঙত মাত্ৰ ৫% মাচুল আৰু অফলাইন ৱাক-ইনত ০% মাচুল।',
    upgradeBtn: 'আপগ্ৰেড কৰক (₹৯৯)',
    oneMonthFreeBadge: '১ম মাহ ফ্ৰী • ৩০ দিন ট্ৰায়াল',
    entryFeeNotice: '₹৯৯ পঞ্জীয়ন মাচুল • ৫% স্বচ্ছ কমিছন',

    // Metrics Cards
    totalRooms: 'মুঠ কোঠা',
    availableRooms: 'খালী কোঠা',
    offlineBooked: 'অফলাইন বুকিং',
    onlineBooked: 'অনলাইন বুকিং',
    todayArrivals: 'আজিৰ আগমন',
    occupied: 'ব্যস্ত',
    busy: 'বুক্ড',

    // Room Grid
    roomStatusGrid: 'কোঠা অৱস্থা গ্ৰিড',
    greenAvailable: 'সেউজীয়া: উপলব্ধ',
    redOffline: 'ৰঙা: অফলাইন',
    blueOnline: 'নীলা: অনলাইন',
    quickBook: 'বুক কৰক',
    viewBooking: 'চাওক',
    checkOut: 'চেক আউট',
    invoice: 'চালান',
    noRoomsMatch: 'কোনো কোঠা ফিল্টাৰৰ সৈতে মিলা নাই',
    trySwitchingTotal: 'অনুগ্ৰহ কৰি "মুঠ কোঠা" ফিল্টাৰ চাওক।',

    // Guest Portal
    guestPortalSubtitle: 'নিশ্চিত হোটেল আৰু হোমষ্টে’ ক্ষিপ্ৰ বুকিং সুবিধা',
    searchPlaceholder: 'চহৰ, অঞ্চল, ভ্ৰমণস্থলী বা হোটেলৰ নাম বিচাৰক...',
    allDestinations: 'সকলো স্থান',
    filterAvailableOnly: 'কেৱল খালী থকা',
    checkInDateLabel: 'চেক-ইন',
    checkOutDateLabel: 'চেক-আউট',
    guestsCountLabel: 'অতিথি',
    nightCount: 'ৰাতি',
    nightsCount: 'ৰাতি',
    perNight: '/ প্ৰতি ৰাতি',
    verifiedHotel: 'পৰীক্ষিত প্ৰতিষ্ঠান',
    roomsAvailable: 'কোঠা উপলব্ধ',
    viewRoomsBtn: 'কোঠা নিৰ্বাচন আৰু বুকিং',
    selectHotelBtn: 'হোটেলৰ কোঠাসমূহ চাওক',
    directBookingTitle: 'অনলাইন ক্ষিপ্ৰ কোঠা সংৰক্ষণ',
    directBookingSubtitle: 'হোটেলৰ সৈতে প্ৰত্যক্ষ বুকিং • তৎক্ষণাৎ নিশ্চিতকৰণ',
    guestFullName: 'অতিথিৰ সম্পূৰ্ণ নাম',
    guestMobile: 'ম’বাইল / হোৱাটছএপ নম্বৰ',
    guestEmail: 'ইমেইল ঠিকনা (ঐচ্ছিক)',
    specialRequests: 'বিশেষ অনুৰোধ / আগমনৰ সময়',
    confirmAndBook: 'বুকিং নিশ্চিত কৰক',
    bookingConfirmedTitle: 'বুকিং সফলতাৰে সম্পন্ন হ’ল!',
    bookingConfirmedSubtitle: 'আপোনাৰ সংৰক্ষণ নিশ্চিত কৰা হৈছে। হোটেল কৰ্তৃপক্ষক জনোৱা হৈছে।',
    myBookingTitle: 'আপোনাৰ বুকিং চাওক',
    myBookingSubtitle: 'আপোনাৰ ম’বাইল নম্বৰ দি সক্ৰিয় বুকিং পৰীক্ষা কৰক',
    enterPhoneNumber: '১০ সংখ্যাৰ ম’বাইল নম্বৰ দিয়ক',
    lookupBtn: 'বুকিং বিচাৰক',

    // Registration & Onboarding
    hotelNameLabel: 'হোটেল বা হোমষ্টে’ৰ নাম',
    ownerNameLabel: 'মালিকৰ সম্পূৰ্ণ নাম',
    contactPhoneLabel: 'যোগাযোগৰ ফোন নম্বৰ',
    cityLabel: 'চহৰ / ভ্ৰমণস্থলী',
    areaLabel: 'অঞ্চল / অঞ্চলৰ নাম',
    landmarkLabel: 'মুখ্য লেণ্ডমাৰ্ক',
    fullAddressLabel: 'সম্পূৰ্ণ পথৰ ঠিকনা',
    googleMapsLinkLabel: 'গুগল মেপ লিংক (ঐচ্ছিক)',
    generateMapBtn: 'মেপ লিংক তৈয়াৰ কৰক',
    guestLocationPreview: 'লাইভ গ্ৰাহক সন্ধান প্ৰিভিউ',
    alreadyRegistered: 'ইতিমধ্যে পঞ্জীকৃত নেকি?',
    logInHere: 'ইয়াত লগইন কৰক',
    addNewHotelBtn: '+ নতুন হোটেল যোগ (₹৯৯)',
    editHotelInfo: 'হোটেল তথ্য সম্পাদনা'
  },
  
  bn: {
    brandTitle: 'ORDERFIX',
    brandTagline: 'মাল্টি-ভেন্ডর হোটেল ম্যানেজমেন্ট, ডুয়াল বুকিং ও ৫% প্ল্যাটফর্ম কমিশন সিস্টেম',
    liveSystem: 'লাইভ প্রোডাকশন সিস্টেম',
    dbConnected: 'নিয়ন পোস্টগ্রেস ডাটাবেস সংযুক্ত',
    oneMonthFree: '১ম মাস ফ্রি সাবস্ক্রিপশন',
    trialDaysLeft: 'দিন বাকি আছে',
    
    rooms: 'রুমসমূহ',
    addBooking: '+ রুম বুক করুন',
    grid: 'রুম গ্রিড',
    list: 'তালিকা',
    accounting: 'হিসাব ও ৫% কমিশন',
    policeVerification: 'পুলিশ ভেরিফিকেশন',
    guestPortal: 'গ্রাহক পোর্টাল 📱',
    compactMode: 'ছোট স্ক্রিন',
    normalMode: 'স্বাভাবিক স্ক্রিন',
    today: 'আজ',
    login: 'লগইন',
    logout: 'লগআউট',
    adminPanel: 'অ্যাডমিন প্যানেল',
    adminSwitch: 'মাস্টার অ্যাডমিন প্যানেল',
    billing: 'বিলিং ও চালান 🧾',
    
    adminTitle: 'প্ল্যাটফর্ম মাস্টার অ্যাডমিন ড্যাশবোর্ড',
    adminSubtitle: 'মাল্টি-ভেন্ডর হোটেল নেটওয়ার্ক, অনলাইন বুকিং ও মাসিক আর্থিক হিসাব',
    registeredHotelsCount: 'মোট নিবন্ধিত হোটেল',
    registeredHotelsDesc: 'Orderfix প্ল্যাটফর্মে নিবন্ধিত হোটেল ও রিসোর্ট',
    onlineBookingsCount: 'অনলাইন গ্রাহক বুকিং',
    onlineBookingsDesc: 'গ্রাহক পোর্টাল থেকে সরাসরি বুকিং',
    totalPlatformCommission: '৫% প্ল্যাটফর্ম কমিশন',
    totalPlatformCommissionDesc: 'রুম ভাড়ার ওপর প্ল্যাটফর্ম মালিকের ৫% কমিশন',
    totalHotelPayout: '১০০% হোটেল রুম ভাড়া',
    totalHotelPayoutDesc: 'হোটেল মালিকের প্রাপ্য ১০০% রুম ট্যারিফ',
    totalEntryFees: '₹৯৯ এন্ট্রি ফি সংগৃহীত',
    totalEntryFeesDesc: 'প্রতিটি হোটেল নিবন্ধনের এককালীন ফি',
    netPlatformEarnings: 'মোট প্ল্যাটফর্ম আয়',
    netPlatformEarningsDesc: '৫% কমিশন + ₹৯৯ এন্ট্রি ফি',
    zeroCommissionOffline: '₹০ অফলাইন কমিশন',
    zeroCommissionOfflineDesc: 'ওয়াক-ইন বুকিংয়ে সম্পূর্ণ ফ্রি',
    
    tabOverview: 'সংক্ষিপ্ত বিবরণ',
    tabHotels: 'হোটেল নিবন্ধনসমূহ',
    tabOnlineBookings: 'অনলাইন বুকিং তালিকা',
    tabMonthlyAccounts: 'মাসিক হিসাব',
    
    hotelName: 'হোটেল / প্রপার্টি',
    propertyType: 'ধরন',
    ownerName: 'মালিকের নাম',
    contactNumber: 'ফোন / হোয়াটসঅ্যাপ',
    location: 'শহর / ঠিকানা',
    registeredOn: 'নিবন্ধনের তারিখ',
    entryFeeStatus: '₹৯৯ এন্ট্রি ফি',
    trialStatus: '১ মাস ফ্রি ট্রায়াল',
    actions: 'অ্যাকশন',
    viewDetails: 'বিস্তারিত দেখুন',
    switchHotel: 'ড্যাশবোর্ডে খুলুন',
    addPropertyBtn: '+ নতুন হোটেল নিবন্ধন (₹৯৯)',
    
    month: 'মাস',
    monthlyBookings: 'অনলাইন বুকিং',
    monthlyTariff: '১০০% হোটেল ভাড়া (₹)',
    monthlyCommission: '৫% কমিশন (₹)',
    monthlyTotalPaid: 'গ্রাহকের মোট পরিশোধ (₹)',
    monthlyNewHotels: 'নতুন হোটেল',
    monthlyEntryFees: 'এন্ট্রি ফি (₹)',
    monthlyNetProfit: 'প্ল্যাটফর্ম মোট আয় (₹)',
    exportReport: 'রিপোর্ট প্রিন্ট করুন',
    
    bookingId: 'বুকিং আইডি',
    guestDetails: 'অতিথির বিবরণ',
    roomDetails: 'হোটেল ও রুম',
    dates: 'চেক-ইন / চেক-আউট',
    roomTariff100: 'রুম ট্যারিফ (১০০% হোটেল)',
    platformFee5: '৫% কমিশন (প্ল্যাটফর্ম)',
    totalPaid: 'মোট পরিশোধ',
    paymentStatus: 'পেমেন্ট স্ট্যাটাস',
    
    securitySettings: 'নিরাপত্তা ও পাসওয়ার্ড',
    changePassword: 'অ্যাডমিন পাসওয়ার্ড পরিবর্তন',
    enterCurrentPassword: 'বর্তমান পাসওয়ার্ড দিন',
    enterNewPassword: 'নতুন পাসওয়ার্ড দিন',
    confirmNewPassword: 'নতুন পাসওয়ার্ড নিশ্চিত করুন',
    saveNewPassword: 'পাসওয়ার্ড সংরক্ষণ করুন',
    forgotPassword: 'পাসওয়ার্ড ভুলে গেছেন? রিকভারি কী ব্যবহার করুন',
    enterRecoveryKey: 'মাস্টার রিকভারি কী দিন',
    recoveryKeyHelp: 'অ্যাডমিন অ্যাক্সেস রিসেট করতে মাস্টার কী ব্যবহার করুন।',
    resetPasswordBtn: 'পাসওয়ার্ড রিসেট করুন',
    passwordMismatch: 'নতুন পাসওয়ার্ড দুটি মেলেনি।',
    passwordChangedSuccess: 'অ্যাডমিন পাসওয়ার্ড সফলভাবে পরিবর্তিত হয়েছে!',
    invalidPassword: 'ভুল পাসওয়ার্ড। আবার চেষ্টা করুন।',
    invalidRecoveryKey: 'ভুল মাস্টার রিকভারি কী।',
    
    english: 'English',
    assamese: 'অসমীয়া (Assamese)',
    bengali: 'বাংলা (Bengali)',
    hindi: 'हिन्दी (Hindi)',

    ownerDashboard: 'মালিকের ড্যাশবোর্ড',
    hotelDirectory: 'হোটেল তালিকা',
    browseRooms: 'রুম নির্বাচন',
    findMyBooking: 'আমার বুকিং দেখুন',
    searchLocation: 'শহর, এলাকা বা ল্যান্ডমার্ক খুঁজুন',
    viewOnMap: 'Google Maps-এ দেখুন',
    bookNow: 'রুম বেছে নিন ও বুক করুন',
    registrationTitle: 'হোটেল ও হোমস্টে নিবন্ধন',
    registrationSubtitle: 'মাল্টি-ভেন্ডর অনবোর্ডিং ও ডুয়াল বুকিং সিস্টেম',
    propertyDetails: '১. প্রতিষ্ঠান ও মালিকের তথ্য',
    locationDetails: 'অবস্থান ও ঠিকানা',
    quickFillDemo: '⚡ ডেমো তথ্য',
    signIn: 'লগইন',
    close: 'বন্ধ করুন',
    proceedPayment: 'পেমেন্ট ও নিবন্ধন সম্পন্ন করুন (₹৯৯)',
    entryFee: 'এন্ট্রি ফি: ₹৯৯',
    freeTrialMonth: '১ম মাস সম্পূর্ণ ফ্রি (৩০ দিন)',
    mobileNavRooms: 'রুম',
    mobileNavPolice: 'পুলিশ',
    mobileNavBook: '+বুক',
    mobileNavAccounts: 'হিসেব',
    mobileNavBilling: 'বিলিং',
    mobileNavGuest: 'গ্রাহক'
  },
  
  hi: {
    brandTitle: 'ORDERFIX',
    brandTagline: 'मल्टी-वेंडर होटल मैनेजमेंट, डुअल बुकिंग और 5% प्लेटफॉर्म कमीशन सिस्टम',
    liveSystem: 'लाइव प्रोडक्शन सिस्टम',
    dbConnected: 'नियॉन पोस्टग्रेएसक्यूएल डेटाबेस कनेक्टेड',
    oneMonthFree: 'पहला महीना फ्री सब्सक्रिप्शन',
    trialDaysLeft: 'दिन शेष',
    
    rooms: 'कमरे',
    addBooking: '+ कमरा बुक करें',
    grid: 'रूम ग्रिड',
    list: 'बुकिंग सूची',
    accounting: 'हिसाब और 5% कमीशन',
    policeVerification: 'पुलिस वेरिफिकेशन',
    guestPortal: 'ग्राहक पोर्टल 📱',
    compactMode: 'छोटा स्क्रीन',
    normalMode: 'सामान्य स्क्रीन',
    today: 'आज',
    login: 'लॉग इन',
    logout: 'लॉग आउट',
    adminPanel: 'एडमिन पैनल',
    adminSwitch: 'मास्टर एडमिन पैनल',
    billing: 'बिलिंग और इनवॉइस 🧾',
    
    adminTitle: 'प्लेटफॉर्म मास्टर एडमिन डैशबोर्ड',
    adminSubtitle: 'केंद्रीय मल्टी-वेंडर होटल नेटवर्क, ऑनलाइन बुकिंग और मासिक वित्तीय हिसाब',
    registeredHotelsCount: 'कुल पंजीकृत होटल',
    registeredHotelsDesc: 'Orderfix पर पंजीकृत होटल और रिसॉर्ट',
    onlineBookingsCount: 'ऑनलाइन कस्टमर बुकिंग्स',
    onlineBookingsDesc: 'ऑनलाइन पोर्टल से सीधे प्राप्त बुकिंग्स',
    totalPlatformCommission: '5% प्लेटफॉर्म कमीशन',
    totalPlatformCommissionDesc: 'रूम टैरिफ पर प्लेटफॉर्म ओनर का 5% कमीशन',
    totalHotelPayout: '100% होटल रूम टैरिफ',
    totalHotelPayoutDesc: 'होटल मालिक को 100% पूरा रूम किराया',
    totalEntryFees: '₹99 रजिस्ट्रेशन फीस',
    totalEntryFeesDesc: 'प्रत्येक होटल का एकमुश्त ऑनबोर्डिंग शुल्क',
    netPlatformEarnings: 'कुल प्लेटफॉर्म कमाई',
    netPlatformEarningsDesc: '5% कमीशन + ₹99 रजिस्ट्रेशन फीस',
    zeroCommissionOffline: '₹0 ऑफलाइन कमीशन',
    zeroCommissionOfflineDesc: 'होटल वॉक-इन बुकिंग पर 100% फ्री',
    
    tabOverview: 'प्लेटफॉर्म अवलोकन',
    tabHotels: 'होटल रजिस्ट्रेशन सूची',
    tabOnlineBookings: 'ऑनलाइन बुकिंग्स',
    tabMonthlyAccounts: 'मासिक हिसाब-किताब',
    
    hotelName: 'होटल / संपत्ति',
    propertyType: 'प्रकार',
    ownerName: 'मालिक का नाम',
    contactNumber: 'फोन / व्हाट्सएप',
    location: 'शहर / पता',
    registeredOn: 'पंजीकरण तारीख',
    entryFeeStatus: '₹99 एंट्री फीस',
    trialStatus: '1 महीना फ्री ट्रायल',
    actions: 'क्रियाएँ',
    viewDetails: 'विवरण देखें',
    switchHotel: 'डैशबोर्ड में खोलें',
    addPropertyBtn: '+ नया होटल जोड़ें (₹99)',
    
    month: 'महीना',
    monthlyBookings: 'ऑनलाइन बुकिंग्स',
    monthlyTariff: '100% होटल टैरिफ (₹)',
    monthlyCommission: '5% कमीशन (₹)',
    monthlyTotalPaid: 'ग्राहक द्वारा भुगतान (₹)',
    monthlyNewHotels: 'नए होटल',
    monthlyEntryFees: 'एंट्री फीस (₹)',
    monthlyNetProfit: 'प्लेटफॉर्म शुद्ध आय (₹)',
    exportReport: 'रिपोर्ट प्रिंट / एक्सपोर्ट करें',
    
    bookingId: 'बुकिंग आईडी',
    guestDetails: 'अतिथि विवरण',
    roomDetails: 'होटल और कमरा',
    dates: 'चेक-इन / चेक-आउट',
    roomTariff100: 'रूम किराया (100% होटल)',
    platformFee5: '5% कमीशन (प्लेटफॉर्म)',
    totalPaid: 'कुल देय राशि',
    paymentStatus: 'भुगतान स्थिति',
    
    securitySettings: 'सुरक्षा और पासवर्ड',
    changePassword: 'एडमिन पासवर्ड बदलें',
    enterCurrentPassword: 'वर्तमान पासवर्ड दर्ज करें',
    enterNewPassword: 'नया पासवर्ड दर्ज करें',
    confirmNewPassword: 'नए पासवर्ड की पुष्टि करें',
    saveNewPassword: 'नया पासवर्ड सहेजें',
    forgotPassword: 'पासवर्ड भूल गए? रिकवरी की से रीसेट करें',
    enterRecoveryKey: 'मास्टर रिकवरी की दर्ज करें',
    recoveryKeyHelp: 'एडमिन एक्सेस रीसेट करने के लिए मास्टर की का उपयोग करें।',
    resetPasswordBtn: 'पासवर्ड रीसेट करें',
    passwordMismatch: 'दोनों नए पासवर्ड मेल नहीं खा रहे हैं।',
    passwordChangedSuccess: 'एडमिन पासवर्ड सफलतापूर्वक बदल गया!',
    invalidPassword: 'गलत पासवर्ड। कृपया पुनः प्रयास करें।',
    invalidRecoveryKey: 'अमान्य मास्टर रिकवरी की।',
    
    english: 'English',
    assamese: 'অসমীয়া (Assamese)',
    bengali: 'বাংলা (Bengali)',
    hindi: 'हिन्दी (Hindi)',

    ownerDashboard: 'मालिक डैशबोर्ड',
    hotelDirectory: 'होटल सूची',
    browseRooms: 'कमरे चुनें',
    findMyBooking: 'मेरी बुकिंग खोजें',
    searchLocation: 'शहर, स्थान या लैंडमार्क खोजें',
    viewOnMap: 'गूगल मैप्स पर देखें',
    bookNow: 'कमरा चुनें और बुक करें',
    registrationTitle: 'होटल और होमस्टे पंजीकरण',
    registrationSubtitle: 'मल्टी-वेंडर ऑनबोर्डिंग और त्वरित डुअल बुकिंग सिस्टम',
    propertyDetails: '१. संपत्ति और मालिक का विवरण',
    locationDetails: 'होटल का स्थान और पता',
    quickFillDemo: '⚡ डेमो डेटा',
    signIn: 'लॉग इन',
    close: 'बंद करें',
    proceedPayment: 'भुगतान और पंजीकरण करें (₹99)',
    entryFee: 'प्रवेश शुल्क: ₹99',
    freeTrialMonth: 'पहला महीना फ्री (30 दिन)',
    mobileNavRooms: 'कमरे',
    mobileNavPolice: 'पुलिस',
    mobileNavBook: '+बुक',
    mobileNavAccounts: 'हिसाब',
    mobileNavBilling: 'बिल',
    mobileNavGuest: 'ग्राहक'
  }
};

export function getTranslations(lang: LanguageCode = 'en'): Translations {
  return translations[lang] || translations.en;
}
