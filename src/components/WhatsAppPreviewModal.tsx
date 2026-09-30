import React, { useState, useEffect } from 'react';
import { Booking, HotelProfile } from '../types';
import {
  generateConfirmationMessage,
  generateCheckInReminder,
  generateThankYouMessage,
  cleanPhoneNumber
} from '../utils/whatsapp';
import {
  X,
  MessageCircle,
  Copy,
  ExternalLink,
  Check,
  Send,
  Sparkles,
  Phone
} from 'lucide-react';

interface WhatsAppPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  booking: Booking | null;
  hotel: HotelProfile;
}

export const WhatsAppPreviewModal: React.FC<WhatsAppPreviewModalProps> = ({
  isOpen,
  onClose,
  booking,
  hotel
}) => {
  const [templateType, setTemplateType] = useState<'confirmation' | 'reminder' | 'thankyou'>('confirmation');
  const [customText, setCustomText] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!booking) return;

    if (templateType === 'confirmation') {
      setCustomText(generateConfirmationMessage(booking, hotel));
    } else if (templateType === 'reminder') {
      setCustomText(generateCheckInReminder(booking, hotel));
    } else {
      setCustomText(generateThankYouMessage(booking, hotel));
    }
  }, [booking, hotel, templateType]);

  if (!isOpen || !booking) return null;

  const cleanPhone = cleanPhoneNumber(booking.guestPhone);
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(customText)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(customText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenWhatsApp = () => {
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-[#075E54] text-white px-5 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold">WhatsApp Direct Messenger</h3>
              <p className="text-xs text-emerald-100">
                To: {booking.guestName} ({booking.guestPhone})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-6 space-y-4">
          
          {/* Template Selectors */}
          <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setTemplateType('confirmation')}
              className={`flex-1 py-1.5 px-2 rounded-lg transition-all ${
                templateType === 'confirmation'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              1. Confirmation
            </button>
            <button
              type="button"
              onClick={() => setTemplateType('reminder')}
              className={`flex-1 py-1.5 px-2 rounded-lg transition-all ${
                templateType === 'reminder'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              2. Arrival Reminder
            </button>
            <button
              type="button"
              onClick={() => setTemplateType('thankyou')}
              className={`flex-1 py-1.5 px-2 rounded-lg transition-all ${
                templateType === 'thankyou'
                  ? 'bg-white text-slate-900 shadow-xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              3. Thank You
            </button>
          </div>

          {/* WhatsApp Chat Preview Area */}
          <div className="relative rounded-2xl bg-[#EFEAE2] p-4 sm:p-5 border border-slate-300 shadow-inner">
            <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center mb-2">
              WhatsApp Message Preview
            </div>

            {/* Chat bubble */}
            <div className="bg-white rounded-2xl rounded-tr-xs p-3.5 shadow-sm border border-slate-200/80 text-xs leading-relaxed text-slate-900 font-sans whitespace-pre-wrap max-h-64 overflow-y-auto">
              {customText}
            </div>

            <div className="text-right text-[10px] text-slate-500 mt-1 font-mono">
              Ready to send to +{cleanPhone}
            </div>
          </div>

          {/* Optional edit text toggle */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Custom Edit Message (Optional)
            </label>
            <textarea
              rows={3}
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              className="w-full p-2.5 text-xs rounded-xl border border-slate-300 text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-mono"
            />
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={handleCopy}
              className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span className="text-emerald-700">Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-500" />
                  <span>Copy Text</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleOpenWhatsApp}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-[#25D366] hover:bg-[#20ba5a] active:scale-95 rounded-xl shadow-md shadow-emerald-600/30 transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Send via WhatsApp (+{cleanPhone})</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
