import { EmployeeDashboard } from "@/components/employee/employee-dashboard";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";

export default function EmployeesPage() {
  return (
    <div className="container mx-auto py-5 px-4 sm:px-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-4 animate-in fade-in slide-in-from-top-4  duration-500">
        <div className="flex flex-col gap-3">
          <h1 className="text-2xl font-semibold leading-none">Employees</h1>
          <Breadcrumb
            items={[
              { label: "Dashboard", href: "/dashboard" },
              { label: "Employees", href: "/employees" },
            ]}
          />
        </div>

        {/* Actions */}

        <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4  duration-500">
          <Button asChild variant="default" className="rounded-full">
            <Link href={`${ROUTES.EMPLOYEES}/add`}>
              <Plus />
              Add Employee
            </Link>
          </Button>
        </div>
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-4  duration-500">
        <EmployeeDashboard />
      </div>
    </div>
  );
}
