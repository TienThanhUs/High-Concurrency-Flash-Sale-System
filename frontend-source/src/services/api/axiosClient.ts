import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const TOKEN_KEY = 'flashmart_jwt';

function resolveBaseUrl(): string {
  const envUrl = import.meta.env.VITE_API_BASE_URL?.trim();
  if (envUrl) {
    const clean = envUrl.replace(/\/+$/, '');
    return clean.endsWith('/api/v1') ? clean : `${clean}/api/v1`;
  }
  return import.meta.env.PROD ? 'https://flashmart-api.onrender.com/api/v1' : '/api/v1';
}

export const axiosClient = axios.create({
  baseURL: resolveBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request Interceptor: Attach JWT
axiosClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Handle 401 Unauthorized
axiosClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      const url = error.config?.url || '';
      // Don't auto-redirect if it is login or register endpoint
      const isAuthEndpoint = url.includes('/auth/login') || url.includes('/auth/register');

      if (!isAuthEndpoint) {
        localStorage.removeItem(TOKEN_KEY);
        // Dispatch custom event so AuthContext can handle logout and toast
        window.dispatchEvent(
          new CustomEvent('auth:unauthorized', {
            detail: { message: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!' },
          })
        );
      }
    }
    return Promise.reject(error);
  }
);
