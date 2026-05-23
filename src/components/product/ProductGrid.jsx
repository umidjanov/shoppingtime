import React from 'react';
import ProductCard from './ProductCard';
import { ProductGridSkeleton } from '../ui/Skeleton';
import { PackageSearch } from 'lucide-react';
import { useLang } from '../../context/LanguageContext';

export default function ProductGrid({ products, isLoading, emptyMessage }) {
  const { t } = useLang();
  if (isLoading) return <ProductGridSkeleton count={8} />;
  if (!products || products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center animate-fade-in">
        <PackageSearch size={48} className="text-stone-300 mb-4" />
        <h3 className="font-serif text-2xl text-stone-700 mb-2">{t('shop_no_products')}</h3>
        <p className="text-sm text-stone-400 max-w-xs">{emptyMessage || t('shop_no_products_sub')}</p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {products.map(product => <ProductCard key={product.id} product={product} />)}
    </div>
  );
}
