// Admin Service - API calls for institution management
import { authGet, authPost, authUpload, authDelete } from './authFetch';

const backendUrl = process.env.REACT_APP_BACKEND_URL
const API_BASE_URL = `${backendUrl}/api/expert`;

// Helper function to get auth headers
const getAuthHeaders = () => {
    const token = localStorage.getItem('accessToken'); // Changed from 'token' to 'accessToken'
    return {
        'Authorization': `Bearer ${token}`
    };
};

export const adminService = {

    // Get institution profile
    async getInstitution(userId, user, patchUser) {
        // console.log("Fetching institution profile for user:", userId);

        try {
            const data = await authGet(`${API_BASE_URL}/${userId}/institution`);
            patchUser({ institution: data.institution });
            console.log("Data.institution:", data.institution)
            return data.institution || {};
        } catch (error) {
            console.error('Error fetching institution:', error);
            throw error;
        }
    },

    // Update institution profile with multipart form data
    async updateInstitution(formdata, userId) {
        try {
            console.log("Sending FormData to backend...");
            // authUpload handles method (default POST, pass 'PUT' as 3rd arg)
            const data = await authUpload(
                `${API_BASE_URL}/${userId}/institution/Update`,
                formdata,
                'PUT'
            );

            console.log("Institution updated successfully:", data);
            return data.institution || {};
        } catch (error) {
            console.error('Error updating institution:', error);
            throw error;
        }
    },

    // Get invited users
    async getInvitedUsers(userId, user, patchUser) {
        try {
            const data = await authGet(`${API_BASE_URL}/${userId}/institution/invited-users`);

            if (typeof patchUser === 'function') {
                patchUser({ invitedUsers: data.invitedUsers });
            }
            console.log("Data.invitedUsers:", data.invitedUsers)
            return data.invitedUsers || [];
        } catch (error) {
            console.error('Error fetching invited users:', error);
            throw error;
        }
    },

    // Invite user to institution
    async inviteUser(userId, name, email) {
        try {
            const data = await authPost(`${API_BASE_URL}/${userId}/institution/invite-user`, { name, email });
            console.log("User invited successfully:", data);
            return data.invitedUser;
        } catch (error) {
            console.error('Error inviting user:', error);
            throw error;
        }
    },

    // Remove invited user
    async removeInvitedUser(userId, id) {
        try {
            const data = await authDelete(`${API_BASE_URL}/${userId}/institution/invited-users/${id}`);
            console.log("Invited user removed:", data);
            return data;
        } catch (error) {
            console.error('Error removing invited user:', error);
            throw error;
        }
    },

    // Resend invitation
    async resendInvitation(userId, invitationId) {
        try {
            // Using the institution route as requested
            const data = await authPost(`${API_BASE_URL}/${userId}/institution/resend-invite/${invitationId}`, {});
            console.log("Invitation resent:", data);
            return data;
        } catch (error) {
            console.error('Error resending invitation:', error);
            throw error;
        }
    },


}