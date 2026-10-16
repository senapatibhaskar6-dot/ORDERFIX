import React, { useState } from 'react';
import { Room, Booking, HotelProfile } from '../types';
import {
  checkBookingConflict,
  calculateNights,
  formatDateFull,
  formatDateShort,
  formatSourceName
} from '../utils/bookingEngine';
import { calculatePlatformCommission, SAMPLE_HOTEL_IMAGES } from '../utils/storage';
import {
  Phone,
  MessageCircle,
  Calendar,
  CheckCircle2,
  XCircle,
  MapPin,
  Clock,
  Wifi,
  Wind,
  Tv,
  Coffee,
  ShieldCheck,
  Share2,
  ArrowLeft,
  Sparkles,
  Users,
  Search,
  FileText,
  CreditCard,
  QrCode,
  Check,
  Building2,
  ChevronRight,
  Eye,
  X,
  Maximize2,
  DollarSign,
  Car,
  Utensils,
  Zap,
  Info,
  Compass,
  ExternalLink
} from 'lucide-react';
import { OrderfixLogo } from './Logo';

interface CustomerGuestViewProps {
  hotels: HotelProfile[];
  activeHotel: HotelProfile;
  onSelectHotel: (hotelId: string) => void;
  rooms: Room[];
  bookings: Booking[];
  onSaveBooking: (newBooking: Booking, sendWhatsAppNow: boolean) => void;
  onBackToOwner: () => void;
}

export const CustomerGuestView: React.FC<CustomerGuestViewProps> = ({
  hotels,
  activeHotel,
  onSelectHotel,
  rooms,
  bookings,
  onSaveBooking,
  onBackToOwner
}) => {
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  })();

  // Navigation tab inside Customer Portal
  const [activePortalTab, setActivePortalTab] = useState<'browse' | 'hotels_directory' | 'my_booking' | 'about'>('browse');

  // Dates & Guest Filter
  const [checkInDate, setCheckInDate] = useState(today);
  const [checkOutDate, setCheckOutDate] = useState(tomorrow);
  const [guestCount, setGuestCount] = useState(2);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'available'>('all');
  const [copiedLink, setCopiedLink] = useState(false);

  // Location-based Search and Filtering
  const [locationSearchQuery, setLocationSearchQuery] = useState<string>('');
  const [selectedDestination, setSelectedDestination] = useState<string>('all');

  // Image Gallery Lightbox Modal State
  const [lightboxImageIndex, setLightboxImageIndex] = useState<number | null>(null);

  // Direct Booking Modal State
  const [selectedRoomForBooking, setSelectedRoomForBooking] = useState<Room | null>(null);
  const [bookingGuestName, setBookingGuestName] = useState('');
  const [bookingGuestPhone, setBookingGuestPhone] = useState('');
  const [bookingGuestEmail, setBookingGuestEmail] = useState('');
  const [bookingNotes, setBookingNotes] = useState('');
  const [isSubmittingBooking, setIsSubmittingBooking] = useState(false);
  const [bookedConfirmation, setBookedConfirmation] = useState<Booking | null>(null);

  // Guest Booking Lookup State ("মোৰ বুকিং চাওক")
  const [lookupPhone, setLookupPhone] = useState('');
  const [searchedBooking, setSearchedBooking] = useState<Booking | null | 'not_found'>(null);

  const nights = calculateNights(checkInDate, checkOutDate);

  // Filter hotels based on selected destination and location search query
  const filteredHotels = hotels.filter((h) => {
    // 1. Destination tab filter
    if (selectedDestination !== 'all' && h.city.toLowerCase() !== selectedDestination.toLowerCase()) {
      return false;
    }
    // 2. Search query filter (matches city, area, landmark, address, hotel name, state)
    if (locationSearchQuery.trim()) {
      const q = locationSearchQuery.toLowerCase().trim();
      const matchCity = h.city.toLowerCase().includes(q);
      const matchArea = (h.area || '').toLowerCase().includes(q);
      const matchLandmark = (h.landmark || '').toLowerCase().includes(q);
      const matchAddress = (h.address || '').toLowerCase().includes(q);
      const matchName = h.name.toLowerCase().includes(q);
      const matchState = (h.state || '').toLowerCase().includes(q);

      // Support Assamese search words
      const matchAssamese =
        (q.includes('কাজিৰঙা') && h.city.toLowerCase().includes('kaziranga')) ||
        (q.includes('গুৱাহাটী') && h.city.toLowerCase().includes('guwahati')) ||
        (q.includes('তেজপুৰ') && h.city.toLowerCase().includes('tezpur')) ||
        (q.includes('শ্বিলং') && h.city.toLowerCase().includes('shillong')) ||
        (q.includes('মাজুলী') && h.city.toLowerCase().includes('majuli')) ||
        (q.includes('যোৰহাট') && h.city.toLowerCase().includes('jorhat')) ||
        (q.includes('ডিব্ৰুগড়') && h.city.toLowerCase().includes('dibrugarh')) ||
        (q.includes('শিৱসাগৰ') && h.city.toLowerCase().includes('sivasagar')) ||
        (q.includes('মানাহ') && h.city.toLowerCase().includes('manas')) ||
        (q.includes('হাফলং') && h.city.toLowerCase().includes('haflong'));

      return matchCity || matchArea || matchLandmark || matchAddress || matchName || matchState || matchAssamese;
    }
    return true;
  });

  // Unique cities from currently loaded hotels
  const uniqueCities = Array.from(new Set(hotels.map((h) => h.city))).filter(Boolean);

  // Helper to calculate starting room price for any hotel
  const getHotelStartingPrice = (hotelId: string) => {
    const hotelRooms = rooms.filter((r) => r.hotelId === hotelId);
    if (hotelRooms.length === 0) return 1800;
    return Math.min(...hotelRooms.map((r) => r.basePrice));
  };

  // Helper to calculate total rooms for any hotel
  const getHotelRoomsCount = (hotelId: string) => {
    return rooms.filter((r) => r.hotelId === hotelId).length;
  };

  // Hotels in the same destination as currently active hotel
  const sisterHotelsInDestination = hotels.filter(
    (h) => h.city.toLowerCase() === activeHotel.city.toLowerCase() && h.id !== activeHotel.id
  );

  // Filter rooms belonging to current active hotel
  const activeHotelRooms = rooms.filter(
    (r) => !r.hotelId || r.hotelId === activeHotel.id
  );

  // Check each room availability for the selected dates
  const roomsWithAvailability = activeHotelRooms.map((room) => {
    const conflict = checkBookingConflict(room.id, checkInDate, checkOutDate, bookings);
    const isAvailable = !conflict.hasConflict && !room.isMaintenance;
    return {
      ...room,
      isAvailable,
      conflictMessage: conflict.message
    };
  });

  const availableRoomsCount = roomsWithAvailability.filter((r) => r.isAvailable).length;

  const displayedRooms = selectedFilter === 'available'
    ? roomsWithAvailability.filter((r) => r.isAvailable)
    : roomsWithAvailability;

  const handleShare = () => {
    const portalUrl = `${window.location.origin}?view=guest&hotel=${activeHotel.id}`;
    if (navigator.share) {
      navigator
        .share({
          title: `${activeHotel.name} - Direct Room Booking & Guest Portal`,
          text: `Check live room availability & book directly at ${activeHotel.name} with zero booking fees!`,
          url: portalUrl
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(portalUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleLookupBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupPhone.trim()) return;

    const cleanInput = lookupPhone.replace(/\D/g, '').slice(-10);
    const found = bookings.find((b) => {
      const bPhone = b.guestPhone.replace(/\D/g, '').slice(-10);
      return bPhone === cleanInput && b.status !== 'cancelled';
    });

    if (found) {
      setSearchedBooking(found);
    } else {
      setSearchedBooking('not_found');
    }
  };

  const handleConfirmDirectBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoomForBooking) return;
    if (!bookingGuestName.trim() || !bookingGuestPhone.trim()) {
      alert('অনুগ্ৰহ কৰি অতিথিৰ নাম আৰু ফোন নম্বৰ দিয়ক।');
      return;
    }

    setIsSubmittingBooking(true);

    const roomTariff = selectedRoomForBooking.basePrice * nights;
    const split = calculatePlatformCommission(roomTariff, 'online');
    const totalAmount = split.totalWithCommission;

    const newBooking: Booking = {
      id: `bk-${Date.now().toString().slice(-6)}`,
      hotelId: activeHotel.id,
      roomId: selectedRoomForBooking.id,
      roomNumber: selectedRoomForBooking.roomNumber,
      guestName: bookingGuestName.trim(),
      guestPhone: bookingGuestPhone.trim(),
      guestEmail: bookingGuestEmail.trim() || undefined,
      channel: 'online',
      source: 'orderfix_portal',
      portalBookingId: `OF-${Date.now().toString().slice(-6)}`,
      checkInDate,
      checkOutDate,
      checkInTime: activeHotel.checkInStandardTime || '12:00 PM',
      checkOutTime: activeHotel.checkOutStandardTime || '11:00 AM',
      guestCount,
      totalAmount,
      advancePaid: totalAmount, // Paid online via portal
      paymentStatus: 'paid',
      paymentMethod: 'online_portal',
      status: 'confirmed',
      notes: bookingNotes.trim() ? `Direct Online: ${bookingNotes.trim()}` : 'Booked via Customer Guest Portal',
      createdAt: new Date().toISOString(),
      commissionRate: split.commissionRate,
      platformCommission: split.platformCommission,
      hotelPayoutAmount: split.hotelPayoutAmount
    };

    setTimeout(() => {
      onSaveBooking(newBooking, false);
      setIsSubmittingBooking(false);
      setBookedConfirmation(newBooking);
      setSelectedRoomForBooking(null);
    }, 700);
  };

  const activeHotelImages = (activeHotel.images && activeHotel.images.length > 0)
    ? activeHotel.images
    : [
        'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
        'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1200&q=80'
      ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-start text-slate-800 font-sans pb-16">
      
      {/* Mobile Shell Container */}
      <div className="w-full max-w-md md:max-w-xl bg-white min-h-screen shadow-2xl flex flex-col border-x border-slate-200">
        
        {/* Top Header & Property Switcher */}
        <div className="bg-gradient-to-r from-[#0B2545] to-[#123661] text-white p-4 sticky top-0 z-30 shadow-md">
          <div className="flex items-center justify-between gap-2">
            
            <button
              onClick={onBackToOwner}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all cursor-pointer active:scale-95"
              title="Return to Hotel Owner Management Dashboard"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>মালিকৰ ডেশ্ববৰ্ড</span>
            </button>

            <div className="flex items-center gap-1.5">
              <OrderfixLogo size="sm" className="text-white" />
              <span className="text-[10px] font-black uppercase tracking-wider bg-teal-400 text-slate-950 px-2 py-0.5 rounded-full">
                গ্ৰাহক পৰ্টেল
              </span>
            </div>

            <button
              onClick={handleShare}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs transition-colors cursor-pointer"
              title="Share Portal Link"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            </button>
          </div>

          {/* Hotel Name & Verification Badge */}
          <div className="mt-2.5 flex items-start justify-between gap-2">
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h1 className="text-base sm:text-lg font-black text-white leading-tight">
                  {activeHotel.name}
                </h1>
                <span title="Assam Police KYC Verified Safe Stay">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                </span>
              </div>
              <div className="flex items-center gap-2 flex-wrap text-[11px] text-slate-300">
                <span className="flex items-center gap-1 font-semibold text-teal-300">
                  <MapPin className="w-3 h-3 text-teal-400 shrink-0" />
                  <span>{activeHotel.city}, {activeHotel.state}</span>
                </span>
                {activeHotel.area && (
                  <span className="text-slate-400">• {activeHotel.area}</span>
                )}
                <a
                  href={activeHotel.mapLocationUrl || `https://maps.google.com/?q=${encodeURIComponent(`${activeHotel.name} ${activeHotel.area || ''} ${activeHotel.city} ${activeHotel.state}`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[10px] font-bold text-teal-300 hover:text-white bg-white/10 hover:bg-white/20 px-2 py-0.5 rounded-md border border-white/10 transition-colors"
                  title="Google Maps ত সঠিক অৱস্থান চাওক"
                >
                  <Compass className="w-3 h-3 text-teal-300" />
                  <span>মেপ চাওক</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
            </div>

            <button
              onClick={() => setActivePortalTab('hotels_directory')}
              className="shrink-0 text-[11px] font-bold bg-teal-500/20 hover:bg-teal-500/30 text-teal-200 border border-teal-400/30 px-2.5 py-1 rounded-xl flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Building2 className="w-3.5 h-3.5 text-teal-300" />
              <span>অন্য হোটেল ({hotels.length})</span>
            </button>
          </div>

          {/* DEDICATED LOCATION & DESTINATION SEARCH BAR */}
          <div className="mt-3 space-y-2 bg-slate-900/60 p-2.5 rounded-2xl border border-white/15 backdrop-blur-xs">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[10px] font-black uppercase tracking-wider text-teal-300 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-teal-400" />
                <span>অনলাইন বুকিং লোকেশ্যন চাৰ্চ (Find Hotels by Location)</span>
              </span>
              {(locationSearchQuery || selectedDestination !== 'all') && (
                <button
                  type="button"
                  onClick={() => {
                    setLocationSearchQuery('');
                    setSelectedDestination('all');
                  }}
                  className="text-[10px] text-teal-300 hover:text-white font-bold underline cursor-pointer"
                >
                  সকলো চাওক (Reset)
                </button>
              )}
            </div>

            {/* Location Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-teal-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="চহৰ, স্থান বা লেণ্ডমাৰ্ক (e.g. Kaziranga, Guwahati, Tezpur, Shillong...)"
                value={locationSearchQuery}
                onChange={(e) => {
                  const val = e.target.value;
                  setLocationSearchQuery(val);
                  if (activePortalTab === 'my_booking') {
                    setActivePortalTab('browse');
                  }
                  if (val.trim()) {
                    const matched = hotels.find((h) =>
                      h.city.toLowerCase().includes(val.toLowerCase()) ||
                      (h.area || '').toLowerCase().includes(val.toLowerCase()) ||
                      (h.landmark || '').toLowerCase().includes(val.toLowerCase())
                    );
                    if (matched) {
                      onSelectHotel(matched.id);
                    }
                  }
                }}
                className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-950/90 border border-teal-500/40 text-white placeholder-slate-400 text-xs font-bold focus:outline-hidden focus:ring-2 focus:ring-teal-400"
              />
              {locationSearchQuery && (
                <button
                  type="button"
                  onClick={() => setLocationSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Horizontal Scrollable Destination Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {[
                { city: 'all', label: 'সকলো স্থান', icon: '📍' },
                { city: 'Kaziranga', label: 'কাজিৰঙা', icon: '🦏' },
                { city: 'Guwahati', label: 'গুৱাহাটী', icon: '⛩️' },
                { city: 'Tezpur', label: 'তেজপুৰ', icon: '🏞️' },
                { city: 'Shillong', label: 'শ্বিলং', icon: '⛰️' },
                { city: 'Majuli', label: 'মাজুলী', icon: '🏝️' },
                { city: 'Jorhat', label: 'যোৰহাট', icon: '🍃' },
                { city: 'Dibrugarh', label: 'ডিব্ৰুগড়', icon: '🌊' },
                { city: 'Sivasagar', label: 'শিৱসাগৰ', icon: '🏛️' },
                { city: 'Manas', label: 'মানাহ', icon: '🌿' }
              ].map((dest) => {
                const count = dest.city === 'all'
                  ? hotels.length
                  : hotels.filter((h) => h.city.toLowerCase() === dest.city.toLowerCase()).length;
                const isSelected = selectedDestination.toLowerCase() === dest.city.toLowerCase();

                return (
                  <button
                    key={dest.city}
                    type="button"
                    onClick={() => {
                      setSelectedDestination(dest.city);
                      if (dest.city !== 'all') {
                        const matched = hotels.find((h) => h.city.toLowerCase() === dest.city.toLowerCase());
                        if (matched) {
                          onSelectHotel(matched.id);
                        }
                      }
                    }}
                    className={`px-2.5 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer shrink-0 flex items-center gap-1 ${
                      isSelected
                        ? 'bg-teal-400 text-slate-950 shadow-md font-black ring-2 ring-white scale-102'
                        : 'bg-white/10 text-slate-200 hover:bg-white/20 hover:text-white border border-white/10'
                    }`}
                  >
                    <span>{dest.icon}</span>
                    <span>{dest.label}</span>
                    <span className={`text-[10px] px-1 rounded-full ${isSelected ? 'bg-slate-950/20 text-slate-950 font-black' : 'bg-black/30 text-slate-300'}`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="grid grid-cols-3 gap-1 mt-3 bg-slate-900/40 p-1 rounded-xl border border-white/10 text-xs font-bold text-center">
            <button
              onClick={() => setActivePortalTab('browse')}
              className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                activePortalTab === 'browse'
                  ? 'bg-teal-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              কোঠা বাছনি (Rooms)
            </button>

            <button
              onClick={() => setActivePortalTab('hotels_directory')}
              className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                activePortalTab === 'hotels_directory'
                  ? 'bg-teal-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              হোটেল তালিকা ({filteredHotels.length})
            </button>

            <button
              onClick={() => setActivePortalTab('my_booking')}
              className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                activePortalTab === 'my_booking'
                  ? 'bg-teal-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              মোৰ বুকিং চাওক
            </button>
          </div>
        </div>

        {/* TAB 1: BROWSE CURRENT HOTEL & ROOMS */}
        {activePortalTab === 'browse' && (
          <div className="p-3.5 sm:p-4 space-y-4">
            
            {/* ACTIVE HOTEL DETAILED LOCATION & MAP CARD */}
            <div className="bg-gradient-to-r from-teal-50 via-white to-slate-50 p-3 rounded-2xl border border-teal-200/90 shadow-2xs space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-0.5">
                  <div className="text-xs font-black text-slate-900 flex items-center gap-1.5 flex-wrap">
                    <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                    <span>{activeHotel.city}, {activeHotel.state}</span>
                    {activeHotel.area && (
                      <span className="text-teal-700 font-bold">• {activeHotel.area}</span>
                    )}
                  </div>
                  {activeHotel.landmark && (
                    <div className="text-[11px] text-slate-700 flex items-center gap-1 font-semibold">
                      <span>🏛️ বিশিষ্ট লেণ্ডমাৰ্ক:</span>
                      <span className="text-slate-900 font-bold">{activeHotel.landmark}</span>
                    </div>
                  )}
                  <div className="text-[10px] text-slate-500 truncate max-w-sm">
                    {activeHotel.address}
                  </div>
                </div>

                <span className="text-[10px] font-black uppercase tracking-wider bg-teal-100 text-teal-800 px-2 py-0.5 rounded-md shrink-0">
                  সত্যাপিত অৱস্থান
                </span>
              </div>

              <div className="pt-1.5 border-t border-teal-100 flex items-center justify-between gap-2 flex-wrap">
                <a
                  href={activeHotel.mapLocationUrl || `https://maps.google.com/?q=${encodeURIComponent(`${activeHotel.name} ${activeHotel.area || ''} ${activeHotel.city} ${activeHotel.state}`)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-black text-teal-800 hover:text-teal-950 bg-teal-100/70 hover:bg-teal-200/80 px-2.5 py-1 rounded-xl border border-teal-300 transition-colors cursor-pointer"
                >
                  <Compass className="w-3.5 h-3.5 text-teal-700" />
                  <span>Google Maps ত চাওক</span>
                  <ExternalLink className="w-3 h-3 text-teal-700" />
                </a>

                {sisterHotelsInDestination.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setActivePortalTab('hotels_directory')}
                    className="text-xs font-bold text-teal-700 hover:text-teal-900 underline cursor-pointer"
                  >
                    {activeHotel.city}-ৰ অন্য {sisterHotelsInDestination.length}খন হোটেল চাওক
                  </button>
                )}
              </div>

              {/* Sister Hotels Quick Switcher in Same City */}
              {sisterHotelsInDestination.length > 0 && (
                <div className="pt-1.5 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto text-[11px]">
                  <span className="text-[10px] font-bold text-slate-500 whitespace-nowrap">
                    এই স্থানৰ অন্য হোটেল:
                  </span>
                  {sisterHotelsInDestination.map((sh) => (
                    <button
                      key={sh.id}
                      type="button"
                      onClick={() => onSelectHotel(sh.id)}
                      className="px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-slate-700 hover:border-teal-400 hover:text-teal-700 font-semibold whitespace-nowrap cursor-pointer transition-colors"
                    >
                      {sh.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 4 HIGH-QUALITY PROPERTY IMAGES CAROUSEL / GRID */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold text-slate-900 flex items-center gap-1">
                  <span>হোটেল আৰু কোঠাৰ ফটো (Property Photos)</span>
                  <span className="text-[10px] text-teal-700 bg-teal-50 px-1.5 py-0.2 rounded font-bold">
                    ৪খন ফটো
                  </span>
                </span>
                <span className="text-[11px] text-slate-500">ফটোত টিপি ডাঙৰকৈ চাওক</span>
              </div>

              {/* 4-Image Mosaic Grid */}
              <div className="grid grid-cols-4 gap-1.5 rounded-2xl overflow-hidden border border-slate-200 p-1 bg-slate-50 shadow-xs">
                {activeHotelImages.slice(0, 4).map((img, idx) => (
                  <div
                    key={idx}
                    onClick={() => setLightboxImageIndex(idx)}
                    className="relative aspect-4/3 rounded-xl overflow-hidden cursor-pointer group bg-slate-200"
                  >
                    <img
                      src={img}
                      alt={`${activeHotel.name} ${idx + 1}`}
                      className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-200"
                    />
                    <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-slate-950/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <Maximize2 className="w-3.5 h-3.5 text-white" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Hotel Amenities Badges */}
            {activeHotel.amenities && activeHotel.amenities.length > 0 && (
              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-1.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">
                  সুবিধাসমূহ (Hotel Facilities & Amenities):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {activeHotel.amenities.map((a, i) => (
                    <span
                      key={i}
                      className="text-[10px] font-bold bg-white text-slate-700 px-2 py-0.5 rounded-lg border border-slate-200 flex items-center gap-1"
                    >
                      <Check className="w-2.5 h-2.5 text-teal-600" />
                      <span>{a}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Date Range & Guests Picker Card */}
            <div className="bg-gradient-to-br from-teal-50/70 via-slate-50 to-white rounded-2xl p-3.5 border border-teal-200/80 shadow-xs space-y-2.5">
              <div className="text-xs font-black text-slate-900 flex items-center justify-between">
                <span>তাৰিখ আৰু অতিথি বাছনি (Check-in / Check-out)</span>
                <span className="text-[11px] font-extrabold text-teal-800 bg-teal-100 px-2 py-0.5 rounded-full">
                  {nights} {nights === 1 ? 'ৰাতি (Night)' : 'ৰাতি (Nights)'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                    আগমনৰ তাৰিখ (Check-in)
                  </label>
                  <input
                    type="date"
                    min={today}
                    value={checkInDate}
                    onChange={(e) => setCheckInDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 font-bold rounded-xl border border-slate-300 text-slate-900 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-600 mb-0.5">
                    প্ৰস্থানৰ তাৰিখ (Check-out)
                  </label>
                  <input
                    type="date"
                    min={checkInDate}
                    value={checkOutDate}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 font-bold rounded-xl border border-slate-300 text-slate-900 bg-white"
                  />
                </div>
              </div>

              {/* Availability Filter Chips */}
              <div className="flex items-center justify-between pt-1 border-t border-teal-100">
                <span className="text-[11px] font-bold text-slate-600">
                  উপলব্ধতা ফিল্টাৰ:
                </span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setSelectedFilter('all')}
                    className={`px-2 py-0.5 text-[10px] font-bold rounded-lg ${
                      selectedFilter === 'all'
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    সকলো ({activeHotelRooms.length})
                  </button>
                  <button
                    onClick={() => setSelectedFilter('available')}
                    className={`px-2 py-0.5 text-[10px] font-bold rounded-lg ${
                      selectedFilter === 'available'
                        ? 'bg-emerald-600 text-white'
                        : 'text-emerald-700'
                    }`}
                  >
                    খালী ({availableRoomsCount})
                  </button>
                </div>
              </div>
            </div>

            {/* Live Availability Badge */}
            <div className="flex items-center justify-between p-2.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs">
              <div className="flex items-center gap-1.5 font-bold">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>{availableRoomsCount} টা কোঠা বুকিঙৰ বাবে সাজু</span>
              </div>
              <span className="text-[11px] text-emerald-700 font-semibold">
                {formatDateShort(checkInDate)} – {formatDateShort(checkOutDate)}
              </span>
            </div>

            {/* ROOM CARDS LIST */}
            <div className="space-y-3">
              {displayedRooms.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
                  এই তাৰিখত কোনো কোঠা খালী নাই। অনুগ্ৰহ কৰি অন্য তাৰিখ বাছনি কৰক।
                </div>
              ) : (
                displayedRooms.map((room) => {
                  const totalPrice = room.basePrice * nights;
                  const split = calculatePlatformCommission(totalPrice, 'online');

                  return (
                    <div
                      key={room.id}
                      className={`bg-white rounded-2xl p-3.5 border-2 transition-all shadow-xs space-y-2.5 ${
                        room.isAvailable
                          ? 'border-emerald-300 hover:border-emerald-500'
                          : 'border-slate-200 bg-slate-50/70 opacity-75'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-1.5">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-base font-black text-slate-900">
                              Room {room.roomNumber}
                            </span>
                            <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-700">
                              Floor {room.floor}
                            </span>
                          </div>
                          <p className="text-xs font-bold text-teal-800">
                            {room.name || room.type} • {room.type}
                          </p>
                        </div>

                        {room.isAvailable ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500 text-white shrink-0">
                            <CheckCircle2 className="w-3 h-3" />
                            খালী (Available)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 shrink-0">
                            <XCircle className="w-3 h-3 text-rose-600" />
                            বুক হৈছে
                          </span>
                        )}
                      </div>

                      {/* Amenities pills */}
                      <div className="flex flex-wrap gap-1">
                        {room.amenities.map((amenity, idx) => (
                          <span
                            key={idx}
                            className="text-[9px] font-semibold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-md"
                          >
                            {amenity}
                          </span>
                        ))}
                        <span className="text-[9px] font-semibold bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-md">
                          Max {room.capacity} Guests
                        </span>
                      </div>

                      {/* Transparent Platform Fee & Payout Preview */}
                      <div className="bg-slate-50 p-2 rounded-xl text-[10px] text-slate-600 flex items-center justify-between border border-slate-100">
                        <span>স্বচ্ছ বিল বিভাজন:</span>
                        <div className="space-x-2">
                          <span className="text-teal-800 font-bold">৫% প্লেটফৰ্ম মাচুল: ₹{split.platformCommission}</span>
                          <span className="text-slate-900 font-extrabold">১০০% হোটেল প্ৰাপ্য: ₹{split.hotelPayoutAmount}</span>
                        </div>
                      </div>

                      {/* Pricing & Direct Booking CTA */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                        <div>
                          <div className="text-base font-black text-slate-900">
                            ₹{room.basePrice.toLocaleString('en-IN')}
                            <span className="text-[10px] font-normal text-slate-500"> / ৰাতি</span>
                          </div>
                          {nights > 1 && (
                            <div className="text-[10px] text-teal-700 font-bold">
                              মুঠ: ₹{totalPrice.toLocaleString('en-IN')} ({nights} ৰাতি)
                            </div>
                          )}
                        </div>

                        {room.isAvailable ? (
                          <button
                            type="button"
                            onClick={() => setSelectedRoomForBooking(room)}
                            className="flex items-center gap-1.5 py-2 px-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-slate-950 font-black text-xs shadow-md shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer"
                          >
                            <CreditCard className="w-3.5 h-3.5 text-slate-950" />
                            <span>অনলাইন বুক কৰক (Book Now)</span>
                          </button>
                        ) : (
                          <button
                            disabled
                            className="py-1.5 px-3 rounded-xl bg-slate-100 text-slate-400 font-bold text-xs cursor-not-allowed"
                          >
                            বুক হৈছে
                          </button>
                        )}
                      </div>

                    </div>
                  );
                })
              )}
            </div>

            {/* Direct Call / Contact Bar */}
            <div className="bg-slate-900 text-white rounded-2xl p-3.5 space-y-2 text-xs">
              <div className="font-bold flex items-center justify-between">
                <span>হোটেল কৰ্তৃপক্ষৰ সৈতে পোনপটীয়া যোগাযোগ:</span>
                <span className="text-teal-400">{activeHotel.ownerName}</span>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={`tel:${activeHotel.phone}`}
                  className="flex-1 py-2 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-center font-bold flex items-center justify-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5 text-teal-400" />
                  <span>ফোন কৰক ({activeHotel.phone})</span>
                </a>
                <a
                  href={`https://wa.me/${activeHotel.whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(`নমস্কাৰ, মই ${activeHotel.name}-ত কোঠা বুকিঙৰ বিষয়ে জানিবলৈ যোগাযোগ কৰিছোঁ।`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2 px-3 rounded-xl bg-[#25D366] text-white font-bold flex items-center justify-center gap-1"
                >
                  <MessageCircle className="w-4 h-4" />
                </a>
              </div>
            </div>

          </div>
        )}

        {/* TAB 2: MULTI-VENDOR HOTELS DIRECTORY */}
        {activePortalTab === 'hotels_directory' && (
          <div className="p-3.5 sm:p-4 space-y-4">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div>
                <h2 className="text-base font-black text-slate-900 flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-teal-600" />
                  <span>পঞ্জীকৃত হোটেল আৰু হোমষ্টে’ (Verified Hotels Directory)</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  লোকেশ্যান, লেণ্ডমাৰ্ক আৰু সঠিক ঠিকনা অনুসৰি বাছনি কৰক
                </p>
              </div>

              <span className="text-xs font-black bg-teal-50 text-teal-900 border border-teal-200 px-2.5 py-1 rounded-xl">
                {filteredHotels.length} খন হোটেল উপলব্ধ
              </span>
            </div>

            {/* Active Search & Location Filter Notification */}
            {(selectedDestination !== 'all' || locationSearchQuery.trim()) && (
              <div className="p-2.5 rounded-xl bg-teal-500/10 border border-teal-300 text-teal-900 text-xs flex items-center justify-between">
                <div className="flex items-center gap-1.5 font-bold">
                  <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  <span>
                    ফিল্টাৰ: {selectedDestination !== 'all' ? selectedDestination : ''} {locationSearchQuery ? `"${locationSearchQuery}"` : ''}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedDestination('all');
                    setLocationSearchQuery('');
                  }}
                  className="text-[11px] font-extrabold text-teal-700 hover:text-teal-950 underline cursor-pointer"
                >
                  সকলো চাওক
                </button>
              </div>
            )}

            {/* If no hotels match search */}
            {filteredHotels.length === 0 && (
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2">
                <MapPin className="w-8 h-8 text-slate-400 mx-auto" />
                <h3 className="text-sm font-bold text-slate-800">
                  এই লোকেশ্যনত কোনো হোটেল পোৱা নগ'ল
                </h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">
                  অনুগ্ৰহ কৰি অন্য চহৰ বা লেণ্ডমাৰ্ক (কাজিৰঙা, গুৱাহাটী, তেজপুৰ, শ্বিলং আদি) বিচাৰি চাওক।
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedDestination('all');
                    setLocationSearchQuery('');
                  }}
                  className="mt-2 px-3 py-1.5 rounded-xl bg-teal-600 text-white font-bold text-xs cursor-pointer"
                >
                  সকলো হোটেল চাওক
                </button>
              </div>
            )}

            {/* Hotel Cards List with Full Location Details */}
            <div className="space-y-3.5">
              {filteredHotels.map((h) => {
                const isCurrent = h.id === activeHotel.id;
                const hImages = (h.images && h.images.length > 0) ? h.images : SAMPLE_HOTEL_IMAGES;
                const startingPrice = getHotelStartingPrice(h.id);
                const totalHotelRooms = getHotelRoomsCount(h.id);
                const mapLink = h.mapLocationUrl || `https://maps.google.com/?q=${encodeURIComponent(`${h.name} ${h.area || ''} ${h.city} ${h.state}`)}`;

                return (
                  <div
                    key={h.id}
                    className={`bg-white rounded-2xl p-3.5 border-2 transition-all space-y-3 shadow-xs ${
                      isCurrent
                        ? 'border-teal-500 shadow-md ring-2 ring-teal-500/10'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {/* Hotel Image Banner */}
                    <div className="relative aspect-16/9 rounded-xl overflow-hidden bg-slate-100">
                      <img
                        src={hImages[0]}
                        alt={h.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 left-2 bg-slate-950/80 backdrop-blur-xs text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                        <MapPin className="w-3 h-3 text-teal-400" />
                        <span>{h.city}, {h.state}</span>
                      </div>
                      <div className="absolute bottom-2 right-2 bg-emerald-500 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full shadow-xs flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-slate-950" />
                        <span>KYC Verified Stay</span>
                      </div>
                    </div>

                    {/* Hotel Info & Structured Location */}
                    <div className="space-y-1">
                      <div className="flex items-start justify-between gap-1.5">
                        <h3 className="text-sm font-extrabold text-slate-900 leading-snug">
                          {h.name}
                        </h3>
                        {isCurrent && (
                          <span className="text-[10px] font-black uppercase bg-teal-100 text-teal-800 px-2 py-0.5 rounded-md shrink-0">
                            বৰ্তমান নিৰ্বাচিত
                          </span>
                        )}
                      </div>

                      {/* Explicit Locality & Landmark */}
                      <div className="flex flex-col gap-0.5 text-xs text-slate-600 pt-0.5">
                        <div className="flex items-center gap-1 font-semibold text-teal-800">
                          <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                          <span>{h.city}, {h.state}</span>
                          {h.area && <span>• {h.area}</span>}
                        </div>
                        {h.landmark && (
                          <div className="text-[11px] text-slate-700 flex items-center gap-1 font-medium">
                            <span>🏛️ লেণ্ডমাৰ্ক:</span>
                            <span className="font-bold text-slate-900">{h.landmark}</span>
                          </div>
                        )}
                        <div className="text-[10px] text-slate-500 truncate">
                          {h.address}
                        </div>
                      </div>

                      <p className="text-xs text-slate-500 line-clamp-1 pt-0.5">
                        {h.description || h.tagline}
                      </p>
                    </div>

                    {/* Amenities Snippet */}
                    {h.amenities && h.amenities.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {h.amenities.slice(0, 3).map((a, idx) => (
                          <span
                            key={idx}
                            className="text-[9px] font-semibold bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded-md"
                          >
                            {a}
                          </span>
                        ))}
                        {h.amenities.length > 3 && (
                          <span className="text-[9px] text-slate-400">+{h.amenities.length - 3} more</span>
                        )}
                      </div>
                    )}

                    {/* Pricing, Room Count & Direct Action Buttons */}
                    <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2 flex-wrap">
                      <div>
                        <div className="text-xs font-black text-slate-900">
                          ₹{startingPrice.toLocaleString()}{' '}
                          <span className="text-[10px] font-normal text-slate-500">/ নিশাৰ পৰা</span>
                        </div>
                        <div className="text-[10px] text-teal-700 font-semibold">
                          {totalHotelRooms} টা কোঠা উপলব্ধ
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <a
                          href={mapLink}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-xl border border-slate-300 hover:border-teal-400 text-slate-700 hover:text-teal-700 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                          title="Google Maps ত চাওক"
                        >
                          <Compass className="w-3.5 h-3.5 text-teal-600" />
                          <span className="hidden sm:inline">মেপ</span>
                          <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
                        </a>

                        <button
                          onClick={() => {
                            onSelectHotel(h.id);
                            setActivePortalTab('browse');
                          }}
                          className="py-1.5 px-3 rounded-xl bg-[#0B2545] hover:bg-[#123661] text-white font-extrabold text-xs flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                        >
                          <span>কোঠা চাওক & বুক কৰক</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 3: GUEST BOOKING LOOKUP */}
        {activePortalTab === 'my_booking' && (
          <div className="p-3.5 sm:p-4 space-y-4">
            <div>
              <h2 className="text-base font-black text-slate-900">
                মোৰ বুকিং চাওক (Find My Reservation)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                বুকিং কৰোঁতে দিয়া মোবাইল নম্বৰটো দি পোনপটীয়াকৈ ষ্টেটাছ আৰু পাছ চাওক
              </p>
            </div>

            <form onSubmit={handleLookupBooking} className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                মোবাইল নম্বৰ (10-Digit Mobile Number)
              </label>
              <div className="flex gap-2">
                <input
                  type="tel"
                  required
                  placeholder="e.g. 9820112233"
                  value={lookupPhone}
                  onChange={(e) => setLookupPhone(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs sm:text-sm font-mono font-bold rounded-xl border border-slate-300 text-slate-900 bg-white"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-black text-xs cursor-pointer shadow-xs"
                >
                  বিচাৰক (Search)
                </button>
              </div>
            </form>

            {searchedBooking === 'not_found' && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs text-center space-y-1">
                <div className="font-bold">এই নম্বৰত কোনো সক্ৰিয় বুকিং পোৱা নগ'ল।</div>
                <div className="text-[11px] text-amber-700">অনুগ্ৰহ কৰি সঠিক নম্বৰ দি পুনৰ চেষ্টা কৰক বা হোটেলত পোনপটীয়াকৈ যোগাযোগ কৰক।</div>
              </div>
            )}

            {searchedBooking && searchedBooking !== 'not_found' && (
              <div className="bg-white rounded-2xl p-4 border-2 border-emerald-400 shadow-md space-y-3 animate-in fade-in duration-200">
                <div className="flex items-center justify-between pb-2 border-b">
                  <div>
                    <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      সক্ৰিয় বুকিং (Confirmed)
                    </span>
                    <h3 className="text-base font-black text-slate-900 mt-1">
                      {searchedBooking.guestName}
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-500 block">কোঠা নম্বৰ</span>
                    <span className="text-base font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded-lg border">
                      Room {searchedBooking.roomNumber}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-2.5 rounded-xl border">
                  <div>
                    <span className="text-slate-500 block text-[10px]">আগমন (Check-in):</span>
                    <span className="font-bold text-slate-900">{formatDateShort(searchedBooking.checkInDate)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">প্ৰস্থান (Check-out):</span>
                    <span className="font-bold text-slate-900">{formatDateShort(searchedBooking.checkOutDate)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">মুঠ ধন:</span>
                    <span className="font-bold text-slate-900">₹{searchedBooking.totalAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">পৰিশোধ স্থিতি:</span>
                    <span className="font-bold text-emerald-700 capitalize">{searchedBooking.paymentStatus}</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-teal-50 text-teal-900 text-xs flex items-center justify-between">
                  <span>হোটেলৰ ঠিকনা: {activeHotel.address}</span>
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* LIGHTBOX MODAL: FULLSCREEN PHOTO VIEWER */}
      {lightboxImageIndex !== null && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex flex-col items-center justify-center p-3 animate-in fade-in duration-150">
          <div className="relative w-full max-w-2xl bg-black rounded-3xl overflow-hidden shadow-2xl flex flex-col">
            <div className="p-3 bg-slate-900 text-white flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">
                {activeHotel.name} • ফটো {lightboxImageIndex + 1} / {activeHotelImages.length}
              </span>
              <button
                onClick={() => setLightboxImageIndex(null)}
                className="p-1 rounded-full bg-white/20 hover:bg-white/30 text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative aspect-4/3 w-full bg-slate-900 flex items-center justify-center">
              <img
                src={activeHotelImages[lightboxImageIndex]}
                alt="Enlarged Hotel Photo"
                className="max-h-full max-w-full object-contain"
              />
            </div>

            {/* Thumbnail selector row */}
            <div className="p-2.5 bg-slate-900 flex items-center justify-center gap-2 overflow-x-auto">
              {activeHotelImages.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setLightboxImageIndex(i)}
                  className={`w-12 h-10 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                    i === lightboxImageIndex ? 'border-teal-400 scale-105' : 'border-transparent opacity-60'
                  }`}
                >
                  <img src={img} alt="thumb" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* DIRECT ONLINE BOOKING MODAL WITH TRANSPARENT 5% COMMISSION SPLIT */}
      {selectedRoomForBooking && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-[#0B2545] to-[#133E6D] text-white p-4 sm:p-5 relative">
              <button
                onClick={() => setSelectedRoomForBooking(null)}
                className="absolute right-4 top-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="text-[10px] font-black uppercase tracking-wider bg-teal-400 text-slate-950 px-2 py-0.5 rounded-full inline-block mb-1">
                পোনপটীয়া অনলাইন বুকিং (Direct Booking)
              </div>
              <h3 className="text-lg font-black text-white">
                Room {selectedRoomForBooking.roomNumber} • {selectedRoomForBooking.type}
              </h3>
              <p className="text-xs text-slate-300">
                {activeHotel.name} • {formatDateShort(checkInDate)} ➔ {formatDateShort(checkOutDate)} ({nights} ৰাতি)
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleConfirmDirectBooking} className="p-4 sm:p-5 overflow-y-auto space-y-3.5 text-xs text-slate-800">
              
              {/* Transparent Tariff & 5% Platform Fee Breakdown Box */}
              {(() => {
                const roomTariff = selectedRoomForBooking.basePrice * nights;
                const split = calculatePlatformCommission(roomTariff, 'online');
                return (
                  <div className="bg-gradient-to-br from-teal-50 to-slate-50 p-3 rounded-2xl border border-teal-200 space-y-1.5">
                    <div className="flex justify-between text-slate-600 font-semibold">
                      <span>কোঠাৰ প্ৰতি নিশাৰ ভাৰা:</span>
                      <span className="font-bold text-slate-900">₹{selectedRoomForBooking.basePrice} × {nights} ৰাতি</span>
                    </div>

                    <div className="flex justify-between text-slate-700 font-bold">
                      <span>মুঠ কোঠাৰ ভাৰা (Room Tariff):</span>
                      <span className="font-extrabold text-slate-900">₹{roomTariff.toLocaleString('en-IN')}</span>
                    </div>

                    {/* 5% Platform Fee & 100% Hotel Split Breakdown */}
                    <div className="pt-2 border-t border-teal-200/80 space-y-1 text-[11px]">
                      <div className="flex justify-between text-emerald-800 font-bold">
                        <span>• হোটেল মালিকৰ প্ৰাপ্য (100% Room Tariff to Hotel):</span>
                        <span className="font-mono font-bold text-slate-900">₹{split.hotelPayoutAmount.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="flex justify-between text-teal-800 font-bold">
                        <span>• অৰ্ডাৰফিক্স ৫% প্লেটফৰ্ম সেৱা মাচুল (5% Platform Fee on Tariff):</span>
                        <span className="font-mono font-bold text-teal-700">+₹{split.platformCommission.toLocaleString('en-IN')}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-teal-200/80 flex items-center justify-between text-sm font-black text-slate-950">
                      <span>মুঠ পৰিশোধ কৰিবলগীয়া (Total Payable by Guest):</span>
                      <span className="text-lg text-emerald-700">₹{split.totalWithCommission.toLocaleString('en-IN')}</span>
                    </div>

                    <div className="text-[10px] text-teal-800 bg-teal-100/60 p-2 rounded-lg leading-tight font-medium">
                      ✓ হোটেলৰ সম্পূৰ্ণ ১০০% ৰূম টেৰিফ (₹{split.hotelPayoutAmount.toLocaleString('en-IN')}) হোটেল মালিকে পাব আৰু টেৰিফৰ ওপৰত ৫% কমিছন (₹{split.platformCommission.toLocaleString('en-IN')}) প্লেটফৰ্ম মালিকে পাব।
                    </div>
                  </div>
                );
              })()}

              {/* Guest Inputs */}
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  অতিথিৰ সম্পূৰ্ণ নাম (Guest Full Name) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bhaskar Jyoti Baruah"
                  value={bookingGuestName}
                  onChange={(e) => setBookingGuestName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-xs bg-white text-slate-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    মোবাইল নম্বৰ (Mobile Number) *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="10-digit Phone"
                    value={bookingGuestPhone}
                    onChange={(e) => setBookingGuestPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold text-xs bg-white text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    ইমেইল (Email ID)
                  </label>
                  <input
                    type="email"
                    placeholder="email@example.com"
                    value={bookingGuestEmail}
                    onChange={(e) => setBookingGuestEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  বিশেষ অনুৰোধ / আগমন সময় (Special Requests)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Late check-in at 7 PM, extra mattress"
                  value={bookingNotes}
                  onChange={(e) => setBookingNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white text-slate-900"
                />
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[10px] text-slate-500 space-y-0.5">
                <p>• চেক-ইনৰ সময়ত চৰকাৰী আধাৰ বা ভোটাৰ কাৰ্ড দাখিল কৰিব লাগিব (Assam Police C-Form নিয়ম)।</p>
                <p>• কোঠাৰ ১০০% সম্পূৰ্ণ ভাৰা হোটেল মালিকৰ একাউণ্টলৈ যাব আৰু ৰূম টেৰিফৰ ওপৰত ৫% প্লেটফৰ্ম মাচুল সংগ্ৰহ কৰা হয়।</p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedRoomForBooking(null)}
                  className="px-3 py-2 rounded-xl text-slate-600 font-bold"
                >
                  বাতিল (Cancel)
                </button>

                <button
                  type="submit"
                  disabled={isSubmittingBooking}
                  className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-slate-950 font-black text-xs shadow-md shadow-emerald-500/20 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  {isSubmittingBooking ? (
                    <span>বুকিং প্ৰচেছিং হৈ আছে...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-slate-950" />
                      <span>বুকিং নিশ্চিত কৰক (Confirm Booking)</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* BOOKING SUCCESS NOTIFICATION POPUP */}
      {bookedConfirmation && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 animate-in zoom-in-95 duration-200">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 text-center space-y-4 shadow-2xl border border-slate-200">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h3 className="text-xl font-black text-slate-900">
                বুকিং সফল হ'ল! 🎉
              </h3>
              <p className="text-xs text-slate-600 mt-1">
                আপোনাৰ বাবে <span className="font-bold text-slate-900">Room {bookedConfirmation.roomNumber}</span> সংৰক্ষণ কৰা হৈছে।
              </p>
            </div>

            <div className="bg-slate-50 p-3 rounded-2xl border text-xs text-left space-y-1 font-mono">
              <div className="flex justify-between text-slate-500">
                <span>বুকিং নম্বৰ:</span>
                <span className="font-bold text-slate-900">{bookedConfirmation.portalBookingId}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>অতিথি:</span>
                <span className="font-bold text-slate-900">{bookedConfirmation.guestName}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>মুঠ পৰিশোধ:</span>
                <span className="font-bold text-emerald-700">₹{bookedConfirmation.totalAmount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button
              onClick={() => setBookedConfirmation(null)}
              className="w-full py-2.5 rounded-xl bg-[#0B2545] text-white font-black text-xs cursor-pointer shadow-md"
            >
              ঠিক আছে (Close)
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
