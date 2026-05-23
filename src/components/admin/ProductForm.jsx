import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useLang } from '../../context/LanguageContext';

const CATEGORIES = ['towels', 'robes', 'bedding', 'suitcases'];

const EMPTY_FORM = { name:'',category:'towels',price:'',description:'',images:'',colors:'',sizes:'',stock:'',rating:'',reviewCount:'',isFeatured:false,tags:'' };

function toFormValues(product) {
  if (!product) return EMPTY_FORM;
  return {
    name: product.name ?? '',
    category: product.category ?? 'towels',
    price: product.price?.toString() ?? '',
    description: product.description ?? '',
    images: Array.isArray(product.images) ? product.images.join(', ') : (product.images ?? ''),
    colors: Array.isArray(product.colors) ? product.colors.join(', ') : (product.colors ?? ''),
    sizes: Array.isArray(product.sizes) ? product.sizes.join(', ') : (product.sizes ?? ''),
    stock: product.stock?.toString() ?? '',
    rating: product.rating?.toString() ?? '',
    reviewCount: product.reviewCount?.toString() ?? '',
    isFeatured: product.isFeatured ?? false,
    tags: Array.isArray(product.tags) ? product.tags.join(', ') : (product.tags ?? ''),
  };
}

export default function ProductForm({ product, onSubmit, onCancel, isSubmitting }) {
  const { t } = useLang();
  const [form, setForm] = useState(toFormValues(product));
  const [errors, setErrors] = useState({});
  const isEdit = !!product;

  useEffect(() => { setForm(toFormValues(product)); setErrors({}); }, [product]);

  const validate = (form) => {
    const errs = {};
    if (!form.name.trim()) errs.name = t('form_err_name');
    if (!form.category) errs.category = t('form_err_category');
    const price = parseFloat(form.price);
    if (!form.price || isNaN(price) || price < 0) errs.price = t('form_err_price');
    if (!form.description.trim()) errs.description = t('form_err_desc');
    const stock = parseInt(form.stock, 10);
    if (form.stock === '' || isNaN(stock) || stock < 0) errs.stock = t('form_err_stock');
    if (form.rating) { const r = parseFloat(form.rating); if (isNaN(r) || r < 0 || r > 5) errs.rating = t('form_err_rating'); }
    return errs;
  };

  const set = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm(f => ({ ...f, [field]: value }));
    if (errors[field]) setErrors(e => { const ne = { ...e }; delete ne[field]; return ne; });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    onSubmit(form);
  };

  const Field = ({ id, label, error, children }) => (
    <div>
      <label className="label-base" htmlFor={id}>{label}</label>
      {children}
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-stone-900/50 backdrop-blur-sm" onClick={onCancel} />
      <aside className="relative w-full max-w-lg h-full bg-white shadow-2xl overflow-y-auto animate-slide-up">
        <div className="sticky top-0 bg-white border-b border-stone-200 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="font-serif text-xl text-stone-900">{isEdit ? t('form_edit_title') : t('form_add_title')}</h2>
          <button onClick={onCancel} className="text-stone-400 hover:text-stone-700 transition-colors"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5" noValidate>
          <Field id="name" label={t('form_name')} error={errors.name}>
            <input id="name" type="text" value={form.name} onChange={set('name')} className={`input-base ${errors.name ? 'input-error' : ''}`} placeholder={t('form_name_placeholder')} disabled={isSubmitting} />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field id="category" label={t('form_category')} error={errors.category}>
              <select id="category" value={form.category} onChange={set('category')} className={`input-base ${errors.category ? 'input-error' : ''}`} disabled={isSubmitting}>
                {CATEGORIES.map(c => <option key={c} value={c}>{t(`cat_${c}`)}</option>)}
              </select>
            </Field>
            <Field id="price" label={t('form_price')} error={errors.price}>
              <input id="price" type="number" min="0" step="0.01" value={form.price} onChange={set('price')} className={`input-base ${errors.price ? 'input-error' : ''}`} placeholder="0.00" disabled={isSubmitting} />
            </Field>
          </div>

          <Field id="description" label={t('form_description')} error={errors.description}>
            <textarea id="description" rows={4} value={form.description} onChange={set('description')} className={`input-base resize-none ${errors.description ? 'input-error' : ''}`} placeholder={t('form_description_placeholder')} disabled={isSubmitting} />
          </Field>

          <Field id="images" label={t('form_images')} error={errors.images}>
            <textarea id="images" rows={2} value={form.images} onChange={set('images')} className="input-base resize-none text-xs" placeholder={t('form_images_placeholder')} disabled={isSubmitting} />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field id="colors" label={t('form_colors')} error={errors.colors}>
              <input id="colors" type="text" value={form.colors} onChange={set('colors')} className="input-base text-sm" placeholder={t('form_colors_placeholder')} disabled={isSubmitting} />
            </Field>
            <Field id="sizes" label={t('form_sizes')} error={errors.sizes}>
              <input id="sizes" type="text" value={form.sizes} onChange={set('sizes')} className="input-base text-sm" placeholder={t('form_sizes_placeholder')} disabled={isSubmitting} />
            </Field>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Field id="stock" label={t('form_stock')} error={errors.stock}>
              <input id="stock" type="number" min="0" value={form.stock} onChange={set('stock')} className={`input-base ${errors.stock ? 'input-error' : ''}`} placeholder="0" disabled={isSubmitting} />
            </Field>
            <Field id="rating" label={t('form_rating')} error={errors.rating}>
              <input id="rating" type="number" min="0" max="5" step="0.1" value={form.rating} onChange={set('rating')} className={`input-base ${errors.rating ? 'input-error' : ''}`} placeholder="4.5" disabled={isSubmitting} />
            </Field>
            <Field id="reviewCount" label={t('form_reviews')} error={errors.reviewCount}>
              <input id="reviewCount" type="number" min="0" value={form.reviewCount} onChange={set('reviewCount')} className="input-base" placeholder="0" disabled={isSubmitting} />
            </Field>
          </div>

          <Field id="tags" label={t('form_tags')} error={errors.tags}>
            <input id="tags" type="text" value={form.tags} onChange={set('tags')} className="input-base text-sm" placeholder={t('form_tags_placeholder')} disabled={isSubmitting} />
          </Field>

          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input type="checkbox" checked={form.isFeatured} onChange={set('isFeatured')} className="w-4 h-4 accent-stone-900" disabled={isSubmitting} />
            <span className="text-sm font-medium text-stone-700">{t('form_featured')}</span>
          </label>

          <div className="flex items-center gap-3 pt-4 border-t border-stone-200">
            <button type="submit" disabled={isSubmitting} className="btn-primary flex-1 justify-center py-3 text-sm">
              {isSubmitting && <Loader2 size={14} className="animate-spin" />}
              {isEdit ? t('form_update') : t('form_add')}
            </button>
            <button type="button" onClick={onCancel} disabled={isSubmitting} className="btn-secondary px-5 py-3 text-sm">{t('form_cancel')}</button>
          </div>
        </form>
      </aside>
    </div>
  );
}
