import React, { useState } from 'react';
import { Sparkles, ArrowRight, X, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { SubscriptionState } from '../types';

interface PricingBannerProps {
  subscription: SubscriptionState;
  onOpenPricing: () => void;
}

export const PricingBanner: React.FC<PricingBannerProps> = ({
  subscription,
  onOpenPricing
}) => {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-[#0B2545] via-[#103460] to-[#0A223E] text-white rounded-2xl shadow-md p-4 sm:p-5 border border-slate-700/40 my-5">
      {/* Subtle background glow */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-[#00B686]/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left Information */}
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00B686] to-teal-600 flex items-center justify-center shrink-0 shadow-lg shadow-teal-900/30">
            <Sparkles className="w-5 h-5 text-white" />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs uppercase font-extrabold tracking-wider bg-teal-500/20 text-[#00E5A3] px-2 py-0.5 rounded-full border border-teal-500/30">
                Small Hotel & Homestay Special
              </span>
              <span className="text-xs text-slate-300">
                Zero Commission • 100% Conflict Shield
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white mt-1 leading-snug">
              Stop costly double-bookings for just{' '}
              <span className="text-[#00E5A3] underline decoration-teal-500/40 underline-offset-4 font-extrabold">
                ₹99 / month
              </span>{' '}
              <span className="text-xs text-slate-300 font-normal">
                (or ₹999 / year with 2 months free)
              </span>
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Sync walk-ins, phone calls, MakeMyTrip, Booking.com, Airbnb & direct WhatsApp inquiries in one pocket-friendly screen.
            </p>
          </div>
        </div>

        {/* Right CTA button & close */}
        <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
          <button
            onClick={onOpenPricing}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-[#00B686] text-white hover:bg-[#00c592] active:scale-95 transition-all shadow-md shadow-teal-900/40 cursor-pointer"
          >
            <span>Upgrade to Pro (₹99)</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={() => setIsDismissed(true)}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
            title="Dismiss banner"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
