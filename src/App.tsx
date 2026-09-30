/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Room, Booking, HotelProfile, SubscriptionState, Expense, GuestVerificationData } from './types';
import {
  loadRooms,
  saveRooms,
  loadBookings,
  saveBookings,
  loadHotel,
  saveHotel,
  loadSubscription,
  saveSubscription,
  loadExpenses,
  saveExpenses,
  loadVerifications,
  saveVerifications,
  getTodayString,
  generateInitialBookings,
  DEFAULT_ROOMS,
  DEFAULT_HOTEL
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
  // Global State
  const [rooms, setRooms] = useState<Room[]>(() => loadRooms());
  const [bookings, setBookings] = useState<Booking[]>(() => loadBookings());
  const [hotel, setHotel] = useState<HotelProfile>(() => loadHotel());
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
    saveHotel(hotel);
  }, [hotel]);

  useEffect(() => {
    saveSubscription(subscription);
  }, [subscription]);

  useEffect(() => {
    saveExpenses(expenses);
  }, [expenses]);

  useEffect(() => {
    saveVerifications(verifications);
  }, [verifications]);

  // Handlers
  const handleSaveBooking = (newBooking: Booking, sendWhatsAppNow: boolean) => {
    setBookings((prev) => [newBooking, ...prev]);
    showToast(`✅ Room ${newBooking.roomNumber} বুক হ'ল! (${newBooking.guestName})`, 'success');

    if (sendWhatsAppNow) {
      setTimeout(() => {
        setWhatsAppBooking(newBooking);
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
    showToast('Guest checked out successfully! Room is now free.', 'success');
  };

  const handleAddExpense = (newExp: Expense) => {
    setExpenses((prev) => [newExp, ...prev]);
    showToast(`✅ খৰচ যোগ কৰা হ'ল: ₹${newExp.amount} (${newExp.title})`, 'info');
  };

  const handleDeleteExpense = (expId: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== expId));
    showToast('খৰচ আঁতৰোৱা হ\'ল', 'warning');
  };

  const handleAddVerification = (newV: GuestVerificationData) => {
    setVerifications((prev) => [newV, ...prev]);
    showToast(`✅ ${newV.guestName}-ৰ আই-ডি পুলিচ বহীত সংৰক্ষণ হ'ল!`, 'success');
  };

  const handleUpdateVerification = (updatedV: GuestVerificationData) => {
    setVerifications((prev) => prev.map((v) => (v.id === updatedV.id ? updatedV : v)));
    showToast(`তথ্য আপডেট হ'ল (${updatedV.guestName})`, 'info');
  };

  const handleDeleteVerification = (id: string) => {
    setVerifications((prev) => prev.filter((v) => v.id !== id));
    showToast('অতিথিৰ পুলিচ ৰেকৰ্ড আঁতৰোৱা হ\'ল', 'warning');
  };

  const handleUpdateHotelProfile = (updated: HotelProfile) => {
    setHotel(updated);
    saveHotel(updated);
    showToast('থানা আৰু হোটেলৰ তথ্য সংৰক্ষণ কৰা হ\'ল!', 'success');
  };

  const handleQuickBookRoom = (room: Room) => {
    if (room.isMaintenance) {
      setRooms((prev) =>
        prev.map((r) => (r.id === room.id ? { ...r, isMaintenance: false } : r))
      );
      showToast(`Room ${room.roomNumber} marked clean & available!`, 'success');
      return;
    }
    setPreselectedRoomForBooking(room);
    setIsAddBookingOpen(true);
  };

  const handleViewBooking = (booking: Booking, room?: Room) => {
    setSelectedBookingForDetails(booking);
    setSelectedRoomForDetails(room || rooms.find((r) => r.id === booking.roomId) || null);
  };

  const handleResetDemoData = () => {
    if (confirm('Reset to initial sample rooms and bookings for demonstration?')) {
      const freshRooms = DEFAULT_ROOMS;
      const freshBookings = generateInitialBookings();
      setRooms(freshRooms);
      setBookings(freshBookings);
      saveRooms(freshRooms);
      saveBookings(freshBookings);
      showToast('Sample data reset successfully!', 'info');
    }
  };

  // If Customer / Guest View is toggled active, display the guest-facing mobile portal!
  if (isCustomerViewActive) {
    return (
      <CustomerGuestView
        hotel={hotel}
        rooms={rooms}
        bookings={bookings}
        onBackToOwner={() => setIsCustomerViewActive(false)}
      />
    );
  }

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
          rooms={rooms}
          bookings={bookings}
          selectedDate={selectedDate}
          activeFilter={activeMetricFilter}
          onSelectFilter={setActiveMetricFilter}
          isCompactMode={isCompactMode}
        />

        {/* View Switcher Bar (ৰূম গ্ৰিড | তালিকা | হিচাপ-নিকাশ | পুলিচ ভেৰিফিকেচন) */}
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
              <span>তালিকা ({bookings.length})</span>
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
              <span>হিচাপ (Accounting 📊)</span>
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
              rooms={rooms}
              bookings={bookings}
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
                bookings={bookings}
                rooms={rooms}
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
              bookings={bookings}
              rooms={rooms}
              onViewBooking={handleViewBooking}
              onOpenWhatsApp={(b) => setWhatsAppBooking(b)}
              onCheckOutBooking={handleCheckOutBooking}
              onOpenPoliceVerification={() => setActiveViewTab('police')}
            />
          </div>
        ) : activeViewTab === 'accounting' ? (
          <div className="mt-2">
            {/* DEDICATED HOTEL ACCOUNTING & REVENUE LEDGER */}
            <HotelAccounting
              bookings={bookings}
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
              bookings={bookings}
              rooms={rooms}
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
        bookingsCount={bookings.length}
      />

      {/* Footer (Desktop) */}
      <footer className="hidden md:block mt-12 bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-900">ORDERFIX</span>
            <span>• Pocket-friendly Booking Sync for Small Hotels, Homestays & Resorts</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] flex-wrap">
            <button
              onClick={() => setActiveViewTab('police')}
              className="text-rose-800 hover:text-rose-950 font-bold underline cursor-pointer"
            >
              পুলিচ ৰিপৰ্ট (Police Log 👮)
            </button>
            <button
              onClick={() => setActiveViewTab('accounting')}
              className="text-amber-800 hover:text-amber-950 font-bold underline cursor-pointer"
            >
              হোটেল হিচাপ (Accounting 📊)
            </button>
            <button
              onClick={() => setIsPricingOpen(true)}
              className="text-teal-700 hover:text-teal-900 font-bold underline cursor-pointer"
            >
              Pricing Details
            </button>
            <button
              onClick={() => setIsHotelSettingsOpen(true)}
              className="text-slate-600 hover:text-slate-900 font-medium cursor-pointer"
            >
              Property Settings
            </button>
            <button
              onClick={() => setIsCustomerViewActive(true)}
              className="text-emerald-700 hover:text-emerald-900 font-bold cursor-pointer"
            >
              Guest Mobile View 📱
            </button>
          </div>
        </div>
      </footer>

      {/* MODALS */}
      
      {/* 1. Dual Booking Mode Form */}
      <AddBookingModal
        isOpen={isAddBookingOpen}
        onClose={() => {
          setIsAddBookingOpen(false);
          setPreselectedRoomForBooking(null);
        }}
        rooms={rooms}
        bookings={bookings}
        preselectedRoom={preselectedRoomForBooking}
        defaultDate={selectedDate}
        onSaveBooking={handleSaveBooking}
      />

      {/* 2. Booking Details & Status Modal */}
      <BookingDetailsModal
        isOpen={!!selectedBookingForDetails}
        onClose={() => {
          setSelectedBookingForDetails(null);
          setSelectedRoomForDetails(null);
        }}
        booking={selectedBookingForDetails}
        room={selectedRoomForDetails}
        hotel={hotel}
        onUpdateBooking={handleUpdateBooking}
        onDeleteBooking={handleDeleteBooking}
        onOpenWhatsApp={(b) => setWhatsAppBooking(b)}
        onPrintSlip={(b) => setPrintSlipBooking(b)}
      />

      {/* 3. WhatsApp Direct Preview & Sender Modal */}
      <WhatsAppPreviewModal
        isOpen={!!whatsAppBooking}
        onClose={() => setWhatsAppBooking(null)}
        booking={whatsAppBooking}
        hotel={hotel}
      />

      {/* 4. Guest Check-in Pass / Receipt Print Slip Modal */}
      <PrintSlipModal
        isOpen={!!printSlipBooking}
        onClose={() => setPrintSlipBooking(null)}
        booking={printSlipBooking}
        hotel={hotel}
      />

      {/* 5. Subscription & Pricing Modal (₹99/mo or ₹999/yr) */}
      <PricingModal
        isOpen={isPricingOpen}
        onClose={() => setIsPricingOpen(false)}
        subscription={subscription}
        onUpdateSubscription={(newSub) => {
          setSubscription(newSub);
          showToast('Pro Plan active! Thank you for supporting Orderfix.', 'success');
        }}
      />

      {/* 6. Room Inventory & Tariff Manager */}
      <RoomManagerModal
        isOpen={isRoomManagerOpen}
        onClose={() => setIsRoomManagerOpen(false)}
        rooms={rooms}
        onUpdateRooms={(updated) => {
          setRooms(updated);
          showToast('Room inventory updated.', 'info');
        }}
      />

      {/* 7. Hotel Profile & WhatsApp Settings */}
      <HotelSettingsModal
        isOpen={isHotelSettingsOpen}
        onClose={() => setIsHotelSettingsOpen(false)}
        hotel={hotel}
        onSaveHotel={(updated) => {
          setHotel(updated);
          showToast('Property settings saved.', 'success');
        }}
      />

    </div>
  );
}
