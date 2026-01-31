import axios from 'axios';

const api = axios.create({
  baseURL: '/api', // Uses Vite proxy
});

// Add a request interceptor to attach the token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;

// Add a response interceptor to handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      const requestUrl = error.config?.url || '';
      const isAuthMeCall = requestUrl.includes('/auth/me');
      const isAuthLogin = requestUrl.includes('/auth/login');
      const isAuthRegister = requestUrl.includes('/auth/register');
      // Let AuthContext and auth pages handle their own failures
      if (!isAuthMeCall && !isAuthLogin && !isAuthRegister && window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
