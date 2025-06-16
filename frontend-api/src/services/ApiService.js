// services/ApiService.js - No Modules Format
const API_BASE_URL = 'http://localhost:8080/api/v1';

class ApiService {
    static async request(endpoint, options = {}) {
        const token = localStorage.getItem('auth_token');
        
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        };

        if (token && !endpoint.includes('/auth/')) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
            
            if (!response.ok) {
                let errorData;
                try {
                    errorData = await response.json();
                } catch {
                    errorData = { message: this.getDefaultErrorMessage(response.status) };
                }
                
                if (response.status === 401) {
                    localStorage.removeItem('auth_token');
                    window.dispatchEvent(new CustomEvent('navigate', { detail: 'login' }));
                }
                
                const errorMessage = errorData.message || this.getDefaultErrorMessage(response.status);
                const detailedError = `Error ${response.status}: ${errorMessage}`;
                
                throw new Error(detailedError);
            }

            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                return await response.json();
            }
            return null;
        } catch (error) {
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                throw new Error('Network error: Unable to connect to the server.');
            }
            throw error;
        }
    }

    static getDefaultErrorMessage(status) {
        switch (status) {
            case 400:
                return 'Bad request - Invalid data provided';
            case 401:
                return 'Unauthorized - Please log in again';
            case 403:
                return 'Forbidden - You don\'t have permission to perform this action';
            case 404:
                return 'Not found - The requested resource doesn\'t exist';
            case 409:
                return 'Conflict - Resource already exists or is in use';
            case 422:
                return 'Unprocessable entity - Validation failed';
            case 500:
                return 'Internal server error - Please try again later';
            case 503:
                return 'Service unavailable - Server is temporarily down';
            default:
                return `HTTP ${status} - An unexpected error occurred`;
        }
    }

    static async get(endpoint) {
        return this.request(endpoint);
    }
    
    static async post(endpoint, data) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }
    
    static async put(endpoint, data) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }
    
    static async delete(endpoint) {
        return this.request(endpoint, {
            method: 'DELETE'
        });
    }
}

window.ApiService = ApiService;