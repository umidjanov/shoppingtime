import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Twitter, Facebook, ArrowRight } from 'lucide-react';
import { useLang } from '../../context/LanguageContext';

export default function Footer() {
  const { t } = useLang();

  const LINKS = {
    [t('footer_shop')]: [
      { label: t('nav_towels'), to: '/shop?category=towels' },
      { label: t('nav_robes'), to: '/shop?category=robes' },
      { label: t('nav_bedding'), to: '/shop?category=bedding' },
      { label: t('nav_luggage'), to: '/shop?category=suitcases' },
      { label: t('footer_new_arrivals'), to: '/shop' },
    ],
    [t('footer_company')]: [
      { label: t('footer_about'), to: '/' },
      { label: t('footer_sustainability'), to: '/' },
      { label: t('footer_careers'), to: '/' },
      { label: t('footer_press'), to: '/' },
    ],
    [t('footer_support')]: [
      { label: t('footer_shipping'), to: '/' },
      { label: t('footer_care'), to: '/' },
      { label: t('footer_size'), to: '/' },
      { label: t('footer_contact'), to: '/' },
    ],
  };

  return (
    <footer className="bg-stone-900 text-stone-300 mt-auto">
      <div className="border-b border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <h3 className="font-serif text-white text-2xl mb-1">{t('footer_newsletter_title')}</h3>
            <p className="text-sm text-stone-400">{t('footer_newsletter_sub')}</p>
          </div>
          <form className="flex w-full md:w-auto gap-0" onSubmit={e => e.preventDefault()}>
            <input type="email" placeholder="your@email.com" className="flex-1 md:w-64 bg-stone-800 border border-stone-700 text-stone-100 placeholder:text-stone-500 px-4 py-2.5 text-sm focus:outline-none focus:border-stone-500" />
            <button type="submit" className="bg-stone-50 text-stone-900 px-5 py-2.5 flex items-center gap-2 text-sm font-medium hover:bg-white transition-colors">
              {t('footer_subscribe')} <ArrowRight size={14} />
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14 grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12">
        <div className="col-span-2 md:col-span-1">
          <Link to="/" className="font-serif text-white text-xl font-semibold">
            LUXE <span className="font-light italic">Textiles</span>
          </Link>
          <p className="mt-3 text-sm text-stone-400 leading-relaxed max-w-52">{t('footer_since')}</p>
          <div className="flex gap-3 mt-5">
            {[Instagram, Twitter, Facebook].map((Icon, i) => (
              <a key={i} href="#" className="w-8 h-8 border border-stone-700 flex items-center justify-center text-stone-400 hover:text-white hover:border-stone-500 transition-all">
                <Icon size={14} />
              </a>
            ))}
          </div>
        </div>

        {Object.entries(LINKS).map(([section, links]) => (
          <div key={section}>
            <h4 className="text-xs uppercase tracking-[0.2em] font-medium text-stone-400 mb-4">{section}</h4>
            <ul className="space-y-2.5">
              {links.map(link => (
                <li key={link.label}>
                  <Link to={link.to} className="text-sm text-stone-400 hover:text-white transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-500">
          <p>{t('footer_rights', { year: new Date().getFullYear() })}</p>
          <div className="flex gap-5">
            <a href="#" className="hover:text-stone-300 transition-colors">{t('footer_privacy')}</a>
            <a href="#" className="hover:text-stone-300 transition-colors">{t('footer_terms')}</a>
            <a href="#" className="hover:text-stone-300 transition-colors">{t('footer_cookies')}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
