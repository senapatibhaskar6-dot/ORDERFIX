import React from 'react';
import { Booking, HotelProfile } from '../types';
import { formatDateFull, formatSourceName, calculateNights } from '../utils/bookingEngine';
import { X, Printer, CheckCircle2 } from 'lucide-react';
import { OrderfixLogo } from './Logo';

interface PrintSlipModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
  hotel: HotelProfile;
}

export const PrintSlipModal: React.FC<PrintSlipModalProps> = ({
  isOpen,
  onClose,
  booking,
  hotel
}) => {
  if (!isOpen || !booking) return null;

  const nights = calculateNights(booking.checkInDate, booking.checkOutDate);
  const balance = Math.max(0, booking.totalAmount - booking.advancePaid);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Control Bar (Hidden in Print) */}
        <div className="bg-slate-900 text-white px-5 py-3 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Guest Check-in Pass / Receipt
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-600 text-white font-bold text-xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Slip</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Area */}
        <div id="printable-voucher" className="p-6 sm:p-8 bg-white text-slate-900 space-y-6">
          
          {/* Header with Hotel Info & Orderfix Verified Seal */}
          <div className="flex items-start justify-between border-b pb-5">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                {hotel.name}
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                {hotel.address}, {hotel.city}, {hotel.state} - {hotel.pincode}
              </p>
              <p className="text-xs text-slate-600">
                Phone: {hotel.phone} • Email: {hotel.email}
              </p>
            </div>

            <div className="text-right">
              <OrderfixLogo size="sm" showText={false} />
              <div className="text-[10px] uppercase font-bold text-teal-700 tracking-wider mt-1">
                Orderfix Verified
              </div>
              <div className="text-[10px] text-slate-400">
                No Double-Booking
              </div>
            </div>
          </div>

          {/* Reservation ID & Status */}
          <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-slate-500">Reservation Reference:</span>
              <span className="font-mono font-bold text-slate-900 ml-1">
                #{booking.id.toUpperCase()}
              </span>
            </div>
            <div>
              <span className="text-slate-500">Channel:</span>
              <span className="font-bold text-slate-900 ml-1">
                {formatSourceName(booking.source)}
              </span>
            </div>
            <div>
              <span className="text-slate-500">Date Issued:</span>
              <span className="font-medium text-slate-900 ml-1">
                {new Date().toLocaleDateString('en-IN')}
              </span>
            </div>
          </div>

          {/* Guest & Room Details Grid */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-slate-50/60 rounded-xl border border-slate-100">
              <div className="text-slate-500 font-bold uppercase text-[10px] mb-1">
                Guest Information
              </div>
              <div className="text-sm font-bold text-slate-900">
                {booking.guestName}
              </div>
              <div className="text-slate-600 mt-0.5">
                Mobile: {booking.guestPhone}
              </div>
              <div className="text-slate-600">
                Total Guests: {booking.guestCount}
              </div>
            </div>

            <div className="p-3 bg-slate-50/60 rounded-xl border border-slate-100">
              <div className="text-slate-500 font-bold uppercase text-[10px] mb-1">
                Room Assigned
              </div>
              <div className="text-sm font-bold text-slate-900">
                Room {booking.roomNumber}
              </div>
              <div className="text-slate-600 mt-0.5">
                Duration: {nights} {nights === 1 ? 'Night' : 'Nights'}
              </div>
            </div>
          </div>

          {/* Stay Timeline */}
          <div className="grid grid-cols-2 gap-4 p-3 bg-teal-50/50 border border-teal-200 rounded-xl text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-teal-800">
                Check-in
              </span>
              <div className="font-bold text-slate-900 text-sm">
                {formatDateFull(booking.checkInDate)}
              </div>
              <div className="text-slate-600 text-[11px]">
                Standard Time: {hotel.checkInStandardTime}
              </div>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-teal-800">
                Check-out
              </span>
              <div className="font-bold text-slate-900 text-sm">
                {formatDateFull(booking.checkOutDate)}
              </div>
              <div className="text-slate-600 text-[11px]">
                Standard Time: {hotel.checkOutStandardTime}
              </div>
            </div>
          </div>

          {/* Tariff & Payment Summary */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="bg-slate-100 px-4 py-2 text-xs font-bold uppercase text-slate-700">
              Payment Receipt & Balance
            </div>
            <div className="p-4 space-y-2 text-xs">
              <div className="flex justify-between text-slate-700">
                <span>Room Charges ({nights} nights)</span>
                <span>₹{booking.totalAmount.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-medium">
                <span>Advance Payment Received ({booking.paymentMethod.toUpperCase()})</span>
                <span>- ₹{booking.advancePaid.toLocaleString('en-IN')}</span>
              </div>
              <div className="pt-2 border-t flex justify-between font-bold text-sm text-slate-900">
                <span>Balance Due at Check-out</span>
                <span className={balance > 0 ? 'text-rose-600' : 'text-slate-900'}>
                  ₹{balance.toLocaleString('en-IN')}
                </span>
              </div>
            </div>
          </div>

          {/* Terms & Signatures */}
          <div className="pt-4 border-t text-[11px] text-slate-500 space-y-4">
            <p>
              Please present valid Govt ID (Aadhaar / Passport / Driving License) upon check-in. Smoking in non-smoking rooms and unauthorized visitors are strictly prohibited.
            </p>
            <div className="flex justify-between pt-6">
              <div className="border-t border-slate-400 w-36 text-center pt-1 text-[10px] text-slate-600">
                Guest Signature
              </div>
              <div className="border-t border-slate-400 w-36 text-center pt-1 text-[10px] text-slate-600">
                Authorized Manager
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
