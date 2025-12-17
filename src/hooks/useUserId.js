import { useAuth } from '../contexts/AuthContext';
import { apiClient } from '../services/apiClient';

/**
 * Custom hook for getting the current user ID
 * 
 * This hook provides backward compatibility for components
 * that previously used localStorage.getItem('userId').
 * 
 * Usage:
 *   const { userId } = useUserId();
 *   // or
 *   const userId = useUserId().userId;
 * 
 * This hook will:
 * 1. First try to get userId from the JWT token (preferred)
 * 2. Fall back to the user object in AuthContext
 * 3. Last resort: check localStorage (for migration period)
 */
export const useUserId = () => {
    const { user, getUserId } = useAuth();

    // Priority 1: Get from JWT token (most secure)
    let userId = getUserId();

    // Priority 2: Get from user object in context
    if (!userId && user?._id) {
        userId = user._id;
    }

    // Priority 3: Fall back to localStorage (migration period only)
    if (!userId) {
        userId = localStorage.getItem('userId');
    }

    return { userId };
};

/**
 * Get userId directly from apiClient (for non-hook contexts)
 * Use this when you can't use hooks (e.g., in service files)
 */
export const getCurrentUserId = () => {
    // Try JWT token first
    let userId = apiClient.getUserIdFromToken();

    // Fall back to localStorage
    if (!userId) {
        userId = localStorage.getItem('userId');
    }

    return userId;
};

export default useUserId;
