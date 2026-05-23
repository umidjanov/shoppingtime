import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, ChevronLeft, ChevronRight, Truck, RotateCcw, Shield, Minus, Plus } from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import { useLang } from '../context/LanguageContext';
import { ProductDetailSkeleton } from '../components/ui/Skeleton';
import StarRating from '../components/ui/StarRating';
import ProductCard from '../components/product/ProductCard';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getProductById, getRelatedProducts, isLoading } = useProducts();
  const { addItem } = useCart();
  const { toast } = useToast();
  const { t } = useLang();

  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [activeImgIdx, setActiveImgIdx] = useState(0);
  const [errors, setErrors] = useState({});

  const product = getProductById(id);
  const related = getRelatedProducts(id, 4);

  useEffect(() => {
    if (product) {
      setSelectedColor(product.colors?.[0] ?? null);
      setSelectedSize(product.sizes?.[0] ?? null);
      setActiveImgIdx(0);
      setQuantity(1);
      setErrors({});
    }
  }, [id, product]);

  if (isLoading) return <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12"><ProductDetailSkeleton /></div>;

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-24 text-center">
        <h2 className="font-serif text-3xl text-stone-700 mb-4">{t('detail_not_found')}</h2>
        <p className="text-stone-500 mb-8">{t('detail_not_found_sub')}</p>
        <button onClick={() => navigate('/shop')} className="btn-primary">{t('detail_back')}</button>
      </div>
    );
  }

  const validate = () => {
    const errs = {};
    if (product.colors?.length > 0 && !selectedColor) errs.color = t('detail_select_color');
    if (product.sizes?.length > 0 && !selectedSize) errs.size = t('detail_select_size');
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleAddToCart = () => {
    if (!validate()) return;
    addItem(product, selectedColor, selectedSize, quantity);
    toast.success(t('detail_added_cart', { name: product.name }));
  };

  const imgs = product.images ?? [];
  const isOutOfStock = product.stock === 0;
  const prevImg = () => setActiveImgIdx(i => (i - 1 + imgs.length) % imgs.length);
  const nextImg = () => setActiveImgIdx(i => (i + 1) % imgs.length);

  return (
    <div className="animate-fade-in">
      <div className="border-b border-stone-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-2 text-xs text-stone-500">
          <Link to="/" className="hover:text-stone-900 transition-colors">{t('detail_breadcrumb_home')}</Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-stone-900 transition-colors">{t('detail_breadcrumb_shop')}</Link>
          <span>/</span>
          <Link to={`/shop?category=${product.category}`} className="hover:text-stone-900 transition-colors">{t(`cat_${product.category}`) || product.category}</Link>
          <span>/</span>
          <span className="text-stone-700 truncate max-w-40">{product.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
          <div className="space-y-3">
            <div className="relative bg-stone-100 aspect-square overflow-hidden group">
              {imgs.length > 0 ? (
                <img src={imgs[activeImgIdx]} alt={`${product.name} — view ${activeImgIdx + 1}`} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-stone-400">No image</div>
              )}
              {imgs.length > 1 && (
                <>
                  <button onClick={prevImg} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors opacity-0 group-hover:opacity-100" aria-label="Previous image"><ChevronLeft size={18} /></button>
                  <button onClick={nextImg} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors opacity-0 group-hover:opacity-100" aria-label="Next image"><ChevronRight size={18} /></button>
                </>
              )}
              {imgs.length > 1 && <div className="absolute bottom-3 right-3 bg-white/80 backdrop-blur-sm text-xs px-2 py-1 text-stone-700 font-mono">{activeImgIdx + 1} / {imgs.length}</div>}
            </div>
            {imgs.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {imgs.map((img, i) => (
                  <button key={i} onClick={() => setActiveImgIdx(i)} className={`aspect-square overflow-hidden bg-stone-100 border-2 transition-all ${i === activeImgIdx ? 'border-stone-900' : 'border-transparent hover:border-stone-300'}`}>
                    <img src={img} alt={`Thumbnail ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col">
            <p className="section-subtitle text-xs mb-2">{t(`cat_${product.category}`) || product.category}</p>
            <h1 className="font-serif text-3xl md:text-4xl text-stone-900 mb-3">{product.name}</h1>
            {product.rating > 0 && <StarRating rating={product.rating} reviewCount={product.reviewCount} />}
            <div className="mt-4 flex items-baseline gap-3">
              <span className="font-serif text-3xl text-stone-900">${product.price}</span>
              {isOutOfStock && <span className="badge bg-stone-100 text-stone-500 text-xs">{t('detail_out_of_stock')}</span>}
              {!isOutOfStock && product.stock < 10 && <span className="text-xs text-red-600 font-medium">{t('card_only_left', { n: product.stock })}</span>}
            </div>
            {product.tags?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {product.tags.map(tag => <span key={tag} className="badge badge-stone text-[10px]">{tag}</span>)}
              </div>
            )}
            <p className="text-stone-600 text-sm leading-relaxed mt-5 border-t border-stone-100 pt-5">{product.description}</p>

            {product.colors?.length > 0 && (
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="label-base m-0">{t('detail_color')}</p>
                  {selectedColor && <span className="text-xs text-stone-500">{selectedColor}</span>}
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map(color => (
                    <button key={color} onClick={() => { setSelectedColor(color); setErrors(e => ({ ...e, color: undefined })); }}
                      className={`px-3 py-1.5 text-xs border transition-all ${selectedColor === color ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-300 text-stone-600 hover:border-stone-600'}`}>
                      {color}
                    </button>
                  ))}
                </div>
                {errors.color && <p className="text-xs text-red-500 mt-1">{errors.color}</p>}
              </div>
            )}

            {product.sizes?.length > 0 && (
              <div className="mt-5">
                <p className="label-base mb-2">{t('detail_size')}</p>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map(size => (
                    <button key={size} onClick={() => { setSelectedSize(size); setErrors(e => ({ ...e, size: undefined })); }}
                      className={`px-4 py-2 text-xs border transition-all ${selectedSize === size ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-300 text-stone-600 hover:border-stone-600'}`}>
                      {size}
                    </button>
                  ))}
                </div>
                {errors.size && <p className="text-xs text-red-500 mt-1">{errors.size}</p>}
              </div>
            )}

            <div className="mt-6">
              <p className="label-base mb-2">{t('detail_quantity')}</p>
              <div className="flex items-center border border-stone-300 w-fit">
                <button onClick={() => setQuantity(q => Math.max(1, q - 1))} className="w-10 h-10 flex items-center justify-center text-stone-600 hover:bg-stone-100 transition-colors" disabled={quantity <= 1}><Minus size={14} /></button>
                <span className="w-12 text-center text-sm font-medium text-stone-900">{quantity}</span>
                <button onClick={() => setQuantity(q => Math.min(product.stock, q + 1))} className="w-10 h-10 flex items-center justify-center text-stone-600 hover:bg-stone-100 transition-colors" disabled={quantity >= product.stock}><Plus size={14} /></button>
              </div>
            </div>

            <div className="flex gap-3 mt-7">
              <button onClick={handleAddToCart} disabled={isOutOfStock} className="flex-1 btn-primary justify-center py-4 text-sm uppercase tracking-widest">
                <ShoppingBag size={16} />
                {isOutOfStock ? t('detail_out_of_stock') : t('detail_add_cart')}
              </button>
            </div>

            <div className="mt-8 pt-6 border-t border-stone-100 grid grid-cols-3 gap-3">
              {[
                { icon: Truck, label: t('detail_free_shipping'), sub: t('detail_free_shipping_sub') },
                { icon: RotateCcw, label: t('detail_returns'), sub: t('detail_returns_sub') },
                { icon: Shield, label: t('detail_authentic'), sub: t('detail_authentic_sub') },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="text-center">
                  <Icon size={18} className="mx-auto text-stone-500 mb-1" />
                  <p className="text-xs font-medium text-stone-700">{label}</p>
                  <p className="text-[10px] text-stone-400">{sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {related.length > 0 && (
          <section className="mt-20 pt-12 border-t border-stone-200">
            <div className="flex items-end justify-between mb-8">
              <div>
                <p className="section-subtitle mb-2">{t('detail_related_eyebrow')}</p>
                <h2 className="font-serif text-2xl text-stone-900">{t('detail_related_h2')}</h2>
              </div>
              <Link to={`/shop?category=${product.category}`} className="text-sm text-stone-500 hover:text-stone-900 transition-colors">{t('detail_view_all')}</Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {related.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
