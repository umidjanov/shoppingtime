import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useLang } from '../context/LanguageContext';

export default function CartPage() {
  const { items, itemCount, subtotal, isEmpty, removeItem, updateQuantity, clearCart } = useCart();
  const { toast } = useToast();
  const { t } = useLang();
  const navigate = useNavigate();

  const handleRemove = (item) => {
    removeItem(item.key);
    toast.info(t('cart_removed', { name: item.name }));
  };

  const shipping = subtotal >= 150 ? 0 : 12;
  const total = subtotal + shipping;

  if (isEmpty) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center animate-fade-in">
        <ShoppingBag size={56} className="mx-auto text-stone-300 mb-5" />
        <h2 className="font-serif text-3xl text-stone-700 mb-3">{t('cart_empty_title')}</h2>
        <p className="text-stone-400 mb-8">{t('cart_empty_sub')}</p>
        <Link to="/shop" className="btn-primary">{t('cart_continue')}</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 animate-fade-in">
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-serif text-3xl text-stone-900">
          {t('cart_title')} <span className="text-stone-400 font-light text-xl ml-2">({itemCount})</span>
        </h1>
        <button onClick={() => { clearCart(); toast.info(t('cart_cleared')); }} className="text-xs text-stone-400 hover:text-red-600 transition-colors">
          {t('cart_clear')}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-0">
          {items.map((item, idx) => (
            <div key={item.key} className={`flex gap-5 py-6 ${idx < items.length - 1 ? 'border-b border-stone-200' : ''} animate-fade-in`}>
              <Link to={`/product/${item.productId}`} className="flex-shrink-0">
                <img src={item.image} alt={item.name} className="w-24 h-24 md:w-28 md:h-28 object-cover bg-stone-100" />
              </Link>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-stone-400 mb-0.5">{t(`cat_${item.category}`) || item.category}</p>
                    <Link to={`/product/${item.productId}`} className="font-serif text-base text-stone-900 hover:text-stone-600 transition-colors block">{item.name}</Link>
                    <div className="flex gap-3 mt-1 text-xs text-stone-500">
                      {item.color && <span>{t('cart_color')}: {item.color}</span>}
                      {item.size && <span>{t('cart_size')}: {item.size}</span>}
                    </div>
                  </div>
                  <p className="font-medium text-stone-900 flex-shrink-0">${(item.price * item.quantity).toFixed(2)}</p>
                </div>
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center border border-stone-200">
                    <button onClick={() => updateQuantity(item.key, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center text-stone-500 hover:bg-stone-100 transition-colors" disabled={item.quantity <= 1}><Minus size={12} /></button>
                    <span className="w-8 text-center text-sm">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.key, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center text-stone-500 hover:bg-stone-100 transition-colors" disabled={item.quantity >= item.stock}><Plus size={12} /></button>
                  </div>
                  <button onClick={() => handleRemove(item)} className="text-stone-400 hover:text-red-600 transition-colors p-1" aria-label="Remove item"><Trash2 size={15} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="bg-stone-50 border border-stone-200 p-6 sticky top-24">
            <h2 className="font-serif text-xl text-stone-900 mb-5">{t('cart_summary')}</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-stone-600">
                <span>{t('cart_subtotal', { n: itemCount })}</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>{t('cart_shipping')}</span>
                <span>{shipping === 0 ? <span className="text-emerald-600">{t('cart_free_shipping')}</span> : `$${shipping}`}</span>
              </div>
              {shipping > 0 && <p className="text-xs text-stone-400">{t('cart_shipping_threshold', { n: (150 - subtotal).toFixed(2) })}</p>}
              <div className="border-t border-stone-300 pt-3 flex justify-between font-semibold text-stone-900 text-base">
                <span>{t('cart_total')}</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            {/* ── CHECKOUT BUTTON — navigates to /checkout ── */}
            <button
              onClick={() => navigate('/checkout')}
              className="btn-primary w-full justify-center mt-6 py-4 text-sm uppercase tracking-widest"
            >
              {t('cart_checkout')} <ArrowRight size={15} />
            </button>

            <Link to="/shop" className="block text-center text-sm text-stone-500 hover:text-stone-900 mt-4 transition-colors">{t('cart_back')}</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
