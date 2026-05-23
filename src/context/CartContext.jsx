import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
} from 'react';

// ─── Constants ────────────────────────────────────────────────────────────────
const STORAGE_KEY = 'luxe_textiles_cart';
const CartContext = createContext(null);

// ─── Helpers ─────────────────────────────────────────────────────────────────
function loadCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch { /* ignore */ }
  return [];
}

function saveCart(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch { /* ignore */ }
}

/**
 * Cart item key is a composite of product id + selected color + selected size
 * so the same product in different variants is tracked separately.
 */
function makeItemKey(productId, color, size) {
  return `${productId}__${color ?? 'default'}__${size ?? 'default'}`;
}

// ─── Reducer ─────────────────────────────────────────────────────────────────
function cartReducer(state, action) {
  let next;

  switch (action.type) {
    case 'HYDRATE':
      return { ...state, items: action.payload };

    case 'ADD_ITEM': {
      const { product, color, size, quantity = 1 } = action.payload;
      const key = makeItemKey(product.id, color, size);
      const existing = state.items.find(i => i.key === key);

      if (existing) {
        next = state.items.map(i =>
          i.key === key
            ? { ...i, quantity: Math.min(i.quantity + quantity, product.stock) }
            : i
        );
      } else {
        next = [
          ...state.items,
          {
            key,
            productId: product.id,
            name: product.name,
            price: product.price,
            image: product.images?.[0] ?? '',
            category: product.category,
            color: color ?? null,
            size: size ?? null,
            stock: product.stock,
            quantity,
          },
        ];
      }
      saveCart(next);
      return { ...state, items: next };
    }

    case 'REMOVE_ITEM': {
      next = state.items.filter(i => i.key !== action.payload);
      saveCart(next);
      return { ...state, items: next };
    }

    case 'UPDATE_QUANTITY': {
      const { key, quantity } = action.payload;
      next = state.items
        .map(i =>
          i.key === key
            ? { ...i, quantity: Math.max(0, Math.min(quantity, i.stock)) }
            : i
        )
        .filter(i => i.quantity > 0);
      saveCart(next);
      return { ...state, items: next };
    }

    case 'CLEAR_CART': {
      saveCart([]);
      return { ...state, items: [] };
    }

    default:
      return state;
  }
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [] });

  // Hydrate from localStorage on mount
  useEffect(() => {
    dispatch({ type: 'HYDRATE', payload: loadCart() });
  }, []);

  const addItem = useCallback((product, color, size, quantity = 1) => {
    dispatch({ type: 'ADD_ITEM', payload: { product, color, size, quantity } });
  }, []);

  const removeItem = useCallback((key) => {
    dispatch({ type: 'REMOVE_ITEM', payload: key });
  }, []);

  const updateQuantity = useCallback((key, quantity) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { key, quantity } });
  }, []);

  const clearCart = useCallback(() => {
    dispatch({ type: 'CLEAR_CART' });
  }, []);

  // Derived values
  const itemCount = state.items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = state.items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const isEmpty = state.items.length === 0;

  const value = {
    items: state.items,
    itemCount,
    subtotal,
    isEmpty,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
}
