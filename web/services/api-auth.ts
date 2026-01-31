import { useMutation, useQuery } from "@tanstack/react-query";

import { setAuthCookie } from "@/lib/auth-cookie";
import { removeAuthCookie } from "@/lib/auth-cookie";
import { ROUTES } from "@/lib/routes";
import { Role } from "@/lib/constant";

import { apiClient } from "./api-client";
import type { GErrorResponse, GResponse } from "./type";
import { useCallback, useState } from "react";

// --- REGISTER ---

export type RegisterReq = {
  phone?: string;
  email?: string;
  password: string;
};

export type RegisterRes = GResponse<{
  phone?: string;
  email?: string;
  role?: Role;
  token?: string;
  tokenExpiredAt?: string;
}>;

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

// --- LOGIN EMPLOYEE ---

export type FileRes = {
  key: string;
  url: string;
};

export type LoginEmployeeReq = {
  businessCode: string;
  pin: string;
  employeeId: string;
};

export type LoginEmployeeRes = GResponse<{
  id: string;
  name: string;
  role: string;
  businessId: string;
  businessName: string;
  image?: FileRes;
}>;

// --- LIST LOGINABLE EMPLOYEES ---

export type LoginableEmployeeRes = {
  id: string;
  name: string;
  role: string;
  image?: FileRes;
};

// --- REFRESH TOKEN ---

export type RefreshTokenReq = {
  refreshToken: string;
};

export type RefreshTokenRes = GResponse<{
  token?: string;
  tokenExpiredAt?: string;
}>;

// --- FORGOT PASSWORD (REQUEST OTP) ---

export type ForgotPasswordReq = {
  email?: string;
};

export type ForgotPasswordRes = GResponse<{
  nextRequestAt?: string;
}>;

// --- SET PASSWORD ---

export type SetPasswordReq = {
  token: string;
  password: string;
};

export type SetPasswordRes = GResponse<Record<string, never>>;

// --- VERIFY EMAIL ---

export type VerifyEmailReq = {
  token: string;
};

// --- GET CURRENT USER ---

export type GetCurrentUserRes = GResponse<{
  name?: string;
  phone?: string;
  email?: string;
  role?: Role;
  token?: string;
  googleImage?: string;
  tokenExpiredAt?: string;
}>;

// --- RESET PASSWORD ---

export type ResetPasswordReq = {
  token: string;
  password: string;
};

export type ResetPasswordRes = GResponse<Record<string, never>>;

// Main Function

export const authApi = {
  register: async (credentials: RegisterReq): Promise<RegisterRes> => {
    const response = await apiClient.post("/auth/register", credentials);
    return response?.data;
  },

  login: async (credentials: LoginReq): Promise<LoginRes> => {
    const response = await apiClient.post("/auth/login", credentials);
    return response?.data;
  },

  forgotPassword: async (data: ForgotPasswordReq): Promise<ForgotPasswordRes> => {
    const response = await apiClient.post("/auth/forgot-password", data);
    return response?.data;
  },

  resetPassword: async (data: ResetPasswordReq): Promise<ResetPasswordRes> => {
    const response = await apiClient.post("/auth/reset-password", data);
    return response?.data;
  },

  setPassword: async (data: SetPasswordReq): Promise<SetPasswordRes> => {
    const response = await apiClient.post("/auth/set-password", data);
    return response?.data;
  },

  sendVerification: async (data: ForgotPasswordReq): Promise<ForgotPasswordRes> => {
    const response = await apiClient.post("/auth/send-verification", data);
    return response?.data;
  },

  verifyEmail: async (data: VerifyEmailReq): Promise<LoginRes> => {
    const response = await apiClient.post("/auth/verify-email", data);
    if (!response) throw new Error("Failed to verify email");
    return response?.data;
  },

  refreshToken: async (): Promise<RefreshTokenRes> => {
    const response = await apiClient.post("/auth/refresh-token");
    return response?.data;
  },

  logout: async (): Promise<GResponse<null>> => {
    const response = await apiClient.post("/auth/logout");
    return response?.data;
  },

  loginEmployee: async (credentials: LoginEmployeeReq): Promise<LoginEmployeeRes> => {
    const response = await apiClient.post("/auth/login/employees", credentials);
    return response?.data;
  },

  listLoginableEmployees: async (
    businessCode: string
  ): Promise<GResponse<LoginableEmployeeRes[]>> => {
    const response = await apiClient.get(`/auth/login/${businessCode}/employees`);
    return response?.data;
  },
};

// --- HOOKS ---

export const useRegister = ({
  onSuccess,
  onError,
}: {
  onSuccess?: (data: RegisterRes) => void;
  onError?: (error: string) => void;
}) => {
  return useMutation({
    mutationFn: (data: RegisterReq) => authApi.register(data),
    onSuccess: (data: RegisterRes) => {
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
      onSuccess?.(data);
    },
    onError: (error: GErrorResponse) => {
      console.log(error);
      onError?.(error.response?.data?.message || "An error occurred");
    },
  });
};

export const useForgotPassword = ({
  onSuccess,
  onError,
}: {
  onSuccess?: (data: ForgotPasswordRes) => void;
  onError?: (error: string) => void;
} = {}) => {
  return useMutation({
    mutationFn: (data: ForgotPasswordReq) => authApi.forgotPassword(data),
    onSuccess: (data: ForgotPasswordRes) => {
      onSuccess?.(data);
    },
    onError: (error: GErrorResponse) => {
      onError?.(error.response?.data?.message || "An error occurred");
    },
  });
};

export const useResetPassword = ({
  onSuccess,
  onError,
}: {
  onSuccess?: (data: ResetPasswordRes) => void;
  onError?: (error: string) => void;
} = {}) => {
  return useMutation({
    mutationFn: (data: ResetPasswordReq) => authApi.resetPassword(data),
    onSuccess: (data: ResetPasswordRes) => {
      onSuccess?.(data);
    },
    onError: (error: GErrorResponse) => {
      onError?.(error.response?.data?.message || "An error occurred");
    },
  });
};

export const useSetPassword = ({
  onSuccess,
  onError,
}: {
  onSuccess?: (data: SetPasswordRes) => void;
  onError?: (error: string) => void;
} = {}) => {
  return useMutation({
    mutationFn: (data: SetPasswordReq) => authApi.setPassword(data),
    onSuccess: (data: SetPasswordRes) => {
      onSuccess?.(data);
    },
    onError: (error: GErrorResponse) => {
      onError?.(error.response?.data?.message || "An error occurred");
    },
  });
};

export const useSendVerification = ({
  onSuccess,
  onError,
}: {
  onSuccess?: (data: ForgotPasswordRes) => void;
  onError?: (error: string) => void;
} = {}) => {
  return useMutation({
    mutationFn: (data: ForgotPasswordReq) => authApi.sendVerification(data),
    onSuccess: (data: ForgotPasswordRes) => {
      onSuccess?.(data);
    },
    onError: (error: GErrorResponse) => {
      onError?.(error.response?.data?.message || "An error occurred");
    },
  });
};

export const useVerifyEmail = ({
  onSuccess,
  onError,
}: {
  onSuccess?: (data: LoginRes) => void;
  onError?: (error: string) => void;
} = {}) => {
  return useMutation({
    mutationFn: (data: VerifyEmailReq) => authApi.verifyEmail(data),
    onSuccess: (data: LoginRes) => {
      onSuccess?.(data);
    },
    onError: (error: GErrorResponse) => {
      onError?.(error.response?.data?.message || "An error occurred");
    },
  });
};

export const useLogout = ({
  onSuccess,
  onError,
}: {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}) => {
  return useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      window.location.href = ROUTES.LOGIN;
      onSuccess?.();
    },
    onError: (error: GErrorResponse) => {
      onError?.(error.response?.data?.message || "An error occurred");
    },
  });
};

export const useLoginEmployee = ({
  onSuccess,
  onError,
}: {
  onSuccess?: (data: LoginEmployeeRes) => void;
  onError?: (error: string) => void;
}) => {
  return useMutation({
    mutationFn: (data: LoginEmployeeReq) => authApi.loginEmployee(data),
    onSuccess: (data: LoginEmployeeRes) => {
      // Note: Employee login uses httpOnly cookies set by the server
      // No need to manually set cookies here
      onSuccess?.(data);
    },
    onError: (error: GErrorResponse) => {
      onError?.(error.response?.data?.message || "An error occurred");
    },
  });
};

export const useListLoginableEmployees = (businessCode: string) => {
  return useQuery({
    queryKey: ["loginable-employees", businessCode],
    queryFn: () => authApi.listLoginableEmployees(businessCode),
    enabled: !!businessCode,
  });
};
