import React from 'react';
import { Room, Booking } from '../types';
import { getRoomStatusForDate, formatDateShort, formatSourceName } from '../utils/bookingEngine';
import {
  Plus,
  MessageCircle,
  Eye,
  LogOut,
  Calendar,
  Sparkles,
  Wrench,
  User,
  CheckCircle2,
  AlertCircle,
  Phone
} from 'lucide-react';

interface RoomGridProps {
  rooms: Room[];
  bookings: Booking[];
  selectedDate: string;
  activeFilter: 'all' | 'available' | 'offline' | 'online' | 'today_arrivals';
  onQuickBookRoom: (room: Room) => void;
  onViewBooking: (booking: Booking, room: Room) => void;
  onOpenWhatsApp: (booking: Booking) => void;
  onCheckOutBooking: (bookingId: string) => void;
  isCompactMode?: boolean;
}

export const RoomGrid: React.FC<RoomGridProps> = ({
  rooms,
  bookings,
  selectedDate,
  activeFilter,
  onQuickBookRoom,
  onViewBooking,
  onOpenWhatsApp,
  onCheckOutBooking,
  isCompactMode = false
}) => {
  // Filter rooms based on active filter
  const filteredRooms = rooms.filter((room) => {
    const { status, booking } = getRoomStatusForDate(room, selectedDate, bookings);

    if (activeFilter === 'all') return true;
    if (activeFilter === 'available') return status === 'available';
    if (activeFilter === 'offline') return status === 'offline_booked';
    if (activeFilter === 'online') return status === 'online_booked';
    if (activeFilter === 'today_arrivals') {
      return booking && booking.checkInDate === selectedDate;
    }
    return true;
  });

  return (
    <div className="space-y-2 sm:space-y-3">
      {/* Header & Visual Color Legend (Compact on Mobile) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-3 bg-white p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center gap-1.5">
            <span>কোঠা অৱস্থা (Room Status Grid)</span>
            <span className="text-[11px] font-normal text-slate-500">
              ({filteredRooms.length}/{rooms.length})
            </span>
          </h2>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-1.5 text-[10px] sm:text-xs font-bold">
          <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Green: Available</span>
          </div>

          <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-rose-50 text-rose-800 border border-rose-200">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>Red: Offline</span>
          </div>

          <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-blue-50 text-blue-800 border border-blue-200">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span>Blue: Online</span>
          </div>
        </div>
      </div>

      {/* Grid Container */}
      {filteredRooms.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center">
          <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
          <h3 className="text-xs font-bold text-slate-700">No rooms match the current filter</h3>
          <p className="text-[11px] text-slate-500 mt-0.5">Try switching to &quot;Total Rooms&quot;.</p>
        </div>
      ) : (
        <div
          className={`grid gap-2 sm:gap-3.5 ${
            isCompactMode
              ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
              : 'grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
          }`}
        >
          {filteredRooms.map((room) => {
            const { status, booking } = getRoomStatusForDate(room, selectedDate, bookings);

            // AVAILABLE STATE (GREEN)
            if (status === 'available') {
              return (
                <div
                  key={room.id}
                  className="group relative flex flex-col justify-between bg-gradient-to-b from-emerald-50/70 to-emerald-100/30 rounded-xl sm:rounded-2xl border-2 border-emerald-400/80 hover:border-emerald-500 p-2.5 sm:p-4 transition-all hover:shadow-md"
                >
                  <div>
                    {/* Top Bar */}
                    <div className="flex items-start justify-between gap-1">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-base sm:text-xl font-black text-emerald-950 tracking-tight">
                            Room {room.roomNumber}
                          </span>
                          <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded-md bg-emerald-200 text-emerald-900">
                            F{room.floor}
                          </span>
                        </div>
                        <p className="text-[10px] sm:text-xs font-semibold text-emerald-800 truncate max-w-[130px]">
                          {room.type}
                        </p>
                      </div>

                      <span className="inline-flex items-center gap-0.5 text-[9px] sm:text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500 text-white shrink-0">
                        <CheckCircle2 className="w-3 h-3" />
                        Free
                      </span>
                    </div>

                    {/* Price */}
                    <div className="mt-2 pt-1.5 border-t border-emerald-200/70 text-[11px] text-emerald-900 flex items-center justify-between">
                      <span className="text-emerald-700 text-[10px]">Tariff:</span>
                      <span className="font-black text-xs sm:text-sm">
                        ₹{room.basePrice.toLocaleString('en-IN')}
                        <span className="text-[9px] font-normal text-emerald-700">/nt</span>
                      </span>
                    </div>
                  </div>

                  {/* Primary CTA - Guaranteed Always Visible & Easy to Tap */}
                  <div className="mt-2.5 pt-1">
                    <button
                      onClick={() => onQuickBookRoom(room)}
                      className="w-full flex items-center justify-center gap-1 py-1.5 sm:py-2 px-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-extrabold text-[11px] sm:text-xs transition-all shadow-xs cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ বুক কৰক (Book)</span>
                    </button>
                  </div>
                </div>
              );
            }

            // OFFLINE BOOKED STATE (RED / ROSE)
            if (status === 'offline_booked' && booking) {
              return (
                <div
                  key={room.id}
                  className="group relative flex flex-col justify-between bg-gradient-to-b from-rose-50/80 to-rose-100/40 rounded-xl sm:rounded-2xl border-2 border-rose-400 hover:border-rose-500 p-2.5 sm:p-4 transition-all hover:shadow-md"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-1">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-base sm:text-xl font-black text-rose-950 tracking-tight">
                            Room {room.roomNumber}
                          </span>
                          <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded-md bg-rose-200 text-rose-900">
                            F{room.floor}
                          </span>
                        </div>
                        <p className="text-[10px] sm:text-xs font-semibold text-rose-800 truncate max-w-[130px]">
                          {room.type}
                        </p>
                      </div>

                      <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-rose-600 text-white shrink-0">
                        Offline
                      </span>
                    </div>

                    {/* Guest Information */}
                    <div className="mt-2 p-1.5 sm:p-2 rounded-lg bg-white/80 border border-rose-200/80 text-[10px] sm:text-xs space-y-1">
                      <div className="flex items-center justify-between font-bold text-slate-900 truncate">
                        <span className="truncate flex items-center gap-1">
                          <User className="w-3 h-3 text-rose-600 shrink-0" />
                          {booking.guestName}
                        </span>
                        <span className="text-[9px] text-rose-800 bg-rose-100 px-1 rounded-sm shrink-0">
                          {formatSourceName(booking.source)}
                        </span>
                      </div>

                      <div className="text-slate-600 flex items-center justify-between text-[10px]">
                        <span>{formatDateShort(booking.checkInDate)} - {formatDateShort(booking.checkOutDate)}</span>
                        <span className="font-extrabold text-rose-900">₹{booking.totalAmount}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="mt-2.5 pt-1 flex items-center gap-1">
                    <button
                      onClick={() => onOpenWhatsApp(booking)}
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 px-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] sm:text-xs transition-all shadow-xs cursor-pointer"
                      title="WhatsApp confirmation"
                    >
                      <MessageCircle className="w-3 h-3 shrink-0" />
                      <span className="truncate">WhatsApp</span>
                    </button>

                    <a
                      href={`tel:${booking.guestPhone}`}
                      className="p-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-800 transition-colors flex items-center justify-center shrink-0"
                      title={`Call ${booking.guestName}`}
                    >
                      <Phone className="w-3 h-3" />
                    </a>

                    <button
                      onClick={() => onViewBooking(booking, room)}
                      className="p-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-800 font-bold border border-slate-200 transition-all cursor-pointer flex items-center justify-center shrink-0"
                      title="Details"
                    >
                      <Eye className="w-3 h-3 text-slate-600" />
                    </button>

                    <button
                      onClick={() => onCheckOutBooking(booking.id)}
                      className="py-1.5 px-2 rounded-lg bg-rose-200 hover:bg-rose-300 text-rose-900 font-black text-[10px] transition-all cursor-pointer shrink-0"
                      title="Check out & Free"
                    >
                      Free
                    </button>
                  </div>
                </div>
              );
            }

            // ONLINE BOOKED STATE (BLUE)
            if (status === 'online_booked' && booking) {
              return (
                <div
                  key={room.id}
                  className="group relative flex flex-col justify-between bg-gradient-to-b from-blue-50/80 to-blue-100/40 rounded-xl sm:rounded-2xl border-2 border-blue-400 hover:border-blue-500 p-2.5 sm:p-4 transition-all hover:shadow-md"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-1">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-base sm:text-xl font-black text-blue-950 tracking-tight">
                            Room {room.roomNumber}
                          </span>
                          <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded-md bg-blue-200 text-blue-900">
                            F{room.floor}
                          </span>
                        </div>
                        <p className="text-[10px] sm:text-xs font-semibold text-blue-800 truncate max-w-[130px]">
                          {room.type}
                        </p>
                      </div>

                      <span className="inline-flex items-center gap-1 text-[9px] sm:text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-600 text-white shrink-0">
                        Online
                      </span>
                    </div>

                    {/* Guest Information */}
                    <div className="mt-2 p-1.5 sm:p-2 rounded-lg bg-white/80 border border-blue-200/80 text-[10px] sm:text-xs space-y-1">
                      <div className="flex items-center justify-between font-bold text-slate-900 truncate">
                        <span className="truncate flex items-center gap-1">
                          <User className="w-3 h-3 text-blue-600 shrink-0" />
                          {booking.guestName}
                        </span>
                        <span className="text-[9px] text-blue-800 bg-blue-100 px-1 rounded-sm shrink-0">
                          {formatSourceName(booking.source)}
                        </span>
                      </div>

                      <div className="text-slate-600 flex items-center justify-between text-[10px]">
                        <span>{formatDateShort(booking.checkInDate)} - {formatDateShort(booking.checkOutDate)}</span>
                        <span className="font-extrabold text-blue-900">₹{booking.totalAmount}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="mt-2.5 pt-1 flex items-center gap-1">
                    <button
                      onClick={() => onOpenWhatsApp(booking)}
                      className="flex-1 flex items-center justify-center gap-1 py-1.5 px-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] sm:text-xs transition-all shadow-xs cursor-pointer"
                      title="WhatsApp confirmation"
                    >
                      <MessageCircle className="w-3 h-3 shrink-0" />
                      <span className="truncate">WhatsApp</span>
                    </button>

                    <a
                      href={`tel:${booking.guestPhone}`}
                      className="p-1.5 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-800 transition-colors flex items-center justify-center shrink-0"
                      title={`Call ${booking.guestName}`}
                    >
                      <Phone className="w-3 h-3" />
                    </a>

                    <button
                      onClick={() => onViewBooking(booking, room)}
                      className="p-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-800 font-bold border border-slate-200 transition-all cursor-pointer flex items-center justify-center shrink-0"
                      title="Details"
                    >
                      <Eye className="w-3 h-3 text-slate-600" />
                    </button>

                    <button
                      onClick={() => onCheckOutBooking(booking.id)}
                      className="py-1.5 px-2 rounded-lg bg-blue-200 hover:bg-blue-300 text-blue-900 font-black text-[10px] transition-all cursor-pointer shrink-0"
                      title="Check out & Free"
                    >
                      Free
                    </button>
                  </div>
                </div>
              );
            }

            // MAINTENANCE STATE (AMBER)
            return (
              <div
                key={room.id}
                className="group relative flex flex-col justify-between bg-amber-50/60 rounded-xl sm:rounded-2xl border-2 border-amber-300 p-2.5 sm:p-4"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-base sm:text-xl font-black text-amber-950">
                        Room {room.roomNumber}
                      </span>
                      <p className="text-[10px] sm:text-xs font-semibold text-amber-800">{room.type}</p>
                    </div>
                    <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full bg-amber-200 text-amber-900">
                      Maint
                    </span>
                  </div>
                  <p className="text-[10px] text-amber-800 mt-2 bg-white/70 p-1.5 rounded-lg border border-amber-200">
                    Housekeeping / Cleaning
                  </p>
                </div>
                <div className="mt-2.5 pt-1">
                  <button
                    onClick={() => onQuickBookRoom(room)}
                    className="w-full py-1.5 px-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-[10px] sm:text-xs"
                  >
                    Mark Available
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
