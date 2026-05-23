import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, User, Menu, X, ChevronDown, Shield } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useLang } from '../../context/LanguageContext';
import LanguageSwitcher from '../ui/LanguageSwitcher';

export default function Header() {
  const { itemCount } = useCart();
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const { t } = useLang();
  const navigate = useNavigate();

  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const searchInputRef = useRef(null);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    const handler = e => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [navigate]);

  const handleSearch = e => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const NAV_LINKS = [
    { label: t('nav_towels'), to: '/shop?category=towels' },
    { label: t('nav_robes'), to: '/shop?category=robes' },
    { label: t('nav_bedding'), to: '/shop?category=bedding' },
    { label: t('nav_luggage'), to: '/shop?category=suitcases' },
    { label: t('nav_all'), to: '/shop' },
  ];

  return (
    <>
      <div className="bg-stone-900 text-stone-200 text-center py-2 text-xs tracking-widest font-medium uppercase">
        {t('announcement')}
      </div>

      <header className={`sticky top-0 z-50 bg-stone-50/95 backdrop-blur-md border-b border-stone-200 transition-shadow duration-300 ${scrolled ? 'shadow-sm' : ''}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <button className="lg:hidden btn-ghost -ml-2" onClick={() => setMobileOpen(o => !o)} aria-label="Toggle navigation">
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>

            <Link to="/" className="font-serif text-xl md:text-2xl font-semibold tracking-tight text-stone-900 hover:text-stone-700 transition-colors">
              SHOPPING <span className="font-light italic">Time</span>
            </Link>

            <nav className="hidden lg:flex items-center gap-8" aria-label="Primary navigation">
              {NAV_LINKS.map(link => (
                <Link key={link.label} to={link.to} className="nav-link">{link.label}</Link>
              ))}
            </nav>

            <div className="flex items-center gap-1">
              <LanguageSwitcher />

              <button className="btn-ghost p-2" onClick={() => setSearchOpen(o => !o)} aria-label="Search">
                <Search size={20} />
              </button>

              <div className="relative" ref={userMenuRef}>
                <button className="btn-ghost p-2 flex items-center gap-1" onClick={() => setUserMenuOpen(o => !o)} aria-label="Account" aria-expanded={userMenuOpen}>
                  <User size={20} />
                  {isAuthenticated && <ChevronDown size={13} className="hidden sm:block text-stone-400" />}
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white border border-stone-200 shadow-lg py-1.5 animate-slide-up">
                    {isAuthenticated ? (
                      <>
                        <div className="px-4 py-2.5 border-b border-stone-100">
                          <p className="text-xs font-medium text-stone-900 truncate">{user?.name}</p>
                          <p className="text-xs text-stone-400 truncate">{user?.email}</p>
                        </div>
                        {isAdmin && (
                          <Link to="/admin" className="flex items-center gap-2 px-4 py-2 text-sm text-stone-700 hover:bg-stone-50 transition-colors" onClick={() => setUserMenuOpen(false)}>
                            <Shield size={14} className="text-amber-600" />
                            {t('nav_admin')}
                          </Link>
                        )}
                        <button onClick={() => { logout(); setUserMenuOpen(false); }} className="w-full text-left px-4 py-2 text-sm text-stone-600 hover:bg-stone-50 transition-colors">
                          {t('nav_signout')}
                        </button>
                      </>
                    ) : (
                      <>
                        <Link to="/login" className="block px-4 py-2 text-sm text-stone-700 hover:bg-stone-50 transition-colors" onClick={() => setUserMenuOpen(false)}>
                          {t('nav_signin')}
                        </Link>
                        <div className="px-4 py-2 text-xs text-stone-400 border-t border-stone-100 mt-1">
                          {t('nav_demo')}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              <Link to="/cart" className="btn-ghost p-2 relative" aria-label={`Cart, ${itemCount} items`}>
                <ShoppingBag size={20} />
                {itemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] min-h-[18px] bg-stone-900 text-stone-50 text-[10px] font-bold flex items-center justify-center leading-none px-1">
                    {itemCount > 99 ? '99+' : itemCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>

        {searchOpen && (
          <div className="border-t border-stone-200 bg-white animate-slide-up">
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
              <Search size={18} className="text-stone-400 flex-shrink-0" />
              <input ref={searchInputRef} type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder={t('search_placeholder')} className="flex-1 text-sm text-stone-900 placeholder:text-stone-400 bg-transparent focus:outline-none" />
              {searchQuery && <button type="button" onClick={() => setSearchQuery('')} className="text-stone-400 hover:text-stone-700"><X size={16} /></button>}
              <button type="button" onClick={() => setSearchOpen(false)} className="text-stone-400 hover:text-stone-700 pl-2 border-l border-stone-200"><X size={18} /></button>
            </form>
          </div>
        )}
      </header>

      {mobileOpen && (
        <>
          <div className="lg:hidden fixed inset-0 z-40 bg-stone-900/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <nav className="lg:hidden fixed top-0 left-0 z-50 h-full w-72 bg-white shadow-2xl flex flex-col pt-20 pb-8 px-6 gap-1 animate-slide-up overflow-y-auto">
            {NAV_LINKS.map(link => (
              <Link key={link.label} to={link.to} onClick={() => setMobileOpen(false)} className="py-3 border-b border-stone-100 text-stone-700 font-medium text-sm hover:text-stone-900 transition-colors">
                {link.label}
              </Link>
            ))}
            {isAdmin && (
              <Link to="/admin" onClick={() => setMobileOpen(false)} className="py-3 border-b border-stone-100 text-amber-700 font-medium text-sm flex items-center gap-2">
                <Shield size={14} />{t('nav_admin')}
              </Link>
            )}
          </nav>
        </>
      )}
    </>
  );
}
