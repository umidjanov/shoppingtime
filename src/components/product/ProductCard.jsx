import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Eye, Heart } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useToast } from '../../context/ToastContext';
import { useLang } from '../../context/LanguageContext';
import StarRating from '../ui/StarRating';

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const { toast } = useToast();
  const { t } = useLang();
  const [imgIdx, setImgIdx] = useState(0);
  const [wished, setWished] = useState(false);

  const handleQuickAdd = e => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product, product.colors?.[0] ?? null, product.sizes?.[0] ?? null, 1);
    toast.success(t('toast_added_cart', { name: product.name }));
  };

  const image = product.images?.[imgIdx] ?? product.images?.[0] ?? '';
  const isOutOfStock = product.stock === 0;

  return (
    <article className="group card overflow-hidden animate-fade-in">
      <div className="relative overflow-hidden bg-stone-100 aspect-[3/4]">
        <Link to={`/product/${product.id}`} aria-label={`View ${product.name}`}>
          <img src={image} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
          {product.images?.length > 1 && (
            <img src={product.images[1]} alt={`${product.name} alternate`} className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500" loading="lazy" />
          )}
        </Link>

        <div className="absolute top-3 left-3 flex flex-col gap-1.5">
          {product.isFeatured && <span className="badge badge-amber text-[10px]">{t('card_featured')}</span>}
          {isOutOfStock && <span className="badge bg-stone-800 text-stone-200 text-[10px]">{t('card_out_of_stock')}</span>}
          {product.stock > 0 && product.stock < 10 && <span className="badge bg-red-50 text-red-700 text-[10px]">{t('card_only_left', { n: product.stock })}</span>}
        </div>

        <button onClick={e => { e.preventDefault(); setWished(w => !w); }}
          className="absolute top-3 right-3 w-8 h-8 bg-white/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-white"
          aria-label="Wishlist">
          <Heart size={15} className={wished ? 'text-red-500 fill-red-500' : 'text-stone-600'} />
        </button>

        <div className="absolute bottom-0 left-0 right-0 flex gap-px translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <button onClick={handleQuickAdd} disabled={isOutOfStock}
            className="flex-1 bg-stone-900 text-stone-50 py-3 text-xs font-medium uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-stone-800 active:bg-stone-950 transition-colors disabled:bg-stone-300 disabled:cursor-not-allowed">
            <ShoppingBag size={14} />
            {isOutOfStock ? t('card_out_of_stock') : t('card_quick_add')}
          </button>
          <Link to={`/product/${product.id}`}
            className="w-12 bg-white text-stone-900 flex items-center justify-center border-l border-stone-200 hover:bg-stone-50 transition-colors"
            aria-label="View product">
            <Eye size={16} />
          </Link>
        </div>

        {product.images?.length > 1 && (
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {product.images.slice(0, 3).map((_, i) => (
              <button key={i} onClick={e => { e.preventDefault(); setImgIdx(i); }}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${i === imgIdx ? 'bg-white' : 'bg-white/50'}`} />
            ))}
          </div>
        )}
      </div>

      <div className="p-4">
        <p className="section-subtitle text-[10px] mb-1">{t(`cat_${product.category}`) || product.category}</p>
        <Link to={`/product/${product.id}`} className="font-serif text-base text-stone-900 hover:text-stone-600 transition-colors line-clamp-1 block">
          {product.name}
        </Link>
        <div className="mt-1.5 flex items-center justify-between">
          <span className="font-medium text-stone-900">${product.price}</span>
          {product.rating > 0 && <StarRating rating={product.rating} size={12} showCount={false} />}
        </div>
        {product.colors?.length > 0 && (
          <div className="mt-2.5 flex gap-1 flex-wrap">
            {product.colors.slice(0, 5).map(c => (
              <span key={c} className="text-[10px] px-1.5 py-0.5 border border-stone-200 text-stone-500">{c}</span>
            ))}
            {product.colors.length > 5 && <span className="text-[10px] text-stone-400">+{product.colors.length - 5}</span>}
          </div>
        )}
      </div>
    </article>
  );
}
