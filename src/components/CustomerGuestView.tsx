import React, { useState } from 'react';
import { Room, Booking, HotelProfile } from '../types';
import {
  checkBookingConflict,
  calculateNights,
  formatDateFull,
  formatDateShort,
  formatSourceName
} from '../utils/bookingEngine';
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
  Check
} from 'lucide-react';
import { OrderfixLogo } from './Logo';

interface CustomerGuestViewProps {
  hotel: HotelProfile;
  rooms: Room[];
  bookings: Booking[];
  onBackToOwner: () => void;
}

export const CustomerGuestView: React.FC<CustomerGuestViewProps> = ({
  hotel,
  rooms,
  bookings,
  onBackToOwner
}) => {
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = (() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  })();

  // Navigation tab inside Customer Portal
  const [activePortalTab, setActivePortalTab] = useState<'browse' | 'my_booking' | 'about'>('browse');

  // Dates & Guest Filter
  const [checkInDate, setCheckInDate] = useState(today);
  const [checkOutDate, setCheckOutDate] = useState(tomorrow);
  const [guestCount, setGuestCount] = useState(2);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'available'>('all');
  const [copiedLink, setCopiedLink] = useState(false);

  // Guest Booking Lookup State ("মোৰ বুকিং চাওক")
  const [lookupPhone, setLookupPhone] = useState('');
  const [searchedBooking, setSearchedBooking] = useState<Booking | null | 'not_found'>(null);

  const nights = calculateNights(checkInDate, checkOutDate);

  // Check each room availability for the selected dates
  const roomsWithAvailability = rooms.map((room) => {
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
    const portalUrl = window.location.origin + '?view=guest';
    if (navigator.share) {
      navigator
        .share({
          title: `${hotel.name} - Direct Room Booking & Guest Portal`,
          text: `Check real-time room availability & book directly at ${hotel.name} with zero booking fees!`,
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

    const query = lookupPhone.trim().replace(/\D/g, '');
    const found = bookings.find((b) => {
      const cleanBPhone = b.guestPhone.replace(/\D/g, '');
      const matchPhone = cleanBPhone.includes(query) || query.includes(cleanBPhone);
      const matchId = b.id.toLowerCase().includes(lookupPhone.trim().toLowerCase());
      return matchPhone || matchId;
    });

    setSearchedBooking(found || 'not_found');
  };

  const getWhatsAppInquiryUrl = (room?: Room) => {
    const cleanPhone = hotel.whatsappNumber.replace(/\D/g, '');
    const roomText = room ? `Room ${room.roomNumber} (${room.type})` : 'a room';
    const message = `*Room Booking Inquiry - ${hotel.name}* 🌴
Hello! I am inquiring from the *Orderfix Guest Portal*:
• Room: *${roomText}*
• Check-in: *${formatDateFull(checkInDate)}*
• Check-out: *${formatDateFull(checkOutDate)}* (${nights} ${nights === 1 ? 'night' : 'nights'})
• Number of Guests: *${guestCount}*
${room ? `• Quoted Rate: *₹${(room.basePrice * nights).toLocaleString('en-IN')}* total` : ''}

Is this room available? Please confirm booking steps.`;

    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-24 font-sans w-full max-w-full overflow-x-hidden">
      
      {/* Top Mobile Bar for Customer */}
      <header className="sticky top-0 z-30 bg-[#0B2545] text-white shadow-md w-full">
        <div className="max-w-md mx-auto px-3 sm:px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={onBackToOwner}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center gap-1 text-xs font-bold cursor-pointer"
              title="Return to Hotel Owner Dashboard"
            >
              <ArrowLeft className="w-4 h-4 text-[#00E5A3]" />
              <span>মালিক ড্যাশব'ৰ্ড</span>
            </button>
            <div className="border-l border-white/20 pl-2">
              <span className="text-[10px] uppercase font-extrabold text-[#00E5A3] tracking-wider block">
                হোটেলৰ গ্ৰাহক পৰ্টেল
              </span>
              <h1 className="text-xs sm:text-sm font-extrabold truncate max-w-[150px] text-white">
                {hotel.name}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleShare}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              title="গ্ৰাহকৰ সৈতে লিংক শ্বেয়াৰ কৰক (Share with Guest)"
            >
              <Share2 className="w-4 h-4 text-[#00E5A3]" />
            </button>
            <a
              href={`tel:${hotel.phone}`}
              className="p-2 rounded-xl bg-[#00B686] hover:bg-[#00c592] text-white transition-colors flex items-center justify-center cursor-pointer"
              title="হোটেললৈ পোনপটীয়া কল কৰক"
            >
              <Phone className="w-4 h-4" />
            </a>
          </div>
        </div>

        {copiedLink && (
          <div className="bg-emerald-600 text-white text-center py-1.5 text-xs font-bold animate-in fade-in flex items-center justify-center gap-1">
            <Check className="w-3.5 h-3.5" />
            <span>গ্ৰাহক পৰ্টেলৰ লিংক কপি হ'ল! হোৱাটছএপত শ্বেয়াৰ কৰক।</span>
          </div>
        )}

        {/* Customer Portal Sub-Tabs */}
        <div className="bg-[#081C33] border-t border-white/10 px-3 py-1 flex items-center justify-around max-w-md mx-auto text-xs font-bold">
          <button
            onClick={() => setActivePortalTab('browse')}
            className={`py-1.5 px-3 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activePortalTab === 'browse'
                ? 'bg-teal-500 text-slate-950 font-black shadow-xs'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>কোঠা চাওক (Rooms)</span>
          </button>

          <button
            onClick={() => setActivePortalTab('my_booking')}
            className={`py-1.5 px-3 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activePortalTab === 'my_booking'
                ? 'bg-teal-500 text-slate-950 font-black shadow-xs'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Search className="w-3.5 h-3.5" />
            <span>মোৰ বুকিং (My Booking)</span>
          </button>

          <button
            onClick={() => setActivePortalTab('about')}
            className={`py-1.5 px-3 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
              activePortalTab === 'about'
                ? 'bg-teal-500 text-slate-950 font-black shadow-xs'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>হোটেল (About)</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-md mx-auto px-3 sm:px-4 pt-3.5 space-y-3.5">
        
        {/* Hero Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0B2545] via-[#103460] to-[#0A223E] text-white p-4 sm:p-5 shadow-lg">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#00B686]/20 text-[#00E5A3] border border-[#00B686]/30">
                <ShieldCheck className="w-3 h-3" />
                সরাসৰি বুকিং • ০% অতিৰিক্ত মাচুল
              </span>
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                {hotel.name}
              </h2>
              <p className="text-xs text-slate-300 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span>{hotel.city}, {hotel.state}</span>
              </p>
            </div>
            
            <OrderfixLogo size="sm" showText={false} />
          </div>

          <p className="text-xs text-slate-300 mt-2 italic">
            &quot;{hotel.tagline}&quot;
          </p>

          <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-[11px] text-slate-300">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-teal-400" />
              <span>চেক-ইন: {hotel.checkInStandardTime}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-teal-400" />
              <span>চেক-আউট: {hotel.checkOutStandardTime}</span>
            </div>
          </div>
        </div>

        {/* TAB 1: BROWSE ROOMS & REALTIME AVAILABILITY */}
        {activePortalTab === 'browse' && (
          <div className="space-y-3">
            {/* Date & Guest Picker Card */}
            <div className="bg-white rounded-3xl p-3.5 shadow-sm border border-slate-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-teal-600" />
                  তাৰিখ বাছনি কৰক (Stay Dates)
                </h3>
                <span className="text-[11px] font-black text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
                  {nights} {nights === 1 ? 'ৰাতি (Night)' : 'ৰাতি (Nights)'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                    আহিবৰ তাৰিখ (Check-in)
                  </label>
                  <input
                    type="date"
                    min={today}
                    value={checkInDate}
                    onChange={(e) => {
                      setCheckInDate(e.target.value);
                      if (e.target.value >= checkOutDate) {
                        const next = new Date(e.target.value);
                        next.setDate(next.getDate() + 1);
                        setCheckOutDate(next.toISOString().split('T')[0]);
                      }
                    }}
                    className="w-full px-2 py-1.5 text-xs font-bold rounded-xl border border-slate-300 text-slate-900 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                    যাবৰ তাৰিখ (Check-out)
                  </label>
                  <input
                    type="date"
                    min={checkInDate}
                    value={checkOutDate}
                    onChange={(e) => setCheckOutDate(e.target.value)}
                    className="w-full px-2 py-1.5 text-xs font-bold rounded-xl border border-slate-300 text-slate-900 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span className="text-[11px] font-medium text-slate-600">অতিথি:</span>
                  <select
                    value={guestCount}
                    onChange={(e) => setGuestCount(Number(e.target.value))}
                    className="px-2 py-0.5 text-xs font-bold rounded-lg border border-slate-200 text-slate-800 bg-slate-50"
                  >
                    {[1, 2, 3, 4, 5, 6].map((num) => (
                      <option key={num} value={num}>
                        {num} Guest{num > 1 ? 's' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-[10px] font-bold">
                  <button
                    type="button"
                    onClick={() => setSelectedFilter('all')}
                    className={`px-2 py-1 rounded-md transition-all ${
                      selectedFilter === 'all'
                        ? 'bg-white text-slate-900 shadow-xs'
                        : 'text-slate-600'
                    }`}
                  >
                    All ({rooms.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedFilter('available')}
                    className={`px-2 py-1 rounded-md transition-all ${
                      selectedFilter === 'available'
                        ? 'bg-emerald-600 text-white shadow-xs'
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
                <span>{availableRoomsCount} টা কোঠা বুকিঙৰ বাবে উপলব্ধ</span>
              </div>
              <span className="text-[11px] text-emerald-700">
                {formatDateShort(checkInDate)} – {formatDateShort(checkOutDate)}
              </span>
            </div>

            {/* Room Cards List */}
            <div className="space-y-2.5">
              {displayedRooms.map((room) => {
                const totalPrice = room.basePrice * nights;
                const waUrl = getWhatsAppInquiryUrl(room);

                return (
                  <div
                    key={room.id}
                    className={`bg-white rounded-2xl p-3.5 border-2 transition-all shadow-xs ${
                      room.isAvailable
                        ? 'border-emerald-300 hover:border-emerald-500'
                        : 'border-slate-200 bg-slate-50/70 opacity-80'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-1.5">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-base sm:text-lg font-black text-slate-900">
                            Room {room.roomNumber}
                          </span>
                          <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-700">
                            Floor {room.floor}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-slate-600">
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
                          বুক হৈছে (Booked)
                        </span>
                      )}
                    </div>

                    {/* Amenities pills */}
                    <div className="flex flex-wrap gap-1 mt-2">
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

                    {/* Pricing and Action */}
                    <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <div className="text-sm sm:text-base font-black text-slate-900">
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
                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 py-2 px-3 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>হোৱাটছএপত বুক কৰক</span>
                        </a>
                      ) : (
                        <div className="text-right">
                          <span className="text-[11px] font-bold text-rose-600 block">
                            ইতিমধ্যে বুক কৰা হৈছে
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: GUEST BOOKING LOOKUP ("মোৰ বুকিং চাওক / CHECK MY RESERVATION") */}
        {activePortalTab === 'my_booking' && (
          <div className="space-y-3 bg-white rounded-3xl p-4 sm:p-5 shadow-sm border border-slate-200">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-teal-600" />
                <span>আপোনাৰ বুকিং বিচাৰক (Check My Reservation)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                আপোনাৰ পঞ্জীভুক্ত ফোন নম্বৰ বা ৰিজাৰ্ভেচন নম্বৰ লিখক
              </p>
            </div>

            <form onSubmit={handleLookupBooking} className="flex gap-2">
              <input
                type="text"
                required
                placeholder="১০টা অংকৰ মোবাইল নম্বৰ লিখক"
                value={lookupPhone}
                onChange={(e) => setLookupPhone(e.target.value)}
                className="flex-1 px-3 py-2 text-xs font-bold rounded-xl border border-slate-300 text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-[#0B2545] hover:bg-[#133560] text-white font-bold text-xs flex items-center gap-1 cursor-pointer"
              >
                <Search className="w-3.5 h-3.5 text-[#00E5A3]" />
                <span>সন্ধান কৰক</span>
              </button>
            </form>

            {/* Search Result */}
            {searchedBooking === 'not_found' && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-center space-y-1 text-xs text-rose-900">
                <XCircle className="w-6 h-6 text-rose-500 mx-auto" />
                <div className="font-bold">কোনো বুকিং পোৱা নগ'ল!</div>
                <div className="text-[11px] text-rose-700">
                  দয়া কৰি সঠিক নম্বৰ লিখক অথবা হোটেলৰ ৰিচেপশ্বনত যোগাযোগ কৰক।
                </div>
              </div>
            )}

            {searchedBooking && searchedBooking !== 'not_found' && (
              <div className="p-4 bg-emerald-50 border-2 border-emerald-400 rounded-2xl space-y-3 animate-in fade-in">
                <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                      নিশ্চিত বুকিং (Confirmed)
                    </span>
                    <h4 className="text-base font-black text-emerald-950 mt-1">
                      Room {searchedBooking.roomNumber} • {searchedBooking.guestName}
                    </h4>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-900">
                    #{searchedBooking.id.slice(-6).toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-emerald-800 block">চেক-ইন তাৰিখ</span>
                    <span className="font-extrabold text-slate-900">
                      {formatDateShort(searchedBooking.checkInDate)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-emerald-800 block">চেক-আউট তাৰিখ</span>
                    <span className="font-extrabold text-slate-900">
                      {formatDateShort(searchedBooking.checkOutDate)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-emerald-800 block">মুঠ ভাৰা</span>
                    <span className="font-extrabold text-slate-900">
                      ₹{searchedBooking.totalAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-emerald-800 block">প্ৰদান অৱস্থা</span>
                    <span className="font-extrabold text-emerald-900">
                      {searchedBooking.paymentStatus === 'paid'
                        ? 'সম্পূৰ্ণ পৰিশোধিত'
                        : `অগ্ৰিম ₹${searchedBooking.advancePaid}`}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-emerald-200 flex items-center justify-between text-xs">
                  <a
                    href={`https://wa.me/${hotel.whatsappNumber.replace(/\D/g, '')}?text=Hello%20${hotel.name},%20inquiring%20about%20my%20booking%20%23${searchedBooking.id.slice(-6)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 font-bold text-emerald-800 hover:text-emerald-950"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>মালিকৰ সৈতে কথা পাতক</span>
                  </a>
                  <a
                    href={`tel:${hotel.phone}`}
                    className="flex items-center gap-1 font-bold text-slate-800 hover:text-slate-950"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>কল কৰক</span>
                  </a>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: ABOUT PROPERTY, POLICIES & LOCATION */}
        {activePortalTab === 'about' && (
          <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-200 space-y-3">
            <h3 className="text-sm font-extrabold text-slate-900">
              {hotel.name} ৰ বিষয়ে
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              {hotel.address}, {hotel.city}, {hotel.state} - {hotel.pincode}
            </p>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t text-xs">
              <div className="p-2.5 bg-slate-50 rounded-xl">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">
                  ফোন নম্বৰ
                </span>
                <span className="font-bold text-slate-800 block mt-0.5">
                  {hotel.phone}
                </span>
              </div>
              <div className="p-2.5 bg-slate-50 rounded-xl">
                <span className="text-[10px] text-slate-500 font-bold uppercase block">
                  হোৱাটছএপ নম্বৰ
                </span>
                <span className="font-bold text-emerald-700 block mt-0.5">
                  {hotel.whatsappNumber}
                </span>
              </div>
            </div>

            <div className="pt-2 text-xs text-slate-700 space-y-1.5 border-t">
              <div className="font-bold text-slate-900">হোটেলৰ নিয়মসমূহ:</div>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                <span>চেক-ইনৰ সময়ত চৰকাৰী পৰিচয় পত্ৰ (Aadhaar / Voter ID) দেখুৱাব লাগিব।</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                <span>চেক-ইন সময়: {hotel.checkInStandardTime} • চেক-আউট: {hotel.checkOutStandardTime}</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                <span>সরাসৰি বুকিং কৰিলে কোনো মধ্যভোগী বা এজেণ্ট মাচুল নাথাকে।</span>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Floating Customer Action Bar */}
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/98 backdrop-blur-md border-t border-slate-200 p-2.5 shadow-xl">
          <div className="max-w-md mx-auto grid grid-cols-2 gap-2">
            <a
              href={`tel:${hotel.phone}`}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-900 text-white font-bold text-xs active:scale-95 transition-all cursor-pointer"
            >
              <Phone className="w-4 h-4 text-teal-400" />
              <span>ৰিচেপশ্বনলৈ কল</span>
            </a>

            <a
              href={getWhatsAppInquiryUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs shadow-md shadow-emerald-600/30 active:scale-95 transition-all cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>হোৱাটছএপত কথা পাতক</span>
            </a>
          </div>
        </div>

      </main>
    </div>
  );
};
