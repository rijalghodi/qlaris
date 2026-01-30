import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { Role } from "@/lib/constant";

import { apiClient } from "./api-client";
import type { GErrorResponse, GResponse } from "./type";

// --- TYPES ---

export type FileRes = {
  key: string;
  url: string;
};

export type BusinessRes = {
  id: string;
  name: string;
  address?: string;
  employeeCount?: string;
  category?: string;
  logo?: FileRes;
};

export type UserRes = {
  id: string;
  email: string;
  name: string;
  role: Role;
  business?: BusinessRes;
  googleImage?: string;
  image?: FileRes;
  isVerified: boolean;
  hasPassword: boolean;
  createdAt: string;
  updatedAt: string;
};

export type EditCurrentUserReq = {
  name?: string;
  image?: string;
};

export type EditCurrentUserBusinessReq = {
  name?: string;
  address?: string;
  logo?: string;
  category?: string;
  employeeCount?: number;
};

export type EditPasswordReq = {
  oldPassword?: string;
  newPassword: string;
};

export type GetCurrentUserRes = GResponse<UserRes>;

// --- API FUNCTIONS ---

export const userApi = {
  getCurrentUser: async (): Promise<GetCurrentUserRes> => {
    const response = await apiClient.get("/users/current");
    return response.data;
  },

  editCurrentUser: async (data: EditCurrentUserReq): Promise<GetCurrentUserRes> => {
    const response = await apiClient.put("/users/current", data);
    return response.data;
  },

  editCurrentUserBusiness: async (data: EditCurrentUserBusinessReq): Promise<GetCurrentUserRes> => {
    const response = await apiClient.put("/users/current/business", data);
    return response.data;
  },

  editCurrentUserPassword: async (data: EditPasswordReq): Promise<GResponse<string>> => {
    const response = await apiClient.put("/users/current/password", data);
    return response.data;
  },

  deleteUser: async (): Promise<GResponse<string>> => {
    const response = await apiClient.delete("/users/current");
    return response.data;
  },
};

// --- HOOKS ---

export const useGetCurrentUser = () => {
  return useQuery({
    queryKey: ["current-user"],
    queryFn: () => userApi.getCurrentUser(),
  });
};

export const useEditCurrentUser = ({
  onSuccess,
  onError,
}: {
  onSuccess?: (data: GetCurrentUserRes) => void;
  onError?: (error: string) => void;
} = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: EditCurrentUserReq) => userApi.editCurrentUser(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["current-user"] });
      onSuccess?.(data);
    },
    onError: (error: GErrorResponse) => {
      onError?.(error.response?.data?.message || "An error occurred");
    },
  });
};

export const useEditCurrentUserBusiness = ({
  onSuccess,
  onError,
}: {
  onSuccess?: (data: GetCurrentUserRes) => void;
  onError?: (error: string) => void;
} = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: EditCurrentUserBusinessReq) => userApi.editCurrentUserBusiness(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["current-user"] });
      onSuccess?.(data);
    },
    onError: (error: GErrorResponse) => {
      onError?.(error.response?.data?.message || "An error occurred");
    },
  });
};

export const useEditCurrentUserPassword = ({
  onSuccess,
  onError,
}: {
  onSuccess?: () => void;
  onError?: (error: string) => void;
} = {}) => {
  return useMutation({
    mutationFn: (data: EditPasswordReq) => userApi.editCurrentUserPassword(data),
    onSuccess: () => {
      onSuccess?.();
    },
    onError: (error: GErrorResponse) => {
      onError?.(error.response?.data?.message || "An error occurred");
    },
  });
};

export const useDeleteUser = ({
  onSuccess,
  onError,
}: {
  onSuccess?: () => void;
  onError?: (error: string) => void;
} = {}) => {
  return useMutation({
    mutationFn: () => userApi.deleteUser(),
    onSuccess: () => {
      onSuccess?.();
    },
    onError: (error: GErrorResponse) => {
      onError?.(error.response?.data?.message || "An error occurred");
    },
  });
};
