import React, { useState } from 'react';
import { Booking, HotelProfile, Expense, ExpenseCategory } from '../types';
import { formatDateShort, formatDateFull, formatSourceName } from '../utils/bookingEngine';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Clock,
  Plus,
  Trash2,
  Download,
  Printer,
  Calendar,
  CreditCard,
  Building,
  CheckCircle2,
  AlertCircle,
  PieChart,
  Filter,
  FileText,
  Search,
  MessageCircle,
  Phone
} from 'lucide-react';

interface HotelAccountingProps {
  bookings: Booking[];
  hotel: HotelProfile;
  expenses: Expense[];
  onAddExpense: (expense: Expense) => void;
  onDeleteExpense: (expenseId: string) => void;
  onOpenWhatsApp: (booking: Booking) => void;
}

export const HotelAccounting: React.FC<HotelAccountingProps> = ({
  bookings,
  hotel,
  expenses,
  onAddExpense,
  onDeleteExpense,
  onOpenWhatsApp
}) => {
  const today = new Date().toISOString().split('T')[0];

  // Timeframe filter state
  const [timeframe, setTimeframe] = useState<'today' | 'this_week' | 'this_month' | 'all'>('this_month');
  const [filterPaymentMode, setFilterPaymentMode] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Add Expense Modal / Toggle State
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [expTitle, setExpTitle] = useState('');
  const [expAmount, setExpAmount] = useState('');
  const [expCategory, setExpCategory] = useState<ExpenseCategory>('supplies');
  const [expPaymentMethod, setExpPaymentMethod] = useState<'cash' | 'upi' | 'bank'>('cash');
  const [expNotes, setExpNotes] = useState('');

  // Helper date filters
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const startOfWeek = (() => {
    const d = new Date(now);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    return d.toISOString().split('T')[0];
  })();

  // Filter Bookings by timeframe
  const filteredBookings = bookings.filter((b) => {
    if (b.status === 'cancelled') return false;

    if (timeframe === 'today') {
      if (b.checkInDate !== today && b.checkOutDate !== today) return false;
    } else if (timeframe === 'this_week') {
      if (b.checkInDate < startOfWeek) return false;
    } else if (timeframe === 'this_month') {
      if (b.checkInDate < startOfMonth) return false;
    }

    if (filterPaymentMode !== 'all') {
      if (b.paymentMethod !== filterPaymentMode) return false;
    }

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchName = b.guestName.toLowerCase().includes(q);
      const matchRoom = b.roomNumber.includes(q);
      const matchPhone = b.guestPhone.includes(q);
      return matchName || matchRoom || matchPhone;
    }

    return true;
  });

  // Filter Expenses by timeframe
  const filteredExpenses = expenses.filter((e) => {
    if (timeframe === 'today') {
      return e.date === today;
    } else if (timeframe === 'this_week') {
      return e.date >= startOfWeek;
    } else if (timeframe === 'this_month') {
      return e.date >= startOfMonth;
    }
    return true;
  });

  // Financial Calculations
  const totalGrossRevenue = filteredBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);
  const totalCollectedAdvance = filteredBookings.reduce((sum, b) => sum + (b.advancePaid || 0), 0);
  const totalPendingDue = filteredBookings.reduce(
    (sum, b) => sum + Math.max(0, (b.totalAmount || 0) - (b.advancePaid || 0)),
    0
  );
  const totalExpenses = filteredExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const netProfit = totalCollectedAdvance - totalExpenses;

  // Channel Breakdown
  const directOfflineRevenue = filteredBookings
    .filter((b) => b.channel === 'offline')
    .reduce((sum, b) => sum + (b.totalAmount || 0), 0);
  const onlineOTARevenue = filteredBookings
    .filter((b) => b.channel === 'online')
    .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

  // Payment Mode Breakdown
  const cashCollected = filteredBookings
    .filter((b) => b.paymentMethod === 'cash')
    .reduce((sum, b) => sum + (b.advancePaid || 0), 0);
  const upiCollected = filteredBookings
    .filter((b) => b.paymentMethod === 'upi')
    .reduce((sum, b) => sum + (b.advancePaid || 0), 0);
  const cardCollected = filteredBookings
    .filter((b) => b.paymentMethod === 'card')
    .reduce((sum, b) => sum + (b.advancePaid || 0), 0);
  const onlinePortalCollected = filteredBookings
    .filter((b) => b.paymentMethod === 'online_portal')
    .reduce((sum, b) => sum + (b.advancePaid || 0), 0);

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!expTitle.trim() || !expAmount) return;

    const newExpense: Expense = {
      id: `exp-${Date.now()}`,
      title: expTitle.trim(),
      category: expCategory,
      amount: Number(expAmount) || 0,
      date: today,
      paymentMethod: expPaymentMethod,
      notes: expNotes.trim() || undefined,
      createdAt: new Date().toISOString()
    };

    onAddExpense(newExpense);
    setExpTitle('');
    setExpAmount('');
    setExpNotes('');
    setIsAddingExpense(false);
  };

  const handleExportCSV = () => {
    const headers = ['Type', 'Date', 'Room/Category', 'Guest/Title', 'Method', 'Total (₹)', 'Paid (₹)', 'Due (₹)'];
    const bookingRows = filteredBookings.map((b) => [
      'Booking',
      b.checkInDate,
      `Room ${b.roomNumber}`,
      `"${b.guestName}"`,
      b.paymentMethod,
      b.totalAmount,
      b.advancePaid,
      Math.max(0, b.totalAmount - b.advancePaid)
    ]);
    const expenseRows = filteredExpenses.map((e) => [
      'Expense',
      e.date,
      e.category,
      `"${e.title}"`,
      e.paymentMethod,
      e.amount,
      e.amount,
      0
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...bookingRows.map((r) => r.join(',')), ...expenseRows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Orderfix_Accounting_${today}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-4 max-w-7xl mx-auto pb-10">
      
      {/* Top Banner & Header */}
      <div className="bg-gradient-to-r from-[#0B2545] via-[#123966] to-[#0A223E] text-white p-4 sm:p-6 rounded-3xl shadow-lg border border-slate-700/40 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider bg-[#00B686] text-slate-950 px-2.5 py-0.5 rounded-full shadow-xs">
                হোটেল একাউণ্টিং আৰু ৰাজহ বহী
              </span>
              <span className="text-xs text-slate-300">
                {hotel.name}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              হিচাপ-নিকাশ আৰু আয়-ব্যয় (Financial Accounting)
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              মুঠ উপাৰ্জন, প্ৰাপ্ত নগদ/ইউপিআই ধন, বাকী ৰখা ধন আৰু খৰচৰ সম্পূৰ্ণ খতিয়ান
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => setIsAddingExpense(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-teal-500 hover:bg-teal-600 text-slate-950 font-black text-xs shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ খৰচ যোগ কৰক (Add Expense)</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-colors cursor-pointer"
              title="Download CSV Excel report"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">এক্সপ'ৰ্ট</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-colors cursor-pointer"
              title="Print Financial Statement"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">প্ৰিণ্ট</span>
            </button>
          </div>
        </div>

        {/* Timeframe Selector Pills */}
        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between flex-wrap gap-2 text-xs font-bold relative z-10">
          <div className="flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setTimeframe('today')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                timeframe === 'today'
                  ? 'bg-[#00B686] text-slate-950 font-black shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              আজি (Today)
            </button>
            <button
              onClick={() => setTimeframe('this_week')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                timeframe === 'this_week'
                  ? 'bg-[#00B686] text-slate-950 font-black shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              এই সপ্তাহ (Week)
            </button>
            <button
              onClick={() => setTimeframe('this_month')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                timeframe === 'this_month'
                  ? 'bg-[#00B686] text-slate-950 font-black shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              এই মাহ (Month)
            </button>
            <button
              onClick={() => setTimeframe('all')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                timeframe === 'all'
                  ? 'bg-[#00B686] text-slate-950 font-black shadow-xs'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              সকলো (All Time)
            </button>
          </div>

          <div className="text-slate-300 text-xs">
            বুকিং সংখ্যা: <span className="font-extrabold text-white">{filteredBookings.length}</span> • খৰচ প্ৰবিষ্টি: <span className="font-extrabold text-white">{filteredExpenses.length}</span>
          </div>
        </div>
      </div>

      {/* 5 Executive Financial Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-2.5 sm:gap-3.5">
        
        {/* Card 1: Total Gross Revenue */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">মুঠ ব্যৱসায়</span>
            <span className="p-1 rounded-lg bg-blue-50 text-blue-700">
              <TrendingUp className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            ₹{totalGrossRevenue.toLocaleString('en-IN')}
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">
            মুঠ বুকিং মূল্য (Gross Tariff)
          </p>
        </div>

        {/* Card 2: Total Collected Cash/UPI */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-emerald-800 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">প্ৰাপ্ত নগদ/ইউপিআই</span>
            <span className="p-1 rounded-lg bg-emerald-100 text-emerald-800">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-950 tracking-tight">
            ₹{totalCollectedAdvance.toLocaleString('en-IN')}
          </div>
          <p className="text-[10px] text-emerald-700 mt-0.5">
            হাতত জমা হোৱা ধন (Collected)
          </p>
        </div>

        {/* Card 3: Pending Balance Due */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-amber-50/70 border border-amber-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-amber-800 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">বকেয়া / বাকী ধন</span>
            <span className="p-1 rounded-lg bg-amber-100 text-amber-800">
              <Clock className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-950 tracking-tight">
            ₹{totalPendingDue.toLocaleString('en-IN')}
          </div>
          <p className="text-[10px] text-amber-700 mt-0.5">
            চেক-আউটৰ সময়ত ল'বলগীয়া (Due)
          </p>
        </div>

        {/* Card 4: Total Hotel Expenses */}
        <div className="p-3.5 sm:p-4 rounded-2xl bg-rose-50/70 border border-rose-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between text-rose-800 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">মুঠ খৰচ</span>
            <span className="p-1 rounded-lg bg-rose-100 text-rose-800">
              <TrendingDown className="w-3.5 h-3.5" />
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-rose-950 tracking-tight">
            ₹{totalExpenses.toLocaleString('en-IN')}
          </div>
          <p className="text-[10px] text-rose-700 mt-0.5">
            লণ্ড্ৰী, খাদ্য আৰু বিজুলী খৰচ
          </p>
        </div>

        {/* Card 5: Net Profit */}
        <div className="col-span-2 lg:col-span-1 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-teal-50 to-emerald-100/60 border-2 border-teal-400 shadow-xs">
          <div className="flex items-center justify-between text-teal-900 mb-1">
            <span className="text-[11px] font-extrabold uppercase tracking-wider">নিখুঁত লাভ (Net Profit)</span>
            <span className="p-1 rounded-lg bg-teal-200 text-teal-900 font-bold text-[10px]">
              লাভাংশ
            </span>
          </div>
          <div className={`text-xl sm:text-2xl font-black tracking-tight ${netProfit >= 0 ? 'text-teal-950' : 'text-rose-600'}`}>
            ₹{netProfit.toLocaleString('en-IN')}
          </div>
          <p className="text-[10px] text-teal-800 mt-0.5">
            আদায়কৃত ধন – মুঠ খৰচ
          </p>
        </div>

      </div>

      {/* Breakdowns Row: Channel vs Payment Mode */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        
        {/* Box 1: Channel Breakdown (Direct Offline vs Online OTAs) */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
              <PieChart className="w-4 h-4 text-teal-600" />
              <span>উপাৰ্জনৰ মাধ্যম (Channel Breakdown)</span>
            </h3>
            <span className="text-[11px] text-slate-500 font-bold">
              মুঠ: ₹{totalGrossRevenue.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="space-y-2.5">
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="flex items-center gap-1.5 text-rose-900">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  পোনপটীয়া অফলাইন (Direct Walk-in / Phone)
                </span>
                <span className="text-slate-900">
                  ₹{directOfflineRevenue.toLocaleString('en-IN')}{' '}
                  <span className="text-slate-500 text-[10px] font-normal">
                    ({totalGrossRevenue > 0 ? Math.round((directOfflineRevenue / totalGrossRevenue) * 100) : 0}%)
                  </span>
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-rose-500 h-2 rounded-full"
                  style={{
                    width: `${totalGrossRevenue > 0 ? (directOfflineRevenue / totalGrossRevenue) * 100 : 0}%`
                  }}
                />
              </div>
              <span className="text-[10px] text-slate-500 mt-0.5 block">
                • ০% কমিছন • সম্পূৰ্ণ লাভ হোটেলৰ
              </span>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="flex items-center gap-1.5 text-blue-900">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                  অনলাইন পৰ্টেল (MakeMyTrip, Booking.com, Airbnb)
                </span>
                <span className="text-slate-900">
                  ₹{onlineOTARevenue.toLocaleString('en-IN')}{' '}
                  <span className="text-slate-500 text-[10px] font-normal">
                    ({totalGrossRevenue > 0 ? Math.round((onlineOTARevenue / totalGrossRevenue) * 100) : 0}%)
                  </span>
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{
                    width: `${totalGrossRevenue > 0 ? (onlineOTARevenue / totalGrossRevenue) * 100 : 0}%`
                  }}
                />
              </div>
              <span className="text-[10px] text-slate-500 mt-0.5 block">
                • OTA পৰ্টেলৰ পৰা অহা বুকিং
              </span>
            </div>
          </div>
        </div>

        {/* Box 2: Payment Mode Breakdown (নগদ, ইউপিআই, কাৰ্ড) */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-teal-600" />
              <span>ধন প্ৰদানৰ ধৰণ (Payment Mode Collected)</span>
            </h3>
            <span className="text-[11px] text-emerald-700 font-bold">
              আদায়: ₹{totalCollectedAdvance.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">নগদ ধন (Cash)</span>
              <span className="text-sm font-black text-slate-900">
                ₹{cashCollected.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="p-2.5 bg-emerald-50/60 rounded-xl border border-emerald-100">
              <span className="text-[10px] font-bold text-emerald-800 uppercase block">UPI / GPay / PhonePe</span>
              <span className="text-sm font-black text-emerald-950">
                ₹{upiCollected.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="p-2.5 bg-purple-50/60 rounded-xl border border-purple-100">
              <span className="text-[10px] font-bold text-purple-800 uppercase block">কাৰ্ড (Card Swipe)</span>
              <span className="text-sm font-black text-purple-950">
                ₹{cardCollected.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="p-2.5 bg-blue-50/60 rounded-xl border border-blue-100">
              <span className="text-[10px] font-bold text-blue-800 uppercase block">Online Portal Prepaid</span>
              <span className="text-sm font-black text-blue-950">
                ₹{onlinePortalCollected.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* EXPENSE LOG SECTION */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b flex items-center justify-between">
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center gap-2">
              <span>দৈনন্দিন খৰচৰ বহী (Hotel Expense Tracker)</span>
              <span className="text-xs bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full font-bold">
                ₹{totalExpenses.toLocaleString('en-IN')}
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              লণ্ড্ৰী, খাদ্য সামগ্ৰী, মেৰামতি আৰু বিদ্যুৎ খৰচৰ হিচাপ
            </p>
          </div>

          <button
            onClick={() => setIsAddingExpense(true)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ খৰচ লিখক</span>
          </button>
        </div>

        {/* Add Expense Form Inline Modal */}
        {isAddingExpense && (
          <form onSubmit={handleCreateExpense} className="p-4 bg-rose-50/60 border-b border-rose-200 space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between font-bold text-xs text-rose-950">
              <span>নতুন খৰচ প্ৰবিষ্ট কৰক (Add New Expense)</span>
              <button
                type="button"
                onClick={() => setIsAddingExpense(false)}
                className="text-slate-500 hover:text-slate-800"
              >
                বাতিল (Cancel)
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                  খৰচৰ বিৱৰণ (Description) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bed sheet laundry, Vegetables for breakfast"
                  value={expTitle}
                  onChange={(e) => setExpTitle(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs font-bold rounded-lg border border-slate-300 text-slate-900 bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                  পৰিমাণ (Amount ₹) *
                </label>
                <input
                  type="number"
                  inputMode="numeric"
                  required
                  min={1}
                  placeholder="₹ Amount"
                  value={expAmount}
                  onChange={(e) => setExpAmount(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs font-bold rounded-lg border border-slate-300 text-slate-900 bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-0.5">
                  শ্ৰেণী (Category)
                </label>
                <select
                  value={expCategory}
                  onChange={(e) => setExpCategory(e.target.value as ExpenseCategory)}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 text-slate-900 bg-white"
                >
                  <option value="supplies">লণ্ড্ৰী / চাফাই (Supplies)</option>
                  <option value="food_beverage">খাদ্য সামগ্ৰী (Breakfast/F&B)</option>
                  <option value="utilities">বিদ্যুৎ / পানী (Utilities)</option>
                  <option value="maintenance">মেৰামতি (Maintenance)</option>
                  <option value="staff">কৰ্মচাৰী মজুৰি (Staff)</option>
                  <option value="other">অন্যান্য (Other)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-slate-600">পৰিশোধ মাধ্যম:</span>
                <select
                  value={expPaymentMethod}
                  onChange={(e) => setExpPaymentMethod(e.target.value as any)}
                  className="px-2 py-1 text-xs rounded-lg border border-slate-300 text-slate-900 bg-white font-bold"
                >
                  <option value="cash">নগদ (Cash)</option>
                  <option value="upi">ইউপিআই (UPI/GPay)</option>
                  <option value="bank">বেংক ট্ৰান্সফাৰ (Bank)</option>
                </select>
              </div>

              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs shadow-xs cursor-pointer"
              >
                খৰচ সংৰক্ষণ কৰক (Save Expense)
              </button>
            </div>
          </form>
        )}

        {/* Expenses List */}
        <div className="divide-y divide-slate-100 max-h-56 overflow-y-auto">
          {filteredExpenses.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400">
              এই সময়ছোৱাত কোনো খৰচ লিপিবদ্ধ হোৱা নাই।
            </div>
          ) : (
            filteredExpenses.map((exp) => (
              <div key={exp.id} className="p-3 flex items-center justify-between gap-2 hover:bg-slate-50 transition-colors text-xs">
                <div>
                  <div className="font-bold text-slate-900">{exp.title}</div>
                  <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5">
                    <span>{formatDateShort(exp.date)}</span>
                    <span className="capitalize px-1.5 py-0.2 rounded-sm bg-slate-100 text-slate-700">
                      {exp.category.replace('_', ' ')}
                    </span>
                    <span className="uppercase text-slate-600 font-mono">
                      {exp.paymentMethod}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-black text-rose-700 text-sm">
                    - ₹{exp.amount.toLocaleString('en-IN')}
                  </span>
                  <button
                    onClick={() => onDeleteExpense(exp.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded-md transition-colors cursor-pointer"
                    title="Delete expense"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* DETAILED BOOKING LEDGER TABLE */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-teal-600" />
              <span>বুকিং আৰু ৰাজহ তালিকা (Detailed Revenue Ledger)</span>
            </h3>
            <p className="text-xs text-slate-500">
              প্ৰতিটো কোঠাৰ ভাৰা, আদায় কৰা অগ্ৰিম আৰু বাকী থকা ধনৰ খতিয়ান
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-56">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="অতিথি, ৰূম বা ফোন..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:bg-white focus:outline-hidden"
              />
            </div>

            <select
              value={filterPaymentMode}
              onChange={(e) => setFilterPaymentMode(e.target.value)}
              className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 text-slate-700 bg-slate-50 font-bold"
            >
              <option value="all">সকলো মাধ্যম</option>
              <option value="cash">নগদ (Cash)</option>
              <option value="upi">ইউপিআই (UPI)</option>
              <option value="card">কাৰ্ড (Card)</option>
              <option value="online_portal">Online OTA</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                <th className="py-2.5 px-3">তাৰিখ (Date)</th>
                <th className="py-2.5 px-3">ৰূম (Room)</th>
                <th className="py-2.5 px-3">অতিথি (Guest)</th>
                <th className="py-2.5 px-3">উৎস (Channel)</th>
                <th className="py-2.5 px-3">পৰিশোধ মাধ্যম</th>
                <th className="py-2.5 px-3">মুঠ ভাৰা (Total)</th>
                <th className="py-2.5 px-3">জমা ধন (Paid)</th>
                <th className="py-2.5 px-3">বাকী (Due)</th>
                <th className="py-2.5 px-3 text-right">ব্যৱস্থা</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    কোনো বুকিং বা লেনদেন পোৱা নগ'ল।
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => {
                  const due = Math.max(0, b.totalAmount - b.advancePaid);

                  return (
                    <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3 font-semibold text-slate-700 whitespace-nowrap">
                        {formatDateShort(b.checkInDate)}
                      </td>

                      <td className="py-2.5 px-3">
                        <span className="font-black text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded-md border border-slate-200">
                          {b.roomNumber}
                        </span>
                      </td>

                      <td className="py-2.5 px-3">
                        <div className="font-bold text-slate-900">{b.guestName}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{b.guestPhone}</div>
                      </td>

                      <td className="py-2.5 px-3">
                        <span className={`inline-block px-1.5 py-0.2 rounded-md text-[10px] font-bold ${
                          b.channel === 'online' ? 'bg-blue-100 text-blue-800' : 'bg-rose-100 text-rose-800'
                        }`}>
                          {formatSourceName(b.source)}
                        </span>
                      </td>

                      <td className="py-2.5 px-3 uppercase font-mono text-[10px] text-slate-600 font-bold">
                        {b.paymentMethod}
                      </td>

                      <td className="py-2.5 px-3 font-black text-slate-900">
                        ₹{b.totalAmount.toLocaleString('en-IN')}
                      </td>

                      <td className="py-2.5 px-3 font-bold text-emerald-700">
                        ₹{b.advancePaid.toLocaleString('en-IN')}
                      </td>

                      <td className="py-2.5 px-3">
                        {due > 0 ? (
                          <span className="font-black text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded-md">
                            ₹{due.toLocaleString('en-IN')}
                          </span>
                        ) : (
                          <span className="text-emerald-700 text-[10px] font-bold">
                            সম্পূৰ্ণ আদায় ✓
                          </span>
                        )}
                      </td>

                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => onOpenWhatsApp(b)}
                          className="p-1 rounded-md text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                          title="WhatsApp payment reminder"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                        </button>
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
  );
};
