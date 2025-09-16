import apiService from '../services/api';

/**
 * Check if the current user is an admin
 * @returns {boolean} True if user is admin, false otherwise
 */
export const isAdmin = () => {
    try {
        const user = apiService.getStoredUser();
        return user && user.isAdmin === true;
    } catch (error) {
        console.error('Error checking admin status:', error);
        return false;
    }
};

/**
 * Check if the current user is authenticated
 * @returns {boolean} True if user is authenticated, false otherwise
 */
export const isAuthenticated = () => {
    return apiService.isAuthenticated();
};

/**
 * Get current user data
 * @returns {Object|null} User object or null if not authenticated
 */
export const getCurrentUser = () => {
    try {
        return apiService.getStoredUser();
    } catch (error) {
        console.error('Error getting current user:', error);
        return null;
    }
};
