import axios, {
  type AxiosInstance,
  type InternalAxiosRequestConfig,
  type AxiosResponse,
  AxiosError,
} from 'axios';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/auth.store';
import { API_ENDPOINTS } from './constants';
import type { ApiSuccessResponse, ApiErrorResponse, ApiResponse } from '@/types';
import { generateId } from './utils';

// Declare helper elements for token refresh queues
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

export const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds timeout
});

// ---------- Request Interceptor ----------
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 1. Attach trace request ID
    const reqId = generateId();
    config.headers['X-Request-ID'] = reqId;
    if (typeof localStorage !== 'undefined') {
      const sessionId = localStorage.getItem('resumeai_session_id');
      if (sessionId) {
        config.headers['X-Session-ID'] = sessionId;
      }
    }

    // 2. Fetch token from Zustand Auth store
    const token = useAuthStore.getState().accessToken;
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: unknown) => {
    return Promise.reject(error);
  }
);

// ---------- Response Interceptor ----------
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError<ApiErrorResponse>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (!error.response) {
      toast.error('Network Error. Please check your internet connection.');
      return Promise.reject(error);
    }

    const { status, data } = error.response;

    // Handle 401 Token Expiration and Refresh Queueing
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(apiClient(originalRequest));
            },
            reject: (err: unknown) => {
              reject(err);
            },
          });
        });
      }

      isRefreshing = true;
      const refreshToken = useAuthStore.getState().refreshToken;

      if (!refreshToken) {
        useAuthStore.getState().logout();
        isRefreshing = false;
        return Promise.reject(error);
      }

      try {
        const refreshResponse = await axios.post<ApiResponse<{ accessToken: string; refreshToken: string; expiresIn: number }>>(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1'}${API_ENDPOINTS.AUTH.REFRESH}`,
          { refreshToken }
        );

        if (refreshResponse.data.success) {
          const newTokens = refreshResponse.data.data;
          const user = useAuthStore.getState().user;
          
          if (user) {
            useAuthStore.getState().setAuth(user, newTokens);
          }

          apiClient.defaults.headers.common.Authorization = `Bearer ${newTokens.accessToken}`;
          originalRequest.headers.Authorization = `Bearer ${newTokens.accessToken}`;

          processQueue(null, newTokens.accessToken);
          isRefreshing = false;

          return apiClient(originalRequest);
        } else {
          throw new Error('Refresh token invalid');
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        useAuthStore.getState().logout();
        isRefreshing = false;
        toast.error('Session expired. Please log in again.');
        return Promise.reject(refreshError);
      }
    }

    // Handle Other Standard Errors
    const serverMessage = data?.error?.message || 'An unexpected error occurred';
    
    // If validation error, display field level feedback or primary error message
    if (status === 400 && data?.error?.details) {
      const fields = data.error.details.map((d) => d.field).join(', ');
      toast.error(`Validation Failed (${fields}): ${serverMessage}`);
    } else if (status >= 500) {
      toast.error('Server side error. Our engineers have been notified.');
    } else {
      toast.error(serverMessage);
    }

    return Promise.reject(error);
  }
);

// ---------- Standardized HTTP Request Helpers ----------

export async function apiGet<T>(url: string, params?: Record<string, unknown>): Promise<T> {
  const response = await apiClient.get<ApiSuccessResponse<T>>(url, { params });
  return response.data.data;
}

export async function apiPost<T>(url: string, body?: unknown): Promise<T> {
  const response = await apiClient.post<ApiSuccessResponse<T>>(url, body);
  return response.data.data;
}

export async function apiPut<T>(url: string, body?: unknown): Promise<T> {
  const response = await apiClient.put<ApiSuccessResponse<T>>(url, body);
  return response.data.data;
}

export async function apiPatch<T>(url: string, body?: unknown): Promise<T> {
  const response = await apiClient.patch<ApiSuccessResponse<T>>(url, body);
  return response.data.data;
}

export async function apiDelete<T>(url: string): Promise<T> {
  const response = await apiClient.delete<ApiSuccessResponse<T>>(url);
  return response.data.data;
}
