import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { setAuthCookie } from "@/lib/auth-cookie";
import { removeAuthCookie } from "@/lib/auth-cookie";
import { ROUTES } from "@/lib/routes";
import { Role } from "@/lib/constant";

import { apiClient } from "./api-client";
import type { GErrorResponse, GResponse, MResponse } from "./type";

// --- TYPES ---

export type FileRes = {
  key: string;
  url: string;
};

export type UserRes = {
  id: string;
  email: string;
  name: string;
  role: Role;
  googleImage?: string;
  image?: FileRes;
  isVerified: boolean;
  hasPassword: boolean;
  businessName?: string;
  businessAddress?: string;
  isDataCompleted?: boolean;
  createdAt: string;
  updatedAt: string;
};

export type EditCurrentUserReq = {
  name?: string;
  image?: string;
  businessName?: string;
  businessAddress?: string;
};

export type EditPasswordReq = {
  currentPassword?: string;
  newPassword: string;
};

export type CreateUserReq = {
  email: string;
  password: string;
  name: string;
  role: "owner" | "manager" | "cashier";
  businessId?: string;
  image?: string;
  businessName?: string;
  businessAddress?: string;
};

export type UpdateUserReq = {
  name?: string;
  role?: "owner" | "manager" | "cashier";
  image?: string;
  businessName?: string;
  businessAddress?: string;
};

export type GetCurrentUserRes = GResponse<UserRes>;
export type GetUserRes = GResponse<UserRes>;
export type ListUsersRes = MResponse<UserRes>;

// --- API FUNCTIONS ---

export const userApi = {
  getCurrentUser: async (): Promise<GetCurrentUserRes> => {
    const response = await apiClient.get("/users/current");
    return response.data;
  },

  editCurrentUser: async (data: EditCurrentUserReq): Promise<GetUserRes> => {
    const response = await apiClient.put("/users/current", data);
    return response.data;
  },

  editCurrentUserPassword: async (data: EditPasswordReq): Promise<GResponse<string>> => {
    const response = await apiClient.put("/users/current/password", data);
    return response.data;
  },

  getUser: async (id: string): Promise<GetUserRes> => {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  },

  listUsers: async (params?: { page?: number; pageSize?: number }): Promise<ListUsersRes> => {
    const response = await apiClient.get("/users", { params });
    return response.data;
  },

  createUser: async (data: CreateUserReq): Promise<GetUserRes> => {
    const response = await apiClient.post("/users", data);
    return response.data;
  },

  updateUser: async (id: string, data: UpdateUserReq): Promise<GetUserRes> => {
    const response = await apiClient.put(`/users/${id}`, data);
    return response.data;
  },

  deleteUser: async (id: string): Promise<GResponse<null>> => {
    const response = await apiClient.delete(`/users/${id}`);
    return response.data;
  },

  editPassword: async (id: string, data: EditPasswordReq): Promise<GResponse<string>> => {
    const response = await apiClient.put(`/users/${id}/password`, data);
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
  onSuccess?: (data: GetUserRes) => void;
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

export const useGetUser = (id: string) => {
  return useQuery({
    queryKey: ["users", id],
    queryFn: () => userApi.getUser(id),
    enabled: !!id,
  });
};

export const useListUsers = (params?: { page?: number; pageSize?: number }) => {
  return useQuery({
    queryKey: ["users", params],
    queryFn: () => userApi.listUsers(params),
  });
};

export const useCreateUser = ({
  onSuccess,
  onError,
}: {
  onSuccess?: (data: GetUserRes) => void;
  onError?: (error: string) => void;
} = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserReq) => userApi.createUser(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      onSuccess?.(data);
    },
    onError: (error: GErrorResponse) => {
      onError?.(error.response?.data?.message || "An error occurred");
    },
  });
};

export const useUpdateUser = ({
  onSuccess,
  onError,
}: {
  onSuccess?: (data: GetUserRes) => void;
  onError?: (error: string) => void;
} = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserReq }) => userApi.updateUser(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["current-user"] });
      onSuccess?.(data);
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
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => userApi.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      onSuccess?.();
    },
    onError: (error: GErrorResponse) => {
      onError?.(error.response?.data?.message || "An error occurred");
    },
  });
};
