import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  useState,
} from 'react';
import initialData from '../data/initialData.json';

// ─── Constants ────────────────────────────────────────────────────────────────
const STORAGE_KEY = 'luxe_textiles_products';
const ProductContext = createContext(null);

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Read products from localStorage, falling back to seed data. */
function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (err) {
    console.warn('[ProductContext] Failed to parse localStorage:', err);
  }
  // Seed storage with initial data on first run
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
  } catch (err) {
    console.warn('[ProductContext] Failed to seed localStorage:', err);
  }
  return initialData;
}

/** Persist the product list to localStorage. */
function saveToStorage(products) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  } catch (err) {
    console.warn('[ProductContext] Failed to save to localStorage:', err);
  }
}

/** Generate a collision-resistant product ID. */
function generateId() {
  return `prod-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

// ─── Reducer ─────────────────────────────────────────────────────────────────
function productReducer(state, action) {
  let next;

  switch (action.type) {
    case 'SET_PRODUCTS':
      return { ...state, products: action.payload };

    case 'ADD_PRODUCT': {
      const newProduct = {
        ...action.payload,
        id: generateId(),
        rating: action.payload.rating ?? 0,
        reviewCount: action.payload.reviewCount ?? 0,
        isFeatured: action.payload.isFeatured ?? false,
        tags: action.payload.tags ?? [],
      };
      next = [newProduct, ...state.products];
      saveToStorage(next);
      return { ...state, products: next };
    }

    case 'UPDATE_PRODUCT': {
      next = state.products.map(p =>
        p.id === action.payload.id ? { ...p, ...action.payload } : p
      );
      saveToStorage(next);
      return { ...state, products: next };
    }

    case 'DELETE_PRODUCT': {
      next = state.products.filter(p => p.id !== action.payload);
      saveToStorage(next);
      return { ...state, products: next };
    }

    case 'RESET_TO_INITIAL': {
      saveToStorage(initialData);
      return { ...state, products: initialData };
    }

    default:
      return state;
  }
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function ProductProvider({ children }) {
  // Simulated loading state for skeleton UX
  const [isLoading, setIsLoading] = useState(true);

  const [state, dispatch] = useReducer(productReducer, { products: [] });

  // Hydrate from localStorage on mount (simulate async fetch)
  useEffect(() => {
    const timer = setTimeout(() => {
      const stored = loadFromStorage();
      dispatch({ type: 'SET_PRODUCTS', payload: stored });
      setIsLoading(false);
    }, 600); // 600ms simulated fetch delay

    return () => clearTimeout(timer);
  }, []);

  // ── CRUD Operations ──────────────────────────────────────────────────────

  /**
   * Add a brand-new product.
   * @param {Object} productData - All fields except `id` (auto-generated).
   * @returns {Object} The newly created product.
   */
  const addProduct = useCallback((productData) => {
    // Normalize array fields that may come in as comma-separated strings
    const normalized = normalizeArrayFields(productData);
    dispatch({ type: 'ADD_PRODUCT', payload: normalized });
    // Return the product with the generated id for callers that need it
    return { ...normalized };
  }, []);

  /**
   * Update an existing product by id.
   * @param {string} id - The product's id.
   * @param {Object} updates - Fields to update (partial).
   */
  const updateProduct = useCallback((id, updates) => {
    const normalized = normalizeArrayFields(updates);
    dispatch({ type: 'UPDATE_PRODUCT', payload: { id, ...normalized } });
  }, []);

  /**
   * Permanently delete a product by id.
   * @param {string} id - The product's id.
   */
  const deleteProduct = useCallback((id) => {
    dispatch({ type: 'DELETE_PRODUCT', payload: id });
  }, []);

  /**
   * Reset all products to the original seed data (useful for development/demo).
   */
  const resetToInitial = useCallback(() => {
    dispatch({ type: 'RESET_TO_INITIAL' });
  }, []);

  // ── Search & Filter ────────────────────────────────────────────────────────

  /**
   * Filter products by name, description, or category strings.
   * @param {string} query - Free-text search.
   * @param {string} category - Category slug ('towels' | 'robes' | 'bedding' | 'suitcases' | 'all').
   * @param {Object} options - { sortBy, priceMin, priceMax, inStockOnly }
   * @returns {Product[]}
   */
  const searchProducts = useCallback(
    (query = '', category = 'all', options = {}) => {
      const { sortBy = 'default', priceMin, priceMax, inStockOnly = false } = options;

      let results = [...state.products];

      // Category filter
      if (category && category !== 'all') {
        results = results.filter(p => p.category === category);
      }

      // Full-text search across name, description, tags, category
      if (query.trim()) {
        const lower = query.toLowerCase().trim();
        results = results.filter(p =>
          p.name.toLowerCase().includes(lower) ||
          p.description.toLowerCase().includes(lower) ||
          p.category.toLowerCase().includes(lower) ||
          (p.tags && p.tags.some(t => t.toLowerCase().includes(lower)))
        );
      }

      // Price range filter
      if (priceMin !== undefined) results = results.filter(p => p.price >= priceMin);
      if (priceMax !== undefined) results = results.filter(p => p.price <= priceMax);

      // In-stock filter
      if (inStockOnly) results = results.filter(p => p.stock > 0);

      // Sorting
      switch (sortBy) {
        case 'price-asc':
          results.sort((a, b) => a.price - b.price);
          break;
        case 'price-desc':
          results.sort((a, b) => b.price - a.price);
          break;
        case 'rating':
          results.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0));
          break;
        case 'newest':
          // "newest" = those added most recently (higher index in original or by id timestamp)
          results.sort((a, b) => (b.id > a.id ? 1 : -1));
          break;
        default:
          // Featured products first
          results.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
      }

      return results;
    },
    [state.products]
  );

  /**
   * Get a single product by id.
   * @param {string} id
   * @returns {Object|undefined}
   */
  const getProductById = useCallback(
    (id) => state.products.find(p => p.id === id),
    [state.products]
  );

  /**
   * Get related products (same category, different id, max `limit`).
   */
  const getRelatedProducts = useCallback(
    (productId, limit = 4) =>
      state.products
        .filter(p => {
          const target = state.products.find(x => x.id === productId);
          return target && p.category === target.category && p.id !== productId;
        })
        .slice(0, limit),
    [state.products]
  );

  /**
   * Get featured products.
   */
  const getFeaturedProducts = useCallback(
    (limit = 8) =>
      state.products.filter(p => p.isFeatured).slice(0, limit),
    [state.products]
  );

  // ── Context Value ──────────────────────────────────────────────────────────
  const value = {
    // State
    products: state.products,
    isLoading,

    // CRUD
    addProduct,
    updateProduct,
    deleteProduct,
    resetToInitial,

    // Queries
    searchProducts,
    getProductById,
    getRelatedProducts,
    getFeaturedProducts,

    // Stats (useful for admin dashboard)
    stats: {
      total: state.products.length,
      byCategory: state.products.reduce((acc, p) => {
        acc[p.category] = (acc[p.category] || 0) + 1;
        return acc;
      }, {}),
      lowStock: state.products.filter(p => p.stock > 0 && p.stock < 20).length,
      outOfStock: state.products.filter(p => p.stock === 0).length,
      totalInventoryValue: state.products.reduce((sum, p) => sum + p.price * p.stock, 0),
    },
  };

  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useProducts() {
  const context = useContext(ProductContext);
  if (!context) throw new Error('useProducts must be used within a ProductProvider');
  return context;
}

// ─── Internal Utils ───────────────────────────────────────────────────────────

/**
 * Ensure fields that should be arrays are arrays.
 * Accepts either an array or a comma-separated string.
 */
function normalizeArrayFields(data) {
  const arrayFields = ['images', 'colors', 'sizes', 'tags'];
  const result = { ...data };

  arrayFields.forEach(field => {
    if (field in result) {
      if (typeof result[field] === 'string') {
        result[field] = result[field]
          .split(',')
          .map(s => s.trim())
          .filter(Boolean);
      } else if (!Array.isArray(result[field])) {
        result[field] = [];
      }
    }
  });

  // Coerce numeric fields
  if ('price' in result) result.price = parseFloat(result.price) || 0;
  if ('stock' in result) result.stock = parseInt(result.stock, 10) || 0;
  if ('rating' in result) result.rating = parseFloat(result.rating) || 0;
  if ('reviewCount' in result) result.reviewCount = parseInt(result.reviewCount, 10) || 0;

  return result;
}
