/**
 * Common utility functions for API operations
 */
import { toast } from "sonner";
/**
 * Show success toast notification
 */
export function showSuccess(message) {
    toast.success(message);
}
/**
 * Show error toast notification
 */
export function showError(message) {
    toast.error(message);
}
/**
 * Show info toast notification
 */
export function showInfo(message) {
    toast.info(message);
}
/**
 * Handle API error and show appropriate message
 */
export function handleError(error, defaultMessage = "An error occurred") {
    const message = error?.message || error?.detail || defaultMessage;
    showError(message);
    console.error("API Error:", error);
}
/**
 * Format date to ISO string for API
 */
export function formatDateForAPI(date) {
    return date.toISOString();
}
/**
 * Parse date from API response
 */
export function parseDateFromAPI(dateString) {
    return new Date(dateString);
}
/**
 * Format currency
 */
export function formatCurrency(amount, currency = "AED") {
    return new Intl.NumberFormat('en-AE', {
        style: 'currency',
        currency: currency,
    }).format(amount);
}
/**
 * Format distance in km
 */
export function formatDistance(km) {
    if (km < 1) {
        return `${Math.round(km * 1000)}m`;
    }
    return `${km.toFixed(1)}km`;
}
/**
 * Format duration in minutes
 */
export function formatDuration(minutes) {
    if (minutes < 60) {
        return `${Math.round(minutes)} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}
/**
 * Debounce function for search inputs
 */
export function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
/**
 * Retry an async operation
 */
export async function retry(fn, maxAttempts = 3, delay = 1000) {
    let lastError;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await fn();
        }
        catch (error) {
            lastError = error;
            if (attempt < maxAttempts) {
                await new Promise(resolve => setTimeout(resolve, delay * attempt));
            }
        }
    }
    throw lastError;
}
/**
 * Check if value is valid coordinate
 */
export function isValidCoordinate(lat, lng) {
    return (lat >= -90 && lat <= 90 &&
        lng >= -180 && lng <= 180);
}
/**
 * Calculate distance between two coordinates (Haversine formula)
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth's radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) *
            Math.cos(toRad(lat2)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}
function toRad(degrees) {
    return (degrees * Math.PI) / 180;
}
/**
 * Get status badge color
 */
export function getStatusColor(status) {
    const statusColors = {
        AVAILABLE: "bg-success/10 text-success",
        BUSY: "bg-primary/10 text-primary",
        ON_BREAK: "bg-warning/10 text-warning",
        OFFLINE: "bg-muted text-muted-foreground",
        PENDING: "bg-warning/10 text-warning",
        ASSIGNED: "bg-primary/10 text-primary",
        PICKED_UP: "bg-info/10 text-info",
        IN_TRANSIT: "bg-primary/10 text-primary",
        DELIVERED: "bg-success/10 text-success",
        CANCELLED: "bg-destructive/10 text-destructive",
    };
    return statusColors[status] || "bg-muted text-muted-foreground";
}
/**
 * Get severity badge color
 */
export function getSeverityColor(severity) {
    const severityColors = {
        low: "bg-blue-500/10 text-blue-500",
        medium: "bg-yellow-500/10 text-yellow-500",
        high: "bg-orange-500/10 text-orange-500",
        critical: "bg-red-500/10 text-red-500",
    };
    return severityColors[severity.toLowerCase()] || "bg-muted text-muted-foreground";
}
/**
 * Validate email format
 */
export function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}
/**
 * Validate phone number format
 */
export function isValidPhone(phone) {
    const phoneRegex = /^\+?[\d\s\-()]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
}
/**
 * Format phone number for display
 */
export function formatPhoneNumber(phone) {
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
        return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
}
/**
 * Safely parse JSON
 */
export function safeJsonParse(json, fallback) {
    try {
        return JSON.parse(json);
    }
    catch {
        return fallback;
    }
}
/**
 * Generate unique ID
 */
export function generateId() {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
/**
 * Check if object is empty
 */
export function isEmpty(obj) {
    return Object.keys(obj).length === 0;
}
/**
 * Deep clone object
 */
export function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
}
/**
 * Group array by key
 */
export function groupBy(array, key) {
    return array.reduce((result, item) => {
        const groupKey = String(item[key]);
        if (!result[groupKey]) {
            result[groupKey] = [];
        }
        result[groupKey].push(item);
        return result;
    }, {});
}
/**
 * Sort array by key
 */
export function sortBy(array, key, ascending = true) {
    return [...array].sort((a, b) => {
        const aVal = a[key];
        const bVal = b[key];
        if (aVal < bVal)
            return ascending ? -1 : 1;
        if (aVal > bVal)
            return ascending ? 1 : -1;
        return 0;
    });
}
/**
 * Paginate array
 */
export function paginate(array, page, pageSize) {
    return array.slice(page * pageSize, (page + 1) * pageSize);
}
/**
 * Calculate percentage
 */
export function calculatePercentage(value, total) {
    if (total === 0)
        return 0;
    return Math.round((value / total) * 100);
}
/**
 * Truncate string
 */
export function truncate(str, maxLength) {
    if (str.length <= maxLength)
        return str;
    return str.slice(0, maxLength - 3) + '...';
}

