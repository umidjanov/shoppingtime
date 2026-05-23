import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Pencil, Trash2, Eye, RotateCcw, TrendingUp, Package, AlertTriangle, DollarSign, ChevronUp, ChevronDown, X } from 'lucide-react';
import { useProducts } from '../../context/ProductContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useLang } from '../../context/LanguageContext';
import { TableSkeleton } from '../ui/Skeleton';
import ConfirmModal from '../ui/ConfirmModal';
import ProductForm from './ProductForm';

const CATEGORY_COLORS = {
  towels: 'bg-blue-50 text-blue-700',
  robes: 'bg-purple-50 text-purple-700',
  bedding: 'bg-green-50 text-green-700',
  suitcases: 'bg-orange-50 text-orange-700',
};

export default function AdminDashboard() {
  const { products, isLoading, addProduct, updateProduct, deleteProduct, resetToInitial, stats } = useProducts();
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const { t } = useLang();

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: 'name', dir: 'asc' });
  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isAdmin) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <h2 className="font-serif text-3xl text-stone-700 mb-4">{t('admin_access_denied')}</h2>
        <p className="text-stone-500 mb-8">{t('admin_access_denied_sub')}</p>
        <Link to="/login" className="btn-primary">{t('admin_signin')}</Link>
      </div>
    );
  }

  const FILTER_CATS = [
    { value: 'all', label: t('admin_all') },
    { value: 'towels', label: t('cat_towels') },
    { value: 'robes', label: t('cat_robes') },
    { value: 'bedding', label: t('cat_bedding') },
    { value: 'suitcases', label: t('cat_suitcases') },
  ];

  const filtered = useMemo(() => {
    let result = [...products];
    if (categoryFilter !== 'all') result = result.filter(p => p.category === categoryFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || p.id.includes(q));
    }
    result.sort((a, b) => {
      let aVal = a[sortConfig.key] ?? ''; let bVal = b[sortConfig.key] ?? '';
      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();
      if (aVal < bVal) return sortConfig.dir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortConfig.dir === 'asc' ? 1 : -1;
      return 0;
    });
    return result;
  }, [products, categoryFilter, search, sortConfig]);

  const toggleSort = (key) => setSortConfig(prev => prev.key === key ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' });
  const SortIcon = ({ colKey }) => {
    if (sortConfig.key !== colKey) return <ChevronUp size={12} className="text-stone-300" />;
    return sortConfig.dir === 'asc' ? <ChevronUp size={12} className="text-stone-700" /> : <ChevronDown size={12} className="text-stone-700" />;
  };

  const openAdd = () => { setEditingProduct(null); setFormOpen(true); };
  const openEdit = (product) => { setEditingProduct(product); setFormOpen(true); };

  const handleFormSubmit = async (formData) => {
    setIsSubmitting(true);
    await new Promise(r => setTimeout(r, 300));
    if (editingProduct) { updateProduct(editingProduct.id, formData); toast.success(t('admin_updated', { name: formData.name })); }
    else { addProduct(formData); toast.success(t('admin_added', { name: formData.name })); }
    setIsSubmitting(false);
    setFormOpen(false);
    setEditingProduct(null);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteProduct(deleteTarget.id);
    toast.error(t('admin_deleted', { name: deleteTarget.name }));
    setDeleteTarget(null);
  };

  const statCards = [
    { label: t('admin_total'), value: stats.total, icon: Package, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: t('admin_inventory'), value: `$${Math.round(stats.totalInventoryValue).toLocaleString()}`, icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: t('admin_low_stock'), value: stats.lowStock, icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: t('admin_out_stock'), value: stats.outOfStock, icon: TrendingUp, color: 'text-red-600', bg: 'bg-red-50' },
  ];

  const TABLE_COLS = [
    { key: null, label: t('admin_col_image'), width: 'w-16' },
    { key: 'name', label: t('admin_col_product') },
    { key: 'category', label: t('admin_col_category') },
    { key: 'price', label: t('admin_col_price') },
    { key: 'stock', label: t('admin_col_stock') },
    { key: 'rating', label: t('admin_col_rating') },
    { key: null, label: t('admin_col_actions') },
  ];

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 flex items-center justify-between">
          <div>
            <p className="section-subtitle text-xs mb-0.5">{t('admin_eyebrow')}</p>
            <h1 className="font-serif text-2xl text-stone-900">{t('admin_title')}</h1>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => { resetToInitial(); toast.info(t('admin_reset_success')); }} className="btn-ghost text-xs border border-stone-300 gap-1.5" title={t('admin_reset')}>
              <RotateCcw size={13} /><span className="hidden sm:inline">{t('admin_reset')}</span>
            </button>
            <button onClick={openAdd} className="btn-primary text-sm gap-2"><Plus size={16} />{t('admin_add')}</button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statCards.map(card => {
            const Icon = card.icon;
            return (
              <div key={card.label} className="card p-5 flex items-center gap-4">
                <div className={`w-10 h-10 ${card.bg} flex items-center justify-center flex-shrink-0`}><Icon size={18} className={card.color} /></div>
                <div>
                  <p className="text-xs text-stone-500 uppercase tracking-wide">{card.label}</p>
                  <p className="font-serif text-xl text-stone-900">{card.value}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-5">
          <div className="relative flex-1 min-w-52 max-w-xs">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder={t('admin_search')} className="input-base pl-9 text-sm" />
            {search && <button onClick={() => setSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700"><X size={13} /></button>}
          </div>
          {FILTER_CATS.map(cat => (
            <button key={cat.value} onClick={() => setCategoryFilter(cat.value)}
              className={`px-3 py-1.5 text-xs border transition-all ${categoryFilter === cat.value ? 'bg-stone-900 text-white border-stone-900' : 'border-stone-200 text-stone-600 hover:border-stone-400'}`}>
              {cat.label}
            </button>
          ))}
          <span className="text-xs text-stone-400 ml-auto">{filtered.length} / {products.length}</span>
        </div>

        <div className="card overflow-x-auto">
          <table className="w-full text-sm" aria-label="Products table">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50">
                {TABLE_COLS.map(col => (
                  <th key={col.label} className={`px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-stone-500 ${col.key ? 'cursor-pointer hover:text-stone-800 select-none' : ''} ${col.width ?? ''}`} onClick={() => col.key && toggleSort(col.key)}>
                    <span className="flex items-center gap-1">{col.label}{col.key && <SortIcon colKey={col.key} />}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? <TableSkeleton rows={6} cols={7} /> : filtered.length === 0 ? (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-stone-400 text-sm">{t('admin_no_products')}</td></tr>
              ) : (
                filtered.map(product => (
                  <tr key={product.id} className="border-b border-stone-100 hover:bg-stone-50 transition-colors">
                    <td className="px-4 py-3"><img src={product.images?.[0] ?? ''} alt={product.name} className="w-10 h-10 object-cover bg-stone-100" /></td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-stone-900 line-clamp-1">{product.name}</p>
                        <p className="text-xs text-stone-400 font-mono mt-0.5">{product.id}</p>
                        {product.isFeatured && <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 mt-0.5 inline-block">{t('admin_featured')}</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`badge text-[10px] ${CATEGORY_COLORS[product.category] ?? 'bg-stone-100 text-stone-600'}`}>{t(`cat_${product.category}`) || product.category}</span>
                    </td>
                    <td className="px-4 py-3 font-medium text-stone-900">${product.price}</td>
                    <td className="px-4 py-3">
                      <span className={`font-medium ${product.stock === 0 ? 'text-red-600' : product.stock < 20 ? 'text-amber-600' : 'text-stone-700'}`}>{product.stock}</span>
                    </td>
                    <td className="px-4 py-3 text-stone-600">
                      {product.rating > 0 ? <span className="flex items-center gap-1"><span className="text-amber-500">★</span>{product.rating.toFixed(1)}<span className="text-stone-400 text-xs">({product.reviewCount ?? 0})</span></span> : <span className="text-stone-300">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Link to={`/product/${product.id}`} target="_blank" className="btn-ghost p-1.5 text-stone-500" title={t('admin_view')}><Eye size={15} /></Link>
                        <button onClick={() => openEdit(product)} className="btn-ghost p-1.5 text-stone-500" title={t('admin_edit')}><Pencil size={15} /></button>
                        <button onClick={() => setDeleteTarget(product)} className="btn-ghost p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50" title={t('admin_delete')}><Trash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {formOpen && <ProductForm product={editingProduct} onSubmit={handleFormSubmit} onCancel={() => { setFormOpen(false); setEditingProduct(null); }} isSubmitting={isSubmitting} />}

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={t('admin_delete_title')}
        message={t('admin_delete_msg', { name: deleteTarget?.name ?? '' })}
        confirmLabel={t('admin_delete_btn')}
        variant="danger"
      />
    </div>
  );
}
