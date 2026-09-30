import React, { useState, useEffect } from 'react';
import {
  Room,
  Booking,
  ChannelType,
  OfflineSource,
  OnlineSource,
  PaymentStatus,
  PaymentMethod
} from '../types';
import {
  checkBookingConflict,
  calculateNights,
  formatDateShort,
  formatSourceName
} from '../utils/bookingEngine';
import {
  X,
  ShieldCheck,
  ShieldAlert,
  Calendar,
  Phone,
  User,
  DollarSign,
  Globe2,
  PhoneCall,
  CheckCircle2,
  Sparkles,
  MessageCircle,
  AlertTriangle
} from 'lucide-react';

interface AddBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  rooms: Room[];
  bookings: Booking[];
  preselectedRoom?: Room | null;
  defaultDate?: string;
  onSaveBooking: (newBooking: Booking, sendWhatsAppNow: boolean) => void;
}

export const AddBookingModal: React.FC<AddBookingModalProps> = ({
  isOpen,
  onClose,
  rooms,
  bookings,
  preselectedRoom,
  defaultDate,
  onSaveBooking
}) => {
  const today = defaultDate || new Date().toISOString().split('T')[0];
  const tomorrow = (() => {
    const d = new Date(today);
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  })();

  // Form State
  const [channel, setChannel] = useState<ChannelType>('offline');
  const [offlineSource, setOfflineSource] = useState<OfflineSource>('walk_in');
  const [onlineSource, setOnlineSource] = useState<OnlineSource>('booking_com');
  const [portalBookingId, setPortalBookingId] = useState('');
  
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestCount, setGuestCount] = useState(2);

  const [checkInDate, setCheckInDate] = useState(today);
  const [checkOutDate, setCheckOutDate] = useState(tomorrow);
  const [selectedRoomId, setSelectedRoomId] = useState(preselectedRoom ? preselectedRoom.id : rooms[0]?.id || '');

  const [totalAmount, setTotalAmount] = useState<number>(0);
  const [advancePaid, setAdvancePaid] = useState<number>(0);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('partial');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [notes, setNotes] = useState('');
  const [sendWhatsApp, setSendWhatsApp] = useState(true);

  // Sync preselected room if provided
  useEffect(() => {
    if (preselectedRoom) {
      setSelectedRoomId(preselectedRoom.id);
    } else if (rooms.length > 0 && !selectedRoomId) {
      setSelectedRoomId(rooms[0].id);
    }
  }, [preselectedRoom, rooms]);

  // Recalculate default total amount whenever room or dates change
  useEffect(() => {
    const selectedRoom = rooms.find((r) => r.id === selectedRoomId);
    if (selectedRoom && checkInDate && checkOutDate) {
      const nights = calculateNights(checkInDate, checkOutDate);
      const calculated = selectedRoom.basePrice * nights;
      setTotalAmount(calculated);
      if (channel === 'online') {
        setAdvancePaid(calculated);
        setPaymentStatus('paid');
        setPaymentMethod('online_portal');
      }
    }
  }, [selectedRoomId, checkInDate, checkOutDate, rooms, channel]);

  if (!isOpen) return null;

  const currentRoom = rooms.find((r) => r.id === selectedRoomId);
  const nights = calculateNights(checkInDate, checkOutDate);

  // Instant Conflict Prevention Engine Check
  const conflictResult = selectedRoomId
    ? checkBookingConflict(selectedRoomId, checkInDate, checkOutDate, bookings)
    : { hasConflict: false };

  // Find clash-free alternative rooms for quick-click recommendation
  const alternativeRooms = rooms.filter((r) => {
    if (r.id === selectedRoomId || r.isMaintenance) return false;
    const res = checkBookingConflict(r.id, checkInDate, checkOutDate, bookings);
    return !res.hasConflict;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!guestName.trim()) {
      alert('Please enter guest name.');
      return;
    }
    if (!guestPhone.trim() || guestPhone.length < 7) {
      alert('Please enter a valid phone number.');
      return;
    }
    if (conflictResult.hasConflict) {
      alert('Cannot create booking: Date conflict detected for this room.');
      return;
    }

    const newBooking: Booking = {
      id: `bk-${Date.now().toString().slice(-6)}`,
      roomId: selectedRoomId,
      roomNumber: currentRoom?.roomNumber || selectedRoomId,
      guestName: guestName.trim(),
      guestPhone: guestPhone.trim(),
      guestEmail: guestEmail.trim() || undefined,
      channel,
      source: channel === 'offline' ? offlineSource : onlineSource,
      portalBookingId: channel === 'online' ? portalBookingId.trim() : undefined,
      checkInDate,
      checkOutDate,
      checkInTime: '12:00 PM',
      guestCount,
      totalAmount: Number(totalAmount) || 0,
      advancePaid: Number(advancePaid) || 0,
      paymentStatus:
        Number(advancePaid) >= Number(totalAmount)
          ? 'paid'
          : Number(advancePaid) > 0
          ? 'partial'
          : 'pending',
      paymentMethod,
      status: 'confirmed',
      notes: notes.trim() || undefined,
      createdAt: new Date().toISOString()
    };

    onSaveBooking(newBooking, sendWhatsApp);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-5">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[92vh] sm:max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#0B2545] to-[#123661] text-white px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#00B686]/20 border border-[#00B686]/40 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-[#00E5A3]" />
            </div>
            <div>
              <h3 className="text-sm sm:text-lg font-bold">কোঠা বুক কৰক (Add Booking)</h3>
              <p className="text-[11px] text-slate-300 hidden xs:block">
                Instant double-booking prevention shield
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
          
          <div className="flex-1 overflow-y-auto p-3.5 sm:p-6 space-y-3.5 sm:space-y-5">
            {/* Dual Booking Mode Switcher */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
              Select Booking Channel
            </label>
            <div className="grid grid-cols-2 gap-3 p-1.5 bg-slate-100 rounded-2xl border border-slate-200">
              
              {/* Offline Tab */}
              <button
                type="button"
                onClick={() => setChannel('offline')}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                  channel === 'offline'
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <PhoneCall className="w-4 h-4" />
                <span>Offline / Walk-in / Phone</span>
              </button>

              {/* Online Tab */}
              <button
                type="button"
                onClick={() => setChannel('online')}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
                  channel === 'online'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                <Globe2 className="w-4 h-4" />
                <span>Online Travel Portal</span>
              </button>
            </div>
          </div>

          {/* Channel Specific Source Selector */}
          {channel === 'offline' ? (
            <div className="p-3.5 bg-rose-50/60 border border-rose-200 rounded-2xl">
              <label className="block text-xs font-bold text-rose-900 mb-1.5">
                Offline Source
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'walk_in', label: 'Walk-in Guest' },
                  { id: 'phone_call', label: 'Phone Call' },
                  { id: 'whatsapp', label: 'Direct WhatsApp' },
                  { id: 'direct_ref', label: 'Regular / Ref' }
                ].map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setOfflineSource(s.id as OfflineSource)}
                    className={`py-1.5 px-2 text-xs font-semibold rounded-lg border text-center transition-all ${
                      offlineSource === s.id
                        ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-rose-300'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="p-3.5 bg-blue-50/60 border border-blue-200 rounded-2xl space-y-3">
              <div>
                <label className="block text-xs font-bold text-blue-900 mb-1.5">
                  Select Online Portal
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {[
                    { id: 'booking_com', label: 'Booking.com' },
                    { id: 'makemytrip', label: 'MakeMyTrip' },
                    { id: 'airbnb', label: 'Airbnb' },
                    { id: 'agoda', label: 'Agoda' },
                    { id: 'goibibo', label: 'Goibibo' },
                    { id: 'expedia', label: 'Expedia' }
                  ].map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setOnlineSource(p.id as OnlineSource)}
                      className={`py-1.5 px-2 text-xs font-semibold rounded-lg border text-center transition-all ${
                        onlineSource === p.id
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-blue-300'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-blue-950 mb-1">
                  Portal Booking ID / Reference #
                </label>
                <input
                  type="text"
                  placeholder="e.g. MMT-981240 or BC-451299"
                  value={portalBookingId}
                  onChange={(e) => setPortalBookingId(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-xl bg-white border border-blue-200 text-slate-900 font-mono focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>
            </div>
          )}

          {/* Dates & Room Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Check-in Date
              </label>
              <input
                type="date"
                required
                value={checkInDate}
                onChange={(e) => setCheckInDate(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 font-medium text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Check-out Date
              </label>
              <input
                type="date"
                required
                value={checkOutDate}
                min={checkInDate}
                onChange={(e) => setCheckOutDate(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 font-medium text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Duration
              </label>
              <div className="px-3 py-2 text-xs sm:text-sm rounded-xl bg-slate-100 border border-slate-200 font-bold text-slate-800 flex items-center justify-between">
                <span>{nights} {nights === 1 ? 'Night' : 'Nights'}</span>
                <span className="text-[11px] font-normal text-slate-500">
                  {formatDateShort(checkInDate)} - {formatDateShort(checkOutDate)}
                </span>
              </div>
            </div>
          </div>

          {/* Room Selector with Realtime Conflict Detection */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700">
                Assign Room
              </label>
              <span className="text-[11px] text-slate-500">
                Checking {rooms.length} rooms for clash
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {rooms.map((room) => {
                const isSelected = selectedRoomId === room.id;
                const conflict = checkBookingConflict(
                  room.id,
                  checkInDate,
                  checkOutDate,
                  bookings
                );

                return (
                  <button
                    key={room.id}
                    type="button"
                    onClick={() => setSelectedRoomId(room.id)}
                    className={`p-2.5 rounded-xl border text-left transition-all relative ${
                      isSelected
                        ? conflict.hasConflict
                          ? 'bg-rose-50 border-rose-500 ring-2 ring-rose-500/20'
                          : 'bg-teal-50 border-teal-600 ring-2 ring-teal-600/20'
                        : conflict.hasConflict
                        ? 'bg-slate-50 border-slate-200 opacity-60 hover:opacity-100'
                        : 'bg-white border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-extrabold text-slate-900">
                        Room {room.roomNumber}
                      </span>
                      {conflict.hasConflict ? (
                        <span className="w-2 h-2 rounded-full bg-rose-500" title="Occupied" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-emerald-500" title="Available" />
                      )}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate mt-0.5">
                      {room.type}
                    </div>
                    <div className="text-[10px] font-bold text-slate-700 mt-1">
                      ₹{room.basePrice}/nt
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* INSTANT CONFLICT WARNING BANNER */}
          {conflictResult.hasConflict && (
            <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-400 text-rose-950 space-y-2 animate-in fade-in duration-200">
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-rose-800">
                    Double-Booking Conflict Prevented!
                  </h4>
                  <p className="text-xs text-rose-900 mt-0.5 font-medium leading-relaxed">
                    {conflictResult.message}
                  </p>
                </div>
              </div>

              {alternativeRooms.length > 0 && (
                <div className="pt-2 border-t border-rose-200">
                  <span className="text-xs font-bold text-rose-900 block mb-1">
                    Available clash-free rooms for these dates:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {alternativeRooms.map((alt) => (
                      <button
                        key={alt.id}
                        type="button"
                        onClick={() => setSelectedRoomId(alt.id)}
                        className="px-2.5 py-1 rounded-lg bg-white border border-rose-300 text-xs font-bold text-slate-800 hover:bg-emerald-50 hover:border-emerald-500 transition-colors cursor-pointer"
                      >
                        Switch to Room {alt.roomNumber} (₹{alt.basePrice})
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Guest Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Guest Full Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kulkarni"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Phone Number (WhatsApp) *
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="tel"
                  inputMode="tel"
                  required
                  placeholder="10-digit mobile number"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 text-slate-900 font-mono focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Guest Count
              </label>
              <input
                type="number"
                inputMode="numeric"
                min={1}
                max={10}
                value={guestCount}
                onChange={(e) => setGuestCount(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Email Address (Optional)
              </label>
              <input
                type="email"
                placeholder="guest@example.com"
                value={guestEmail}
                onChange={(e) => setGuestEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Pricing & Payments */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span>Billing & Payment</span>
              <span className="text-slate-500 font-normal">
                Tariff: ₹{currentRoom?.basePrice || 0} × {nights} {nights === 1 ? 'night' : 'nights'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Total Stay Amount (₹)
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  required
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-xs sm:text-sm font-bold rounded-xl border border-slate-300 text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Advance Paid (₹)
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  value={advancePaid}
                  onChange={(e) => setAdvancePaid(Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-xs sm:text-sm font-bold rounded-xl border border-slate-300 text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Payment Mode
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full px-3 py-1.5 text-xs sm:text-sm rounded-xl border border-slate-300 text-slate-900 font-medium focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
                >
                  <option value="cash">Cash at Desk</option>
                  <option value="upi">UPI / GPay / PhonePe</option>
                  <option value="card">Credit / Debit Card</option>
                  <option value="online_portal">Online Portal Prepaid</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1 text-slate-600">
              <span>Balance Due at Check-out:</span>
              <span className="font-extrabold text-slate-900">
                ₹{Math.max(0, totalAmount - advancePaid).toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Notes & Special Requests
            </label>
            <input
              type="text"
              placeholder="e.g. Extra mattress requested, Late arrival at 8 PM"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 text-slate-900 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
            />
          </div>

          {/* WhatsApp toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/60 border border-emerald-200">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <div className="text-xs font-bold text-emerald-950">
                  Send WhatsApp Confirmation
                </div>
                <div className="text-[11px] text-emerald-700">
                  Instantly open WhatsApp with a clean, branded booking confirmation slip.
                </div>
              </div>
            </div>
            <input
              type="checkbox"
              checked={sendWhatsApp}
              onChange={(e) => setSendWhatsApp(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded-sm focus:ring-emerald-500 cursor-pointer"
            />
          </div>

          </div>

          {/* Sticky Bottom Action Buttons - Always Visible on Mobile */}
          <div className="p-3 sm:p-4 bg-white border-t border-slate-200 shrink-0 flex items-center justify-between gap-2 z-20 shadow-md">
            <button
              type="button"
              onClick={onClose}
              className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={conflictResult.hasConflict}
              className={`flex items-center gap-1.5 px-4 sm:px-5 py-2.5 rounded-xl font-extrabold text-xs sm:text-sm text-white transition-all shadow-md cursor-pointer ${
                conflictResult.hasConflict
                  ? 'bg-slate-400 cursor-not-allowed shadow-none'
                  : 'bg-[#0B2545] hover:bg-[#133560] active:scale-95 shadow-slate-900/20'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-[#00B686]" />
              <span>Confirm & Block Room</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
