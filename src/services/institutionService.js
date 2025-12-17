import { authFetch, authGet } from './authFetch';
const SERVER_URL = process.env.REACT_APP_BACKEND_URL;

/**
 * Institution Service
 * Handles API calls for institution-wide data aggregation
 */
export const institutionService = {
    /**
     * Get all events from institution (admin + all sub-users)
     */
    getInstitutionEvents: async (userId, user) => {
        try {
            const response = await authFetch(
                `${SERVER_URL}/api/expert/${userId}/institution/events`,
                {
                    headers: {
                        'user-context': JSON.stringify(user)
                    }
                }
            );
            const data = await response.json();
            return data.events || [];
        } catch (error) {
            console.error('Error fetching institution events:', error);
            throw error;
        }
    },

    /**
     * Get all services from institution
     */
    getInstitutionServices: async (userId) => {
        try {
            const data = await authGet(`${SERVER_URL}/api/expert/${userId}/institution/services`);
            return data.services || [];
        } catch (error) {
            console.error('Error fetching institution services:', error);
            throw error;
        }
    },

    /**
     * Get all packages from institution
     */
    getInstitutionPackages: async (userId) => {
        try {
            const data = await authGet(`${SERVER_URL}/api/expert/${userId}/institution/packages`);
            return data.packages || [];
        } catch (error) {
            console.error('Error fetching institution packages:', error);
            throw error;
        }
    },

    /**
     * Get all customers from institution
     */
    getInstitutionCustomers: async (userId) => {
        try {
            const data = await authGet(`${SERVER_URL}/api/expert/${userId}/institution/customers`);
            return data.customers || [];
        } catch (error) {
            console.error('Error fetching institution customers:', error);
            throw error;
        }
    },

    /**
     * Get all orders/payments from institution
     */
    getInstitutionOrders: async (userId) => {
        try {
            const data = await authGet(`${SERVER_URL}/api/expert/${userId}/institution/orders`);
            return data.orders || [];
        } catch (error) {
            console.error('Error fetching institution orders:', error);
            throw error;
        }
    },

    /**
     * Get institution statistics
     */
    getInstitutionStats: async (userId) => {
        try {
            const data = await authGet(`${SERVER_URL}/api/expert/${userId}/institution/stats`);
            return data;
        } catch (error) {
            console.error('Error fetching institution stats:', error);
            throw error;
        }
    }
};

export default institutionService;
