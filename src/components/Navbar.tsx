import React, { useState } from 'react';
import { OrderfixLogo } from './Logo';
import { HotelProfile, SubscriptionState, User } from '../types';
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
  ShieldCheck,
  ChevronDown,
  Plus,
  Check,
  LogIn,
  LogOut,
  User as UserIcon
} from 'lucide-react';

interface NavbarProps {
  hotel: HotelProfile;
  hotels?: HotelProfile[];
  onSelectHotel?: (hotelId: string) => void;
  onOpenNewHotelRegistration?: () => void;
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
  authUser?: User | null;
  onOpenAuth?: () => void;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  hotel,
  hotels = [],
  onSelectHotel,
  onOpenNewHotelRegistration,
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
  onOpenPoliceVerification,
  authUser,
  onOpenAuth,
  onLogout
}) => {
  const today = new Date().toISOString().split('T')[0];
  const isToday = selectedDate === today;
  const [isHotelDropdownOpen, setIsHotelDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs w-full max-w-full">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        
        {/* Main Header Bar */}
        <div className="flex items-center justify-between h-14 sm:h-18 gap-1.5 sm:gap-4">
          
          {/* Left: Logo & Hotel Multi-Vendor Switcher */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0 min-w-0">
            <OrderfixLogo size="sm" showTagline={false} className="sm:hidden" />
            <OrderfixLogo size="md" showTagline={true} className="hidden sm:flex" />

            {/* Multi-Vendor Hotel Switcher */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsHotelDropdownOpen(!isHotelDropdownOpen)}
                className="flex items-center gap-1.5 text-left bg-slate-50 hover:bg-slate-100 border border-slate-200 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-xl transition-all cursor-pointer"
                title="Switch Hotel or Add Property"
              >
                <div className="w-6 h-6 rounded-lg bg-teal-500/10 text-teal-700 flex items-center justify-center shrink-0">
                  <Building2 className="w-3.5 h-3.5 text-teal-600" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-black text-slate-900 truncate max-w-[110px] sm:max-w-[170px] leading-tight">
                    {hotel.name}
                  </div>
                  <div className="text-[10px] text-slate-500 truncate max-w-[110px] sm:max-w-[170px]">
                    {hotel.city} • <span className="text-emerald-700 font-bold">১ মাহ ফ্ৰী</span>
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </button>

              {/* Dropdown Menu */}
              {isHotelDropdownOpen && (
                <div className="absolute left-0 top-full mt-1.5 w-64 bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100">
                    পঞ্জীকৃত হোটেলসমূহ ({hotels.length})
                  </div>

                  <div className="max-h-52 overflow-y-auto divide-y divide-slate-50">
                    {hotels.map((h) => {
                      const isSelected = h.id === hotel.id;
                      return (
                        <button
                          key={h.id}
                          type="button"
                          onClick={() => {
                            if (onSelectHotel) onSelectHotel(h.id);
                            setIsHotelDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 flex items-center justify-between text-xs transition-colors cursor-pointer ${
                            isSelected ? 'bg-teal-50/80 font-black text-teal-950' : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div className="min-w-0 pr-2">
                            <div className="truncate font-bold">{h.name}</div>
                            <div className="text-[10px] text-slate-500 truncate">{h.city}, {h.state}</div>
                          </div>
                          {isSelected && <Check className="w-4 h-4 text-teal-600 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>

                  <div className="pt-1.5 border-t border-slate-100 px-2">
                    {onOpenNewHotelRegistration && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsHotelDropdownOpen(false);
                          onOpenNewHotelRegistration();
                        }}
                        className="w-full py-1.5 px-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 text-xs font-black flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>+ নতুন হোটেল যোগ (₹৯৯)</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setIsHotelDropdownOpen(false);
                        onOpenHotelSettings();
                      }}
                      className="w-full text-center py-1 mt-1 text-[11px] font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
                    >
                      হোটেল তথ্য সম্পাদনা (Edit Info)
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 1 Month Free Trial Badge */}
            <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>১ম মাহ ফ্ৰী চাবস্ক্ৰিপচন • {hotel.trialDaysLeft || 30} দিন বাকী</span>
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

          {/* Right Action Cluster */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            
            {/* Screen Size / Compact Toggle */}
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

            {/* Primary Add Booking Button ("+ বুক কৰক / Add Booking") */}
            <button
              onClick={onOpenAddBooking}
              className="flex items-center gap-1 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-xl text-xs sm:text-sm font-extrabold text-white bg-[#0B2545] hover:bg-[#133560] active:scale-95 shadow-md shadow-slate-900/15 transition-all cursor-pointer shrink-0"
              title="Add New Booking (কোঠা বুক কৰক)"
            >
              <PlusCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#00E5A3] shrink-0" />
              <span>+বুক</span>
            </button>

            {/* Accounting / Ledger Button */}
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

            {/* Police Verification Button */}
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

            {/* Customer Guest View Button */}
            <button
              onClick={onOpenCustomerView}
              className="flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-xl text-[11px] sm:text-xs font-bold bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 transition-all cursor-pointer shadow-xs shrink-0"
              title="হোটেলৰ গ্ৰাহক পৰ্টেল (Customer Guest Portal)"
            >
              <Smartphone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="hidden xs:inline">গ্ৰাহক পৰ্টেল</span>
              <span className="xs:hidden">গ্ৰাহক</span>
            </button>

            {/* Subscription Button (5% Commission & 1 Month Free badge) */}
            <button
              onClick={onOpenPricing}
              className="hidden lg:flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold bg-teal-50 border border-teal-200 text-teal-900 cursor-pointer hover:bg-teal-100"
              title="View 1-Month Free Subscription & 5% Commission Model"
            >
              <Sparkles className="w-3 h-3 text-teal-600" />
              <span>১ মাহ ফ্ৰী • ৫%</span>
            </button>

            {/* User Profile & Logout */}
            {authUser ? (
              <div className="flex items-center gap-1 bg-slate-100 border border-slate-200 pl-2 pr-1 py-1 rounded-xl text-xs shrink-0">
                <UserIcon className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                <span className="font-bold text-slate-800 truncate max-w-[70px] sm:max-w-[110px]">
                  {authUser.name || 'User'}
                </span>
                {onLogout && (
                  <button
                    type="button"
                    onClick={onLogout}
                    className="ml-1 p-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 transition-colors cursor-pointer"
                    title="লগআউট কৰক (Logout)"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ) : onOpenAuth ? (
              <button
                type="button"
                onClick={onOpenAuth}
                className="flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-xl text-[11px] sm:text-xs font-bold bg-teal-50 hover:bg-teal-100 text-teal-900 border border-teal-300 transition-all cursor-pointer shadow-xs shrink-0"
                title="প্ৰৱেশ / লগইন কৰক (Sign In)"
              >
                <LogIn className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                <span>লগইন</span>
              </button>
            ) : null}

          </div>

        </div>
      </div>
    </header>
  );
};
