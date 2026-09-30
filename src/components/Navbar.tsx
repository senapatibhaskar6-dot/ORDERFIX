import React from 'react';
import { OrderfixLogo } from './Logo';
import { HotelProfile, SubscriptionState } from '../types';
import {
  Calendar,
  PlusCircle,
  Sparkles,
  Building2,
  RotateCcw,
  Smartphone,
  BedDouble,
  Minimize2,
  Maximize2,
  DollarSign,
  ShieldCheck
} from 'lucide-react';
import { formatDateShort } from '../utils/bookingEngine';

interface NavbarProps {
  hotel: HotelProfile;
  subscription: SubscriptionState;
  selectedDate: string;
  isCompactMode: boolean;
  onToggleCompactMode: () => void;
  onDateChange: (date: string) => void;
  onOpenAddBooking: () => void;
  onOpenPricing: () => void;
  onOpenHotelSettings: () => void;
  onOpenRoomManager: () => void;
  onResetDemoData: () => void;
  onOpenCustomerView: () => void;
  onOpenAccounting?: () => void;
  onOpenPoliceVerification?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  hotel,
  subscription,
  selectedDate,
  isCompactMode,
  onToggleCompactMode,
  onDateChange,
  onOpenAddBooking,
  onOpenPricing,
  onOpenHotelSettings,
  onOpenRoomManager,
  onResetDemoData,
  onOpenCustomerView,
  onOpenAccounting,
  onOpenPoliceVerification
}) => {
  const today = new Date().toISOString().split('T')[0];
  const isToday = selectedDate === today;

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs w-full max-w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        
        {/* Main Header Bar */}
        <div className="flex items-center justify-between h-14 sm:h-18 gap-1.5 sm:gap-4">
          
          {/* Left: Logo & Hotel Info */}
          <div className="flex items-center gap-1.5 sm:gap-4 shrink-0 min-w-0">
            <OrderfixLogo size="sm" showTagline={false} className="sm:hidden" />
            <OrderfixLogo size="md" showTagline={true} className="hidden sm:flex" />

            {/* Hotel Name (Tablet & Desktop) */}
            <div className="hidden lg:flex items-center gap-2 text-left border-l border-slate-200 pl-3">
              <button
                onClick={onOpenHotelSettings}
                className="group flex flex-col text-left hover:bg-slate-50 p-1 rounded-lg transition-colors cursor-pointer"
                title="Edit Property Info"
              >
                <div className="flex items-center gap-1 text-xs font-bold text-slate-800 group-hover:text-teal-700">
                  <Building2 className="w-3.5 h-3.5 text-teal-600" />
                  <span className="truncate max-w-[150px]">{hotel.name}</span>
                </div>
                <span className="text-[10px] text-slate-500 truncate max-w-[150px]">
                  {hotel.city}
                </span>
              </button>
            </div>
          </div>

          {/* Center: Date Selector (Ultra-Compact on Mobile) */}
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 sm:p-1 rounded-xl border border-slate-200 shrink-0">
            <button
              onClick={() => onDateChange(today)}
              className={`px-1.5 sm:px-2 py-0.5 sm:py-1 text-[11px] sm:text-xs font-extrabold rounded-lg transition-all cursor-pointer ${
                isToday
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Today
            </button>
            
            <div className="flex items-center gap-1 px-1 py-0.5 text-[11px] sm:text-xs font-bold text-slate-800">
              <Calendar className="w-3 h-3 text-slate-500 shrink-0 hidden xs:inline" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => e.target.value && onDateChange(e.target.value)}
                className="bg-transparent border-0 p-0 text-[11px] sm:text-xs font-bold text-slate-800 focus:outline-hidden cursor-pointer w-21 sm:w-28"
              />
            </div>
          </div>

          {/* Right Action Cluster - GUARANTEED 100% VISIBLE ON MOBILE */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            
            {/* Screen Size / Compact Toggle ("সৰু কৰক / Compact Mode") */}
            <button
              onClick={onToggleCompactMode}
              className={`flex items-center gap-1 px-1.5 sm:px-2.5 py-1 rounded-lg text-[10px] sm:text-xs font-bold border transition-all cursor-pointer ${
                isCompactMode
                  ? 'bg-amber-100 text-amber-900 border-amber-300 shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
              }`}
              title={isCompactMode ? 'সৰু স্ক্ৰীণ সক্ৰিয় (Compact Mode Active)' : 'Fit entire screen on mobile'}
            >
              {isCompactMode ? (
                <>
                  <Maximize2 className="w-3 h-3 text-amber-700" />
                  <span className="hidden xs:inline">সাধাৰণ</span>
                </>
              ) : (
                <>
                  <Minimize2 className="w-3 h-3 text-slate-600" />
                  <span className="hidden xs:inline">সৰু স্ক্ৰীণ</span>
                  <span className="xs:hidden">সৰু</span>
                </>
              )}
            </button>

            {/* Room Manager Button ("+ কোঠা / Add Room") */}
            <button
              onClick={onOpenRoomManager}
              className="flex items-center gap-1 px-1.5 sm:px-2.5 py-1 rounded-xl text-[11px] sm:text-xs font-bold text-teal-900 bg-teal-50 hover:bg-teal-100 border border-teal-200 transition-all cursor-pointer"
              title="Add New Room or Manage Rooms (কোঠা যোগ কৰক)"
            >
              <BedDouble className="w-3.5 h-3.5 text-teal-600 shrink-0" />
              <span className="hidden sm:inline">Rooms</span>
              <span className="sm:hidden">+ৰূম</span>
            </button>

            {/* Primary Add Booking Button ("+ বুক কৰক / Add Booking") - ALWAYS VISIBLE */}
            <button
              onClick={onOpenAddBooking}
              className="flex items-center gap-1 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-xl text-xs sm:text-sm font-extrabold text-white bg-[#0B2545] hover:bg-[#133560] active:scale-95 shadow-md shadow-slate-900/15 transition-all cursor-pointer shrink-0"
              title="Add New Booking (কোঠা বুক কৰক)"
            >
              <PlusCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#00E5A3] shrink-0" />
              <span>+বুক</span>
            </button>

            {/* Accounting / Ledger Button ("হিচাপ / Accounts") */}
            {onOpenAccounting && (
              <button
                onClick={onOpenAccounting}
                className="flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-xl text-[11px] sm:text-xs font-bold text-amber-950 bg-amber-50 hover:bg-amber-100 border border-amber-300 transition-all cursor-pointer shadow-xs shrink-0"
                title="হোটেল একাউণ্টিং আৰু ৰাজহ বহী (Hotel Accounting & Revenue Ledger)"
              >
                <DollarSign className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                <span className="hidden xs:inline">হিচাপ</span>
                <span className="xs:hidden">হিচাপ</span>
              </button>
            )}

            {/* Police Verification Button ("পুলিচ ৰিপৰ্ট / Police Log") */}
            {onOpenPoliceVerification && (
              <button
                onClick={onOpenPoliceVerification}
                className="flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-xl text-[11px] sm:text-xs font-bold text-rose-950 bg-rose-50 hover:bg-rose-100 border border-rose-300 transition-all cursor-pointer shadow-xs shrink-0"
                title="পুলিচ ভেৰিফিকেচন আৰু অতিথি ৰিপৰ্ট (Police Verification & Guest Reporting)"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span className="hidden xs:inline">পুলিচ</span>
                <span className="xs:hidden">পুলিচ</span>
              </button>
            )}

            {/* Customer Guest View Button ("গ্ৰাহক পৰ্টেল") - Always visible */}
            <button
              onClick={onOpenCustomerView}
              className="flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-xl text-[11px] sm:text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 transition-all cursor-pointer shadow-xs shrink-0"
              title="হোটেলৰ গ্ৰাহক পৰ্টেল (Customer Guest Portal)"
            >
              <Smartphone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="hidden xs:inline">গ্ৰাহক পৰ্টেল</span>
              <span className="xs:hidden">গ্ৰাহক</span>
            </button>

            {/* Subscription Button (Pocket Friendly ₹99/mo) */}
            <button
              onClick={onOpenPricing}
              className="hidden lg:flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold bg-teal-50 border border-teal-200 text-teal-900"
            >
              <Sparkles className="w-3 h-3 text-teal-600" />
              <span>₹99/mo</span>
            </button>

          </div>

        </div>
      </div>
    </header>
  );
};
