import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { SupportedLanguage } from '../utils/i18n';

interface LanguageSelectorProps {
  className?: string;
  dropUp?: boolean;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ className = '', dropUp = false }) => {
  const { currentLanguage, setLanguage, languages } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (code: SupportedLanguage) => {
    setLanguage(code);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className={`relative inline-block text-left ${className}`}>
      {/* Pill Button Matching Netflix / Premium UI Design */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label="Select language"
        className="flex items-center gap-1.5 px-3 py-1.5 bg-black/70 hover:bg-zinc-900/90 border border-zinc-700/80 hover:border-zinc-500 rounded-full text-xs font-bold text-white transition-all duration-200 cursor-pointer shadow-sm select-none focus:outline-none focus:ring-1 focus:ring-red-600/50"
      >
        <Globe className="w-3.5 h-3.5 text-zinc-300" />
        <span className="tracking-wide uppercase">{currentLanguage}</span>
        <ChevronDown
          className={`w-3 h-3 text-zinc-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={`absolute right-0 ${
            dropUp ? 'bottom-full mb-2' : 'top-full mt-2'
          } w-44 bg-[#18181b]/95 backdrop-blur-md border border-zinc-700/80 rounded-xl shadow-2xl py-1.5 z-50 animate-in fade-in zoom-in-95 duration-150`}
        >
          <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-zinc-400 border-b border-zinc-800 mb-1">
            Language / Langue
          </div>
          {languages.map((lang) => {
            const isSelected = currentLanguage === lang.code;
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => handleSelect(lang.code)}
                className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between transition cursor-pointer ${
                  isSelected
                    ? 'bg-red-600/15 text-white font-bold'
                    : 'text-zinc-300 hover:text-white hover:bg-zinc-800/80'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm leading-none">{lang.flag}</span>
                  <span>{lang.nativeLabel}</span>
                  <span className="text-[10px] text-zinc-400 uppercase font-mono">
                    ({lang.code})
                  </span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-red-500 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
