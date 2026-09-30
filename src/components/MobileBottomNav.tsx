import React from 'react';
import {
  LayoutGrid,
  List,
  Plus,
  Smartphone,
  DollarSign,
  ShieldCheck
} from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: 'grid' | 'table' | 'accounting' | 'police';
  onSelectTab: (tab: 'grid' | 'table' | 'accounting' | 'police') => void;
  onOpenAddBooking: () => void;
  onOpenCustomerView: () => void;
  bookingsCount: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onSelectTab,
  onOpenAddBooking,
  onOpenCustomerView,
  bookingsCount
}) => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/98 backdrop-blur-md border-t border-slate-200 shadow-2xl pb-[env(safe-area-inset-bottom,4px)]">
      <div className="max-w-md mx-auto px-1.5 py-1.5 flex items-center justify-around gap-1">
        
        {/* Rooms Grid Tab */}
        <button
          onClick={() => onSelectTab('grid')}
          className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-xl transition-all cursor-pointer ${
            activeTab === 'grid'
              ? 'text-teal-700 font-extrabold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <div className="relative">
            <LayoutGrid className="w-4 h-4" />
            {activeTab === 'grid' && (
              <span className="w-1.5 h-1.5 rounded-full bg-teal-600 absolute -bottom-1 left-1/2 -translate-x-1/2" />
            )}
          </div>
          <span className="text-[9px] mt-0.5 font-bold">ৰূম</span>
        </button>

        {/* Police Verification Tab */}
        <button
          onClick={() => onSelectTab('police')}
          className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-xl transition-all cursor-pointer ${
            activeTab === 'police'
              ? 'text-rose-700 font-extrabold'
              : 'text-slate-500 hover:text-slate-800'
          }`}
          title="পুলিচ ভেৰিফিকেচন (Police Verification)"
        >
          <div className="relative">
            <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
              activeTab === 'police' ? 'bg-rose-100 text-rose-700 font-bold' : 'bg-slate-100 text-slate-700'
            }`}>
              <ShieldCheck className="w-3.5 h-3.5" />
            </div>
            {activeTab === 'police' && (
              <span className="w-1.5 h-1.5 rounded-full bg-rose-600 absolute -bottom-1 left-1/2 -translate-x-1/2" />
            )}
          </div>
          <span className="text-[9px] mt-0.5 font-black text-rose-900">পুলিচ</span>
        </button>

        {/* Center Prominent Add Booking Button (কোঠা বুক কৰক) */}
        <div className="relative -top-2">
          <button
            onClick={onOpenAddBooking}
            className="flex items-center gap-1 px-3 py-1.5 rounded-2xl bg-gradient-to-tr from-[#0B2545] to-[#164477] text-white shadow-xl shadow-slate-900/40 active:scale-90 transition-transform cursor-pointer border-2 border-white"
            title="কোঠা বুক কৰক (+ Add Booking)"
          >
            <Plus className="w-4 h-4 text-[#00E5A3] shrink-0" />
            <span className="text-[11px] font-black tracking-tight text-white">+বুক</span>
          </button>
        </div>

        {/* Accounting & Ledger Tab ("হিচাপ / Accounts") */}
        <button
          onClick={() => onSelectTab('accounting')}
          className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-xl transition-all cursor-pointer ${
            activeTab === 'accounting'
              ? 'text-amber-800 font-black'
              : 'text-slate-500 hover:text-slate-800'
          }`}
          title="হোটেল একাউণ্টিং আৰু ৰাজহ বহী (Hotel Accounting)"
        >
          <div className="relative">
            <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
              activeTab === 'accounting' ? 'bg-amber-200 text-amber-950 font-black' : 'bg-amber-100 text-amber-800'
            }`}>
              <DollarSign className="w-3.5 h-3.5" />
            </div>
            {activeTab === 'accounting' && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-600 absolute -bottom-1 left-1/2 -translate-x-1/2" />
            )}
          </div>
          <span className="text-[9px] mt-0.5 font-black text-amber-900">হিচাপ</span>
        </button>

        {/* Guest View Tab */}
        <button
          onClick={onOpenCustomerView}
          className="flex flex-col items-center justify-center py-1 px-1.5 rounded-xl text-emerald-700 hover:text-emerald-900 transition-all cursor-pointer"
          title="Customer View"
        >
          <Smartphone className="w-4 h-4 text-emerald-600" />
          <span className="text-[9px] font-bold text-emerald-800 mt-0.5">গ্ৰাহক</span>
        </button>

      </div>
    </nav>
  );
};
