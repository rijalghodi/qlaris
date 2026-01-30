"use client";

import { EditEmployeeForm } from "@/components/employee/edit-employee-form";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/routes";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useEmployee } from "@/services/api-employee";
import { useParams } from "next/navigation";
import { Suspense } from "react";

interface EditEmployeePageProps {
  params: Promise<{
    employeeId: string;
  }>;
}

export default function EditEmployeePage() {
  return (
    <Suspense fallback={null}>
      <EditEmployeeContent />
    </Suspense>
  );
}

function EditEmployeeContent() {
  const { employeeId } = useParams<{ employeeId: string }>();

  const { data, isLoading, isFetching, error } = useEmployee(employeeId);
  const employeeData = data?.data;

  if (isLoading || isFetching) {
    return (
      <div className="container mx-auto py-5 px-4 sm:px-6 max-w-7xl">
        <div className="flex items-center justify-center">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-5 px-4 sm:px-6 max-w-7xl">
        <div className="flex items-center justify-center">Error: {error.message}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-5 px-4 sm:px-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex flex-col gap-3 animate-in fade-in slide-in-from-top-4  duration-500">
          <h1 className="text-2xl font-semibold leading-none">Edit Employee</h1>
          <Breadcrumb
            items={[
              { label: "Dashboard", href: ROUTES.DASHBOARD },
              { label: "Employees", href: ROUTES.EMPLOYEES },
              { label: "Edit Employee", href: ROUTES.EMPLOYEE_EDIT(employeeId) },
            ]}
          />
        </div>

        <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-4  duration-500">
          <Button asChild variant="secondary" className="shrink-0 rounded-full">
            <Link href={ROUTES.EMPLOYEES}>
              <ArrowLeft /> Back to Employees
            </Link>
          </Button>
        </div>
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-4  duration-500">
        <EditEmployeeForm employeeId={employeeId} defaultValues={employeeData} />
      </div>
    </div>
  );
}
