"use client";

import React from "react";
import { useDashboardSummary } from "@/services/api-dashboard";
import { DatumCard } from "./datum-card";
import { LastTransactionsCard } from "./last-transactions-card";
import { TopProductsCard } from "./top-products-card";
import { formatCurrency } from "@/lib/number";
import { DollarSign, Receipt, TrendingUp, Loader2 } from "lucide-react";
// import { Alert, AlertDescription } from "../ui/alert";
import { AlertCircle } from "lucide-react";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "../ui/empty";
import { cn } from "@/lib/utils";
import { buttonVariants } from "../ui/button";

export function Dashboard() {
  const { data, isLoading, error } = useDashboardSummary();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia>
            <AlertCircle className="h-4 w-4" />
          </EmptyMedia>
          <EmptyTitle>Failed to load dashboard data.</EmptyTitle>
          <EmptyDescription>Please try again later.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  const summary = data?.data;
  if (!summary) return null;
  const compareYesterday = summary.today.compareYesterday;
  const compareLastWeek = summary.thisWeek.compareLastWeek;

  return (
    <div className="space-y-6">
      {/*  Stats */}
      <div>
        <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4 justify-start">
          <DatumCard
            title="Today Sales"
            value={formatCurrency(summary.today.sales)}
            comparison={
              compareYesterday
                ? {
                    valuePercent: `${Math.abs(compareYesterday.salesPercent).toFixed(1)}%`,
                    isUp: compareYesterday.salesPercent >= 0,
                    label: "vs yesterday",
                  }
                : undefined
            }
            decoration={
              <div className="rounded-full text-primary bg-primary/20 size-12 flex items-center justify-center">
                <DollarSign className="size-5" />
              </div>
            }
          />
          <DatumCard
            title="Today Profit"
            value={formatCurrency(summary.today.profit)}
            comparison={
              summary.today.compareYesterday
                ? {
                    valuePercent: `${Math.abs(summary.today.compareYesterday.profitPercent).toFixed(1)}%`,
                    isUp: summary.today.compareYesterday.profitPercent >= 0,
                    label: "vs yesterday",
                  }
                : undefined
            }
            decoration={
              <div className="rounded-full text-primary-complement bg-primary-complement/20 size-12 flex items-center justify-center">
                <TrendingUp className="size-5" />
              </div>
            }
          />
          <DatumCard
            title="This Week Sales"
            value={formatCurrency(summary.thisWeek.sales)}
            comparison={
              compareLastWeek
                ? {
                    valuePercent: `${Math.abs(compareLastWeek.salesPercent).toFixed(1)}%`,
                    isUp: compareLastWeek.salesPercent >= 0,
                    label: "vs last week",
                  }
                : undefined
            }
            decoration={<DollarSign className="size-8 text-muted-foreground" />}
          />
          <DatumCard
            title="This Week Profit"
            value={formatCurrency(summary.thisWeek.profit)}
            comparison={
              compareLastWeek
                ? {
                    valuePercent: `${Math.abs(compareLastWeek.profitPercent).toFixed(1)}%`,
                    isUp: compareLastWeek.profitPercent >= 0,
                    label: "vs last week",
                  }
                : undefined
            }
            decoration={<TrendingUp className="size-8 text-muted-foreground" />}
          />
        </div>
      </div>

      {/* Latest Transactions and Top Products */}
      <div className="grid gap-6 lg:grid-cols-2">
        <LastTransactionsCard transactions={summary.lastTransactions} />
        <TopProductsCard products={summary.topProducts} />
      </div>
    </div>
  );
}
