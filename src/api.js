import axios from 'axios';

// Create an Axios instance configured for the backend API
const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Adjust if backend runs on a different port
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add Authorization token automatically
api.interceptors.request.use(
  async (config) => {
    let token = localStorage.getItem('token');
    let userRole = localStorage.getItem('userRole');
    let userId = localStorage.getItem('userId');
    let userEmail = localStorage.getItem('userEmail');

    // Check if Supabase session has a token and user metadata
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && (k.includes('-auth-token') || k.startsWith('sb-'))) {
          const raw = localStorage.getItem(k);
          if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed?.access_token && !token) {
              token = parsed.access_token;
            }
            if (parsed?.user) {
              if (!userId) userId = parsed.user.id;
              if (!userEmail) userEmail = parsed.user.email;
              if (!userRole) {
                userRole = parsed.user.user_metadata?.role || parsed.user.app_metadata?.role;
              }
            }
          }
        }
      }
    } catch {}

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Attach user metadata headers if available in 'user' key
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const u = JSON.parse(userStr);
        if (u.id) userId = u.id;
        if (u.role) userRole = u.role;
        if (u.email) userEmail = u.email;
      } catch {}
    }

    if (userId) config.headers['x-user-id'] = userId;
    if (userRole) config.headers['x-user-role'] = userRole;
    if (userEmail) config.headers['x-user-email'] = userEmail;

    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle global errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Don't brutally wipe session if user is in an active session
      console.warn('API 401 Unauthorized for URL:', error.config?.url);
    }
    return Promise.reject(error);
  }
);

export default api;
