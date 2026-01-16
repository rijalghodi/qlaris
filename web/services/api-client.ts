import axios from "axios";
import { ACCESS_TOKEN_KEY } from "@/lib/constant";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = document.cookie
        .split("; ")
        .find((row) => row.startsWith(`${ACCESS_TOKEN_KEY}=`))
        ?.split("=")[1];

      if (token) {
        config.headers.Authorization = `Bearer ${decodeURIComponent(token)}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      // if (typeof window !== "undefined") {
      //   removeAuthCookie();
      // }
    }
    return Promise.reject(error);
  }
);
