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
  Star
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
                <span className="text-[11px] font-extrabold uppercase tracking-wider bg-[#00B686] text-white px-2.5 py-0.5 rounded-full">
                  Tailored For Homestays & Resorts
                </span>
                <span className="text-xs text-slate-300">No Costly Hardware</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Pocket-Friendly Pricing
              </h2>
              <p className="text-xs sm:text-sm text-slate-200 mt-1 max-w-lg">
                Complex hotel software costs thousands every month. Orderfix gives you 100% double-booking protection for the price of a cup of tea.
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Billing Cycle Toggle */}
          <div className="mt-5 flex items-center justify-center relative z-10">
            <div className="bg-slate-900/50 p-1 rounded-2xl border border-white/15 flex items-center gap-1">
              <button
                type="button"
                onClick={() => setBillingCycle('monthly')}
                className={`py-1.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-[#00B686] text-white shadow-md'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                Monthly Plan (₹99 / mo)
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle('annual')}
                className={`py-1.5 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-1.5 ${
                  billingCycle === 'annual'
                    ? 'bg-[#00B686] text-white shadow-md'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                <span>Annual Plan (₹999 / yr)</span>
                <span className="text-[10px] bg-amber-400 text-slate-950 font-black px-1.5 py-0.5 rounded-md">
                  Save 16%
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-7 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {showPaymentSuccess ? (
            <div className="p-8 text-center space-y-3 bg-emerald-50 rounded-3xl border border-emerald-200">
              <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/30">
                <Check className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-emerald-950">
                Orderfix Pro Active!
              </h3>
              <p className="text-xs text-emerald-800 max-w-md mx-auto">
                Your hotel is fully protected with instant conflict prevention and unlimited WhatsApp confirmations.
              </p>
              <button
                onClick={onClose}
                className="mt-4 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm cursor-pointer"
              >
                Return to Dashboard
              </button>
            </div>
          ) : (
            <>
              {/* Plan Card */}
              <div className="rounded-3xl border-2 border-[#00B686] bg-gradient-to-b from-teal-50/50 to-white p-5 sm:p-6 shadow-md relative">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-teal-800">
                      Orderfix Complete Pro Shield
                    </span>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-3xl sm:text-4xl font-black text-slate-950">
                        {billingCycle === 'monthly' ? '₹99' : '₹999'}
                      </span>
                      <span className="text-xs sm:text-sm font-semibold text-slate-500">
                        {billingCycle === 'monthly' ? '/ month' : '/ year (₹83/mo)'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      {billingCycle === 'monthly'
                        ? 'Affordable monthly billing. Cancel anytime.'
                        : 'Includes 2 Months Free + Priority Setup Support.'}
                    </p>
                  </div>

                  <div className="text-right">
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={handleSimulatePayment}
                      className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-[#0B2545] hover:bg-[#133560] active:scale-95 text-white font-extrabold text-sm transition-all shadow-lg shadow-slate-900/10 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isProcessing ? (
                        <span>Activating...</span>
                      ) : (
                        <>
                          <Zap className="w-4 h-4 text-[#00B686]" />
                          <span>
                            {subscription.isActive && subscription.plan !== 'trial'
                              ? 'Renew Subscription'
                              : 'Upgrade Now for ₹' + (billingCycle === 'monthly' ? '99' : '999')}
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Feature Checklist */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-5 mt-5 border-t border-teal-200/60 text-xs">
                  {[
                    'Instant Double-Booking Shield',
                    'Sync Walk-ins & Phone Bookings',
                    'Integrate MMT, Booking.com, Airbnb',
                    'Unlimited WhatsApp Confirmations',
                    'Printable Guest Check-in Slips',
                    'Mobile & Tablet Browser Friendly',
                    'Zero Commission on Direct Guests',
                    'Offline Data Recovery & Backups'
                  ].map((feat, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-slate-800">
                      <CheckCircle2 className="w-4 h-4 text-[#00B686] shrink-0" />
                      <span className="font-semibold">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Methods Simulation (Local Market Friendly) */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-2">
                  <span>Fast UPI Payment for India & Local Markets</span>
                  <span className="text-emerald-700 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> 100% Secure
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-600">
                  <span className="px-2.5 py-1 bg-white rounded-lg border border-slate-200 font-bold text-purple-700">
                    PhonePe
                  </span>
                  <span className="px-2.5 py-1 bg-white rounded-lg border border-slate-200 font-bold text-blue-700">
                    Google Pay
                  </span>
                  <span className="px-2.5 py-1 bg-white rounded-lg border border-slate-200 font-bold text-sky-700">
                    Paytm UPI
                  </span>
                  <span className="px-2.5 py-1 bg-white rounded-lg border border-slate-200 font-bold text-slate-800">
                    Any UPI QR
                  </span>
                  <span className="px-2.5 py-1 bg-white rounded-lg border border-slate-200 font-bold text-slate-800">
                    Debit / Credit Card
                  </span>
                </div>
              </div>

              {/* Real Owner Testimonial */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-50 to-teal-50/40 border border-slate-200 text-xs text-slate-700 space-y-1.5">
                <div className="flex items-center gap-1 text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                <p className="italic text-slate-800">
                  &quot;Earlier, our receptionist took a walk-in guest while Booking.com sold the same room 10 minutes later. We had to pay a huge penalty to rehouse the guest. Orderfix at ₹99/month saved us from that headache completely!&quot;
                </p>
                <div className="font-bold text-slate-900 text-[11px]">
                  — Anthony Fernandes, Sea Breeze Homestay, Calangute
                </div>
              </div>
            </>
          )}

        </div>

      </div>
    </div>
  );
};
