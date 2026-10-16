import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { LanguageCode } from '../utils/translations';

interface LanguageSelectorProps {
  language: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  className?: string;
  variant?: 'light' | 'dark' | 'header';
}

export const LANGUAGES: { code: LanguageCode; label: string; native: string; flag: string }[] = [
  { code: 'en', label: 'English', native: 'English', flag: '🇬🇧' },
  { code: 'as', label: 'Assamese', native: 'অসমীয়া', flag: '🇮🇳' },
  { code: 'bn', label: 'Bengali', native: 'বাংলা', flag: '🇮🇳' },
  { code: 'hi', label: 'Hindi', native: 'हिन्दी', flag: '🇮🇳' }
];

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  language,
  onLanguageChange,
  className = '',
  variant = 'light'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close when clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentLang = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  const getButtonStyles = () => {
    if (variant === 'dark') {
      return 'bg-white/10 hover:bg-white/20 text-white border-white/20';
    }
    if (variant === 'header') {
      return 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200';
    }
    return 'bg-white hover:bg-slate-50 text-slate-800 border-slate-300 shadow-2xs';
  };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold border transition-all cursor-pointer ${getButtonStyles()}`}
        title="Select Language / ভাষা নিৰ্বাচন কৰক"
      >
        <Globe className="w-3.5 h-3.5 text-teal-500 shrink-0" />
        <span className="font-extrabold">{currentLang.native}</span>
        <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-44 rounded-2xl bg-white text-slate-900 shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="px-3 py-1 text-[10px] font-black uppercase tracking-wider text-slate-400 border-b border-slate-100 flex items-center justify-between">
            <span>Select Language</span>
            <span className="text-teal-600 font-bold">ভাষা</span>
          </div>

          <div className="py-1">
            {LANGUAGES.map((lang) => {
              const isSelected = language === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => {
                    onLanguageChange(lang.code);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-teal-50/60 cursor-pointer transition-colors ${
                    isSelected ? 'bg-teal-50 text-teal-900 font-black' : 'text-slate-700 font-medium'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{lang.flag}</span>
                    <div>
                      <div className="font-bold text-xs">{lang.native}</div>
                      <div className="text-[10px] text-slate-400">{lang.label}</div>
                    </div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-teal-600 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
