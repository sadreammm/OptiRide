import axios from 'axios';
// Base API URL - update this based on your environment
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
// Create axios instance with default config
export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});
// Request interceptor to add auth token
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('optiride_token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});
// Response interceptor for error handling
apiClient.interceptors.response.use((response) => response, (error) => {
    if (error.response?.status === 401) {
        // Token expired or invalid
        localStorage.removeItem('optiride_token');
        localStorage.removeItem('optiride_user');
        window.location.href = '/login';
    }
    return Promise.reject(error);
});
// Helper function to handle API errors
export const handleApiError = (error) => {
    if (error.response) {
        // Server responded with error
        return {
            message: error.response.data?.detail || error.response.data?.message || 'An error occurred',
            status: error.response.status,
            data: error.response.data,
        };
    }
    else if (error.request) {
        // Request made but no response
        return {
            message: 'No response from server. Please check your connection.',
            status: 0,
        };
    }
    else {
        // Something else happened
        return {
            message: error.message || 'An unexpected error occurred',
            status: 0,
        };
    }
};

