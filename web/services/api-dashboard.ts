import { useQuery } from "@tanstack/react-query";

import { apiClient } from "./api-client";
import type { GResponse } from "./type";
import { buildQueryKey } from "./util";
import type { TransactionRes } from "./api-transaction";
import type { Product } from "./api-product";

// --- TYPES ---

export type Comparison = {
  salesPercent: number;
  transactionsPercent: number;
  profitPercent: number;
};

export type DayStats = {
  sales: number;
  transactions: number;
  profit: number;
  compareYesterday?: Comparison;
};

export type WeekStats = {
  sales: number;
  transactions: number;
  profit: number;
  compareLastWeek?: Comparison;
};

export type TopProduct = Product & { quantitySold: number };
export type DashboardSummary = {
  today: DayStats;
  thisWeek: WeekStats;
  lastTransactions: TransactionRes[];
  topProducts: TopProduct[];
};

export type DashboardSummaryRes = GResponse<DashboardSummary>;

// --- API FUNCTIONS ---

export const dashboardApi = {
  getSummary: async (): Promise<DashboardSummaryRes> => {
    const response = await apiClient.get("/dashboard/summary");
    return response.data;
  },
};

// --- HOOKS ---

export const DASHBOARD_SUMMARY_KEY = "dashboard-summary";
export const useDashboardSummary = () => {
  return useQuery<DashboardSummaryRes>({
    queryKey: buildQueryKey(DASHBOARD_SUMMARY_KEY),
    queryFn: () => dashboardApi.getSummary(),
  });
};
