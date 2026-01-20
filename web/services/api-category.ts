import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "./api-client";
import type { GErrorResponse, GResponse, MResponse } from "./type";

// --- TYPES ---

export type Category = {
  id: string;
  businessId: string;
  name: string;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type CreateCategoryReq = {
  name: string;
};

export type UpdateCategoryReq = {
  name?: string;
};

export type SortCategoryReq = {
  categoryId: string;
  sortOrder: number;
};

export type SortCategoriesReq = {
  categories: SortCategoryReq[];
};

export type CategoryRes = GResponse<Category>;
export type ListCategoriesRes = MResponse<Category>;

// --- API FUNCTIONS ---

export const categoryApi = {
  list: async (params?: { page?: number; pageSize?: number }): Promise<ListCategoriesRes> => {
    const response = await apiClient.get("/categories", { params });
    return response.data;
  },

  get: async (id: string): Promise<CategoryRes> => {
    const response = await apiClient.get(`/categories/${id}`);
    return response.data;
  },

  create: async (data: CreateCategoryReq): Promise<CategoryRes> => {
    const response = await apiClient.post("/categories", data);
    return response.data;
  },

  update: async (id: string, data: UpdateCategoryReq): Promise<CategoryRes> => {
    const response = await apiClient.patch(`/categories/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<GResponse<null>> => {
    const response = await apiClient.delete(`/categories/${id}`);
    return response.data;
  },

  sort: async (data: SortCategoriesReq): Promise<GResponse<null>> => {
    const response = await apiClient.post("/categories/sort", data);
    return response.data;
  },
};

// --- HOOKS ---

export const useCategories = (params?: { page?: number; pageSize?: number }) => {
  return useQuery({
    queryKey: ["categories", params],
    queryFn: () => categoryApi.list(params),
  });
};

export const useCategory = (id: string) => {
  return useQuery({
    queryKey: ["category", id],
    queryFn: () => categoryApi.get(id),
    enabled: !!id,
  });
};

export const useCreateCategory = ({
  onSuccess,
  onError,
}: {
  onSuccess?: (data: CategoryRes) => void;
  onError?: (error: string) => void;
} = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCategoryReq) => categoryApi.create(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["categories"],
        predicate: (query) => query.queryKey.includes("categories"),
      });
      onSuccess?.(data);
    },
    onError: (error: GErrorResponse) => {
      onError?.(error.response?.data?.message || "An error occurred");
    },
  });
};

export const useUpdateCategory = ({
  onSuccess,
  onError,
}: {
  onSuccess?: (data: CategoryRes) => void;
  onError?: (error: string) => void;
} = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCategoryReq }) =>
      categoryApi.update(id, data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      onSuccess?.(data);
    },
    onError: (error: GErrorResponse) => {
      onError?.(error.response?.data?.message || "An error occurred");
    },
  });
};

export const useDeleteCategory = ({
  onSuccess,
  onError,
}: {
  onSuccess?: () => void;
  onError?: (error: string) => void;
} = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => categoryApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      onSuccess?.();
    },
    onError: (error: GErrorResponse) => {
      onError?.(error.response?.data?.message || "An error occurred");
    },
  });
};

export const useSortCategories = ({
  onSuccess,
  onError,
}: {
  onSuccess?: () => void;
  onError?: (error: string) => void;
} = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SortCategoriesReq) => categoryApi.sort(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      onSuccess?.();
    },
    onError: (error: GErrorResponse) => {
      onError?.(error.response?.data?.message || "An error occurred");
    },
  });
};
