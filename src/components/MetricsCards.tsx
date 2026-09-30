import React from 'react';
import { Room, Booking } from '../types';
import { getRoomStatusForDate } from '../utils/bookingEngine';
import {
  DoorClosed,
  CheckCircle2,
  PhoneCall,
  Globe2,
  UserCheck
} from 'lucide-react';

interface MetricsCardsProps {
  rooms: Room[];
  bookings: Booking[];
  selectedDate: string;
  activeFilter: 'all' | 'available' | 'offline' | 'online' | 'today_arrivals';
  onSelectFilter: (filter: 'all' | 'available' | 'offline' | 'online' | 'today_arrivals') => void;
  isCompactMode?: boolean;
}

export const MetricsCards: React.FC<MetricsCardsProps> = ({
  rooms,
  bookings,
  selectedDate,
  activeFilter,
  onSelectFilter,
  isCompactMode = false
}) => {
  // Compute counts for the selected date
  let totalRooms = rooms.length;
  let availableCount = 0;
  let offlineBookedCount = 0;
  let onlineBookedCount = 0;
  let maintenanceCount = 0;

  rooms.forEach((room) => {
    const { status } = getRoomStatusForDate(room, selectedDate, bookings);
    if (status === 'available') availableCount++;
    else if (status === 'offline_booked') offlineBookedCount++;
    else if (status === 'online_booked') onlineBookedCount++;
    else if (status === 'maintenance') maintenanceCount++;
  });

  const todayArrivals = bookings.filter(
    (b) => b.checkInDate === selectedDate && b.status !== 'cancelled'
  );

  const totalBooked = offlineBookedCount + onlineBookedCount;
  const occupancyPercentage =
    totalRooms > 0 ? Math.round((totalBooked / totalRooms) * 100) : 0;

  const cards = [
    {
      id: 'all' as const,
      label: 'মুঠ ৰূম (Total)',
      value: totalRooms,
      subtext: `${occupancyPercentage}% Occupied`,
      icon: DoorClosed,
      theme: 'slate',
      badge: `${totalBooked} Busy`,
      borderActive: 'border-slate-800 ring-2 ring-slate-800/10'
    },
    {
      id: 'available' as const,
      label: 'খালী ৰূম (Free)',
      value: availableCount,
      subtext: 'Ready to book',
      icon: CheckCircle2,
      theme: 'emerald',
      badge: 'Free',
      borderActive: 'border-emerald-500 ring-2 ring-emerald-500/20'
    },
    {
      id: 'offline' as const,
      label: 'Offline (Direct)',
      value: offlineBookedCount,
      subtext: 'Walk-ins/Calls',
      icon: PhoneCall,
      theme: 'rose',
      badge: 'Direct',
      borderActive: 'border-rose-500 ring-2 ring-rose-500/20'
    },
    {
      id: 'online' as const,
      label: 'Online (OTAs)',
      value: onlineBookedCount,
      subtext: 'MMT/Booking.com',
      icon: Globe2,
      theme: 'blue',
      badge: 'Portals',
      borderActive: 'border-blue-500 ring-2 ring-blue-500/20'
    },
    {
      id: 'today_arrivals' as const,
      label: 'আজিৰ চেক-ইন',
      value: todayArrivals.length,
      subtext: 'Today arrivals',
      icon: UserCheck,
      theme: 'purple',
      badge: 'Arrivals',
      borderActive: 'border-purple-500 ring-2 ring-purple-500/20'
    }
  ];

  const colorStyles: Record<
    string,
    { bg: string; iconBg: string; iconColor: string; valueColor: string; badgeBg: string }
  > = {
    slate: {
      bg: 'bg-white',
      iconBg: 'bg-slate-100',
      iconColor: 'text-slate-700',
      valueColor: 'text-slate-900',
      badgeBg: 'bg-slate-100 text-slate-700'
    },
    emerald: {
      bg: 'bg-emerald-50/60',
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-700',
      valueColor: 'text-emerald-950',
      badgeBg: 'bg-emerald-100 text-emerald-800'
    },
    rose: {
      bg: 'bg-rose-50/60',
      iconBg: 'bg-rose-100',
      iconColor: 'text-rose-700',
      valueColor: 'text-rose-950',
      badgeBg: 'bg-rose-100 text-rose-800'
    },
    blue: {
      bg: 'bg-blue-50/60',
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-700',
      valueColor: 'text-blue-950',
      badgeBg: 'bg-blue-100 text-blue-800'
    },
    purple: {
      bg: 'bg-purple-50/60',
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-700',
      valueColor: 'text-purple-950',
      badgeBg: 'bg-purple-100 text-purple-800'
    }
  };

  return (
    <div
      className={`grid gap-1.5 sm:gap-3 my-2 sm:my-3 ${
        isCompactMode
          ? 'grid-cols-3 sm:grid-cols-5'
          : 'grid-cols-2 xs:grid-cols-3 sm:grid-cols-5'
      }`}
    >
      {cards.map((c) => {
        const Icon = c.icon;
        const isSelected = activeFilter === c.id;
        const currentStyle = colorStyles[c.theme];

        return (
          <button
            key={c.id}
            onClick={() => onSelectFilter(activeFilter === c.id ? 'all' : c.id)}
            className={`text-left rounded-xl sm:rounded-2xl border transition-all cursor-pointer relative overflow-hidden group hover:shadow-sm ${
              isCompactMode ? 'p-1.5 sm:p-3' : 'p-2 sm:p-3.5'
            } ${currentStyle.bg} ${
              isSelected
                ? c.borderActive + ' shadow-md shadow-slate-200/50 scale-[1.02]'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            {/* Top row with icon & value */}
            <div className="flex items-center justify-between gap-1">
              <div
                className={`rounded-lg flex items-center justify-center shrink-0 ${
                  isCompactMode ? 'w-6 h-6' : 'w-6 h-6 sm:w-8 sm:h-8'
                } ${currentStyle.iconBg} ${currentStyle.iconColor}`}
              >
                <Icon className={isCompactMode ? 'w-3.5 h-3.5' : 'w-3.5 h-3.5 sm:w-4 sm:h-4'} />
              </div>

              <span
                className={`font-black tracking-tight ${
                  isCompactMode
                    ? 'text-lg sm:text-2xl'
                    : 'text-lg sm:text-2xl'
                } ${currentStyle.valueColor}`}
              >
                {c.value}
              </span>
            </div>

            {/* Label */}
            <div className="mt-1">
              <div
                className={`font-bold truncate text-slate-800 ${
                  isCompactMode ? 'text-[10px] sm:text-xs' : 'text-[11px] sm:text-xs'
                }`}
              >
                {c.label}
              </div>
              {!isCompactMode && (
                <div className="text-[9px] sm:text-[10px] text-slate-500 truncate hidden xs:block">
                  {c.subtext}
                </div>
              )}
            </div>

            {isSelected && (
              <div className="text-[9px] font-extrabold uppercase text-teal-700 mt-0.5 hidden xs:block">
                • Active
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
};
