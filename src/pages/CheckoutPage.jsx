import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User, Phone, MapPin, MessageSquare, Truck, ShoppingBag,
  CreditCard, Banknote, CheckCircle, Send, Loader2,
  ExternalLink, ArrowLeft
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../context/LanguageContext';
import { useToast } from '../context/ToastContext';
import { sendOrderToTelegram, generateOrderNumber } from '../utils/telegram';

// ─── Telegram username of the store owner ─────────────────────────────────────
const TELEGRAM_USERNAME = 'MalikaMuhiddinovna';
const TELEGRAM_LINK = `https://t.me/${TELEGRAM_USERNAME}`;

// ─── Form initial state ───────────────────────────────────────────────────────
const EMPTY_FORM = {
  fullName: '',
  phone: '',
  deliveryMethod: 'delivery',   // 'delivery' | 'pickup'
  address: '',
  city: '',
  comment: '',
  paymentMethod: 'cash',        // 'cash' | 'card'
};

// ─── Success screen ───────────────────────────────────────────────────────────
function SuccessScreen({ orderNumber, phone, onContinue }) {
  const { t } = useLang();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center animate-fade-in">
      <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
        <CheckCircle size={40} className="text-emerald-600" />
      </div>

      <h1 className="font-serif text-3xl md:text-4xl text-stone-900 mb-3">
        {t('checkout_success_title')}
      </h1>
      <p className="text-stone-500 text-sm leading-relaxed max-w-md mb-8">
        {t('checkout_success_sub', {
          num: orderNumber,
          username: `@${TELEGRAM_USERNAME}`,
          phone: phone,
        })}
      </p>

      {/* Telegram direct link */}
      <div className="bg-stone-50 border border-stone-200 px-6 py-5 mb-8 w-full max-w-sm">
        <p className="text-xs text-stone-500 uppercase tracking-widest mb-3">
          {t('checkout_also_telegram')}
        </p>
        <a
          href={TELEGRAM_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 bg-[#2AABEE] text-white px-6 py-3 text-sm font-medium hover:bg-[#1d9ad9] transition-colors w-full"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.833.941z"/>
          </svg>
          @{TELEGRAM_USERNAME}
          <ExternalLink size={14} />
        </a>
      </div>

      <button onClick={onContinue} className="btn-primary px-10 py-3 text-sm uppercase tracking-widest">
        {t('checkout_success_btn')}
      </button>
    </div>
  );
}

// ─── Main Checkout Page ───────────────────────────────────────────────────────
export default function CheckoutPage() {
  const { items, itemCount, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const { t } = useLang();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    ...EMPTY_FORM,
    fullName: user?.name ?? '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderDone, setOrderDone] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');

  const shipping = subtotal >= 150 ? 0 : 12;
  const total = subtotal + shipping;

  // Redirect if cart is empty
  if (items.length === 0 && !orderDone) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center animate-fade-in">
        <ShoppingBag size={56} className="mx-auto text-stone-300 mb-5" />
        <h2 className="font-serif text-3xl text-stone-700 mb-3">{t('cart_empty_title')}</h2>
        <p className="text-stone-400 mb-8">{t('cart_empty_sub')}</p>
        <Link to="/shop" className="btn-primary">{t('cart_continue')}</Link>
      </div>
    );
  }

  if (orderDone) {
    return (
      <SuccessScreen
        orderNumber={orderNumber}
        phone={form.phone}
        onContinue={() => { clearCart(); navigate('/shop'); }}
      />
    );
  }

  // ── Field updater ──────────────────────────────────────────────────────────
  const set = field => e => {
    setForm(f => ({ ...f, [field]: e.target.value }));
    if (errors[field]) setErrors(e => { const ne = { ...e }; delete ne[field]; return ne; });
  };

  // ── Validation ─────────────────────────────────────────────────────────────
  const validate = () => {
    const errs = {};
    if (!form.fullName.trim()) errs.fullName = t('checkout_err_name');
    if (!form.phone.trim() || form.phone.replace(/\D/g, '').length < 9)
      errs.phone = t('checkout_err_phone');
    if (form.deliveryMethod === 'delivery') {
      if (!form.address.trim()) errs.address = t('checkout_err_address');
      if (!form.city.trim()) errs.city = t('checkout_err_city');
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async e => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    const num = generateOrderNumber();

    const result = await sendOrderToTelegram({
      orderInfo: form,
      items,
      subtotal,
      shipping,
      total,
    });

    setIsSubmitting(false);

    if (result.success) {
      setOrderNumber(num);
      setOrderDone(true);
      if (result.demo) {
        toast.info('Demo mode: Configure BOT_TOKEN in src/utils/telegram.js to send real Telegram messages.');
      }
    } else {
      toast.error(t('checkout_err_send'));
    }
  };

  // ── Reusable Field wrapper ─────────────────────────────────────────────────
  const Field = ({ icon: Icon, id, label, error, children }) => (
    <div>
      <label className="label-base" htmlFor={id}>
        {Icon && <Icon size={12} className="inline mr-1.5 -mt-0.5" />}
        {label}
      </label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-stone-50 animate-fade-in">
      {/* Page header */}
      <div className="bg-white border-b border-stone-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-5 flex items-center justify-between">
          <div>
            <p className="section-subtitle text-xs mb-0.5">LUXE Textiles</p>
            <h1 className="font-serif text-2xl text-stone-900">{t('checkout_title')}</h1>
          </div>
          <Link to="/cart" className="btn-ghost text-sm gap-2">
            <ArrowLeft size={15} /> {t('checkout_back')}
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <form onSubmit={handleSubmit} noValidate>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

            {/* ── Left: Form ──────────────────────────────────────────────── */}
            <div className="lg:col-span-3 space-y-6">

              {/* Contact info card */}
              <div className="bg-white border border-stone-200 p-6">
                <h2 className="font-serif text-lg text-stone-900 mb-5 flex items-center gap-2">
                  <User size={18} className="text-stone-500" />
                  {t('checkout_contact')}
                </h2>
                <div className="space-y-4">
                  <Field id="fullName" label={t('checkout_fullname')} error={errors.fullName}>
                    <input
                      id="fullName" type="text" value={form.fullName}
                      onChange={set('fullName')}
                      placeholder={t('checkout_fullname_ph')}
                      className={`input-base ${errors.fullName ? 'input-error' : ''}`}
                      disabled={isSubmitting}
                    />
                  </Field>
                  <Field id="phone" label={t('checkout_phone')} error={errors.phone}>
                    <input
                      id="phone" type="tel" value={form.phone}
                      onChange={set('phone')}
                      placeholder={t('checkout_phone_ph')}
                      className={`input-base ${errors.phone ? 'input-error' : ''}`}
                      disabled={isSubmitting}
                    />
                  </Field>
                </div>
              </div>

              {/* Delivery method card */}
              <div className="bg-white border border-stone-200 p-6">
                <h2 className="font-serif text-lg text-stone-900 mb-5 flex items-center gap-2">
                  <Truck size={18} className="text-stone-500" />
                  {t('checkout_delivery')}
                </h2>

                {/* Toggle buttons */}
                <div className="grid grid-cols-2 gap-3 mb-5">
                  {[
                    { val: 'delivery', label: t('checkout_home_delivery'), icon: Truck },
                    { val: 'pickup',   label: t('checkout_pickup'),        icon: ShoppingBag },
                  ].map(opt => (
                    <label
                      key={opt.val}
                      className={`flex flex-col items-center gap-2 p-4 border-2 cursor-pointer transition-all text-center
                        ${form.deliveryMethod === opt.val
                          ? 'border-stone-900 bg-stone-900 text-white'
                          : 'border-stone-200 text-stone-600 hover:border-stone-400'
                        }`}
                    >
                      <input
                        type="radio" name="deliveryMethod" value={opt.val}
                        checked={form.deliveryMethod === opt.val}
                        onChange={set('deliveryMethod')}
                        className="sr-only"
                      />
                      <opt.icon size={20} />
                      <span className="text-sm font-medium">{opt.label}</span>
                    </label>
                  ))}
                </div>

                {/* Address fields (only for home delivery) */}
                {form.deliveryMethod === 'delivery' && (
                  <div className="space-y-4 animate-slide-up">
                    <Field id="city" label={t('checkout_city')} error={errors.city}>
                      <input
                        id="city" type="text" value={form.city}
                        onChange={set('city')}
                        placeholder={t('checkout_city_ph')}
                        className={`input-base ${errors.city ? 'input-error' : ''}`}
                        disabled={isSubmitting}
                      />
                    </Field>
                    <Field id="address" label={t('checkout_address')} error={errors.address}>
                      <input
                        id="address" type="text" value={form.address}
                        onChange={set('address')}
                        placeholder={t('checkout_address_ph')}
                        className={`input-base ${errors.address ? 'input-error' : ''}`}
                        disabled={isSubmitting}
                      />
                    </Field>
                  </div>
                )}
              </div>

              {/* Payment method card */}
              <div className="bg-white border border-stone-200 p-6">
                <h2 className="font-serif text-lg text-stone-900 mb-5 flex items-center gap-2">
                  <CreditCard size={18} className="text-stone-500" />
                  {t('checkout_payment')}
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { val: 'cash', label: t('checkout_cash'), icon: Banknote },
                    { val: 'card', label: t('checkout_card'), icon: CreditCard },
                  ].map(opt => (
                    <label
                      key={opt.val}
                      className={`flex flex-col items-center gap-2 p-4 border-2 cursor-pointer transition-all text-center
                        ${form.paymentMethod === opt.val
                          ? 'border-stone-900 bg-stone-900 text-white'
                          : 'border-stone-200 text-stone-600 hover:border-stone-400'
                        }`}
                    >
                      <input
                        type="radio" name="paymentMethod" value={opt.val}
                        checked={form.paymentMethod === opt.val}
                        onChange={set('paymentMethod')}
                        className="sr-only"
                      />
                      <opt.icon size={20} />
                      <span className="text-sm font-medium">{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Comment */}
              <div className="bg-white border border-stone-200 p-6">
                <h2 className="font-serif text-lg text-stone-900 mb-4 flex items-center gap-2">
                  <MessageSquare size={18} className="text-stone-500" />
                  {t('checkout_comment')}
                </h2>
                <textarea
                  id="comment" rows={3} value={form.comment}
                  onChange={set('comment')}
                  placeholder={t('checkout_comment_ph')}
                  className="input-base resize-none text-sm"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* ── Right: Order summary ─────────────────────────────────────── */}
            <div className="lg:col-span-2">
              <div className="sticky top-24 space-y-4">

                {/* Summary card */}
                <div className="bg-white border border-stone-200 p-6">
                  <h2 className="font-serif text-lg text-stone-900 mb-4">
                    {t('checkout_summary')}
                    <span className="ml-2 text-stone-400 font-light text-sm">
                      ({t('checkout_items', { n: itemCount })})
                    </span>
                  </h2>

                  {/* Item list */}
                  <div className="space-y-3 mb-5">
                    {items.map(item => (
                      <div key={item.key} className="flex gap-3 text-sm">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-12 h-12 object-cover bg-stone-100 flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-stone-900 text-xs leading-tight line-clamp-2">
                            {item.name}
                          </p>
                          <div className="text-[11px] text-stone-400 mt-0.5 flex gap-2">
                            {item.color && <span>{item.color}</span>}
                            {item.size && <span>{item.size}</span>}
                          </div>
                          <p className="text-xs text-stone-600 mt-0.5">
                            ${item.price} × {item.quantity}
                          </p>
                        </div>
                        <span className="font-medium text-stone-900 text-xs flex-shrink-0">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Totals */}
                  <div className="border-t border-stone-100 pt-4 space-y-2 text-sm">
                    <div className="flex justify-between text-stone-600">
                      <span>{t('checkout_shipping_label')}</span>
                      <span>
                        {shipping === 0
                          ? <span className="text-emerald-600">{t('checkout_free')}</span>
                          : `$${shipping}`
                        }
                      </span>
                    </div>
                    <div className="flex justify-between font-semibold text-stone-900 text-base border-t border-stone-200 pt-2">
                      <span>{t('checkout_total')}</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Telegram info banner */}
                <div className="bg-[#2AABEE]/10 border border-[#2AABEE]/30 px-5 py-4 flex items-start gap-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="#2AABEE" className="mt-0.5 flex-shrink-0">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.833.941z"/>
                  </svg>
                  <div>
                    <p className="text-xs font-semibold text-stone-800 mb-0.5">Telegram</p>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      Buyurtmangiz <span className="font-medium text-[#2AABEE]">@{TELEGRAM_USERNAME}</span> ga yuboriladi
                    </p>
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full btn-primary justify-center py-4 text-sm uppercase tracking-widest gap-3"
                >
                  {isSubmitting
                    ? <><Loader2 size={16} className="animate-spin" />{t('checkout_submitting')}</>
                    : <><Send size={16} />{t('checkout_submit')}</>
                  }
                </button>

                {/* Direct Telegram link */}
                <a
                  href={TELEGRAM_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 border border-[#2AABEE] text-[#2AABEE] py-2.5 text-sm font-medium hover:bg-[#2AABEE]/5 transition-colors w-full"
                >
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.833.941z"/>
                  </svg>
                  {t('checkout_open_telegram')}
                </a>
              </div>
            </div>

          </div>
        </form>
      </div>
    </div>
  );
}
