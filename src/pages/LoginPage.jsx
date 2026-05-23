import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useLang } from '../context/LanguageContext';

export default function LoginPage() {
  const { login, isAuthenticated, error, clearError } = useAuth();
  const { toast } = useToast();
  const { t } = useLang();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname ?? '/';

  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => { if (isAuthenticated) navigate(from, { replace: true }); }, [isAuthenticated]);
  useEffect(() => { clearError(); }, [form.email, form.password]);

  const validate = () => {
    const errs = {};
    if (!form.email.trim()) errs.email = t('login_err_email_required');
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = t('login_err_email_invalid');
    if (!form.password) errs.password = t('login_err_password_required');
    else if (form.password.length < 6) errs.password = t('login_err_password_short');
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    const result = await login(form.email.trim(), form.password);
    setIsSubmitting(false);
    if (result.success) { toast.success(t('login_success')); navigate(from, { replace: true }); }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 animate-fade-in">
      <div className="hidden lg:flex flex-col justify-end p-12 bg-cover bg-center relative" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=1200&q=80)' }}>
        <div className="absolute inset-0 bg-stone-900/60" />
        <div className="relative text-white">
          <p className="text-xs uppercase tracking-[0.25em] text-stone-300 mb-3">{t('login_hero_eyebrow')}</p>
          <h2 className="font-serif text-4xl text-white mb-3 leading-tight">{t('login_hero_h2')}</h2>
          <p className="text-stone-300 text-sm leading-relaxed max-w-sm">{t('login_hero_body')}</p>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm">
          <Link to="/" className="font-serif text-2xl text-stone-900 block mb-10">LUXE <span className="font-light italic">Textiles</span></Link>
          <h1 className="font-serif text-3xl text-stone-900 mb-1">{t('login_welcome')}</h1>
          <p className="text-stone-500 text-sm mb-8">{t('login_subtitle')}</p>
          <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs p-3 mb-6 rounded-sm">{t('login_demo_hint')}</div>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div>
              <label className="label-base" htmlFor="email">{t('login_email')}</label>
              <input id="email" type="email" autoComplete="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className={`input-base ${fieldErrors.email ? 'input-error' : ''}`} placeholder="you@example.com" disabled={isSubmitting} />
              {fieldErrors.email && <p className="text-xs text-red-500 mt-1">{fieldErrors.email}</p>}
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="label-base m-0" htmlFor="password">{t('login_password')}</label>
                <a href="#" className="text-xs text-stone-500 hover:text-stone-900">{t('login_forgot')}</a>
              </div>
              <div className="relative">
                <input id="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} className={`input-base pr-10 ${fieldErrors.password ? 'input-error' : ''}`} placeholder="••••••••" disabled={isSubmitting} />
                <button type="button" onClick={() => setShowPassword(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700">
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {fieldErrors.password && <p className="text-xs text-red-500 mt-1">{fieldErrors.password}</p>}
            </div>
            {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-3">{error}</p>}
            <button type="submit" disabled={isSubmitting} className="btn-primary w-full justify-center py-3.5 text-sm uppercase tracking-widest">
              {isSubmitting && <Loader2 size={16} className="animate-spin" />}
              {isSubmitting ? t('login_submitting') : t('login_submit')}
            </button>
          </form>
          <p className="text-sm text-stone-500 text-center mt-7">
            {t('login_no_account')} <a href="#" className="text-stone-900 font-medium hover:underline">{t('login_create')}</a>
          </p>
        </div>
      </div>
    </div>
  );
}
