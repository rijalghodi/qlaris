import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiClient } from "./api-client";
import type { GErrorResponse, GResponse, MResponse } from "./type";
import { FileRes } from "./api-user";
import { buildQueryKey, buildQueryKeyPredicate } from "./util";
import { Role } from "@/lib/constant";

// --- TYPES ---

export type BusinessRes = {
  id: string;
  name: string;
  address?: string;
};

export type Employee = {
  id: string;
  name: string;
  role: Role;
  business?: BusinessRes;
  image?: FileRes;
  phone?: string;
  email?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateEmployeeReq = {
  name: string;
  pin: string;
  role: Role;
  image?: string;
  phone?: string;
  email?: string;
  isActive?: boolean;
};

export type UpdateEmployeeReq = {
  name?: string;
  role?: Role;
  image?: string;
  pin?: string;
  phone?: string;
  email?: string;
  isActive?: boolean;
};

export type EmployeeRes = GResponse<Employee>;
export type ListEmployeesRes = MResponse<Employee>;

// --- API FUNCTIONS ---

export const employeeApi = {
  list: async (params?: { page?: number; pageSize?: number }): Promise<ListEmployeesRes> => {
    const response = await apiClient.get("/employees", { params });
    return response.data;
  },

  get: async (id: string): Promise<EmployeeRes> => {
    const response = await apiClient.get(`/employees/${id}`);
    return response.data;
  },

  create: async (data: CreateEmployeeReq): Promise<EmployeeRes> => {
    const response = await apiClient.post("/employees", data);
    return response.data;
  },

  update: async (id: string, data: UpdateEmployeeReq): Promise<EmployeeRes> => {
    const response = await apiClient.put(`/employees/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<GResponse<null>> => {
    const response = await apiClient.delete(`/employees/${id}`);
    return response.data;
  },
};

// --- HOOKS ---

export const LIST_EMPLOYEES_KEY = "employees";
export const useEmployees = (params?: { page?: number; pageSize?: number }) => {
  return useQuery<ListEmployeesRes>({
    queryKey: buildQueryKey(LIST_EMPLOYEES_KEY, params),
    queryFn: () => employeeApi.list(params),
  });
};

export const GET_EMPLOYEE_KEY = "employee";
export const useEmployee = (id: string) => {
  return useQuery({
    queryKey: buildQueryKey(GET_EMPLOYEE_KEY, { id }),
    queryFn: () => employeeApi.get(id),
    enabled: !!id,
  });
};

export const useCreateEmployee = ({
  onSuccess,
  onError,
}: {
  onSuccess?: (data: EmployeeRes) => void;
  onError?: (error: string) => void;
} = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateEmployeeReq) => employeeApi.create(data),
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        predicate: buildQueryKeyPredicate([{ key: LIST_EMPLOYEES_KEY }]),
      });
      onSuccess?.(data);
    },
    onError: (error: GErrorResponse) => {
      onError?.(error.response?.data?.message || "An error occurred");
    },
  });
};

export const useUpdateEmployee = ({
  onSuccess,
  onError,
}: {
  onSuccess?: (data: EmployeeRes) => void;
  onError?: (error: string) => void;
} = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEmployeeReq }) =>
      employeeApi.update(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        predicate: buildQueryKeyPredicate([
          { key: LIST_EMPLOYEES_KEY },
          { key: GET_EMPLOYEE_KEY, data: { id: variables.id } },
        ]),
      });
      onSuccess?.(data);
    },
    onError: (error: GErrorResponse) => {
      onError?.(error.response?.data?.message || "An error occurred");
    },
  });
};

export const useDeleteEmployee = ({
  onSuccess,
  onError,
}: {
  onSuccess?: () => void;
  onError?: (error: string) => void;
} = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => employeeApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        predicate: buildQueryKeyPredicate([{ key: LIST_EMPLOYEES_KEY }]),
      });
      onSuccess?.();
    },
    onError: (error: GErrorResponse) => {
      onError?.(error.response?.data?.message || "An error occurred");
    },
  });
};
