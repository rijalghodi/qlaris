import { TransactionDashboard } from "@/components/transaction/transaction-dashboard";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { ROUTES } from "@/lib/routes";

export default function TransactionsPage() {
  return (
    <div className="container mx-auto py-5 px-4 sm:px-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-3">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold leading-none">Transactions</h1>
          <Breadcrumb
            items={[
              { label: "Dashboard", href: "/dashboard" },
              { label: "Transactions", href: ROUTES.TRANSACTIONS || "/transactions" },
            ]}
          />
        </div>
      </div>

      <TransactionDashboard />
    </div>
  );
}
