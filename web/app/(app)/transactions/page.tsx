import { TransactionDashboard } from "@/components/transaction/transaction-dashboard";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { ROUTES } from "@/lib/routes";

export default function TransactionsPage() {
  return (
    <div className="container mx-auto py-5 px-4 sm:px-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-top-4  duration-500">
          <h1 className="text-2xl font-semibold leading-none">Transaction History</h1>
          <Breadcrumb
            items={[
              { label: "Dashboard", href: "/dashboard" },
              { label: "Transactions", href: ROUTES.TRANSACTIONS || "/transactions" },
            ]}
          />
        </div>
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-4  duration-500">
        <TransactionDashboard />
      </div>
    </div>
  );
}
