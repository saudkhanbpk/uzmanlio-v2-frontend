// Admin Service - API calls for institution management
const backendUrl = process.env.REACT_APP_BACKEND_URL
const API_BASE_URL = `${backendUrl}/api/expert`;


export const adminService = {

    // Get institution profile
    async getInstitution(userId, user, patchUser) {
        // console.log("Fetching institution profile for user:", userId);

        try {
            const response = await fetch(`${API_BASE_URL}/${userId}/institution`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
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
            const response = await fetch(`${API_BASE_URL}/${userId}/institution/Update`, {
                method: 'PUT',
                body: formdata,
                // Don't set Content-Type header - browser will set it with boundary
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.log("Error response data:", errorData);
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
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
            const response = await fetch(`${API_BASE_URL}/${userId}/institution/invited-users`);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            patchUser({invitedUsers: data.invitedUsers })
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
            const response = await fetch(`${API_BASE_URL}/${userId}/institution/invite-user`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ name, email }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
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
            const response = await fetch(`${API_BASE_URL}/${userId}/institution/invited-users/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log("Invited user removed:", data);
            return data;
        } catch (error) {
            console.error('Error removing invited user:', error);
            throw error;
        }
    },

    // Resend invitation
    async resendInvitation(userId, email) {
        try {
            const response = await fetch(`${API_BASE_URL}/${userId}/institution/resend-invite/${email}`, {
                method: 'POST',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log("Invitation resent:", data);
            return data.invitedUser;
        } catch (error) {
            console.error('Error resending invitation:', error);
            throw error;
        }
    }
}