"use client";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2, UsersRound } from "lucide-react";
import { Role } from "@/lib/constant";
import type { LoginableEmployeeRes } from "@/services/api-auth";
import { EmptyState } from "@/components/ui/empty";
import { useListLoginableEmployees } from "@/services/api-auth";

interface EmployeeSelectProps {
  businessCode: string;
  onSelect: (employee: LoginableEmployeeRes) => void;
  onBack: () => void;
}

export function EmployeeSelect({ businessCode, onSelect, onBack }: EmployeeSelectProps) {
  // Fetch employees when business code is set
  const { data: employeesResponse, isLoading } = useListLoginableEmployees(businessCode);
  const employees = employeesResponse?.data || [];

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 justify-center items-center h-[400px] bg-card w-full rounded-lg">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="text-muted-foreground">Loading employees</p>
        <Button variant="ghost" size="sm" onClick={onBack} className="mb-2">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </div>
    );
  }

  if (employees.length === 0) {
    return (
      <EmptyState
        icon={<UsersRound />}
        title="No employees found"
        description="No employees found for this business code"
        action={
          <Button variant="ghost" size="sm" onClick={onBack} className="mb-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        }
        className="bg-card h-[400px]"
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3">
        {employees.map((employee) => (
          <button
            key={employee.id}
            onClick={() => onSelect(employee)}
            className="flex items-center gap-4 p-4 border rounded-lg hover:bg-accent transition-colors text-left"
          >
            <Avatar className="h-12 w-12">
              <AvatarImage src={employee.image?.url} alt={employee.name} />
              <AvatarFallback>{employee.name.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-medium">{employee.name}</p>
              <Badge
                variant={employee.role === Role.MANAGER ? "default" : "secondary"}
                className="mt-1"
              >
                {employee.role === Role.MANAGER ? "Manager" : "Cashier"}
              </Badge>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
