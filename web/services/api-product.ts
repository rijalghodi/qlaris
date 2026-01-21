import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "./api-client";
import type { GErrorResponse, GResponse, MResponse } from "./type";
import { FileRes } from "./api-user";
import { Category } from "./api-category";
import { buildQueryKey, buildQueryKeyPredicate } from "./util";

// --- TYPES ---

export type Product = {
  id: string;
  businessId: string;
  name: string;
  price: number;
  isActive: boolean;
  image?: FileRes;
  categoryId?: string;
  category?: Category;
  enableStock: boolean;
  stockQty?: number;
  unit?: string;
  enableBarcode: boolean;
  barcodeValue?: string;
  barcodeType?: string;
  cost?: number;
  createdAt: string;
  updatedAt: string;
};

export type CreateProductReq = {
  name: string;
  price: number;
  image?: string;
  categoryId?: string;
  isFavorite?: boolean;
  enableStock?: boolean;
  stockQty?: number;
  unit?: string;
  enableBarcode?: boolean;
  barcodeValue?: string;
  barcodeType?: string;
  cost?: number;
};

export type UpdateProductReq = {
  name?: string;
  price?: number;
  image?: string;
  categoryId?: string;
  isFavorite?: boolean;
  isActive?: boolean;
  enableStock?: boolean;
  stockQty?: number;
  unit?: string;
  enableBarcode?: boolean;
  barcodeValue?: string;
  barcodeType?: string;
  cost?: number;
};

export type ToggleProductStatusReq = {
  isActive: boolean;
};

export type ProductRes = GResponse<Product>;
export type ListProductsRes = MResponse<Product>;

// --- API FUNCTIONS ---

export const productApi = {
  list: async (params?: {
    page?: number;
    pageSize?: number;
    search?: string;
  }): Promise<ListProductsRes> => {
    const response = await apiClient.get("/products", { params });
    return response.data;
  },

  get: async (id: string): Promise<ProductRes> => {
    const response = await apiClient.get(`/products/${id}`);
    return response.data;
  },

  create: async (data: CreateProductReq): Promise<ProductRes> => {
    const response = await apiClient.post("/products", data);
    return response.data;
  },

  update: async (id: string, data: UpdateProductReq): Promise<ProductRes> => {
    const response = await apiClient.patch(`/products/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<GResponse<null>> => {
    const response = await apiClient.delete(`/products/${id}`);
    return response.data;
  },

  toggleStatus: async (id: string, data: ToggleProductStatusReq): Promise<GResponse<null>> => {
    const response = await apiClient.post(`/products/${id}/status`, data);
    return response.data;
  },
};

// --- HOOKS ---

export const LIST_PRODUCTS_KEY = "products";
export const useProducts = (params?: { page?: number; pageSize?: number; search?: string }) => {
  return useQuery({
    queryKey: buildQueryKey(LIST_PRODUCTS_KEY, params),
    queryFn: () => productApi.list(params),
    initialData: (data: any) => data,
  });
};

export const GET_PRODUCT_KEY = "product";
export const useProduct = (id: string) => {
  return useQuery({
    queryKey: buildQueryKey(GET_PRODUCT_KEY, { id }),
    queryFn: () => productApi.get(id),
    enabled: !!id,
  });
};

export const useCreateProduct = ({
  onSuccess,
  onError,
}: {
  onSuccess?: (data: ProductRes) => void;
  onError?: (error: string) => void;
} = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProductReq) => productApi.create(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        predicate: buildQueryKeyPredicate([{ key: LIST_PRODUCTS_KEY }]),
      });
      onSuccess?.(data);
    },
    onError: (error: GErrorResponse) => {
      onError?.(error.response?.data?.message || "An error occurred");
    },
  });
};

export const useUpdateProduct = ({
  onSuccess,
  onError,
}: {
  onSuccess?: (data: ProductRes) => void;
  onError?: (error: string) => void;
} = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProductReq }) =>
      productApi.update(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        predicate: buildQueryKeyPredicate([
          { key: LIST_PRODUCTS_KEY },
          { key: GET_PRODUCT_KEY, data: { id: variables.id } },
        ]),
      });
      onSuccess?.(data);
    },
    onError: (error: GErrorResponse) => {
      onError?.(error.response?.data?.message || "An error occurred");
    },
  });
};

export const useDeleteProduct = ({
  onSuccess,
  onError,
}: {
  onSuccess?: () => void;
  onError?: (error: string) => void;
} = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => productApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: buildQueryKeyPredicate([{ key: LIST_PRODUCTS_KEY }]),
      });
      onSuccess?.();
    },
    onError: (error: GErrorResponse) => {
      onError?.(error.response?.data?.message || "An error occurred");
    },
  });
};

export const useToggleProductStatus = ({
  onSuccess,
  onError,
}: {
  onSuccess?: () => void;
  onError?: (error: string) => void;
} = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ToggleProductStatusReq }) =>
      productApi.toggleStatus(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        predicate: buildQueryKeyPredicate([
          { key: LIST_PRODUCTS_KEY },
          { key: GET_PRODUCT_KEY, data: { id: variables.id } },
        ]),
      });
      onSuccess?.();
    },
    onError: (error: GErrorResponse) => {
      onError?.(error.response?.data?.message || "An error occurred");
    },
  });
};
