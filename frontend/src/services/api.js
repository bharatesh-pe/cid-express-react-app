// src/services/api.js
import axios from 'axios';

import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

if(!process.env || !process.env.REACT_APP_SERVER_URL){
    toast.error('Please Check Server URL', {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        className: "toast-error",
        onOpen: () =>  Promise.reject('Please Check Server URL')
    });
}

// Base URL for your API (replace with your API's base URL)
const API_BASE_URL = process.env.REACT_APP_SERVER_URL;

// Create an Axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor for request (optional, for adding authorization tokens, etc.)
api.interceptors.request.use(
    (config) => {
        // // You can add auth token here or other headers
        // const token = localStorage.getItem('auth_token');
        // if (token) {
        //     config.headers['token'] = token;
        // }
        // if (config.data instanceof FormData) {
        //     config.headers['Content-Type'] = 'multipart/form-data';
        // } else {
        //     config.headers['Content-Type'] = 'application/json';
        // }

        // if (config.url.includes('/downloadDocumentAttachments/') || config.url.includes('/downloadExcelData')) {
        //     config.responseType = 'blob';
        // }

        // You can add auth token here or other headers
        const token = localStorage.getItem('auth_token');
        if (token) {
            config.headers['token'] = token;
        }

        if (config.data instanceof FormData) {
            config.headers['Content-Type'] = 'multipart/form-data';
        } else {
            config.headers['Content-Type'] = 'application/json';
        }

        // Set response type for specific URLs
        if (
            config.url.includes('/downloadDocumentAttachments/') || 
            config.url.includes('/downloadExcelData')
        ) {
            config.responseType = 'blob';
        }

        // Inject allowedUserIds into body if applicable
        const allowedUserIds = JSON.parse(localStorage.getItem('allowedUserIds') || '[]');

        const method = config.method?.toLowerCase();
        if (['post', 'put', 'patch'].includes(method)) {
            if (config.data instanceof FormData) {
                config.data.append('allowedUserIds', JSON.stringify(allowedUserIds));
            } else {
                config.data = {
                    ...(config.data || {}),
                    allowedUserIds,
                };
            }
        }

        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// // Interceptor for responses (optional)
api.interceptors.response.use(
    (response) => {
        return response.data; // You can modify the response data here
    },
    (error) => {
        if (error.response) {
            // Handle known API errors, such as 401 or 500
            if (error.response.status === 401) {
                // Handle unauthorized (maybe log out user)
            } else {
                // Handle other errors
            }
        }
        return Promise.reject(error);
    }
);

// Function to make GET requests
const get = (url, params = {}) => {
    return api.get(url, { params });
};

// Function to make POST requests
const post = (url, data) => {
    return api.post(url, data);
};

// Function to make PUT requests
const put = (url, data) => {
    return api.put(url, data);
};

// Function to make DELETE requests
const del = (url) => {
    return api.delete(url);
};

// Export functions for use in components
export default {
    get,
    post,
    put,
    del,
};
