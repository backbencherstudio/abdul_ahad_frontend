import axios from 'axios';

const axiosClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_ENDPOINT, 
  withCredentials: false, // Disable cookies to avoid CORS issues
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error); 
  }
);

// Response interceptor to handle token expiration and CORS errors
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle CORS errors
    if (error.message === 'Network Error' || error.code === 'ERR_NETWORK') {
      console.error('CORS Error: Make sure your backend server is running and configured properly');
      return Promise.reject(new Error('Network error. Please check your connection and try again.'));
    }
    
    // Handle 401 Unauthorized - but don't redirect for login API calls
    if (error.response?.status === 401) {
      // Don't redirect if this is a login API call
      const isLoginApiCall = error.config?.url?.includes('/api/auth/login');
      
      if (!isLoginApiCall) {
        // Token expired or invalid for other API calls
        localStorage.removeItem('token');
        
        // Only redirect if we're in the browser
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosClient;