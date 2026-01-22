import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "./api-client";
import type { GErrorResponse, GResponse, MResponse } from "./type";
import { buildQueryKey, buildQueryKeyPredicate } from "./util";

// --- TYPES ---

export type TransactionItemReq = {
  productId: string;
  quantity: number;
};

export type CreateTransactionReq = {
  items: TransactionItemReq[];
  // For cash payment
  receivedAmount?: number;
  isCashPaid?: boolean;
};

export type UpdateTransactionReq = {
  items: TransactionItemReq[];
  // For cash payment
  receivedAmount?: number;
  isCashPaid?: boolean;
};

export type PayTransactionReq = {
  receivedAmount: number;
};

export type TransactionItemRes = {
  id: string;
  productId?: string;
  productName: string;
  price: number;
  quantity: number;
  subtotal: number;
};

export type TransactionRes = {
  id: string;
  invoiceNumber: string;
  businessId: string;
  createdBy: string;
  creatorName: string;
  totalAmount: number;
  receivedAmount: number;
  changeAmount: number;
  status: string;
  paidAt?: string;
  expiredAt: string;
  createdAt: string;
  items: TransactionItemRes[];
};

export type ListTransactionsRes = MResponse<TransactionRes>;

// --- API FUNCTIONS ---

export const transactionApi = {
  list: async (params?: { page?: number; pageSize?: number }): Promise<ListTransactionsRes> => {
    const response = await apiClient.get("/transactions", { params });
    return response.data;
  },

  get: async (id: string): Promise<GResponse<TransactionRes>> => {
    const response = await apiClient.get(`/transactions/${id}`);
    return response.data;
  },

  create: async (data: CreateTransactionReq): Promise<GResponse<TransactionRes>> => {
    const response = await apiClient.post("/transactions", data);
    return response?.data;
  },

  update: async (id: string, data: UpdateTransactionReq): Promise<GResponse<TransactionRes>> => {
    const response = await apiClient.put(`/transactions/${id}`, data);
    return response.data;
  },

  pay: async (id: string, data: PayTransactionReq): Promise<GResponse<TransactionRes>> => {
    const response = await apiClient.post(`/transactions/${id}/pay`, data);
    return response.data;
  },
};

// --- HOOKS ---

export const LIST_TRANSACTIONS_KEY = "transactions";
export const useTransactions = (params?: { page?: number; pageSize?: number; search?: string }) => {
  return useQuery<ListTransactionsRes>({
    queryKey: buildQueryKey(LIST_TRANSACTIONS_KEY, params),
    queryFn: () => transactionApi.list(params),
  });
};

export const GET_TRANSACTION_KEY = "transaction";
export const useTransaction = (id: string) => {
  return useQuery({
    queryKey: buildQueryKey(GET_TRANSACTION_KEY, { id }),
    queryFn: () => transactionApi.get(id),
    enabled: !!id,
  });
};

export const useCreateTransaction = ({
  onSuccess,
  onError,
}: {
  onSuccess?: (data: GResponse<TransactionRes>) => void;
  onError?: (error: string) => void;
} = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTransactionReq) => transactionApi.create(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        predicate: buildQueryKeyPredicate([{ key: LIST_TRANSACTIONS_KEY }]),
      });
      onSuccess?.(data);
    },
    onError: (error: GErrorResponse) => {
      console.log(error);
      onError?.(error.response?.data?.message || "An error occurred");
    },
  });
};

export const useUpdateTransaction = ({
  onSuccess,
  onError,
}: {
  onSuccess?: (data: GResponse<TransactionRes>) => void;
  onError?: (error: string) => void;
} = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTransactionReq }) =>
      transactionApi.update(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        predicate: buildQueryKeyPredicate([
          { key: LIST_TRANSACTIONS_KEY },
          { key: GET_TRANSACTION_KEY, data: { id: variables.id } },
        ]),
      });
      onSuccess?.(data);
    },
    onError: (error: GErrorResponse) => {
      onError?.(error.response?.data?.message || "An error occurred");
    },
  });
};

export const usePayTransaction = ({
  onSuccess,
  onError,
}: {
  onSuccess?: (data: GResponse<TransactionRes>) => void;
  onError?: (error: string) => void;
} = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: PayTransactionReq }) =>
      transactionApi.pay(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        predicate: buildQueryKeyPredicate([
          { key: LIST_TRANSACTIONS_KEY },
          { key: GET_TRANSACTION_KEY, data: { id: variables.id } },
        ]),
      });
      onSuccess?.(data);
    },
    onError: (error: GErrorResponse) => {
      onError?.(error.response?.data?.message || "An error occurred");
    },
  });
};
