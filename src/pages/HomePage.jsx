import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { useLang } from '../context/LanguageContext';
import ProductGrid from '../components/product/ProductGrid';

export default function HomePage() {
  const { getFeaturedProducts, isLoading } = useProducts();
  const { t } = useLang();
  const featured = getFeaturedProducts(4);

  const CATEGORIES = [
    { slug: 'towels', label: t('cat_towels'), description: t('cat_towels_sub'), image: 'https://images.unsplash.com/photo-1600369672770-985fd30004eb?w=600&q=80' },
    { slug: 'robes', label: t('cat_robes'), description: t('cat_robes_sub'), image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=600&q=80' },
    { slug: 'bedding', label: t('cat_bedding'), description: t('cat_bedding_sub'), image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80' },
    { slug: 'suitcases', label: t('cat_suitcases'), description: t('cat_suitcases_sub'), image: 'https://images.unsplash.com/photo-1565026057447-bc90a3dceb87?w=600&q=80' },
  ];

  return (
    <div className="animate-fade-in">
      <section className="relative bg-stone-900 text-white overflow-hidden min-h-[85vh] flex items-center">
        <div className="absolute inset-0 bg-cover bg-center opacity-25" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1616594039964-ae9021a400a0?w=1600&q=80)' }} />
        <div className="absolute inset-0 bg-gradient-to-r from-stone-950/80 via-stone-900/60 to-transparent" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-24">
          <div className="max-w-2xl">
            <p className="section-subtitle text-stone-400 mb-5">{t('home_eyebrow')}</p>
            <h1 className="font-serif text-5xl md:text-7xl font-light text-white leading-[1.05] mb-6">
              {t('home_hero_h1_1')}<br />
              <em className="italic font-normal">{t('home_hero_h1_em')}</em> {t('home_hero_h1_2')}
            </h1>
            <p className="text-lg text-stone-300 font-light leading-relaxed mb-10 max-w-lg">{t('home_hero_body')}</p>
            <div className="flex flex-wrap items-center gap-4">
              <Link to="/shop" className="btn-primary text-sm uppercase tracking-widest py-4 px-8">{t('home_shop_all')}</Link>
              <Link to="/shop?category=bedding" className="text-stone-300 text-sm font-medium flex items-center gap-2 hover:text-white transition-colors group">
                {t('home_explore_bedding')} <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <div className="text-center mb-12">
          <p className="section-subtitle mb-3">{t('home_categories_eyebrow')}</p>
          <h2 className="section-title">{t('home_categories_h2')}</h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {CATEGORIES.map(cat => (
            <Link key={cat.slug} to={`/shop?category=${cat.slug}`} className="group relative overflow-hidden bg-stone-100 aspect-[3/4] block">
              <img src={cat.image} alt={cat.label} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-900/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <p className="text-xs uppercase tracking-widest text-stone-300 mb-1">{cat.description}</p>
                <h3 className="font-serif text-white text-2xl">{cat.label}</h3>
                <div className="mt-2 flex items-center gap-1 text-stone-300 text-xs font-medium translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                  {t('home_shop_now')} <ChevronRight size={12} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-stone-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="section-subtitle mb-2">{t('home_featured_eyebrow')}</p>
              <h2 className="section-title">{t('home_featured_h2')}</h2>
            </div>
            <Link to="/shop" className="hidden sm:flex items-center gap-2 text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors group">
              {t('home_view_all')} <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <ProductGrid products={featured} isLoading={isLoading} />
          <div className="mt-10 text-center sm:hidden">
            <Link to="/shop" className="btn-secondary">{t('home_view_all_btn')}</Link>
          </div>
        </div>
      </section>

      <section className="border-y border-stone-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { title: t('home_val_1_title'), body: t('home_val_1_body') },
            { title: t('home_val_2_title'), body: t('home_val_2_body') },
            { title: t('home_val_3_title'), body: t('home_val_3_body') },
            { title: t('home_val_4_title'), body: t('home_val_4_body') },
          ].map(v => (
            <div key={v.title} className="text-center">
              <h4 className="font-serif text-lg text-stone-900 mb-2">{v.title}</h4>
              <p className="text-sm text-stone-500 leading-relaxed">{v.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="relative py-28 bg-cover bg-center" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=1600&q=80)' }}>
        <div className="absolute inset-0 bg-stone-900/70" />
        <div className="relative text-center text-white max-w-2xl mx-auto px-4">
          <p className="section-subtitle text-stone-300 mb-4">{t('home_cta_eyebrow')}</p>
          <h2 className="font-serif text-4xl md:text-5xl text-white mb-6">{t('home_cta_h2')}</h2>
          <p className="text-stone-300 mb-8 text-lg font-light">{t('home_cta_body')}</p>
          <Link to="/shop?category=bedding" className="btn-primary py-4 px-10 text-sm uppercase tracking-widest">{t('home_cta_btn')}</Link>
        </div>
      </section>
    </div>
  );
}
