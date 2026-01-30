import { AddEmployeeForm } from "@/components/employee/add-employee-form";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AddEmployeePage() {
  return (
    <div className="container mx-auto py-5 px-4 sm:px-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-top-4  duration-500">
          <h1 className="text-2xl font-semibold leading-none">Create Employee</h1>
          <Breadcrumb
            items={[
              { label: "Dashboard", href: "/dashboard" },
              { label: "Employees", href: "/employees" },
              { label: "Create Employee", href: "/employees/add" },
            ]}
          />
        </div>

        <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4  duration-500">
          <Button asChild variant="secondary" className="shrink-0 rounded-full">
            <Link href={ROUTES.EMPLOYEES}>
              <ArrowLeft className="size-4" /> Back to Employees
            </Link>
          </Button>
        </div>
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-4  duration-500">
        <AddEmployeeForm />
      </div>
    </div>
  );
}
