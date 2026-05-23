import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { useLang } from '../../context/LanguageContext';

export default function LanguageSwitcher() {
  const { lang, setLang, languages } = useLang();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const current = languages.find(l => l.code === lang) ?? languages[0];

  useEffect(() => {
    const handler = e => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(o => !o)}
        className="btn-ghost p-2 flex items-center gap-1 text-xs font-medium"
        aria-label="Change language"
        aria-expanded={open}
      >
        <span className="text-sm leading-none">{current.flag}</span>
        <span className="hidden sm:inline text-stone-600">{current.label}</span>
        <ChevronDown
          size={12}
          className={`text-stone-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-40 bg-white border border-stone-200 shadow-lg py-1 animate-slide-up z-50">
          {languages.map(l => (
            <button
              key={l.code}
              onClick={() => { setLang(l.code); setOpen(false); }}
              className={`w-full text-left px-4 py-2.5 text-sm flex items-center justify-between gap-3
                          transition-colors hover:bg-stone-50
                          ${l.code === lang ? 'text-stone-900 font-medium' : 'text-stone-600'}`}
            >
              <span className="flex items-center gap-2.5">
                <span className="text-base leading-none">{l.flag}</span>
                <span>{l.fullLabel}</span>
              </span>
              {l.code === lang && <Check size={13} className="text-stone-900" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
