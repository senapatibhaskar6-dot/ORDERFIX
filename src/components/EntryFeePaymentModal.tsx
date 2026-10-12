import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  QrCode,
  CreditCard,
  Building,
  Smartphone,
  Sparkles,
  ArrowRight,
  Clock,
  X,
  FileCheck
} from 'lucide-react';

interface EntryFeePaymentModalProps {
  hotelName: string;
  ownerName: string;
  phone: string;
  onSuccess: (txnId: string) => void;
  onCancel: () => void;
}

export const EntryFeePaymentModal: React.FC<EntryFeePaymentModalProps> = ({
  hotelName,
  ownerName,
  phone,
  onSuccess,
  onCancel
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'upi_qr' | 'upi_id' | 'card' | 'netbanking'>('upi_qr');
  const [upiInput, setUpiInput] = useState(`${phone || '9876543210'}@upi`);
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 9012');
  const [cardExpiry, setCardExpiry] = useState('08/29');
  const [cardCvv, setCardCvv] = useState('821');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaidSuccess, setIsPaidSuccess] = useState(false);
  const [txnId, setTxnId] = useState('');

  const generateTxnId = () => {
    const random = Math.floor(100000 + Math.random() * 900000);
    return `ORD-REG-99-${random}`;
  };

  const handleSimulatePayment = () => {
    setIsProcessing(true);
    const newTxn = generateTxnId();
    setTxnId(newTxn);

    setTimeout(() => {
      setIsProcessing(false);
      setIsPaidSuccess(true);
      setTimeout(() => {
        onSuccess(newTxn);
      }, 1600);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0B2545] to-[#133E6D] text-white p-5 relative">
          <button
            onClick={onCancel}
            disabled={isProcessing}
            className="absolute right-4 top-4 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider bg-emerald-400 text-slate-950 px-2.5 py-0.5 rounded-full">
              <Lock className="w-3 h-3" />
              Secure 256-Bit Payment Gateway
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider bg-teal-400 text-slate-950 px-2.5 py-0.5 rounded-full">
              <Sparkles className="w-3 h-3" />
              ১ মাহ ফ্ৰী চাবস্ক্ৰিপচন
            </span>
          </div>

          <h3 className="text-xl font-black text-white">
            হোটেল পঞ্জীয়ন মাচুল পৰিশোধ (₹99 Entry Fee)
          </h3>
          <p className="text-xs text-slate-300 mt-0.5">
            {hotelName} ({ownerName}) • অৰ্ডাৰফিক্স সুৰক্ষিত পেমেন্ট
          </p>
        </div>

        {/* Success Screen Overlay */}
        {isPaidSuccess ? (
          <div className="p-8 text-center space-y-4 my-auto animate-in zoom-in-95 duration-200">
            <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-xl ring-8 ring-emerald-50">
              <CheckCircle2 className="w-12 h-12" />
            </div>

            <div>
              <h4 className="text-2xl font-black text-slate-900">
                ₹৯৯ মাচুল সফলভাৱে পৰিশোধ হ'ল! 🎉
              </h4>
              <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">
                অভিনন্দন! আপোনাৰ প্ৰথম ৩০ দিন (১ মাহ) সম্পূৰ্ণ বিনামূলীয়া চাবস্ক্ৰিপচন সক্ৰিয় কৰা হৈছে।
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left text-xs space-y-1.5 font-mono">
              <div className="flex justify-between text-slate-500">
                <span>পেমেন্ট ৰেফাৰেন্স (Txn ID):</span>
                <span className="font-bold text-slate-900">{txnId}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>পৰিশোধিত ধন (Amount):</span>
                <span className="font-bold text-emerald-700">₹99.00 (One-Time)</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>চাবস্ক্ৰিপচন স্থিতি:</span>
                <span className="font-bold text-teal-700">First 30 Days Free (₹0)</span>
              </div>
            </div>

            <div className="text-xs text-slate-500 font-semibold flex items-center justify-center gap-1">
              <div className="w-3 h-3 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
              <span>আপোনাৰ ডেশ্ববৰ্ডলৈ লৈ যোৱা হৈছে...</span>
            </div>
          </div>
        ) : (
          <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-slate-800">
            
            {/* Fee Breakdown Card */}
            <div className="bg-gradient-to-br from-slate-50 to-teal-50/50 p-4 rounded-2xl border border-teal-100 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600">হোটেল পঞ্জীয়ন মাচুল (Entry Fee):</span>
                <span className="text-sm font-extrabold text-slate-900">₹99.00</span>
              </div>

              <div className="flex items-center justify-between text-xs text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1.5 rounded-xl border border-emerald-200">
                <span className="flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>১ম মাহৰ প্লেটফৰ্ম চাবস্ক্ৰিপচন (Trial 30 Days):</span>
                </span>
                <span className="uppercase text-[11px] font-black bg-emerald-600 text-white px-2 py-0.5 rounded-md">
                  FREE (₹0)
                </span>
              </div>

              <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-black text-slate-900 block">এতিয়া পৰিশোধ কৰিবলগীয়া ধন:</span>
                  <span className="text-[10px] text-slate-500">Non-refundable one-time onboarding fee</span>
                </div>
                <span className="text-2xl font-black text-slate-950">₹99</span>
              </div>
            </div>

            {/* Payment Mode Selector */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold uppercase tracking-wider text-slate-600 block">
                পেমেন্টৰ মাধ্যম বাছনি কৰক (Select Payment Method)
              </label>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi_qr')}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                    paymentMethod === 'upi_qr'
                      ? 'border-teal-600 bg-teal-50/80 font-black text-teal-900 shadow-xs'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <QrCode className="w-5 h-5 text-teal-700" />
                  <span className="text-[11px]">UPI QR স্কেন</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                    paymentMethod === 'card'
                      ? 'border-teal-600 bg-teal-50/80 font-black text-teal-900 shadow-xs'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <CreditCard className="w-5 h-5 text-teal-700" />
                  <span className="text-[11px]">ডেবিট / ক্ৰেডিট কাৰ্ড</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('upi_id')}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center justify-center gap-1 ${
                    paymentMethod === 'upi_id'
                      ? 'border-teal-600 bg-teal-50/80 font-black text-teal-900 shadow-xs'
                      : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <Smartphone className="w-5 h-5 text-teal-700" />
                  <span className="text-[11px]">GPay / PhonePe</span>
                </button>
              </div>
            </div>

            {/* Payment Interface Dynamic Block */}
            {paymentMethod === 'upi_qr' && (
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center space-y-3">
                <div className="inline-block p-3 bg-white rounded-2xl shadow-md border border-slate-200">
                  {/* Clean SVG QR Representation for Orderfix ₹99 Fee */}
                  <svg className="w-36 h-36 mx-auto" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect width="100" height="100" fill="white" />
                    <rect x="10" y="10" width="24" height="24" rx="3" fill="#0B2545" />
                    <rect x="14" y="14" width="16" height="16" fill="white" />
                    <rect x="18" y="18" width="8" height="8" fill="#0B2545" />

                    <rect x="66" y="10" width="24" height="24" rx="3" fill="#0B2545" />
                    <rect x="70" y="14" width="16" height="16" fill="white" />
                    <rect x="74" y="18" width="8" height="8" fill="#0B2545" />

                    <rect x="10" y="66" width="24" height="24" rx="3" fill="#0B2545" />
                    <rect x="14" y="70" width="16" height="16" fill="white" />
                    <rect x="18" y="74" width="8" height="8" fill="#0B2545" />

                    {/* QR Pixel Noise Simulation */}
                    <rect x="42" y="12" width="6" height="6" fill="#0D9488" />
                    <rect x="52" y="18" width="6" height="6" fill="#0B2545" />
                    <rect x="44" y="26" width="6" height="6" fill="#0B2545" />
                    <rect x="14" y="44" width="8" height="8" fill="#0D9488" />
                    <rect x="28" y="44" width="6" height="6" fill="#0B2545" />
                    <rect x="42" y="42" width="16" height="16" rx="2" fill="#0B2545" />
                    <rect x="46" y="46" width="8" height="8" fill="#2DD4BF" />
                    <rect x="64" y="44" width="8" height="6" fill="#0B2545" />
                    <rect x="78" y="44" width="10" height="6" fill="#0D9488" />
                    <rect x="42" y="66" width="6" height="10" fill="#0D9488" />
                    <rect x="54" y="66" width="8" height="6" fill="#0B2545" />
                    <rect x="68" y="68" width="18" height="6" fill="#0B2545" />
                    <rect x="52" y="78" width="10" height="10" fill="#0D9488" />
                    <rect x="70" y="80" width="16" height="8" fill="#0B2545" />
                  </svg>
                </div>

                <div className="space-y-1">
                  <div className="text-xs font-black text-slate-900">
                    GPay / PhonePe / Paytm / BHIM ৰে স্কেন কৰক
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    UPI ID: <span className="font-bold text-slate-800">orderfix.official@icici</span>
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === 'card' && (
              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    কাৰ্ড নম্বৰ (Card Number)
                  </label>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-sm bg-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      ম্যাদ (MM/YY)
                    </label>
                    <input
                      type="text"
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-sm bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      CVV
                    </label>
                    <input
                      type="password"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-sm bg-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === 'upi_id' && (
              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    আপোনাৰ UPI ID লিখক (e.g. mobile@paytm)
                  </label>
                  <input
                    type="text"
                    value={upiInput}
                    onChange={(e) => setUpiInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-sm bg-white"
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  আপোনাৰ UPI এপলৈ ₹৯৯ পৰিশোধৰ অনুৰোধ প্ৰেৰণ কৰা হ'ব।
                </p>
              </div>
            )}

            {/* Platform Guarantee Notes */}
            <div className="space-y-1.5 text-[11px] text-slate-500 bg-slate-100/70 p-3 rounded-xl border border-slate-200">
              <div className="flex items-center gap-1.5 text-slate-700 font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>অৰ্ডাৰফিক্স ব্যৱসায়িক সুৰক্ষা & চৰ্ত্ত:</span>
              </div>
              <p>• ₹৯৯ পঞ্জীয়ন মাচুল অ-ঘূৰাইযোগ্য (Non-refundable entry fee)।</p>
              <p>• পঞ্জীয়নৰ দিনৰ পৰা ৩০ দিন (১ মাহ) সম্পূৰ্ণ বিনামূলীয়াকৈ সকলো সুবিধাসমূহ ব্যৱহাৰ কৰিব পাৰিব।</p>
              <p>• অনলাইন বুকিঙত হোটেলৰ কোঠাৰ সম্পূৰ্ণ ১০০% ভাৰা হোটেলৰ একাউণ্টলৈ যাব আৰু ৰূম টেৰিফৰ ওপৰত ৫% প্লেটফৰ্ম মাচুল যোগ হ'ব।</p>
            </div>

            {/* Pay Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleSimulatePayment}
                disabled={isProcessing}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-slate-950 font-black text-sm shadow-xl shadow-teal-500/25 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>পেমেন্ট প্ৰচেছিং হৈ আছে...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 text-slate-950" />
                    <span>₹৯৯ পৰিশোধ কৰক আৰু একাউণ্ট সক্ৰিয় কৰক ➔</span>
                  </>
                )}
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
