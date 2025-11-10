import React, { createContext, useContext, useReducer } from 'react';

// 1. Create Context
const UserContext = createContext();

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
    const map = new Map();
    target.forEach(item => item.id && map.set(item.id, item));
    source.forEach(item => {
      if (item.id && map.has(item.id)) {
        map.set(item.id, { ...map.get(item.id), ...item });
      } else {
        map.set(item.id || Date.now(), item);
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

  return (
    <UserContext.Provider value={{
      user: state.user,
      loading: state.loading,
      error: state.error,
      setUser,
      patchUser,
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