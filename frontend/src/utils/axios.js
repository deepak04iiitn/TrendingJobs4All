import axios from 'axios';

// Create an axios instance with default config
const instance = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3000',  // Use environment variable if available
    withCredentials: true,  // Important for cookies/auth
    headers: {
        'Content-Type': 'application/json'
    }
});

// Add response interceptor for better error handling
instance.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle specific error cases
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            if (error.response.status === 401) {
                // Handle unauthorized access
                window.location.href = '/signin';
            }
            return Promise.reject(error);
        } else if (error.request) {
            // The request was made but no response was received
            console.error('No response received:', error.request);
            return Promise.reject(new Error('No response from server. Please check your connection.'));
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error('Request setup error:', error.message);
            return Promise.reject(error);
        }
    }
);

export default instance; 