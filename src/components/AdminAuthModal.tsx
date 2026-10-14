import React, { useState } from 'react';
import {
  Lock,
  Eye,
  EyeOff,
  ShieldAlert,
  KeyRound,
  CheckCircle2,
  X,
  HelpCircle,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { verifyAdminPassword, resetAdminPasswordWithKey, saveAdminPassword } from '../utils/storage';
import { LanguageCode, getTranslations } from '../utils/translations';

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  language?: LanguageCode;
}

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  language = 'en'
}) => {
  const t = getTranslations(language);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isResetMode, setIsResetMode] = useState(false);

  // Reset Mode States
  const [recoveryKey, setRecoveryKey] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetSuccessMessage, setResetSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!password.trim()) {
      setError(language === 'as' ? 'অনুগ্ৰহ কৰি এডমিন পাছৱৰ্ড প্ৰবিষ্ট কৰক।' : 'Please enter the admin password.');
      return;
    }

    if (verifyAdminPassword(password)) {
      try {
        localStorage.setItem('orderfix_admin_authenticated', 'true');
      } catch {}
      setPassword('');
      setError(null);
      onSuccess();
    } else {
      setError(t.invalidPassword);
    }
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResetSuccessMessage(null);

    if (!recoveryKey.trim()) {
      setError(t.invalidRecoveryKey);
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setError(language === 'as' ? 'পাছৱৰ্ড অন্ততঃ ৬ টা বৰ্ণৰ হ’ব লাগিব।' : 'Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError(t.passwordMismatch);
      return;
    }

    const resetOk = resetAdminPasswordWithKey(recoveryKey, newPassword);
    if (resetOk) {
      setResetSuccessMessage(t.passwordChangedSuccess);
      setRecoveryKey('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        setIsResetMode(false);
        setResetSuccessMessage(null);
      }, 1800);
    } else {
      setError(t.invalidRecoveryKey);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-[#0B2545] via-[#133A69] to-[#0B2545] p-5 sm:p-6 text-white text-center relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-12 h-12 mx-auto mb-2.5 rounded-2xl bg-teal-500/20 border border-teal-400/40 flex items-center justify-center shadow-inner">
            <Lock className="w-6 h-6 text-[#00E5A3]" />
          </div>

          <h3 className="text-lg sm:text-xl font-black tracking-tight">
            {isResetMode ? t.changePassword : t.adminTitle}
          </h3>
          <p className="text-xs text-slate-300 mt-1 max-w-xs mx-auto">
            {isResetMode
              ? t.recoveryKeyHelp
              : (language === 'as'
                  ? 'প্লেটফৰ্মৰ কেন্দ্ৰীয় নিয়ন্ত্ৰণ, হোটেল নেটৱৰ্ক আৰু মাহেকীয়া কমিছন হিচাপ'
                  : 'Central Platform Control, Multi-Vendor Hotel Registry & Commission Ledger')}
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {resetSuccessMessage && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{resetSuccessMessage}</span>
            </div>
          )}

          {!isResetMode ? (
            /* Standard Admin Password Login Form */
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5">
                  {language === 'as' ? 'মাষ্টাৰ এডমিন পাছৱৰ্ড' : 'Master Admin Password'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    autoFocus
                    className="w-full pl-10 pr-10 py-3 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 text-sm font-semibold tracking-wider transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-teal-600" />
                    {language === 'as' ? 'সুৰক্ষিত প্ৰৱেশ ব্যৱস্থা' : 'Encrypted security verification'}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsResetMode(true);
                      setError(null);
                    }}
                    className="text-teal-700 hover:text-teal-800 font-bold hover:underline cursor-pointer"
                  >
                    {t.forgotPassword}
                  </button>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  {language === 'as' ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-600 hover:to-emerald-700 text-slate-950 text-xs font-black shadow-md flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-all"
                >
                  <span>{language === 'as' ? 'এডমিন পেনেল খোলক' : 'Unlock Dashboard'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          ) : (
            /* Forgot / Reset Password Form */
            <form onSubmit={handleResetPassword} className="space-y-3.5">
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                  {t.enterRecoveryKey}
                </label>
                <input
                  type="text"
                  value={recoveryKey}
                  onChange={(e) => setRecoveryKey(e.target.value)}
                  placeholder="ORDERFIX-MASTER-RECOVER-2026"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:border-teal-500 text-xs font-mono tracking-wider"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                  {t.enterNewPassword}
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:border-teal-500 text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                  {t.confirmNewPassword}
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-slate-50 focus:bg-white focus:border-teal-500 text-xs font-semibold"
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsResetMode(false);
                    setError(null);
                  }}
                  className="flex-1 py-2 px-3 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  {language === 'as' ? 'পাছলৈ যাওক' : 'Back to Login'}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-black shadow-md cursor-pointer"
                >
                  {t.resetPasswordBtn}
                </button>
              </div>
            </form>
          )}

        </div>

      </div>
    </div>
  );
};
