import { authFetch, authGet, authPost } from './authFetch';

const SERVER_URL = process.env.REACT_APP_BACKEND_URL;

/**
 * Create a new purchase entry
 * @param {string} userId - Expert's user ID
 * @param {Object|string} customerData - Either customer ObjectID (string) or new customer object {name, surname, email, phone}
 * @param {string} packageId - Package ID to purchase
 * @returns {Promise<Object>} Purchase entry details
 */
export const createPurchaseEntry = async (userId, customerData, packageId) => {
    try {
        const data = await authPost(
            `${SERVER_URL}/api/expert/${userId}/purchases`,
            {
                customerData,
                packageId
            }
        );
        return data;
    } catch (error) {
        console.error('Error creating purchase entry:', error);
        throw error.response?.data || error;
    }
};

/**
 * Get all purchase entries for an expert
 * @param {string} userId - Expert's user ID
 * @returns {Promise<Object>} List of purchase entries
 */
export const getPurchaseEntries = async (userId) => {
    try {
        const data = await authGet(
            `${SERVER_URL}/api/expert/${userId}/purchases`
        );
        return data;
    } catch (error) {
        console.error('Error fetching purchase entries:', error);
        throw error.response?.data || error;
    }
};

export default {
    createPurchaseEntry,
    getPurchaseEntries
};
