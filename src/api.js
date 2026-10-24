import axios from 'axios';

// Create an Axios instance configured for the backend API
const api = axios.create({
  baseURL: 'http://localhost:5000/api', // Adjust if backend runs on a different port
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add Authorization token automatically.
// SECURITY: User identity is derived ONLY from the active Supabase session stored
// in localStorage under the standard 'sb-*' key. We never read manually-cached
// 'userId' / 'userRole' / 'user' keys because those may contain stale data from
// a previous lecturer's session.
api.interceptors.request.use(
  async (config) => {
    let token = null;
    let userId = null;
    let userEmail = null;
    let userRole = null;

    // Read ONLY the Supabase-managed session keys — these are always current.
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
                // Role in Supabase JWT user_metadata is set at registration time
                userRole =
                  parsed.user.user_metadata?.role ||
                  parsed.user.app_metadata?.role ||
                  null;
              }
            }
          }
        }
      }
    } catch { /* ignore parse errors */ }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Only attach supplemental headers when we have a verified Supabase token.
    // Without a token these headers would be meaningless (backend rejects them).
    if (token && userId) {
      config.headers['x-user-id'] = userId;
    }
    if (token && userRole) {
      config.headers['x-user-role'] = userRole;
    }
    if (token && userEmail) {
      config.headers['x-user-email'] = userEmail;
    }

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
