import React, { useState } from 'react';
import { SubscriptionState } from '../types';
import {
  X,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Zap,
  QrCode,
  Smartphone,
  CreditCard,
  Check,
  Star,
  Lock,
  Building,
  DollarSign
} from 'lucide-react';
import { OrderfixLogo } from './Logo';

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscription: SubscriptionState;
  onUpdateSubscription: (sub: SubscriptionState) => void;
}

export const PricingModal: React.FC<PricingModalProps> = ({
  isOpen,
  onClose,
  subscription,
  onUpdateSubscription
}) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleSimulatePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setShowPaymentSuccess(true);
      onUpdateSubscription({
        plan: billingCycle,
        trialDaysLeft: 0,
        isActive: true,
        expiresAt:
          billingCycle === 'monthly'
            ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      });
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0B2545] to-[#143B68] text-white p-6 sm:p-7 relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-[#00B686]/20 rounded-full blur-2xl" />

          <div className="flex items-start justify-between relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-extrabold uppercase tracking-wider bg-[#00B686] text-slate-950 px-2.5 py-0.5 rounded-full">
                  হোটেল আৰু হোমষ্টে’ৰ পকেট-ফ্ৰেইণ্ডলী মাচুল
                </span>
                <span className="text-xs text-slate-300">১ মাহ বিনামূলীয়া</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                অৰ্ডাৰফিক্স চাবস্ক্ৰিপচন & ৫% কমিছন মডেল
              </h2>
              <p className="text-xs sm:text-sm text-slate-200 mt-1 max-w-lg">
                কোনো মাহেকীয়া হেজাৰ হেজাৰ টকাৰ খৰচ নাই। প্ৰথম মাহ সম্পূৰ্ণ ফ্ৰী আৰু অনলাইন বুকিঙত মাত্ৰ ৫% নূন্যতম মাচুল!
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 space-y-6">
          
          {/* Key 3 Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            
            <div className="p-3.5 rounded-2xl bg-teal-50 border border-teal-200 text-teal-950 space-y-1">
              <div className="text-[10px] font-black uppercase text-teal-800">১. প্ৰৱেশ মাচুল</div>
              <div className="text-xl font-black text-teal-950">₹৯৯ (One-Time)</div>
              <p className="text-[11px] text-teal-800 leading-tight">
                অ-ঘূৰাইযোগ্য পঞ্জীয়ন মাচুল। এবাৰ দিলে হোটেল নিৰাপদভাৱে তালিকাভুক্ত হয়।
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-1">
              <div className="text-[10px] font-black uppercase text-emerald-800">২. ফ্ৰী ট্ৰায়েল</div>
              <div className="text-xl font-black text-emerald-950">১ মাহ ফ্ৰী (30 Days)</div>
              <p className="text-[11px] text-emerald-800 leading-tight">
                প্ৰথম ৩০ দিনৰ বাবে কোনো মাহেকীয়া মাচুল নাই। সম্পূৰ্ণ ছফ্টৱেৰ বিনামূলীয়াকৈ ব্যৱহাৰ কৰক।
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-950 space-y-1">
              <div className="text-[10px] font-black uppercase text-indigo-800">৩. ১০০% মালিক + ৫% মাচুল</div>
              <div className="text-xl font-black text-indigo-950">১০০% : ৫%</div>
              <p className="text-[11px] text-indigo-800 leading-tight">
                হোটেলৰ কোঠাৰ সম্পূৰ্ণ ১০০% ভাৰা হোটেল মালিকে পাব আৰু টেৰিফৰ ওপৰত ৫% কমিছন প্লেটফৰ্ম মালিকে পাব।
              </p>
            </div>

          </div>

          {/* Transparent Example Box */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
            <h4 className="font-extrabold text-slate-900 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span>অনলাইন বুকিঙৰ উদাহৰণ (Transparent Calculation Example):</span>
            </h4>
            <div className="grid grid-cols-3 gap-2 bg-white p-3 rounded-xl border border-slate-200 text-center">
              <div>
                <span className="text-emerald-700 block text-[10px] font-bold">১০০% কোঠাৰ ভাৰা (মালিকলৈ)</span>
                <span className="text-sm font-black text-emerald-700">₹২,০০০</span>
              </div>
              <div className="border-x border-slate-100">
                <span className="text-teal-700 block text-[10px] font-bold">৫% প্লেটফৰ্ম কমিছন</span>
                <span className="text-sm font-extrabold text-teal-800">+₹১০০</span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] font-bold">মুঠ গ্ৰাহকে দিয়া ধন</span>
                <span className="text-sm font-black text-slate-900">₹২,১০০</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-500">
              * অফলাইন ৱাক-ইন বা ফোন কলৰ বুকিঙত ০% কমিছন প্ৰযোজ্য। হোটেল মালিকে সম্পূৰ্ণ ১০০% ভাৰা নিজৰ হাতত ৰাখিব পাৰে।
            </p>
          </div>

          {/* Action button */}
          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-[#0B2545] text-white font-bold text-xs cursor-pointer shadow-md"
            >
              বুজি পালোঁ (Close)
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
