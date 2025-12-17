import React, { createContext, useContext, useState, useCallback } from 'react';
import { authFetch } from '../services/authFetch';

const InstitutionUsersContext = createContext();

const SERVER_URL = process.env.REACT_APP_BACKEND_URL;

export const InstitutionUsersProvider = ({ children }) => {
    // Array of full user documents for all institution sub-users
    const [institutionUsers, setInstitutionUsers] = useState([]);
    const [isLoaded, setIsLoaded] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    /**
     * Fetch all institution users (full documents) and cache in context
     * Only fetches if not already loaded
     */
    const fetchInstitutionUsers = useCallback(async (adminUserId, userContext) => {
        console.log("[InstitutionContext] fetchInstitutionUsers called");
        console.log("[InstitutionContext] adminUserId:", adminUserId);
        console.log("[InstitutionContext] userContext:", userContext);
        console.log("[InstitutionContext] isLoaded:", isLoaded);
        console.log("[InstitutionContext] current users count:", institutionUsers.length);

        // Skip if already loaded
        if (isLoaded && institutionUsers.length > 0) {
            console.log("[InstitutionContext] ✅ Data already cached, returning existing users");
            return institutionUsers;
        }

        try {
            setLoading(true);
            setError(null);

            console.log("[InstitutionContext] ⏳ Making API call to:", `${SERVER_URL}/api/expert/${adminUserId}/institution/users`);

            const response = await authFetch(
                `${SERVER_URL}/api/expert/${adminUserId}/institution/users`,
                {
                    headers: {
                        'user-context': JSON.stringify(userContext)
                    }
                }
            );
            const data = await response.json();

            const users = data.users || [];
            console.log("[InstitutionContext] ✅ API Response received");
            console.log("[InstitutionContext] Total users fetched:", users.length);
            console.log("[InstitutionContext] Users data:", users);

            setInstitutionUsers(users);
            setIsLoaded(true);
            setLoading(false);
            return users;
        } catch (err) {
            console.error('[InstitutionContext] ❌ Error fetching institution users:', err);
            setError(err.message || 'Failed to fetch institution users');
            setLoading(false);
            return [];
        }
    }, [isLoaded, institutionUsers]);

    /**
     * Force refresh institution users (bypasses cache)
     */
    const refreshInstitutionUsers = useCallback(async (adminUserId, userContext) => {
        setIsLoaded(false);
        return await fetchInstitutionUsers(adminUserId, userContext);
    }, [fetchInstitutionUsers]);

    /**
     * Get a specific user by ID from the cached data
     */
    const getUserById = useCallback((userId) => {
        return institutionUsers.find(user =>
            user._id === userId || user._id?.toString() === userId
        );
    }, [institutionUsers]);

    /**
     * Get all events from all institution users
     */
    const getAllEvents = useCallback(() => {
        console.log("[InstitutionContext] getAllEvents called");
        console.log("[InstitutionContext] institutionUsers count:", institutionUsers.length);

        const allEvents = institutionUsers.flatMap(user => {
            console.log(`[InstitutionContext] User ${user.information?.name}: ${user.events?.length || 0} events`);
            return (user.events || []).map(event => ({
                ...event,
                expertId: user._id,
                expertName: `${user.information?.name || ''} ${user.information?.surname || ''}`.trim()
            }));
        });

        console.log("[InstitutionContext] Total events extracted:", allEvents.length);
        return allEvents;
    }, [institutionUsers]);

    /**
     * Get all services from all institution users
     */
    const getAllServices = useCallback(() => {
        return institutionUsers.flatMap(user =>
            (user.services || []).map(service => ({
                ...service,
                expertId: user._id,
                expertName: `${user.information?.name || ''} ${user.information?.surname || ''}`.trim()
            }))
        );
    }, [institutionUsers]);

    /**
     * Get all packages from all institution users
     */
    const getAllPackages = useCallback(() => {
        return institutionUsers.flatMap(user =>
            (user.packages || []).map(pkg => ({
                ...pkg,
                expertId: user._id,
                expertName: `${user.information?.name || ''} ${user.information?.surname || ''}`.trim()
            }))
        );
    }, [institutionUsers]);

    /**
     * Get all customers from all institution users
     */
    const getAllCustomers = useCallback(() => {
        return institutionUsers.flatMap(user =>
            (user.customers || []).map(customer => ({
                ...customer,
                expertId: user._id,
                expertName: `${user.information?.name || ''} ${user.information?.surname || ''}`.trim()
            }))
        );
    }, [institutionUsers]);

    /**
     * Clear cached data (useful on logout or user switch)
     */
    const clearCache = useCallback(() => {
        setInstitutionUsers([]);
        setIsLoaded(false);
        setError(null);
    }, []);

    /**
     * Update a specific user in the cache
     */
    const updateUserInCache = useCallback((userId, updatedUserData) => {
        setInstitutionUsers(prev =>
            prev.map(user =>
                (user._id === userId || user._id?.toString() === userId)
                    ? { ...user, ...updatedUserData }
                    : user
            )
        );
    }, []);

    const value = {
        // State
        institutionUsers,
        isLoaded,
        loading,
        error,

        // Methods
        fetchInstitutionUsers,
        refreshInstitutionUsers,
        getUserById,
        getAllEvents,
        getAllServices,
        getAllPackages,
        getAllCustomers,
        clearCache,
        updateUserInCache
    };

    return (
        <InstitutionUsersContext.Provider value={value}>
            {children}
        </InstitutionUsersContext.Provider>
    );
};

export const useInstitutionUsers = () => {
    const context = useContext(InstitutionUsersContext);
    if (!context) {
        throw new Error('useInstitutionUsers must be used within an InstitutionUsersProvider');
    }
    return context;
};

export default InstitutionUsersContext;
