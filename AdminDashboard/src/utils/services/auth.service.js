import { apiClient, handleApiError } from '@/utils/api.config';
export const authService = {
    // Admin creates a user
    async createUser(data) {
        try {
            const response = await apiClient.post('/auth/admin/create-user', data);
            return response.data;
        }
        catch (error) {
            throw handleApiError(error);
        }
    },
    // Admin deletes a user
    async deleteUser(userId) {
        try {
            const response = await apiClient.delete(`/auth/admin/delete-user/${userId}`);
            return response.data;
        }
        catch (error) {
            throw handleApiError(error);
        }
    },
    // User login
    async login(tokenData) {
        try {
            const response = await apiClient.post('/auth/login', tokenData);
            // Store token and user data
            if (response.data.access_token) {
                localStorage.setItem('auth_token', response.data.access_token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
            }
            return response.data;
        }
        catch (error) {
            throw handleApiError(error);
        }
    },
    // User logout
    async logout() {
        try {
            await apiClient.post('/auth/logout');
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user');
        }
        catch (error) {
            // Always clear local storage on logout attempt
            localStorage.removeItem('auth_token');
            localStorage.removeItem('user');
            throw handleApiError(error);
        }
    },
    // Get current user info
    async getMe() {
        try {
            const response = await apiClient.get('/auth/me');
            return response.data;
        }
        catch (error) {
            throw handleApiError(error);
        }
    },
    // Get stored user from localStorage
    getStoredUser() {
        const userStr = localStorage.getItem('user');
        return userStr ? JSON.parse(userStr) : null;
    },
    // Check if user is authenticated
    isAuthenticated() {
        return !!localStorage.getItem('auth_token');
    },
    // Check if user is admin
    isAdmin() {
        const user = this.getStoredUser();
        return user?.user_type === 'admin';
    },
};

