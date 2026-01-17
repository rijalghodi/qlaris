import { useMutation, useQuery } from "@tanstack/react-query";

import { setAuthCookie } from "@/lib/auth-cookie";
import { removeAuthCookie } from "@/lib/auth-cookie";
import { ROUTES } from "@/lib/routes";
import { Role } from "@/lib/constant";

import { apiClient } from "./api-client";
import type { GErrorResponse, GResponse } from "./type";

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
    return response.data;
  },

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

  refreshToken: async (): Promise<RefreshTokenRes> => {
    const response = await apiClient.post("/auth/refresh-token");
    return response.data;
  },

  getCurrentUser: async (): Promise<GetCurrentUserRes> => {
    const response = await apiClient.get("/auth/me");
    return response.data;
  },
};

// --- HOOKS ---

// type MutationBuilderProps<T, R> = {
//   mutationFn: (data: T) => Promise<R>;
//   onSuccess?: (data: R) => void;
//   onError?: (error: string) => void;
// };

// export const mutationBuilder = <T, R>({
//   mutationFn,
//   onSuccess,
//   onError,
// }: MutationBuilderProps<T, R>) => {
//   return useMutation<R, GErrorResponse, T>({
//     mutationFn,
//     onSuccess,
//     onError: (error) => {
//       onError?.(error.response?.data?.message ?? "An error occurred");
//     },
//   });
// };

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
      // if (data.data?.token) {
      //   setAuthCookie({
      //     accessToken: data.data.token,
      //     accessTokenExpires: data.data.tokenExpiredAt,
      //   });
      // }
      onSuccess?.(data);
    },
    onError: (error: GErrorResponse) => {
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

export const useGetCurrentUser = () => {
  return useQuery({
    queryKey: ["current-user"],
    queryFn: () => authApi.getCurrentUser(),
  });
};

import { useCallback, useState } from "react";

export const useLogout = () => {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const logout = useCallback(async () => {
    setIsLoggingOut(true);
    removeAuthCookie();
    window.location.href = ROUTES.LOGIN;
    setIsLoggingOut(false);
  }, []);
  return { isLoggingOut, logout };
};
