import axios from 'axios';

const API_BASE_URL = 'http://localhost:4000/api';

/**
 * Fetch earnings statistics for an expert
 * @param {String} userId - The expert's user ID
 * @returns {Promise<Object>} Earnings statistics
 */
export const fetchEarningsStats = async (userId) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/expert/${userId}/payments/stats`);
        return response.data;
    } catch (error) {
        console.error('Error fetching earnings stats:', error);
        throw error;
    }
};

/**
 * Fetch monthly revenue data for an expert
 * @param {String} userId - The expert's user ID
 * @param {Number} year - The year to fetch data for (optional)
 * @returns {Promise<Object>} Monthly revenue data
 */
export const fetchMonthlyRevenue = async (userId, year) => {
    try {
        const url = year
            ? `${API_BASE_URL}/expert/${userId}/payments/monthly-revenue?year=${year}`
            : `${API_BASE_URL}/expert/${userId}/payments/monthly-revenue`;

        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error('Error fetching monthly revenue:', error);
        throw error;
    }
};

/**
 * Fetch payment orders for an expert
 * @param {String} userId - The expert's user ID
 * @param {Object} filters - Optional filters (status, orderSource, startDate, endDate)
 * @returns {Promise<Object>} Payment orders list
 */
export const fetchPaymentOrders = async (userId, filters = {}) => {
    try {
        const queryParams = new URLSearchParams();

        if (filters.status) queryParams.append('status', filters.status);
        if (filters.orderSource) queryParams.append('orderSource', filters.orderSource);
        if (filters.startDate) queryParams.append('startDate', filters.startDate);
        if (filters.endDate) queryParams.append('endDate', filters.endDate);

        const queryString = queryParams.toString();
        const url = queryString
            ? `${API_BASE_URL}/expert/${userId}/payments/orders?${queryString}`
            : `${API_BASE_URL}/expert/${userId}/payments/orders`;

        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error('Error fetching payment orders:', error);
        throw error;
    }
};

export default {
    fetchEarningsStats,
    fetchMonthlyRevenue,
    fetchPaymentOrders
};
