import React, { useState } from 'react';
import { Booking, Room, HotelProfile, BookingStatus, PaymentStatus } from '../types';
import { formatDateFull, formatSourceName, calculateNights } from '../utils/bookingEngine';
import {
  X,
  User,
  Phone,
  Calendar,
  MessageCircle,
  Printer,
  Trash2,
  CheckCircle,
  Clock,
  LogOut,
  CreditCard,
  Building,
  Edit3
} from 'lucide-react';

interface BookingDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
  room?: Room | null;
  hotel: HotelProfile;
  onUpdateBooking: (updated: Booking) => void;
  onDeleteBooking: (bookingId: string) => void;
  onOpenWhatsApp: (booking: Booking) => void;
  onPrintSlip: (booking: Booking) => void;
}

export const BookingDetailsModal: React.FC<BookingDetailsModalProps> = ({
  isOpen,
  onClose,
  booking,
  room,
  hotel,
  onUpdateBooking,
  onDeleteBooking,
  onOpenWhatsApp,
  onPrintSlip
}) => {
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [editedNotes, setEditedNotes] = useState('');
  const [isUpdatingPayment, setIsUpdatingPayment] = useState(false);
  const [newAdvance, setNewAdvance] = useState(0);

  if (!isOpen || !booking) return null;

  const nights = calculateNights(booking.checkInDate, booking.checkOutDate);
  const balance = Math.max(0, booking.totalAmount - booking.advancePaid);

  const handleStatusChange = (newStatus: BookingStatus) => {
    onUpdateBooking({
      ...booking,
      status: newStatus
    });
  };

  const handleSaveNotes = () => {
    onUpdateBooking({
      ...booking,
      notes: editedNotes
    });
    setIsEditingNotes(false);
  };

  const handleSavePayment = () => {
    const updatedAdvance = Number(newAdvance);
    const updatedStatus: PaymentStatus =
      updatedAdvance >= booking.totalAmount
        ? 'paid'
        : updatedAdvance > 0
        ? 'partial'
        : 'pending';

    onUpdateBooking({
      ...booking,
      advancePaid: updatedAdvance,
      paymentStatus: updatedStatus
    });
    setIsUpdatingPayment(false);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div
          className={`px-5 sm:px-6 py-4 text-white flex items-center justify-between ${
            booking.channel === 'online'
              ? 'bg-gradient-to-r from-blue-700 to-indigo-800'
              : 'bg-gradient-to-r from-rose-700 to-red-800'
          }`}
        >
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-extrabold tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
                {booking.channel === 'online' ? 'Online Channel' : 'Offline Channel'}
              </span>
              <span className="text-xs text-white/80">
                #{booking.id.slice(-6).toUpperCase()}
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold mt-1">
              Room {booking.roomNumber} • {booking.guestName}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          
          {/* Key Status Pill Row */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-500 font-medium">Source:</span>
              <span className="font-bold text-slate-900">
                {formatSourceName(booking.source)}
              </span>
              {booking.portalBookingId && (
                <span className="font-mono bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-md text-[10px]">
                  Ref: {booking.portalBookingId}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium">Status:</span>
              <span
                className={`font-bold px-2 py-0.5 rounded-full capitalize ${
                  booking.status === 'checked_in'
                    ? 'bg-emerald-100 text-emerald-800'
                    : booking.status === 'confirmed'
                    ? 'bg-blue-100 text-blue-800'
                    : booking.status === 'checked_out'
                    ? 'bg-slate-200 text-slate-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {booking.status.replace('_', ' ')}
              </span>
            </div>
          </div>

          {/* Stay Dates */}
          <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-100/70 rounded-2xl border border-slate-200">
            <div>
              <div className="text-[11px] font-bold uppercase text-slate-500 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-teal-600" />
                Check-in
              </div>
              <div className="text-xs sm:text-sm font-bold text-slate-900 mt-1">
                {formatDateFull(booking.checkInDate)}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Standard: {hotel.checkInStandardTime}
              </div>
            </div>

            <div>
              <div className="text-[11px] font-bold uppercase text-slate-500 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-teal-600" />
                Check-out ({nights} {nights === 1 ? 'Night' : 'Nights'})
              </div>
              <div className="text-xs sm:text-sm font-bold text-slate-900 mt-1">
                {formatDateFull(booking.checkOutDate)}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                Standard: {hotel.checkOutStandardTime}
              </div>
            </div>
          </div>

          {/* Guest Info */}
          <div className="space-y-2 p-3.5 border border-slate-200 rounded-2xl">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Guest Information
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2 text-slate-800">
                <User className="w-4 h-4 text-slate-400" />
                <span className="font-semibold">{booking.guestName}</span>
                <span className="text-slate-500">({booking.guestCount} Guests)</span>
              </div>
              <div className="flex items-center gap-2 text-slate-800 font-mono">
                <Phone className="w-4 h-4 text-slate-400" />
                <span>{booking.guestPhone}</span>
              </div>
              {booking.guestEmail && (
                <div className="col-span-2 text-slate-600 text-[11px]">
                  Email: {booking.guestEmail}
                </div>
              )}
            </div>
          </div>

          {/* Payment & Tariff Breakdown */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800">
              <span className="flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-slate-600" />
                Tariff & Payment
              </span>
              <button
                type="button"
                onClick={() => {
                  setNewAdvance(booking.advancePaid);
                  setIsUpdatingPayment(!isUpdatingPayment);
                }}
                className="text-xs text-teal-700 hover:text-teal-900 underline font-semibold cursor-pointer"
              >
                {isUpdatingPayment ? 'Cancel' : 'Update Advance'}
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs text-slate-800 pt-1">
              <div>
                <span className="text-slate-500 block text-[11px]">Total Tariff</span>
                <span className="text-sm font-extrabold">
                  ₹{booking.totalAmount.toLocaleString('en-IN')}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Advance Paid</span>
                <span className="text-sm font-bold text-emerald-700">
                  ₹{booking.advancePaid.toLocaleString('en-IN')}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[11px]">Balance Due</span>
                <span
                  className={`text-sm font-extrabold ${
                    balance > 0 ? 'text-rose-600' : 'text-slate-700'
                  }`}
                >
                  ₹{balance.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {isUpdatingPayment && (
              <div className="pt-2 border-t border-slate-200 flex items-center gap-2">
                <input
                  type="number"
                  value={newAdvance}
                  onChange={(e) => setNewAdvance(Number(e.target.value))}
                  className="px-2.5 py-1 text-xs rounded-lg border border-slate-300 w-32 font-bold"
                  placeholder="New Advance"
                />
                <button
                  type="button"
                  onClick={handleSavePayment}
                  className="px-3 py-1 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg cursor-pointer"
                >
                  Save Payment
                </button>
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="p-3 border border-slate-200 rounded-2xl text-xs space-y-1">
            <div className="flex items-center justify-between text-slate-600 font-bold">
              <span>Notes / Special Requests</span>
              <button
                type="button"
                onClick={() => {
                  setEditedNotes(booking.notes || '');
                  setIsEditingNotes(!isEditingNotes);
                }}
                className="text-teal-700 hover:text-teal-900 text-[11px]"
              >
                {isEditingNotes ? 'Cancel' : 'Edit'}
              </button>
            </div>

            {isEditingNotes ? (
              <div className="space-y-1.5 pt-1">
                <textarea
                  rows={2}
                  value={editedNotes}
                  onChange={(e) => setEditedNotes(e.target.value)}
                  className="w-full p-2 text-xs border border-slate-300 rounded-lg text-slate-900"
                />
                <button
                  type="button"
                  onClick={handleSaveNotes}
                  className="px-3 py-1 text-xs font-bold bg-[#0B2545] text-white rounded-lg cursor-pointer"
                >
                  Save Note
                </button>
              </div>
            ) : (
              <p className="text-slate-700 italic">
                {booking.notes || 'No special requests logged.'}
              </p>
            )}
          </div>

          {/* Status Quick Updater Buttons */}
          <div>
            <span className="block text-xs font-bold text-slate-700 mb-1.5">
              Quick Status Action
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleStatusChange('confirmed')}
                className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                  booking.status === 'confirmed'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                Confirmed
              </button>
              <button
                type="button"
                onClick={() => handleStatusChange('checked_in')}
                className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                  booking.status === 'checked_in'
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                Checked In
              </button>
              <button
                type="button"
                onClick={() => {
                  handleStatusChange('checked_out');
                  onClose();
                }}
                className={`py-1.5 px-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                  booking.status === 'checked_out'
                    ? 'bg-slate-700 text-white border-slate-700'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                Check Out / Free
              </button>
            </div>
          </div>

          {/* Primary Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenWhatsApp(booking);
              }}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-xs shadow-xs cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp Guest</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onClose();
                onPrintSlip(booking);
              }}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs shadow-xs cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Slip</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (confirm('Cancel this booking and free the room?')) {
                  onDeleteBooking(booking.id);
                  onClose();
                }
              }}
              className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              <span>Cancel Booking</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
