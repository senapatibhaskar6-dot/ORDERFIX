/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Room, Booking, HotelProfile, SubscriptionState, Expense, GuestVerificationData, User } from './types';
import {
  loadRooms,
  saveRooms,
  loadBookings,
  saveBookings,
  loadHotel,
  saveHotel,
  loadHotels,
  saveHotels,
  loadActiveHotelId,
  saveActiveHotelId,
  isHotelRegistered,
  setHotelRegistered,
  loadSubscription,
  saveSubscription,
  loadExpenses,
  saveExpenses,
  loadVerifications,
  saveVerifications,
  loadAuthUser,
  saveAuthUser,
  getTodayString,
  generateInitialBookings,
  DEFAULT_ROOMS,
  DEFAULT_HOTEL,
  DEFAULT_HOTELS
} from './utils/storage';
import { Navbar } from './components/Navbar';
import { PricingBanner } from './components/PricingBanner';
import { MetricsCards } from './components/MetricsCards';
import { RoomGrid } from './components/RoomGrid';
import { BookingsTable } from './components/BookingsTable';
import { AddBookingModal } from './components/AddBookingModal';
import { BookingDetailsModal } from './components/BookingDetailsModal';
import { WhatsAppPreviewModal } from './components/WhatsAppPreviewModal';
import { PricingModal } from './components/PricingModal';
import { RoomManagerModal } from './components/RoomManagerModal';
import { HotelSettingsModal } from './components/HotelSettingsModal';
import { PrintSlipModal } from './components/PrintSlipModal';
import { CustomerGuestView } from './components/CustomerGuestView';
import { MobileBottomNav } from './components/MobileBottomNav';
import { HotelAccounting } from './components/HotelAccounting';
import { PoliceVerificationView } from './components/PoliceVerificationView';
import { RegistrationScreen } from './components/RegistrationScreen';
import { AuthModal } from './components/AuthModal';
import {
  LayoutGrid,
  List,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Info,
  Smartphone,
  BedDouble,
  Plus,
  DollarSign
} from 'lucide-react';

export default function App() {
  // Multi-Vendor Hotels List
  const [hotels, setHotels] = useState<HotelProfile[]>(() => loadHotels());
  const [activeHotelId, setActiveHotelId] = useState<string>(() => loadActiveHotelId());

  // Registration Status & New Property Onboarding
  const [isRegistered, setIsRegistered] = useState<boolean>(() => isHotelRegistered());
  const [isRegisteringNewHotel, setIsRegisteringNewHotel] = useState(false);

  // Authentication State (Hotel Owners & Customers)
  const [authUser, setAuthUser] = useState<User | null>(() => loadAuthUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authInitialRole, setAuthInitialRole] = useState<'owner' | 'customer'>('owner');

  const handleLoginSuccess = (user: User) => {
    setAuthUser(user);
    saveAuthUser(user);
    if (user.role === 'owner') {
      setHotelRegistered(true);
      setIsRegistered(true);
    }
    showToast(`🎉 স্বাগতম ${user.name}! সফলভাৱে লগইন হ'ল`, 'success');
  };

  const handleLogout = () => {
    setAuthUser(null);
    saveAuthUser(null);
    showToast('লগআউট সফল হ’ল (Logged out successfully)', 'info');
  };

  const handleOpenAuth = (role: 'owner' | 'customer' = 'owner') => {
    setAuthInitialRole(role);
    setIsAuthModalOpen(true);
  };

  // Active Hotel Entity
  const hotel = hotels.find((h) => h.id === activeHotelId) || hotels[0] || DEFAULT_HOTEL;

  // Global State
  const [rooms, setRooms] = useState<Room[]>(() => loadRooms());
  const [bookings, setBookings] = useState<Booking[]>(() => loadBookings());
  const [subscription, setSubscription] = useState<SubscriptionState>(() => loadSubscription());
  const [expenses, setExpenses] = useState<Expense[]>(() => loadExpenses());
  const [verifications, setVerifications] = useState<GuestVerificationData[]>(() => loadVerifications());
  
  // Navigation & Filtering State: 'grid' | 'table' | 'accounting' | 'police'
  const [selectedDate, setSelectedDate] = useState<string>(() => getTodayString());
  const [activeMetricFilter, setActiveMetricFilter] = useState<'all' | 'available' | 'offline' | 'online' | 'today_arrivals'>('all');
  const [activeViewTab, setActiveViewTab] = useState<'grid' | 'table' | 'accounting' | 'police'>('grid');

  // Compact Mode State: shrinks cards & padding to fit entire screen on mobile!
  const [isCompactMode, setIsCompactMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('orderfix_compact');
      if (saved !== null) return saved === 'true';
      return typeof window !== 'undefined' ? window.innerWidth < 640 : false;
    } catch {
      return false;
    }
  });

  const toggleCompactMode = () => {
    setIsCompactMode((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('orderfix_compact', String(next));
      } catch {}
      showToast(next ? 'সৰু স্ক্ৰীণ সক্ৰিয় (Compact Mode Active)' : 'সাধাৰণ দৃশ্য (Normal Mode)', 'info');
      return next;
    });
  };

  // Dedicated Customer / Guest Mobile View ("Grahoke mobillt sabo pare")
  const [isCustomerViewActive, setIsCustomerViewActive] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const search = window.location.search;
      return search.includes('view=guest') || search.includes('guest=1');
    }
    return false;
  });

  // Modal States
  const [isAddBookingOpen, setIsAddBookingOpen] = useState(false);
  const [preselectedRoomForBooking, setPreselectedRoomForBooking] = useState<Room | null>(null);
  
  const [selectedBookingForDetails, setSelectedBookingForDetails] = useState<Booking | null>(null);
  const [selectedRoomForDetails, setSelectedRoomForDetails] = useState<Room | null>(null);

  const [whatsAppBooking, setWhatsAppBooking] = useState<Booking | null>(null);
  const [printSlipBooking, setPrintSlipBooking] = useState<Booking | null>(null);

  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [isRoomManagerOpen, setIsRoomManagerOpen] = useState(false);
  const [isHotelSettingsOpen, setIsHotelSettingsOpen] = useState(false);

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState<{
    text: string;
    type: 'success' | 'info' | 'warning';
  } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Sync to LocalStorage
  useEffect(() => {
    saveRooms(rooms);
  }, [rooms]);

  useEffect(() => {
    saveBookings(bookings);
  }, [bookings]);

  useEffect(() => {
    saveHotels(hotels);
  }, [hotels]);

  useEffect(() => {
    saveActiveHotelId(activeHotelId);
  }, [activeHotelId]);

  useEffect(() => {
    saveSubscription(subscription);
  }, [subscription]);

  useEffect(() => {
    saveExpenses(expenses);
  }, [expenses]);

  useEffect(() => {
    saveVerifications(verifications);
  }, [verifications]);

  // Hotel Multi-Vendor Switcher Handler
  const handleSelectHotel = (hotelId: string) => {
    setActiveHotelId(hotelId);
    saveActiveHotelId(hotelId);
    const selected = hotels.find((h) => h.id === hotelId);
    if (selected) {
      saveHotel(selected);
      showToast(`সক্ৰিয় হোটেল: ${selected.name}`, 'info');
    }
  };

  // Registration Complete Handler
  const handleCompleteRegistration = (newHotelData: HotelProfile, newRoomsData: Room[]) => {
    const updatedHotels = [newHotelData, ...hotels.filter((h) => h.id !== newHotelData.id)];
    setHotels(updatedHotels);
    saveHotels(updatedHotels);
    setActiveHotelId(newHotelData.id);
    saveActiveHotelId(newHotelData.id);
    saveHotel(newHotelData);

    if (newRoomsData.length > 0) {
      const updatedRooms = [...rooms, ...newRoomsData];
      setRooms(updatedRooms);
      saveRooms(updatedRooms);
    }

    setHotelRegistered(true);
    setIsRegistered(true);
    setIsRegisteringNewHotel(false);

    showToast(`🎉 ${newHotelData.name} পঞ্জীয়ন সফল হ'ল! ₹৯৯ এণ্ট্ৰী মাচুল পৰিশোধিত & ১ম মাহ বিনামূলীয়া চাবস্ক্ৰিপচন সক্ৰিয়!`, 'success');
  };

  // Handlers
  const handleSaveBooking = (newBooking: Booking, sendWhatsAppNow: boolean) => {
    const taggedBooking: Booking = {
      ...newBooking,
      hotelId: newBooking.hotelId || hotel.id
    };

    setBookings((prev) => [taggedBooking, ...prev]);
    showToast(`✅ Room ${taggedBooking.roomNumber} বুক হ'ল! (${taggedBooking.guestName})`, 'success');

    if (sendWhatsAppNow) {
      setTimeout(() => {
        setWhatsAppBooking(taggedBooking);
      }, 300);
    }
  };

  const handleUpdateBooking = (updated: Booking) => {
    setBookings((prev) => prev.map((b) => (b.id === updated.id ? updated : b)));
    setSelectedBookingForDetails(updated);
    showToast(`Updated reservation #${updated.id.slice(-6).toUpperCase()}`, 'info');
  };

  const handleDeleteBooking = (bookingId: string) => {
    setBookings((prev) => prev.filter((b) => b.id !== bookingId));
    showToast('Booking cancelled. Room is now free & available!', 'warning');
  };

  const handleCheckOutBooking = (bookingId: string) => {
    setBookings((prev) =>
      prev.map((b) =>
        b.id === bookingId ? { ...b, status: 'checked_out' } : b
      )
    );
    showToast('Guest checked out successfully!', 'success');
  };

  const handleQuickBookRoom = (room: Room) => {
    setPreselectedRoomForBooking(room);
    setIsAddBookingOpen(true);
  };

  const handleViewBooking = (booking: Booking) => {
    const room = rooms.find((r) => r.id === booking.roomId) || null;
    setSelectedBookingForDetails(booking);
    setSelectedRoomForDetails(room);
  };

  const handleAddExpense = (newExp: Expense) => {
    const taggedExpense = {
      ...newExp,
      hotelId: hotel.id
    };
    setExpenses((prev) => [taggedExpense, ...prev]);
    showToast(`খৰচ লিপিবদ্ধ হ'ল: ₹${newExp.amount.toLocaleString('en-IN')}`, 'success');
  };

  const handleDeleteExpense = (expId: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== expId));
    showToast('খৰচ মচি পেলোৱা হ’ল', 'warning');
  };

  const handleAddVerification = (newV: GuestVerificationData) => {
    const taggedVerification = {
      ...newV,
      hotelId: hotel.id
    };
    setVerifications((prev) => [taggedVerification, ...prev]);
    showToast(`পুলিচ ৰিপৰ্ট যোগ হ'ল (${newV.guestName})`, 'success');
  };

  const handleUpdateVerification = (updatedV: GuestVerificationData) => {
    setVerifications((prev) => prev.map((v) => (v.id === updatedV.id ? updatedV : v)));
    showToast(`পুলিচ ৰিপৰ্ট আপডেট হ'ল (${updatedV.guestName})`, 'info');
  };

  const handleDeleteVerification = (id: string) => {
    setVerifications((prev) => prev.filter((v) => v.id !== id));
    showToast('পুলিচ ৰিপৰ্ট মচি দিয়া হ’ল', 'warning');
  };

  const handleUpdateHotelProfile = (updatedProfile: HotelProfile) => {
    const updatedHotels = hotels.map((h) => (h.id === updatedProfile.id ? updatedProfile : h));
    setHotels(updatedHotels);
    saveHotels(updatedHotels);
    saveHotel(updatedProfile);
    showToast('হোটেলৰ তথ্য সংৰক্ষণ কৰা হ’ল', 'success');
  };

  const handleResetDemoData = () => {
    if (confirm('Reset to standard sample rooms & test reservations?')) {
      const freshRooms = DEFAULT_ROOMS;
      const freshBookings = generateInitialBookings();
      setRooms(freshRooms);
      setBookings(freshBookings);
      saveRooms(freshRooms);
      saveBookings(freshBookings);
      showToast('Sample data reset successfully!', 'info');
    }
  };

  // Filter rooms for the active hotel
  const activeRooms = rooms.filter((r) => !r.hotelId || r.hotelId === hotel.id);
  const activeBookings = bookings.filter((b) => !b.hotelId || b.hotelId === hotel.id);

  // 1. FIRST-TIME REGISTRATION OR ONBOARDING NEW PROPERTY
  if (!isRegistered || isRegisteringNewHotel) {
    return (
      <>
        <RegistrationScreen
          onCompleteRegistration={handleCompleteRegistration}
          onCancel={isRegisteringNewHotel ? () => setIsRegisteringNewHotel(false) : undefined}
          onOpenLogin={() => handleOpenAuth('owner')}
        />
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onLoginSuccess={handleLoginSuccess}
          onOpenHotelRegistration={() => {
            setIsAuthModalOpen(false);
            setIsRegisteringNewHotel(true);
          }}
          initialRole={authInitialRole}
        />
      </>
    );
  }

  // 2. CUSTOMER / GUEST MARKETPLACE VIEW
  if (isCustomerViewActive) {
    return (
      <>
        <CustomerGuestView
          hotels={hotels}
          activeHotel={hotel}
          onSelectHotel={handleSelectHotel}
          rooms={rooms}
          bookings={bookings}
          onSaveBooking={handleSaveBooking}
          onBackToOwner={() => setIsCustomerViewActive(false)}
        />
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onLoginSuccess={handleLoginSuccess}
          onOpenHotelRegistration={() => {
            setIsAuthModalOpen(false);
            setIsRegisteringNewHotel(true);
          }}
          initialRole={authInitialRole}
        />
      </>
    );
  }

  // 3. HOTEL OWNER DASHBOARD & DUAL-BOOKING MANAGEMENT
  return (
    <div className={`min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans pb-24 md:pb-0 overflow-x-hidden w-full max-w-full ${isCompactMode ? 'compact-mode' : ''}`}>
      
      {/* Toast Notification Container */}
      {toastMessage && (
        <div className="fixed bottom-20 md:bottom-5 right-3 md:right-5 z-50 animate-in slide-in-from-bottom-5 duration-200 max-w-xs sm:max-w-sm">
          <div
            className={`px-3.5 py-2.5 rounded-xl shadow-xl border flex items-center gap-2 text-xs font-bold ${
              toastMessage.type === 'success'
                ? 'bg-[#0B2545] text-white border-teal-500'
                : toastMessage.type === 'warning'
                ? 'bg-rose-900 text-white border-rose-500'
                : 'bg-slate-900 text-white border-slate-700'
            }`}
          >
            {toastMessage.type === 'success' && (
              <CheckCircle2 className="w-4 h-4 text-[#00E5A3] shrink-0" />
            )}
            {toastMessage.type === 'warning' && (
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            {toastMessage.type === 'info' && (
              <Info className="w-4 h-4 text-sky-400 shrink-0" />
            )}
            <span className="truncate">{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Main Navigation Bar */}
      <Navbar
        hotel={hotel}
        hotels={hotels}
        onSelectHotel={handleSelectHotel}
        onOpenNewHotelRegistration={() => setIsRegisteringNewHotel(true)}
        subscription={subscription}
        selectedDate={selectedDate}
        isCompactMode={isCompactMode}
        onToggleCompactMode={toggleCompactMode}
        onDateChange={setSelectedDate}
        onOpenAddBooking={() => {
          setPreselectedRoomForBooking(null);
          setIsAddBookingOpen(true);
        }}
        onOpenPricing={() => setIsPricingOpen(true)}
        onOpenHotelSettings={() => setIsHotelSettingsOpen(true)}
        onOpenRoomManager={() => setIsRoomManagerOpen(true)}
        onResetDemoData={handleResetDemoData}
        onOpenCustomerView={() => setIsCustomerViewActive(true)}
        onOpenAccounting={() => setActiveViewTab('accounting')}
        onOpenPoliceVerification={() => setActiveViewTab('police')}
        authUser={authUser}
        onOpenAuth={() => handleOpenAuth('owner')}
        onLogout={handleLogout}
      />

      {/* Mobile Sticky Quick Action Bar */}
      <div className="md:hidden bg-gradient-to-r from-[#0B2545] to-[#123661] text-white px-2 sm:px-3 py-1.5 flex items-center justify-between text-xs shadow-md gap-1">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveViewTab('police')}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg font-bold text-[11px] transition-colors cursor-pointer ${
              activeViewTab === 'police'
                ? 'bg-rose-600 text-white font-black'
                : 'bg-white/15 text-rose-200'
            }`}
            title="পুলিচ ভেৰিফিকেচন"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>পুলিচ</span>
          </button>

          <button
            onClick={() => setActiveViewTab('accounting')}
            className={`flex items-center gap-1 px-2 py-1 rounded-lg font-bold text-[11px] transition-colors cursor-pointer ${
              activeViewTab === 'accounting'
                ? 'bg-amber-400 text-slate-950 font-black'
                : 'bg-white/15 text-amber-200'
            }`}
            title="হোটেল একাউণ্টিং"
          >
            <DollarSign className="w-3 h-3" />
            <span>হিচাপ</span>
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              setPreselectedRoomForBooking(null);
              setIsAddBookingOpen(true);
            }}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#00B686] hover:bg-[#00c793] text-white font-black text-[11px] shadow-xs cursor-pointer active:scale-95"
            title="কোঠা বুক কৰক"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+বুক</span>
          </button>
        </div>
      </div>

      {/* Dashboard Body Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-2 sm:px-6 lg:px-8 py-2.5 sm:py-5">
        
        {/* Commercial Pro Plan Banner */}
        <PricingBanner
          subscription={subscription}
          onOpenPricing={() => setIsPricingOpen(true)}
        />

        {/* Dashboard Overview Cards */}
        <MetricsCards
          rooms={activeRooms}
          bookings={activeBookings}
          selectedDate={selectedDate}
          activeFilter={activeMetricFilter}
          onSelectFilter={setActiveMetricFilter}
          isCompactMode={isCompactMode}
        />

        {/* View Switcher Bar */}
        <div className="flex items-center justify-between mt-3 mb-2 flex-wrap gap-2">
          <div className="flex items-center gap-1 bg-slate-200/90 p-0.5 sm:p-1 rounded-xl flex-wrap">
            <button
              onClick={() => setActiveViewTab('grid')}
              className={`flex items-center gap-1 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
                activeViewTab === 'grid'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>ৰূম গ্ৰিড (Grid)</span>
            </button>

            <button
              onClick={() => setActiveViewTab('table')}
              className={`flex items-center gap-1 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
                activeViewTab === 'table'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              <span>তালিকা ({activeBookings.length})</span>
            </button>

            {/* ACCOUNTING TAB */}
            <button
              onClick={() => setActiveViewTab('accounting')}
              className={`flex items-center gap-1 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
                activeViewTab === 'accounting'
                  ? 'bg-amber-400 text-slate-950 shadow-md font-black'
                  : 'text-amber-900 hover:text-amber-950 hover:bg-amber-100/60'
              }`}
            >
              <DollarSign className="w-3.5 h-3.5 text-amber-800" />
              <span>হিচাপ & ৫% কমিছন (Accounting 📊)</span>
            </button>

            {/* POLICE VERIFICATION TAB */}
            <button
              onClick={() => setActiveViewTab('police')}
              className={`flex items-center gap-1 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-black transition-all cursor-pointer ${
                activeViewTab === 'police'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-rose-900 hover:text-rose-950 hover:bg-rose-100/60'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-rose-500" />
              <span>পুলিচ ভেৰিফিকেচন (Police 👮)</span>
            </button>
          </div>

          <div className="flex items-center gap-1.5 text-xs">
            <button
              onClick={() => setIsCustomerViewActive(true)}
              className="flex items-center gap-1 px-2 sm:px-3 py-1 rounded-xl bg-emerald-50 text-emerald-800 font-bold border border-emerald-200 hover:bg-emerald-100 transition-colors text-[11px] sm:text-xs cursor-pointer"
            >
              <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
              <span>গ্ৰাহক পৰ্টেল 📱</span>
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        {activeViewTab === 'grid' ? (
          <div className="mt-2">
            <RoomGrid
              rooms={activeRooms}
              bookings={activeBookings}
              selectedDate={selectedDate}
              activeFilter={activeMetricFilter}
              onQuickBookRoom={handleQuickBookRoom}
              onViewBooking={handleViewBooking}
              onOpenWhatsApp={(b) => setWhatsAppBooking(b)}
              onCheckOutBooking={handleCheckOutBooking}
              isCompactMode={isCompactMode}
            />

            {/* Also show recent table below grid for convenience on desktop */}
            <div className="hidden md:block mt-6">
              <BookingsTable
                bookings={activeBookings}
                rooms={activeRooms}
                onViewBooking={handleViewBooking}
                onOpenWhatsApp={(b) => setWhatsAppBooking(b)}
                onCheckOutBooking={handleCheckOutBooking}
                onOpenPoliceVerification={() => setActiveViewTab('police')}
              />
            </div>
          </div>
        ) : activeViewTab === 'table' ? (
          <div className="mt-2">
            <BookingsTable
              bookings={activeBookings}
              rooms={activeRooms}
              onViewBooking={handleViewBooking}
              onOpenWhatsApp={(b) => setWhatsAppBooking(b)}
              onCheckOutBooking={handleCheckOutBooking}
              onOpenPoliceVerification={() => setActiveViewTab('police')}
            />
          </div>
        ) : activeViewTab === 'accounting' ? (
          <div className="mt-2">
            {/* DEDICATED HOTEL ACCOUNTING, COMMISSION & REVENUE LEDGER */}
            <HotelAccounting
              bookings={activeBookings}
              hotel={hotel}
              expenses={expenses}
              onAddExpense={handleAddExpense}
              onDeleteExpense={handleDeleteExpense}
              onOpenWhatsApp={(b) => setWhatsAppBooking(b)}
            />
          </div>
        ) : (
          <div className="mt-2">
            {/* DEDICATED POLICE VERIFICATION & GUEST REPORTING MODULE */}
            <PoliceVerificationView
              hotel={hotel}
              bookings={activeBookings}
              rooms={activeRooms}
              verifications={verifications}
              onAddVerification={handleAddVerification}
              onUpdateVerification={handleUpdateVerification}
              onDeleteVerification={handleDeleteVerification}
              onUpdateHotelProfile={handleUpdateHotelProfile}
            />
          </div>
        )}

      </main>

      {/* Mobile App Bottom Navigation Bar */}
      <MobileBottomNav
        activeTab={activeViewTab}
        onSelectTab={setActiveViewTab}
        onOpenAddBooking={() => {
          setPreselectedRoomForBooking(null);
          setIsAddBookingOpen(true);
        }}
        onOpenCustomerView={() => setIsCustomerViewActive(true)}
        bookingsCount={activeBookings.length}
      />

      {/* Footer (Desktop) */}
      <footer className="hidden md:block mt-12 bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-900">ORDERFIX</span>
            <span>• মাল্টি-ভেণ্ডৰ হোটেল ব্যৱস্থাপনা, চাবস্ক্ৰিপচন & ৫% প্লেটফৰ্ম কমিছন প্লেটফৰ্ম</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Assam Police Form-C / Daily Register Compliant • Pocket-Friendly
          </div>
        </div>
      </footer>

      {/* Add Booking Modal */}
      <AddBookingModal
        isOpen={isAddBookingOpen}
        onClose={() => setIsAddBookingOpen(false)}
        rooms={activeRooms}
        bookings={activeBookings}
        preselectedRoom={preselectedRoomForBooking}
        defaultDate={selectedDate}
        onSaveBooking={handleSaveBooking}
      />

      {/* Booking Details Modal */}
      {selectedBookingForDetails && (
        <BookingDetailsModal
          isOpen={!!selectedBookingForDetails}
          onClose={() => setSelectedBookingForDetails(null)}
          booking={selectedBookingForDetails}
          room={selectedRoomForDetails}
          hotel={hotel}
          onUpdateBooking={handleUpdateBooking}
          onDeleteBooking={handleDeleteBooking}
          onOpenWhatsApp={(b) => setWhatsAppBooking(b)}
          onPrintSlip={(b) => setPrintSlipBooking(b)}
        />
      )}

      {/* WhatsApp Message Preview Modal */}
      {whatsAppBooking && (
        <WhatsAppPreviewModal
          isOpen={!!whatsAppBooking}
          onClose={() => setWhatsAppBooking(null)}
          booking={whatsAppBooking}
          hotel={hotel}
        />
      )}

      {/* Print Slip Modal */}
      {printSlipBooking && (
        <PrintSlipModal
          isOpen={!!printSlipBooking}
          onClose={() => setPrintSlipBooking(null)}
          booking={printSlipBooking}
          hotel={hotel}
        />
      )}

      {/* Room Manager Modal */}
      <RoomManagerModal
        isOpen={isRoomManagerOpen}
        onClose={() => setIsRoomManagerOpen(false)}
        rooms={rooms}
        hotelId={hotel.id}
        onUpdateRooms={(newRooms) => {
          setRooms(newRooms);
          saveRooms(newRooms);
          showToast('কোঠাৰ তালিকা আপডেট হ’ল', 'success');
        }}
      />

      {/* Hotel Settings Modal */}
      <HotelSettingsModal
        isOpen={isHotelSettingsOpen}
        onClose={() => setIsHotelSettingsOpen(false)}
        hotel={hotel}
        onSaveHotel={(updatedHotel) => {
          handleUpdateHotelProfile(updatedHotel);
        }}
      />

      {/* Pricing & Subscription Modal */}
      <PricingModal
        isOpen={isPricingOpen}
        onClose={() => setIsPricingOpen(false)}
        subscription={subscription}
        onUpdateSubscription={(newSub) => {
          setSubscription(newSub);
          saveSubscription(newSub);
          showToast('Subscription plan updated!', 'success');
        }}
      />

      {/* Authentication Login & Signup Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        onOpenHotelRegistration={() => {
          setIsAuthModalOpen(false);
          setIsRegisteringNewHotel(true);
        }}
        initialRole={authInitialRole}
      />

    </div>
  );
}
