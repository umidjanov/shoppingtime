import React from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../context/LanguageContext';

export default function NotFoundPage() {
  const { t } = useLang();
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center animate-fade-in">
      <p className="font-mono text-7xl font-bold text-stone-200 mb-4">404</p>
      <h1 className="font-serif text-3xl text-stone-700 mb-3">{t('notfound_title')}</h1>
      <p className="text-stone-400 mb-8 max-w-xs">{t('notfound_sub')}</p>
      <div className="flex gap-4">
        <Link to="/" className="btn-primary">{t('notfound_home')}</Link>
        <Link to="/shop" className="btn-secondary">{t('notfound_shop')}</Link>
      </div>
    </div>
  );
}
