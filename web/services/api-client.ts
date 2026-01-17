import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { setAuthCookie, removeAuthCookie } from "@/lib/auth-cookie";
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

// Utility to get a cookie value
const getCookie = (name: string): string | null => {
  if (typeof document === "undefined") return null;

  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(";").shift() || null;
  }
  return null;
};

// Response interceptor for error handling and token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Check if error is 401 and we haven't retried yet
    if (error.response?.status === 401 && !originalRequest._retry) {
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
        const refreshToken = getCookie("qlaris.refresh-token");

        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        // Call the refresh token endpoint with the refresh token in the body
        const response = await apiClient.post("/auth/refresh-token", {
          refreshToken,
        });
        const newAccessToken = response.data?.data?.accessToken;
        const tokenExpiredAt = response.data?.data?.accessTokenExpiresAt;

        if (newAccessToken) {
          // Update the access token cookie
          setAuthCookie({
            accessToken: newAccessToken,
            accessTokenExpires: tokenExpiredAt,
          });

          // Process the queue of failed requests
          processQueue(null);

          // Retry the original request with new token
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
