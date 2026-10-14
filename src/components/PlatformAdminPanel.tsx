import React, { useState, useMemo } from 'react';
import {
  HotelProfile,
  Booking,
  Room,
  Expense,
  GuestVerificationData
} from '../types';
import {
  Building2,
  Calendar,
  Smartphone,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  ArrowUpRight,
  Printer,
  Download,
  Users,
  BedDouble,
  FileText,
  KeyRound,
  LogOut,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Phone,
  MessageSquare,
  Globe,
  MapPin,
  Lock,
  Plus,
  X,
  CreditCard
} from 'lucide-react';
import { LanguageCode, getTranslations } from '../utils/translations';
import {
  saveAdminPassword,
  verifyAdminPassword,
  resetAdminPasswordWithKey,
  MASTER_RECOVERY_KEY
} from '../utils/storage';

interface PlatformAdminPanelProps {
  hotels: HotelProfile[];
  bookings: Booking[];
  rooms: Room[];
  language: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  onSelectHotel: (hotelId: string) => void;
  onCloseAdmin: () => void;
  onOpenNewHotelRegistration: () => void;
}

export const PlatformAdminPanel: React.FC<PlatformAdminPanelProps> = ({
  hotels,
  bookings,
  rooms,
  language,
  onLanguageChange,
  onSelectHotel,
  onCloseAdmin,
  onOpenNewHotelRegistration
}) => {
  const t = getTranslations(language);

  // Tabs: 'overview' | 'monthly_ledger' | 'hotels' | 'online_bookings'
  const [activeTab, setActiveTab] = useState<'overview' | 'monthly_ledger' | 'hotels' | 'online_bookings'>('overview');

  // Search & Filter States
  const [hotelSearch, setHotelSearch] = useState('');
  const [hotelTypeFilter, setHotelTypeFilter] = useState<string>('all');
  const [bookingSearch, setBookingSearch] = useState('');
  const [selectedMonthFilter, setSelectedMonthFilter] = useState<string>('all');

  // Selected Hotel Modal View
  const [selectedHotelForModal, setSelectedHotelForModal] = useState<HotelProfile | null>(null);

  // Change Password Modal State
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [pwdCurrent, setPwdCurrent] = useState('');
  const [pwdRecoveryKey, setPwdRecoveryKey] = useState('');
  const [pwdNew, setPwdNew] = useState('');
  const [pwdConfirm, setPwdConfirm] = useState('');
  const [pwdError, setPwdError] = useState<string | null>(null);
  const [pwdSuccess, setPwdSuccess] = useState<string | null>(null);

  // 1. FILTERED ONLINE & OFFLINE BOOKINGS
  const onlineBookings = useMemo(() => {
    return bookings.filter((b) => b.channel === 'online');
  }, [bookings]);

  const offlineBookings = useMemo(() => {
    return bookings.filter((b) => b.channel === 'offline' || !b.channel);
  }, [bookings]);

  // 2. FINANCIAL AGGREGATIONS
  // Exact 5% commission on top of room tariff:
  // Hotel gets 100% of room tariff, Platform owner gets 5% of room tariff!
  const totalOnlineTariff = useMemo(() => {
    return onlineBookings.reduce((sum, b) => {
      const tariff = Number(b.hotelPayoutAmount || (b.totalAmount ? Math.round(b.totalAmount / 1.05) : 0));
      return sum + tariff;
    }, 0);
  }, [onlineBookings]);

  const totalPlatformCommission = useMemo(() => {
    return onlineBookings.reduce((sum, b) => {
      const comm = Number(b.platformCommission || (b.totalAmount ? Math.round(b.totalAmount * 0.05) : 0));
      return sum + comm;
    }, 0);
  }, [onlineBookings]);

  const totalOnlineCustomerPaid = totalOnlineTariff + totalPlatformCommission;

  const totalEntryFees = hotels.length * 99;
  const netPlatformEarnings = totalPlatformCommission + totalEntryFees;

  // 3. MONTHLY ONLINE BOOKING ACCOUNTS & LEDGER
  interface MonthLedgerRow {
    monthKey: string; // YYYY-MM
    monthLabel: string;
    bookingsCount: number;
    roomTariff: number; // 100% Hotel Payout
    platformCommission: number; // 5% Commission for Platform
    totalPaidByCustomers: number;
    newHotelsRegisteredCount: number;
    entryFeesCollected: number;
    platformNetEarnings: number;
  }

  const monthlyLedger = useMemo<MonthLedgerRow[]>(() => {
    const monthMap: Record<string, MonthLedgerRow> = {};

    // Group online bookings by month
    onlineBookings.forEach((b) => {
      const dateStr = b.checkInDate || b.createdAt?.split('T')[0] || new Date().toISOString().split('T')[0];
      const monthKey = dateStr.slice(0, 7); // e.g. "2026-10"

      if (!monthMap[monthKey]) {
        const [year, monthNum] = monthKey.split('-');
        const dateObj = new Date(Number(year), Number(monthNum) - 1, 1);
        const monthLabel = dateObj.toLocaleString('en-US', { month: 'long', year: 'numeric' });

        monthMap[monthKey] = {
          monthKey,
          monthLabel,
          bookingsCount: 0,
          roomTariff: 0,
          platformCommission: 0,
          totalPaidByCustomers: 0,
          newHotelsRegisteredCount: 0,
          entryFeesCollected: 0,
          platformNetEarnings: 0
        };
      }

      const tariff = Number(b.hotelPayoutAmount || (b.totalAmount ? Math.round(b.totalAmount / 1.05) : 0));
      const commission = Number(b.platformCommission || Math.round(tariff * 0.05));
      const totalPaid = tariff + commission;

      monthMap[monthKey].bookingsCount += 1;
      monthMap[monthKey].roomTariff += tariff;
      monthMap[monthKey].platformCommission += commission;
      monthMap[monthKey].totalPaidByCustomers += totalPaid;
    });

    // Group hotel registrations by month
    hotels.forEach((h) => {
      const regDate = h.createdAt ? h.createdAt.slice(0, 7) : '2026-09';
      if (!monthMap[regDate]) {
        const [year, monthNum] = regDate.split('-');
        const dateObj = new Date(Number(year || 2026), Number(monthNum || 10) - 1, 1);
        const monthLabel = dateObj.toLocaleString('en-US', { month: 'long', year: 'numeric' });

        monthMap[regDate] = {
          monthKey: regDate,
          monthLabel,
          bookingsCount: 0,
          roomTariff: 0,
          platformCommission: 0,
          totalPaidByCustomers: 0,
          newHotelsRegisteredCount: 0,
          entryFeesCollected: 0,
          platformNetEarnings: 0
        };
      }
      monthMap[regDate].newHotelsRegisteredCount += 1;
      monthMap[regDate].entryFeesCollected += 99;
    });

    // Calculate platform net earnings per month
    return Object.values(monthMap)
      .map((row) => ({
        ...row,
        platformNetEarnings: row.platformCommission + row.entryFeesCollected
      }))
      .sort((a, b) => b.monthKey.localeCompare(a.monthKey));
  }, [onlineBookings, hotels]);

  // Filtered Hotels
  const filteredHotels = useMemo(() => {
    return hotels.filter((h) => {
      const matchesSearch =
        h.name.toLowerCase().includes(hotelSearch.toLowerCase()) ||
        h.city.toLowerCase().includes(hotelSearch.toLowerCase()) ||
        h.ownerName.toLowerCase().includes(hotelSearch.toLowerCase()) ||
        h.phone.includes(hotelSearch);

      const matchesType =
        hotelTypeFilter === 'all' ||
        (h.propertyType || '').toLowerCase().includes(hotelTypeFilter.toLowerCase());

      return matchesSearch && matchesType;
    });
  }, [hotels, hotelSearch, hotelTypeFilter]);

  // Filtered Online Bookings
  const filteredOnlineBookings = useMemo(() => {
    return onlineBookings.filter((b) => {
      const hotel = hotels.find((h) => h.id === b.hotelId);
      const matchesSearch =
        b.guestName.toLowerCase().includes(bookingSearch.toLowerCase()) ||
        b.guestPhone.includes(bookingSearch) ||
        b.id.toLowerCase().includes(bookingSearch.toLowerCase()) ||
        (hotel && hotel.name.toLowerCase().includes(bookingSearch.toLowerCase()));

      const matchesMonth =
        selectedMonthFilter === 'all' ||
        (b.checkInDate && b.checkInDate.startsWith(selectedMonthFilter));

      return matchesSearch && matchesMonth;
    });
  }, [onlineBookings, hotels, bookingSearch, selectedMonthFilter]);

  // Password Change Handler
  const handleChangePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPwdError(null);
    setPwdSuccess(null);

    // If recovery key is provided, use recovery flow
    if (pwdRecoveryKey.trim()) {
      if (pwdRecoveryKey.trim() !== MASTER_RECOVERY_KEY) {
        setPwdError(t.invalidRecoveryKey);
        return;
      }
    } else {
      // Must verify current password
      if (!verifyAdminPassword(pwdCurrent)) {
        setPwdError(t.invalidPassword);
        return;
      }
    }

    if (!pwdNew || pwdNew.length < 6) {
      setPwdError(language === 'as' ? 'পাছৱৰ্ড অন্ততঃ ৬ টা বৰ্ণৰ হ’ব লাগিব।' : 'Password must be at least 6 characters.');
      return;
    }

    if (pwdNew !== pwdConfirm) {
      setPwdError(t.passwordMismatch);
      return;
    }

    saveAdminPassword(pwdNew);
    setPwdSuccess(t.passwordChangedSuccess);
    setPwdCurrent('');
    setPwdRecoveryKey('');
    setPwdNew('');
    setPwdConfirm('');
    setTimeout(() => {
      setIsChangePasswordModalOpen(false);
      setPwdSuccess(null);
    }, 1800);
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem('orderfix_admin_authenticated');
    } catch {}
    onCloseAdmin();
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      
      {/* 1. TOP MASTER ADMIN BAR */}
      <header className="sticky top-0 z-40 bg-[#0B2545]/95 backdrop-blur-md border-b border-teal-500/20 px-3 sm:px-6 py-2.5 sm:py-3.5 shadow-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4 flex-wrap">
          
          {/* Logo & Platform Master Badge */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-400 flex items-center justify-center text-slate-950 font-black text-base shadow-lg shadow-teal-500/20">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-black tracking-tight text-white">
                  ORDERFIX
                </span>
                <span className="px-2 py-0.5 rounded-full bg-teal-500/20 text-[#00E5A3] border border-teal-400/30 text-[10px] font-black uppercase tracking-wider">
                  MASTER ADMIN
                </span>
                <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  NEON POSTGRESQL CONNECTED
                </span>
              </div>
              <div className="text-[10px] sm:text-xs text-slate-300 hidden sm:block">
                {t.adminSubtitle}
              </div>
            </div>
          </div>

          {/* Right Header Action Cluster */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            
            {/* Language Switcher Dropdown */}
            <div className="relative flex items-center bg-slate-800/90 border border-slate-700 rounded-xl px-2 py-1 text-xs text-slate-200">
              <Globe className="w-3.5 h-3.5 text-teal-400 mr-1.5 shrink-0" />
              <select
                value={language}
                onChange={(e) => onLanguageChange(e.target.value as LanguageCode)}
                className="bg-transparent border-0 text-xs font-bold text-slate-100 focus:outline-hidden cursor-pointer pr-1"
                title="Select Platform Language"
              >
                <option value="en" className="bg-slate-800 text-white">English (Default)</option>
                <option value="as" className="bg-slate-800 text-white">অসমীয়া (Assamese)</option>
                <option value="bn" className="bg-slate-800 text-white">বাংলা (Bengali)</option>
                <option value="hi" className="bg-slate-800 text-white">हिन्दी (Hindi)</option>
              </select>
            </div>

            {/* Change Admin Password Button */}
            <button
              type="button"
              onClick={() => {
                setIsChangePasswordModalOpen(true);
                setPwdError(null);
                setPwdSuccess(null);
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 text-xs font-bold transition-colors cursor-pointer"
              title="Change Admin Password / Security"
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">{t.changePassword}</span>
            </button>

            {/* Back to Hotel Dashboard Button */}
            <button
              type="button"
              onClick={onCloseAdmin}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-black transition-all cursor-pointer shadow-md shadow-teal-500/20 active:scale-95"
              title="Exit to Hotel Management Dashboard"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Hotel Dashboard</span>
              <span className="sm:hidden">Exit</span>
            </button>

            {/* Admin Logout */}
            <button
              type="button"
              onClick={handleLogout}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 border border-rose-500/30 text-xs font-bold transition-colors cursor-pointer"
              title="Lock Admin Panel & Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>

          </div>

        </div>
      </header>

      {/* 2. ADMIN NAVIGATION TABS */}
      <nav className="bg-slate-800/90 border-b border-slate-700/80 px-3 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between overflow-x-auto py-1.5 gap-2 no-scrollbar">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{t.tabOverview}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('hotels')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'hotels'
                  ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>{t.tabHotels} ({hotels.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('online_bookings')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'online_bookings'
                  ? 'bg-teal-500 text-slate-950 shadow-md shadow-teal-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>{t.tabOnlineBookings} ({onlineBookings.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('monthly_ledger')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer whitespace-nowrap ${
                activeTab === 'monthly_ledger'
                  ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                  : 'text-amber-300 hover:text-amber-100 hover:bg-amber-500/10'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>{t.tabMonthlyAccounts} ({monthlyLedger.length} {t.month}s)</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenNewHotelRegistration}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-black shadow-md cursor-pointer whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t.addPropertyBtn}</span>
            </button>
          </div>
        </div>
      </nav>

      {/* 3. MAIN DASHBOARD CONTENT CONTAINER */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-5 space-y-6">
        
        {/* TOP LEVEL OVERVIEW CARDS (ALWAYS VISIBLE OR OVERVIEW TAB) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          
          {/* Card 1: Total Registered Hotels ("kiman hotel REGISTRATION hol") */}
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3 sm:p-4 relative overflow-hidden shadow-lg group hover:border-teal-500/40 transition-colors">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider">
                {t.registeredHotelsCount}
              </span>
              <div className="p-1.5 rounded-xl bg-teal-500/10 text-teal-400">
                <Building2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {hotels.length}
            </div>
            <div className="mt-1 flex items-center justify-between text-[10px] sm:text-[11px] text-slate-300">
              <span>₹99 Entry Fees: <b className="text-emerald-400">₹{totalEntryFees.toLocaleString('en-IN')}</b></span>
              <span className="text-teal-400 font-bold">১ মাহ ফ্ৰী</span>
            </div>
            <div className="mt-2 text-[10px] text-slate-400 line-clamp-1">
              {t.registeredHotelsDesc}
            </div>
          </div>

          {/* Card 2: Total Online Customer Bookings ("kiman online customer booking hol") */}
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3 sm:p-4 relative overflow-hidden shadow-lg group hover:border-teal-500/40 transition-colors">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider">
                {t.onlineBookingsCount}
              </span>
              <div className="p-1.5 rounded-xl bg-sky-500/10 text-sky-400">
                <Smartphone className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {onlineBookings.length}
            </div>
            <div className="mt-1 flex items-center justify-between text-[10px] sm:text-[11px] text-slate-300">
              <span>Gross: <b className="text-sky-300">₹{totalOnlineCustomerPaid.toLocaleString('en-IN')}</b></span>
              <span className="text-sky-400 font-bold">{offlineBookings.length} offline</span>
            </div>
            <div className="mt-2 text-[10px] text-slate-400 line-clamp-1">
              {t.onlineBookingsDesc}
            </div>
          </div>

          {/* Card 3: 5% Platform Commission & 100% Hotel Payout */}
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3 sm:p-4 relative overflow-hidden shadow-lg group hover:border-teal-500/40 transition-colors">
            <div className="flex items-center justify-between text-slate-400 mb-1">
              <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider">
                {t.totalPlatformCommission}
              </span>
              <div className="p-1.5 rounded-xl bg-teal-500/10 text-[#00E5A3]">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#00E5A3] tracking-tight">
              ₹{totalPlatformCommission.toLocaleString('en-IN')}
            </div>
            <div className="mt-1 flex items-center justify-between text-[10px] sm:text-[11px] text-slate-300">
              <span>Hotel 100%: <b className="text-slate-200">₹{totalOnlineTariff.toLocaleString('en-IN')}</b></span>
              <span className="text-teal-300 font-bold">5% Online</span>
            </div>
            <div className="mt-2 text-[10px] text-slate-400 line-clamp-1">
              {t.totalPlatformCommissionDesc}
            </div>
          </div>

          {/* Card 4: Net Platform Earnings (5% Commission + ₹99 Fees) */}
          <div className="bg-gradient-to-br from-[#0B2545] to-slate-800 border border-teal-500/40 rounded-2xl p-3 sm:p-4 relative overflow-hidden shadow-lg">
            <div className="flex items-center justify-between text-slate-300 mb-1">
              <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-teal-300">
                {t.netPlatformEarnings}
              </span>
              <div className="p-1.5 rounded-xl bg-teal-400/20 text-[#00E5A3]">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              ₹{netPlatformEarnings.toLocaleString('en-IN')}
            </div>
            <div className="mt-1 flex items-center justify-between text-[10px] sm:text-[11px] text-slate-300">
              <span>Commissions + ₹99 Onboarding</span>
              <span className="text-emerald-400 font-bold">Total Net</span>
            </div>
            <div className="mt-2 text-[10px] text-slate-400 line-clamp-1">
              {t.netPlatformEarningsDesc}
            </div>
          </div>

        </div>

        {/* TAB 1: OVERVIEW SCREEN */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            
            {/* Dual Booking & Zero Commission Rules Callout */}
            <div className="bg-gradient-to-r from-teal-950/60 via-slate-800/80 to-slate-900 border border-teal-500/30 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-teal-500 text-slate-950 font-black text-[10px] uppercase">
                    Platform Rule
                  </span>
                  <h4 className="text-sm sm:text-base font-black text-white">
                    {language === 'as'
                      ? 'দ্বৈত বুকিং & স্বচ্ছ ৫% কমিছন হিচাপ নিয়ম'
                      : 'Dual Booking & Transparent 5% Commission Architecture'}
                  </h4>
                </div>
                <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                  {language === 'as' ? (
                    <>
                      • <b>অনলাইন বুকিং:</b> গ্ৰাহকে পৰ্টেলৰ পৰা কৰা বুকিঙত হোটেল মালিকে ১০০% সম্পূৰ্ণ ৰূম টেৰিফ পায় আৰু ৰূম টেৰিফৰ ওপৰত ৫% প্লেটফৰ্ম কমিছন প্লেটফৰ্মৰ মালিকে লাভ কৰে।<br />
                      • <b>অফলাইন ৱাক-ইন বুকিং:</b> হোটেলৰ নিজস্ব ফোন বা কাউন্টাৰ বুকিঙত <b>₹০ কমিছন</b> (১০০% সম্পূৰ্ণ বিনামূলীয়া)।
                    </>
                  ) : (
                    <>
                      • <b>Online Bookings:</b> 100% full room tariff is disbursed directly to hotel owners, and exactly 5% platform commission on top of room tariff is collected for the platform owner.<br />
                      • <b>Offline Walk-in Bookings:</b> Direct phone or walk-in guest entries logged by hotel owners remain <b>₹0 Commission</b> (100% free forever).
                    </>
                  )}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveTab('monthly_ledger')}
                  className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-md cursor-pointer"
                >
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>{t.tabMonthlyAccounts}</span>
                </button>
              </div>
            </div>

            {/* Quick Preview Split: Latest Registered Hotels & Recent Online Bookings */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Left: Latest Registered Hotels */}
              <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-teal-400" />
                    <h3 className="text-sm font-black text-white">
                      {language === 'as' ? 'শেহতীয়া পঞ্জীকৃত হোটেলসমূহ' : 'Recently Registered Hotels'} ({hotels.length})
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('hotels')}
                    className="text-xs font-bold text-teal-400 hover:text-teal-300 flex items-center gap-0.5 cursor-pointer"
                  >
                    <span>View all</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-3">
                  {hotels.slice(0, 4).map((h) => (
                    <div
                      key={h.id}
                      className="p-3 rounded-xl bg-slate-900/60 border border-slate-700/60 flex items-center justify-between gap-3 hover:border-slate-600 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {h.images && h.images[0] ? (
                          <img
                            src={h.images[0]}
                            alt={h.name}
                            className="w-10 h-10 rounded-xl object-cover border border-slate-700 shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold shrink-0">
                            <Building2 className="w-5 h-5" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="text-xs font-black text-white truncate">{h.name}</div>
                          <div className="text-[10px] text-slate-400 truncate">
                            {h.city}, {h.state} • {h.ownerName}
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-xs font-bold text-emerald-400">
                          ₹99 Paid
                        </div>
                        <button
                          type="button"
                          onClick={() => onSelectHotel(h.id)}
                          className="text-[10px] text-teal-400 hover:underline font-bold"
                        >
                          {t.switchHotel}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: Recent Online Bookings */}
              <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-sky-400" />
                    <h3 className="text-sm font-black text-white">
                      {language === 'as' ? 'শেহতীয়া অনলাইন বুকিং' : 'Recent Online Customer Bookings'} ({onlineBookings.length})
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setActiveTab('online_bookings')}
                    className="text-xs font-bold text-sky-400 hover:text-sky-300 flex items-center gap-0.5 cursor-pointer"
                  >
                    <span>View all</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-3">
                  {onlineBookings.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-400 border border-dashed border-slate-700 rounded-xl">
                      No online customer bookings recorded yet.
                    </div>
                  ) : (
                    onlineBookings.slice(0, 4).map((b) => {
                      const tariff = Number(b.hotelPayoutAmount || (b.totalAmount ? Math.round(b.totalAmount / 1.05) : 0));
                      const commission = Number(b.platformCommission || Math.round(tariff * 0.05));
                      const hotelObj = hotels.find((h) => h.id === b.hotelId);

                      return (
                        <div
                          key={b.id}
                          className="p-3 rounded-xl bg-slate-900/60 border border-slate-700/60 flex items-center justify-between gap-3 hover:border-slate-600 transition-colors"
                        >
                          <div className="min-w-0">
                            <div className="text-xs font-black text-white flex items-center gap-1.5">
                              <span>{b.guestName}</span>
                              <span className="text-[10px] text-slate-400 font-mono">({b.guestPhone})</span>
                            </div>
                            <div className="text-[10px] text-slate-400 truncate">
                              {hotelObj ? hotelObj.name : 'Hotel'} • Room {b.roomNumber} • {b.checkInDate}
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <div className="text-xs font-black text-teal-400">
                              +₹{commission} comm
                            </div>
                            <div className="text-[10px] text-slate-400">
                              Tariff: ₹{tariff}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB 2: MONTHLY ACCOUNTS & LEDGER ("online booking monthly hisap THAKIBO") */}
        {activeTab === 'monthly_ledger' && (
          <div className="space-y-5">
            
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-4 sm:p-5 shadow-lg">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-amber-400" />
                    <span>{t.tabMonthlyAccounts}</span>
                  </h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    {language === 'as'
                      ? 'অনলাইন বুকিংৰ মাহেকীয়া বিত্তীয় বিৱৰণী, ১০০% হোটেল ৰাজহ আৰু ৫% প্লেটফৰ্ম কমিছন সংগ্ৰহ'
                      : 'Month-by-month financial ledger of online customer bookings, 100% hotel payouts, and 5% platform commission earnings.'}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>{t.exportReport}</span>
                  </button>
                </div>
              </div>

              {/* Monthly Ledger Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-700">
                <table className="w-full text-left text-xs text-slate-200">
                  <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] font-black tracking-wider border-b border-slate-700">
                    <tr>
                      <th className="py-3 px-3 sm:px-4">{t.month}</th>
                      <th className="py-3 px-3">{t.monthlyBookings}</th>
                      <th className="py-3 px-3 text-right">{t.monthlyTariff}</th>
                      <th className="py-3 px-3 text-right text-teal-400">{t.monthlyCommission}</th>
                      <th className="py-3 px-3 text-right">{t.monthlyTotalPaid}</th>
                      <th className="py-3 px-3 text-center">{t.monthlyNewHotels}</th>
                      <th className="py-3 px-3 text-right">{t.monthlyEntryFees}</th>
                      <th className="py-3 px-3 sm:px-4 text-right text-amber-400">{t.monthlyNetProfit}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/60 bg-slate-800/40 font-medium">
                    {monthlyLedger.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-slate-400 text-xs">
                          No monthly records available yet.
                        </td>
                      </tr>
                    ) : (
                      monthlyLedger.map((row) => (
                        <tr key={row.monthKey} className="hover:bg-slate-700/40 transition-colors">
                          <td className="py-3 px-3 sm:px-4 font-black text-white whitespace-nowrap">
                            {row.monthLabel}
                            <span className="block text-[10px] font-mono text-slate-400">{row.monthKey}</span>
                          </td>
                          <td className="py-3 px-3">
                            <span className="px-2 py-0.5 rounded-md bg-sky-500/20 text-sky-300 font-bold text-[11px]">
                              {row.bookingsCount} bookings
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right font-semibold text-slate-200">
                            ₹{row.roomTariff.toLocaleString('en-IN')}
                          </td>
                          <td className="py-3 px-3 text-right font-black text-[#00E5A3]">
                            +₹{row.platformCommission.toLocaleString('en-IN')}
                          </td>
                          <td className="py-3 px-3 text-right font-bold text-white">
                            ₹{row.totalPaidByCustomers.toLocaleString('en-IN')}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span className="px-2 py-0.5 rounded-md bg-teal-500/20 text-teal-300 font-bold text-[11px]">
                              {row.newHotelsRegisteredCount}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right font-semibold text-slate-300">
                            ₹{row.entryFeesCollected.toLocaleString('en-IN')}
                          </td>
                          <td className="py-3 px-3 sm:px-4 text-right font-black text-amber-400 text-sm">
                            ₹{row.platformNetEarnings.toLocaleString('en-IN')}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  {monthlyLedger.length > 0 && (
                    <tfoot className="bg-slate-900 font-black text-white text-xs border-t-2 border-slate-700">
                      <tr>
                        <td className="py-3 px-3 sm:px-4">TOTALS</td>
                        <td className="py-3 px-3 text-sky-400">{onlineBookings.length}</td>
                        <td className="py-3 px-3 text-right">₹{totalOnlineTariff.toLocaleString('en-IN')}</td>
                        <td className="py-3 px-3 text-right text-[#00E5A3]">₹{totalPlatformCommission.toLocaleString('en-IN')}</td>
                        <td className="py-3 px-3 text-right">₹{totalOnlineCustomerPaid.toLocaleString('en-IN')}</td>
                        <td className="py-3 px-3 text-center text-teal-300">{hotels.length}</td>
                        <td className="py-3 px-3 text-right">₹{totalEntryFees.toLocaleString('en-IN')}</td>
                        <td className="py-3 px-3 sm:px-4 text-right text-amber-400 text-sm">₹{netPlatformEarnings.toLocaleString('en-IN')}</td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: REGISTERED HOTELS DIRECTORY ("kiman hotel REGISTRATION hol") */}
        {activeTab === 'hotels' && (
          <div className="space-y-4">
            
            {/* Filter & Search Bar */}
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3 sm:p-4 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={hotelSearch}
                  onChange={(e) => setHotelSearch(e.target.value)}
                  placeholder="Search hotel, city, owner, phone..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-hidden focus:border-teal-500"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Filter className="w-3.5 h-3.5" />
                  <select
                    value={hotelTypeFilter}
                    onChange={(e) => setHotelTypeFilter(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-hidden"
                  >
                    <option value="all">All Property Types</option>
                    <option value="hotel">Hotels</option>
                    <option value="resort">Resorts</option>
                    <option value="guest">Guest Houses / Homestays</option>
                  </select>
                </div>

                <button
                  type="button"
                  onClick={onOpenNewHotelRegistration}
                  className="px-3 py-1.5 rounded-xl bg-teal-500 text-slate-950 font-black text-xs flex items-center gap-1 shadow-md cursor-pointer shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t.addPropertyBtn}</span>
                </button>
              </div>
            </div>

            {/* Hotels Table */}
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl overflow-hidden shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-200">
                  <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] font-black tracking-wider border-b border-slate-700">
                    <tr>
                      <th className="py-3 px-3 sm:px-4">{t.hotelName}</th>
                      <th className="py-3 px-3">{t.ownerName}</th>
                      <th className="py-3 px-3">{t.contactNumber}</th>
                      <th className="py-3 px-3">{t.location}</th>
                      <th className="py-3 px-3">{t.entryFeeStatus}</th>
                      <th className="py-3 px-3">{t.trialStatus}</th>
                      <th className="py-3 px-3 sm:px-4 text-right">{t.actions}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/60 bg-slate-800/40">
                    {filteredHotels.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                          No hotels found matching criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredHotels.map((h) => {
                        const hotelBookingsCount = onlineBookings.filter((b) => b.hotelId === h.id).length;
                        return (
                          <tr key={h.id} className="hover:bg-slate-700/40 transition-colors">
                            <td className="py-3 px-3 sm:px-4">
                              <div className="flex items-center gap-3">
                                {h.images && h.images[0] ? (
                                  <img
                                    src={h.images[0]}
                                    alt={h.name}
                                    className="w-10 h-10 rounded-xl object-cover border border-slate-700 shrink-0"
                                  />
                                ) : (
                                  <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold shrink-0">
                                    <Building2 className="w-5 h-5" />
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <div className="font-black text-white text-xs truncate max-w-xs">{h.name}</div>
                                  <div className="text-[10px] text-teal-400 font-semibold">{h.propertyType || 'Hotel'} • {hotelBookingsCount} online bookings</div>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-3 font-semibold text-slate-200">
                              {h.ownerName}
                            </td>
                            <td className="py-3 px-3 whitespace-nowrap">
                              <div className="flex items-center gap-1.5">
                                <a
                                  href={`tel:${h.phone}`}
                                  className="text-xs font-bold text-sky-400 hover:underline flex items-center gap-1"
                                >
                                  <Phone className="w-3 h-3" />
                                  <span>{h.phone}</span>
                                </a>
                                {h.whatsappNumber && (
                                  <a
                                    href={`https://wa.me/${h.whatsappNumber.replace(/\D/g, '')}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-emerald-400 hover:text-emerald-300"
                                    title="WhatsApp Hotel Owner"
                                  >
                                    <MessageSquare className="w-3.5 h-3.5" />
                                  </a>
                                )}
                              </div>
                            </td>
                            <td className="py-3 px-3 text-slate-300">
                              {h.city}, {h.state}
                            </td>
                            <td className="py-3 px-3">
                              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold text-[10px] flex items-center gap-1 w-fit">
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                <span>₹99 Paid</span>
                              </span>
                            </td>
                            <td className="py-3 px-3">
                              <span className="px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 font-bold text-[10px] flex items-center gap-1 w-fit">
                                <Sparkles className="w-3 h-3 text-teal-400" />
                                <span>{h.trialDaysLeft || 30} days left</span>
                              </span>
                            </td>
                            <td className="py-3 px-3 sm:px-4 text-right whitespace-nowrap">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => setSelectedHotelForModal(h)}
                                  className="px-2 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold transition-colors cursor-pointer"
                                >
                                  {t.viewDetails}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => onSelectHotel(h.id)}
                                  className="px-2.5 py-1 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-black transition-colors cursor-pointer"
                                >
                                  {t.switchHotel}
                                </button>
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

          </div>
        )}

        {/* TAB 4: ONLINE CUSTOMER BOOKINGS ("kiman online customer booking hol") */}
        {activeTab === 'online_bookings' && (
          <div className="space-y-4">
            
            {/* Filter & Search Bar */}
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl p-3 sm:p-4 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={bookingSearch}
                  onChange={(e) => setBookingSearch(e.target.value)}
                  placeholder="Search guest, phone, booking ID, hotel..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-400 focus:outline-hidden focus:border-teal-500"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                <span className="text-xs text-slate-400">
                  Total Online Bookings: <b className="text-white">{filteredOnlineBookings.length}</b>
                </span>
              </div>
            </div>

            {/* Online Bookings Table */}
            <div className="bg-slate-800/80 border border-slate-700/80 rounded-2xl overflow-hidden shadow-lg">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-200">
                  <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] font-black tracking-wider border-b border-slate-700">
                    <tr>
                      <th className="py-3 px-3 sm:px-4">{t.bookingId}</th>
                      <th className="py-3 px-3">{t.guestDetails}</th>
                      <th className="py-3 px-3">{t.roomDetails}</th>
                      <th className="py-3 px-3">{t.dates}</th>
                      <th className="py-3 px-3 text-right">{t.roomTariff100}</th>
                      <th className="py-3 px-3 text-right text-teal-400">{t.platformFee5}</th>
                      <th className="py-3 px-3 text-right">{t.totalPaid}</th>
                      <th className="py-3 px-3 sm:px-4 text-center">{t.paymentStatus}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/60 bg-slate-800/40">
                    {filteredOnlineBookings.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-slate-400 text-xs">
                          No online bookings found.
                        </td>
                      </tr>
                    ) : (
                      filteredOnlineBookings.map((b) => {
                        const tariff = Number(b.hotelPayoutAmount || (b.totalAmount ? Math.round(b.totalAmount / 1.05) : 0));
                        const commission = Number(b.platformCommission || Math.round(tariff * 0.05));
                        const totalPaid = tariff + commission;
                        const hotelObj = hotels.find((h) => h.id === b.hotelId);

                        return (
                          <tr key={b.id} className="hover:bg-slate-700/40 transition-colors">
                            <td className="py-3 px-3 sm:px-4 font-mono font-bold text-sky-400 whitespace-nowrap">
                              #{b.id.slice(-6).toUpperCase()}
                            </td>
                            <td className="py-3 px-3">
                              <div className="font-black text-white">{b.guestName}</div>
                              <div className="text-[10px] text-slate-400 font-mono">{b.guestPhone}</div>
                            </td>
                            <td className="py-3 px-3">
                              <div className="font-bold text-slate-200 truncate max-w-xs">{hotelObj?.name || 'Hotel'}</div>
                              <div className="text-[10px] text-teal-400">Room {b.roomNumber}</div>
                            </td>
                            <td className="py-3 px-3 whitespace-nowrap text-slate-300">
                              <div>{b.checkInDate}</div>
                              <div className="text-[10px] text-slate-400">to {b.checkOutDate}</div>
                            </td>
                            <td className="py-3 px-3 text-right font-semibold text-slate-200">
                              ₹{tariff.toLocaleString('en-IN')}
                            </td>
                            <td className="py-3 px-3 text-right font-black text-[#00E5A3]">
                              +₹{commission.toLocaleString('en-IN')}
                            </td>
                            <td className="py-3 px-3 text-right font-bold text-white">
                              ₹{totalPaid.toLocaleString('en-IN')}
                            </td>
                            <td className="py-3 px-3 sm:px-4 text-center">
                              <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold uppercase">
                                {b.paymentStatus || 'Paid'}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* 4. HOTEL DETAILS INSPECTOR MODAL */}
      {selectedHotelForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-5 sm:p-6 text-white space-y-4">
            
            <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3">
              <div>
                <span className="px-2 py-0.5 rounded-md bg-teal-500/20 text-teal-400 text-[10px] font-black uppercase">
                  {selectedHotelForModal.propertyType || 'Hotel'}
                </span>
                <h3 className="text-lg font-black text-white mt-1">
                  {selectedHotelForModal.name}
                </h3>
                <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-teal-400" />
                  <span>{selectedHotelForModal.address}, {selectedHotelForModal.city}, {selectedHotelForModal.state} - {selectedHotelForModal.pincode}</span>
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedHotelForModal(null)}
                className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Photos Uploaded via Camera or Gallery */}
            <div>
              <div className="text-xs font-black text-slate-300 uppercase tracking-wider mb-2">
                Property & Room Photos (Mobile Camera / Gallery)
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {selectedHotelForModal.images && selectedHotelForModal.images.length > 0 ? (
                  selectedHotelForModal.images.map((img, i) => (
                    <img
                      key={i}
                      src={img}
                      alt={`Photo ${i + 1}`}
                      className="w-full h-24 object-cover rounded-xl border border-slate-800 shadow-xs"
                    />
                  ))
                ) : (
                  <div className="col-span-4 p-4 text-center text-xs text-slate-500 bg-slate-800/40 rounded-xl">
                    No images uploaded yet.
                  </div>
                )}
              </div>
            </div>

            {/* Key Registration Details */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-slate-800/60 p-3.5 rounded-2xl border border-slate-700/60">
              <div>
                <span className="text-slate-400 block text-[10px]">Owner Name</span>
                <span className="font-bold text-white">{selectedHotelForModal.ownerName}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Phone Number</span>
                <span className="font-bold text-sky-400">{selectedHotelForModal.phone}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">WhatsApp</span>
                <span className="font-bold text-emerald-400">{selectedHotelForModal.whatsappNumber || selectedHotelForModal.phone}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">₹99 Entry Fee</span>
                <span className="font-bold text-emerald-400">Paid ({selectedHotelForModal.entryFeeTxnId || 'ORD-99'})</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Free Trial Days</span>
                <span className="font-bold text-teal-300">{selectedHotelForModal.trialDaysLeft || 30} days remaining</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Hotel License</span>
                <span className="font-bold text-slate-300">{selectedHotelForModal.hotelLicenseNumber || 'Assam Tourism Certified'}</span>
              </div>
            </div>

            {/* Police Station Jurisdiction */}
            <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/40 text-xs">
              <span className="text-[10px] text-slate-400 block uppercase font-bold">Assam Police Jurisdiction</span>
              <div className="font-bold text-slate-200 mt-0.5">
                {selectedHotelForModal.policeStationName || 'Panbazar Police Station, Guwahati'}
              </div>
              <div className="text-[11px] text-slate-400">
                OC: {selectedHotelForModal.policeStationIncharge || 'Officer-in-Charge'} • WhatsApp: {selectedHotelForModal.policeStationWhatsApp || '+91 94350 12345'}
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedHotelForModal(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  const id = selectedHotelForModal.id;
                  setSelectedHotelForModal(null);
                  onSelectHotel(id);
                }}
                className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-black cursor-pointer shadow-md"
              >
                Open in Hotel Dashboard
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 5. CHANGE ADMIN PASSWORD MODAL */}
      {isChangePasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full shadow-2xl p-5 sm:p-6 text-white space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-400/20 text-amber-400">
                  <KeyRound className="w-5 h-5" />
                </div>
                <h3 className="text-base font-black text-white">
                  {t.changePassword}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsChangePasswordModalOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {pwdError && (
              <div className="p-3 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{pwdError}</span>
              </div>
            )}

            {pwdSuccess && (
              <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{pwdSuccess}</span>
              </div>
            )}

            <form onSubmit={handleChangePasswordSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                  {t.enterCurrentPassword}
                </label>
                <input
                  type="password"
                  value={pwdCurrent}
                  onChange={(e) => setPwdCurrent(e.target.value)}
                  placeholder="Current admin password"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-hidden focus:border-teal-500"
                />
              </div>

              <div className="relative py-1 text-center">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-800"></div></div>
                <span className="relative bg-slate-900 px-2 text-[10px] text-slate-400 uppercase font-bold">OR use Recovery Key</span>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                  {t.enterRecoveryKey}
                </label>
                <input
                  type="text"
                  value={pwdRecoveryKey}
                  onChange={(e) => setPwdRecoveryKey(e.target.value)}
                  placeholder="ORDERFIX-MASTER-RECOVER-2026"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs font-mono text-amber-300 focus:outline-hidden focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                  {t.enterNewPassword}
                </label>
                <input
                  type="password"
                  value={pwdNew}
                  onChange={(e) => setPwdNew(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-hidden focus:border-teal-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-300 uppercase tracking-wider mb-1">
                  {t.confirmNewPassword}
                </label>
                <input
                  type="password"
                  value={pwdConfirm}
                  onChange={(e) => setPwdConfirm(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white focus:outline-hidden focus:border-teal-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsChangePasswordModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-black cursor-pointer shadow-md"
                >
                  {t.saveNewPassword}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
