import React, { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { useLang } from '../context/LanguageContext';
import ProductGrid from '../components/product/ProductGrid';

export default function ShopPage() {
  const { searchProducts, isLoading, stats } = useProducts();
  const { t } = useLang();
  const [searchParams, setSearchParams] = useSearchParams();

  const [query, setQuery] = useState(searchParams.get('q') ?? '');
  const [category, setCategory] = useState(searchParams.get('category') ?? 'all');
  const [sortBy, setSortBy] = useState('default');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    setQuery(searchParams.get('q') ?? '');
    setCategory(searchParams.get('category') ?? 'all');
  }, [searchParams]);

  useEffect(() => {
    const params = {};
    if (query) params.q = query;
    if (category && category !== 'all') params.category = category;
    setSearchParams(params, { replace: true });
  }, [query, category]);

  const CATEGORIES = [
    { value: 'all', label: t('shop_all') },
    { value: 'towels', label: t('cat_towels') },
    { value: 'robes', label: t('cat_robes') },
    { value: 'bedding', label: t('cat_bedding') },
    { value: 'suitcases', label: t('cat_suitcases') },
  ];

  const SORT_OPTIONS = [
    { value: 'default', label: t('shop_featured') },
    { value: 'newest', label: t('shop_newest') },
    { value: 'price-asc', label: t('shop_price_asc') },
    { value: 'price-desc', label: t('shop_price_desc') },
    { value: 'rating', label: t('shop_top_rated') },
  ];

  const products = useMemo(
    () => searchProducts(query, category, { sortBy, inStockOnly }),
    [searchProducts, query, category, sortBy, inStockOnly]
  );

  const activeFilterCount = [category !== 'all', sortBy !== 'default', inStockOnly].filter(Boolean).length;
  const clearFilters = () => { setQuery(''); setCategory('all'); setSortBy('default'); setInStockOnly(false); };
  const categoryLabel = CATEGORIES.find(c => c.value === category)?.label ?? t('shop_all');

  return (
    <div className="min-h-screen">
      <div className="bg-stone-50 border-b border-stone-200 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <p className="section-subtitle mb-2">{t('shop_collection')}</p>
          <h1 className="section-title">{categoryLabel}</h1>
          {query && <p className="text-stone-500 text-sm mt-2">{t('shop_results_for')} <em className="text-stone-700">"{query}"</em></p>}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="hidden md:flex items-center gap-1 flex-wrap">
            {CATEGORIES.map(cat => (
              <button key={cat.value} onClick={() => setCategory(cat.value)}
                className={`px-4 py-2 text-sm font-medium transition-all border ${category === cat.value ? 'bg-stone-900 text-white border-stone-900' : 'border-stone-200 text-stone-600 hover:border-stone-400 hover:text-stone-900'}`}>
                {cat.label}
                {cat.value !== 'all' && stats.byCategory[cat.value] && (
                  <span className="ml-1.5 text-xs opacity-60">({stats.byCategory[cat.value]})</span>
                )}
              </button>
            ))}
          </div>

          <button className="md:hidden btn-ghost gap-2 border border-stone-300" onClick={() => setFiltersOpen(o => !o)}>
            <SlidersHorizontal size={15} />{t('shop_filters')}
            {activeFilterCount > 0 && <span className="w-5 h-5 bg-stone-900 text-white text-xs rounded-full flex items-center justify-center">{activeFilterCount}</span>}
          </button>

          <div className="flex items-center gap-3">
            <label className="hidden sm:flex items-center gap-2 text-sm text-stone-600 cursor-pointer select-none">
              <input type="checkbox" checked={inStockOnly} onChange={e => setInStockOnly(e.target.checked)} className="w-4 h-4 accent-stone-900" />
              {t('shop_in_stock')}
            </label>
            <div className="relative">
              <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="input-base pr-8 text-sm w-auto appearance-none cursor-pointer">
                {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
            </div>
            <p className="text-sm text-stone-500 hidden sm:block">{isLoading ? '…' : t('shop_results', { n: products.length })}</p>
            {activeFilterCount > 0 && (
              <button onClick={clearFilters} className="text-xs text-stone-500 hover:text-stone-900 flex items-center gap-1 transition-colors">
                <X size={13} /> {t('shop_clear')}
              </button>
            )}
          </div>
        </div>

        {filtersOpen && (
          <div className="md:hidden bg-stone-50 border border-stone-200 p-4 mb-6 animate-slide-up">
            <div className="mb-4">
              <p className="label-base mb-2">{t('shop_collection')}</p>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(cat => (
                  <button key={cat.value} onClick={() => setCategory(cat.value)}
                    className={`px-3 py-1.5 text-xs font-medium border transition-all ${category === cat.value ? 'bg-stone-900 text-white border-stone-900' : 'border-stone-200 text-stone-600'}`}>
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm text-stone-600 cursor-pointer">
              <input type="checkbox" checked={inStockOnly} onChange={e => setInStockOnly(e.target.checked)} className="w-4 h-4 accent-stone-900" />
              {t('shop_in_stock')}
            </label>
          </div>
        )}

        <div className="mb-8">
          <div className="relative max-w-sm">
            <input type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder={t('shop_search')} className="input-base pr-8" />
            {query && <button onClick={() => setQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"><X size={15} /></button>}
          </div>
        </div>

        <ProductGrid products={products} isLoading={isLoading} emptyMessage={t('shop_no_products_sub')} />
      </div>
    </div>
  );
}
