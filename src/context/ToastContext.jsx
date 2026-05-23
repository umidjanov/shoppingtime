import React, { createContext, useContext, useCallback, useReducer } from 'react';

// ─── Types & Initial State ────────────────────────────────────────────────────
const ToastContext = createContext(null);

const initialState = { toasts: [] };

let toastIdCounter = 0;

// ─── Reducer ─────────────────────────────────────────────────────────────────
function toastReducer(state, action) {
  switch (action.type) {
    case 'ADD_TOAST':
      return { toasts: [...state.toasts, action.payload] };
    case 'REMOVE_TOAST':
      return { toasts: state.toasts.filter(t => t.id !== action.payload) };
    default:
      return state;
  }
}

// ─── Provider ────────────────────────────────────────────────────────────────
export function ToastProvider({ children }) {
  const [state, dispatch] = useReducer(toastReducer, initialState);

  const addToast = useCallback(({ message, type = 'success', duration = 3500 }) => {
    const id = ++toastIdCounter;
    dispatch({ type: 'ADD_TOAST', payload: { id, message, type, duration } });

    setTimeout(() => {
      dispatch({ type: 'REMOVE_TOAST', payload: id });
    }, duration);

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    dispatch({ type: 'REMOVE_TOAST', payload: id });
  }, []);

  const toast = {
    success: (message, opts = {}) => addToast({ message, type: 'success', ...opts }),
    error: (message, opts = {}) => addToast({ message, type: 'error', ...opts }),
    info: (message, opts = {}) => addToast({ message, type: 'info', ...opts }),
    warning: (message, opts = {}) => addToast({ message, type: 'warning', ...opts }),
  };

  return (
    <ToastContext.Provider value={{ toasts: state.toasts, toast, removeToast }}>
      {children}
    </ToastContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
}
