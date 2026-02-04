import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { setAuthCookie, removeAuthCookie, getAuthCookie } from "@/lib/auth-cookie";
import { ROUTES } from "@/lib/routes";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Enable sending cookies with requests
});

// Track if a token refresh is in progress
let isRefreshing = false;
// Queue of failed requests to retry after token refresh
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

// Process the queue of failed requests
const processQueue = (error: Error | null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });

  failedQueue = [];
};

// Request interceptor to add Bearer token
apiClient.interceptors.request.use(
  (config) => {
    const { accessToken } = getAuthCookie();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling and token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Check if error is 401 and we haven't retried yet and not login path
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      originalRequest.url !== "/auth/login" &&
      originalRequest.url !== "/auth/login/employees"
    ) {
      // Prevent infinite loops by marking this request as retried
      originalRequest._retry = true;

      if (isRefreshing) {
        // If token refresh is already in progress, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            // Retry the original request after token refresh
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      isRefreshing = true;

      try {
        // Get refresh token from cookie
        const { refreshToken } = getAuthCookie();

        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        // Call the refresh token endpoint with the refresh token in the body
        const response = await apiClient.post("/auth/refresh-token", {
          refreshToken,
        });

        if (response.data.success && response.data.data) {
          // Update cookies with new tokens
          const {
            accessToken,
            accessTokenExpiresAt,
            refreshToken: newRefreshToken,
            refreshTokenExpiresAt,
          } = response.data.data;

          setAuthCookie({
            accessToken,
            accessTokenExpires: accessTokenExpiresAt,
            refreshToken: newRefreshToken,
            refreshTokenExpires: refreshTokenExpiresAt,
          });

          // Process the queue of failed requests
          processQueue(null);

          // Retry the original request with new token
          // Update the header with the new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return apiClient(originalRequest);
        } else {
          throw new Error("No token in refresh response");
        }
      } catch (refreshError) {
        // Token refresh failed - logout user
        processQueue(refreshError as Error);

        if (typeof window !== "undefined") {
          removeAuthCookie();
          window.location.href = ROUTES.LOGIN;
        }

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
