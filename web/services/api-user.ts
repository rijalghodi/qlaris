import { useMutation, useQuery } from "@tanstack/react-query";

import { setAuthCookie } from "@/lib/auth-cookie";
import { removeAuthCookie } from "@/lib/auth-cookie";
import { ROUTES } from "@/lib/routes";
import { Role } from "@/lib/constant";

import { apiClient } from "./api-client";
import type { GErrorResponse, GResponse } from "./type";

// --- GET CURRENT USER ---

export type UserRes = {
  id?: string;
  name?: string;
  email?: string;
  role?: Role;
  isVerified?: boolean;
  isDataCompleted?: boolean;
  googleImage?: string;
  businessName?: string;
  businessAddress?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type GetCurrentUserRes = GResponse<UserRes>;

// Main Function

export const apiUser = {
  getCurrentUser: async (): Promise<GetCurrentUserRes> => {
    const response = await apiClient.get("/users/current");
    return response.data;
  },
};

// --- HOOKS ---

export const useGetCurrentUser = () => {
  return useQuery({
    queryKey: ["current-user"],
    queryFn: () => apiUser.getCurrentUser(),
  });
};
