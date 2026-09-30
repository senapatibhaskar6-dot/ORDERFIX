import React, { useState } from 'react';
import { Booking, Room } from '../types';
import { formatDateShort, formatSourceName } from '../utils/bookingEngine';
import {
  Search,
  MessageCircle,
  Eye,
  LogOut,
  Calendar,
  Download,
  Filter,
  User,
  Phone,
  CheckCircle2,
  AlertCircle,
  ShieldCheck
} from 'lucide-react';

interface BookingsTableProps {
  bookings: Booking[];
  rooms: Room[];
  onViewBooking: (booking: Booking, room?: Room) => void;
  onOpenWhatsApp: (booking: Booking) => void;
  onCheckOutBooking: (bookingId: string) => void;
  onOpenPoliceVerification?: (booking?: Booking) => void;
}

export const BookingsTable: React.FC<BookingsTableProps> = ({
  bookings,
  rooms,
  onViewBooking,
  onOpenWhatsApp,
  onCheckOutBooking,
  onOpenPoliceVerification
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [channelFilter, setChannelFilter] = useState<'all' | 'offline' | 'online' | 'active'>('all');

  const filteredBookings = bookings.filter((b) => {
    // Channel filter
    if (channelFilter === 'offline' && b.channel !== 'offline') return false;
    if (channelFilter === 'online' && b.channel !== 'online') return false;
    if (channelFilter === 'active' && (b.status === 'checked_out' || b.status === 'cancelled')) return false;

    // Search query
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchName = b.guestName.toLowerCase().includes(q);
      const matchPhone = b.guestPhone.includes(q);
      const matchRoom = b.roomNumber.toLowerCase().includes(q);
      const matchPortal = b.portalBookingId?.toLowerCase().includes(q);
      return matchName || matchPhone || matchRoom || matchPortal;
    }
    return true;
  });

  const handleExportCSV = () => {
    if (bookings.length === 0) return;
    const headers = ['Booking ID', 'Room', 'Guest Name', 'Phone', 'Channel', 'Source', 'Check In', 'Check Out', 'Total', 'Advance', 'Status'];
    const rows = bookings.map((b) => [
      b.id,
      b.roomNumber,
      `"${b.guestName}"`,
      b.guestPhone,
      b.channel,
      b.source,
      b.checkInDate,
      b.checkOutDate,
      b.totalAmount,
      b.advancePaid,
      b.status
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Orderfix_Bookings_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden mt-6">
      {/* Top Search & Filter Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <span>Recent Reservations & Guest Log</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
              {filteredBookings.length}
            </span>
          </h3>
          <p className="text-xs text-slate-500">
            Unified view of all direct offline and online portal bookings
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search box */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search guest, phone, room..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
            />
          </div>

          {/* Channel Filters */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setChannelFilter('all')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                channelFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setChannelFilter('active')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                channelFilter === 'active'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setChannelFilter('offline')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                channelFilter === 'offline'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-rose-700 hover:text-rose-900'
              }`}
            >
              Offline
            </button>
            <button
              onClick={() => setChannelFilter('online')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                channelFilter === 'online'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-blue-700 hover:text-blue-900'
              }`}
            >
              Online
            </button>
          </div>

          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            title="Download Excel / CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 border-b border-slate-200">
              <th className="py-3 px-4">Room</th>
              <th className="py-3 px-4">Guest</th>
              <th className="py-3 px-4">Stay Dates</th>
              <th className="py-3 px-4">Channel / Source</th>
              <th className="py-3 px-4">Tariff & Pay</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {filteredBookings.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-10 text-center text-slate-500">
                  <AlertCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  No bookings found for the selected criteria.
                </td>
              </tr>
            ) : (
              filteredBookings.map((b) => {
                const room = rooms.find((r) => r.id === b.roomId);
                const isOnline = b.channel === 'online';

                return (
                  <tr
                    key={b.id}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    {/* Room */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="w-8 h-8 rounded-xl font-black text-xs flex items-center justify-center bg-slate-100 text-slate-900 border border-slate-200">
                          {b.roomNumber}
                        </span>
                        <div>
                          <div className="font-bold text-slate-900">
                            Room {b.roomNumber}
                          </div>
                          <div className="text-[10px] text-slate-500">
                            {room?.type || 'Standard'}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Guest */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{b.guestName}</div>
                      <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {b.guestPhone}
                      </div>
                    </td>

                    {/* Stay Dates */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">
                        {formatDateShort(b.checkInDate)} → {formatDateShort(b.checkOutDate)}
                      </div>
                      <div className="text-[10px] text-slate-500">
                        In: {b.checkInTime || '12:00 PM'}
                      </div>
                    </td>

                    {/* Channel */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            isOnline ? 'bg-blue-500' : 'bg-rose-500'
                          }`}
                        />
                        <span className="font-bold text-slate-800">
                          {formatSourceName(b.source)}
                        </span>
                      </div>
                      {b.portalBookingId && (
                        <div className="text-[10px] font-mono text-slate-500 mt-0.5">
                          Ref: {b.portalBookingId}
                        </div>
                      )}
                    </td>

                    {/* Tariff */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">
                        ₹{b.totalAmount.toLocaleString('en-IN')}
                      </div>
                      <div className="text-[10px]">
                        {b.paymentStatus === 'paid' ? (
                          <span className="text-emerald-700 font-semibold">
                            Full Paid
                          </span>
                        ) : (
                          <span className="text-amber-700 font-semibold">
                            Adv: ₹{b.advancePaid}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                          b.status === 'checked_in'
                            ? 'bg-emerald-100 text-emerald-800'
                            : b.status === 'confirmed'
                            ? 'bg-blue-100 text-blue-800'
                            : b.status === 'checked_out'
                            ? 'bg-slate-100 text-slate-700'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {b.status.replace('_', ' ')}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {onOpenPoliceVerification && (
                          <button
                            onClick={() => onOpenPoliceVerification(b)}
                            className="p-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="পুলিচ ভেৰিফিকেচন (Police Log / ID Verification)"
                          >
                            <ShieldCheck className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          onClick={() => onOpenWhatsApp(b)}
                          className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                          title="WhatsApp Confirmation Slip"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => onViewBooking(b, room)}
                          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {b.status !== 'checked_out' && (
                          <button
                            onClick={() => onCheckOutBooking(b.id)}
                            className="p-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Check Out & Free Room"
                          >
                            <LogOut className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
