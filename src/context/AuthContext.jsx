import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
} from 'react';

// ─── Constants ────────────────────────────────────────────────────────────────
const STORAGE_KEY = 'luxe_textiles_auth';
const AuthContext = createContext(null);

// Seed admin user for demo purposes
const DEMO_ADMIN = {
  id: 'user-admin-001',
  name: 'Admin User',
  email: 'admin@luxetextiles.com',
  role: 'admin',
  avatar: null,
};

const DEMO_CREDENTIALS = {
  'admin@luxetextiles.com': { password: 'admin123', user: DEMO_ADMIN },
  'user@luxetextiles.com': {
    password: 'user123',
    user: {
      id: 'user-002',
      name: 'Jane Smith',
      email: 'user@luxetextiles.com',
      role: 'customer',
      avatar: null,
    },
  },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function loadAuthState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return { user: null, isAuthenticated: false };
}

function saveAuthState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch { /* ignore */ }
}

// ─── Reducer ─────────────────────────────────────────────────────────────────
function authReducer(state, action) {
  switch (action.type) {
    case 'HYDRATE':
      return action.payload;

    case 'LOGIN':
      saveAuthState({ user: action.payload, isAuthenticated: true });
      return { user: action.payload, isAuthenticated: true, error: null };

    case 'LOGOUT':
      saveAuthState({ user: null, isAuthenticated: false });
      return { user: null, isAuthenticated: false, error: null };

    case 'SET_ERROR':
      return { ...state, error: action.payload };

    case 'CLEAR_ERROR':
      return { ...state, error: null };

    default:
      return state;
  }
}

// ─── Provider ─────────────────────────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    isAuthenticated: false,
    error: null,
  });

  // Hydrate on mount
  useEffect(() => {
    const stored = loadAuthState();
    dispatch({ type: 'HYDRATE', payload: { ...stored, error: null } });
  }, []);

  /**
   * Simulate login (replace with real API call in production).
   * Returns { success: boolean, error?: string }
   */
  const login = useCallback(async (email, password) => {
    dispatch({ type: 'CLEAR_ERROR' });

    // Simulate network delay
    await new Promise(r => setTimeout(r, 400));

    const entry = DEMO_CREDENTIALS[email.toLowerCase().trim()];
    if (!entry || entry.password !== password) {
      const msg = 'Invalid email or password.';
      dispatch({ type: 'SET_ERROR', payload: msg });
      return { success: false, error: msg };
    }

    dispatch({ type: 'LOGIN', payload: entry.user });
    return { success: true };
  }, []);

  const logout = useCallback(() => {
    dispatch({ type: 'LOGOUT' });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  const isAdmin = state.user?.role === 'admin';

  const value = {
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isAdmin,
    error: state.error,
    login,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
}
