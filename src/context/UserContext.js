import React, { createContext, useContext, useReducer } from 'react';

// 1. Create Context
export const UserContext = createContext();

// 2. Reducer – handles all updates
const userReducer = (state, action) => {
  switch (action.type) {
    case 'SET_USER':
      return { ...state, user: action.payload, loading: false, error: null };

    case 'PATCH_USER':
      if (!state.user) return state;
      return {
        ...state,
        user: deepMerge(state.user, action.payload),
        loading: false,
      };

    case 'SET_LOADING':
      return { ...state, loading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };

    default:
      return state;
  }
};

// 3. Deep Merge – smart update for arrays and objects
function deepMerge(target, source) {
  // If both are arrays (like events, skills, appointments)
  if (Array.isArray(target) && Array.isArray(source)) {
    // Check if array contains primitives (strings/numbers)
    if (source.length > 0 && (typeof source[0] === 'string' || typeof source[0] === 'number')) {
      // For primitive arrays (like selectedSlots), just return the new source array
      return source;
    }

    // For object arrays, merge by ID
    const map = new Map();
    target.forEach(item => item.id && map.set(item.id, item));
    source.forEach(item => {
      if (item.id && map.has(item.id)) {
        map.set(item.id, { ...map.get(item.id), ...item });
      } else {
        // Only use Date.now() if it's truly a new item without ID
        // But be careful - generating random IDs for everything might be bad
        map.set(item.id || item._id || Math.random().toString(36), item);
      }
    });
    return Array.from(map.values());
  }

  // If both are objects
  if (target && source && typeof target === 'object' && typeof source === 'object') {
    const result = { ...target };
    for (const key in source) {
      result[key] = deepMerge(target[key], source[key]);
    }
    return result;
  }

  // Otherwise, just replace
  return source !== undefined ? source : target;
}

// 4. Provider Component
export function UserProvider({ children }) {
  const [state, dispatch] = useReducer(userReducer, {
    user: null,
    loading: true,
    error: null,
  });

  const setUser = (user) => dispatch({ type: 'SET_USER', payload: user });
  const patchUser = (patch) => dispatch({ type: 'PATCH_USER', payload: patch });
  const setLoading = (loading) => dispatch({ type: 'SET_LOADING', payload: loading });
  const setError = (error) => dispatch({ type: 'SET_ERROR', payload: error });

  // Update a specific field in the user object
  const updateUserField = (fieldPath, value) => {
    patchUser({ [fieldPath]: value });
  };

  // Automatic user fetch if userId exists but user data is missing
  React.useEffect(() => {
    const loadUser = async () => {
      // Check sessionStorage first, then localStorage
      const userId = sessionStorage.getItem('userId') || localStorage.getItem('userId');
      console.log('🔄 UserContext: loadUser called, userId:', userId);

      // If no userId, user is not logged in - force logout/redirect
      if (!userId) {
        console.log('🔄 UserContext: No userId found - redirecting to login');
        setLoading(false);
        // Only redirect if we're not already on login/signup pages
        if (window.location.pathname !== '/login' &&
          window.location.pathname !== '/signup' &&
          window.location.pathname !== '/forgot-password' &&
          !window.location.pathname.startsWith('/accept-invitation') &&
          !window.location.pathname.startsWith('/decline-invitation') &&
          !window.location.pathname.startsWith('/verify-email')) {
          // Clear any stale auth data
          sessionStorage.clear();
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('user');
          localStorage.removeItem('userId');
          localStorage.removeItem('isAuthenticated');
          window.location.href = '/login';
        }
        return;
      }

      // If we already have the correct user data loaded, stop loading
      if (state.user && String(state.user._id) === String(userId) && state.user.information?.name) {
        console.log('🔄 UserContext: User already loaded, skipping fetch');
        if (state.loading) setLoading(false);
        return;
      }

      console.log('🔄 UserContext: Fetching user data from backend...');
      try {
        setLoading(true);
        // Dynamically import profile service to avoid circular dependencies
        const { profileService } = await import('../services/ProfileServices');

        const userData = await profileService.getProfile(userId);
        console.log('🔄 UserContext: Received userData:', userData ? 'SUCCESS' : 'NULL');

        if (userData) {
          setUser(userData);
          console.log('🔄 UserContext: User set in context:', userData.information?.name);
        } else {
          // Verify if we should logout if user not found?
          console.warn("User data fetch returned null");
          setLoading(false);
        }
      } catch (err) {
        console.error("Failed to load user in Context:", err);
        setError(err);
        setLoading(false);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []); // Run once on mount 
  // If user logs out, userId changes. But context might be unmounted/remounted.
  // Let's stick to mount for now, or listen to localStorage? (Not reactive).

  return (
    <UserContext.Provider value={{
      user: state.user,
      loading: state.loading,
      error: state.error,
      setUser,
      patchUser,
      updateUserField,
      setLoading,
      setError
    }}>
      {children}
    </UserContext.Provider>
  );
}

// 5. Custom Hook
export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used inside UserProvider');
  }
  return context;
}