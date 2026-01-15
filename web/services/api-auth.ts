import { useMutation } from "@tanstack/react-query";

import { setAuthCookie } from "@/lib/auth-cookie";
import { Role } from "@/lib/constant";

import { apiClient } from "./api-client";
import type { GErrorResponse, GResponse } from "./type";

// --- LOGIN ---

export type LoginReq = {
  phone?: string;
  email?: string;
  password: string;
};

export type LoginRes = GResponse<{
  name?: string;
  phone?: string;
  email?: string;
  role?: Role;
  token?: string;
  tokenExpiredAt?: string;
}>;

// --- FORGOT PASSWORD (REQUEST OTP) ---

export type ForgotPasswordReq = {
  email?: string;
  phone?: string;
};

export type ForgotPasswordRes = GResponse<{
  email?: string;
  phone?: string;
  resendAt: number;
  ttl: number;
}>;

// --- SET PASSWORD ---

export type SetPasswordReq = {
  token: string;
  password: string;
};

export type SetPasswordRes = GResponse<Record<string, never>>;

// --- RESET PASSWORD ---

export type ResetPasswordReq = {
  token: string;
  password: string;
};

export type ResetPasswordRes = GResponse<Record<string, never>>;

// Main Function

export const authApi = {
  login: async (credentials: LoginReq): Promise<LoginRes> => {
    const response = await apiClient.post("/auth/login", credentials);
    return response.data;
  },

  forgotPassword: async (data: ForgotPasswordReq): Promise<ForgotPasswordRes> => {
    const response = await apiClient.post("/auth/forgot-password", data);
    return response.data;
  },

  resetPassword: async (data: ResetPasswordReq): Promise<ResetPasswordRes> => {
    const response = await apiClient.post("/auth/reset-password", data);
    return response.data;
  },

  setPassword: async (data: SetPasswordReq): Promise<SetPasswordRes> => {
    const response = await apiClient.post("/auth/set-password", data);
    return response.data;
  },
};

// --- HOOKS ---

export const useLogin = ({
  onSuccess,
  onError,
}: {
  onSuccess?: (data: LoginRes) => void;
  onError?: (error: string) => void;
}) => {
  return useMutation({
    mutationFn: (data: LoginReq) => authApi.login(data),
    onSuccess: (data: LoginRes) => {
      if (data.data?.token) {
        setAuthCookie({
          accessToken: data.data.token,
          accessTokenExpires: data.data.tokenExpiredAt,
        });
      }
      onSuccess?.(data);
    },
    onError: (error: GErrorResponse) => {
      onError?.(error.response?.data?.message || "An error occurred");
    },
  });
};
