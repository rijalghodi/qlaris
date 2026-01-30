"use client";

import { Pencil, Trash2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import type { ColumnDef } from "@/components/ui/data-table";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import type { Employee } from "@/services/api-employee";
import { Badge } from "@/components/ui/badge";
import { EmployeeRole } from "@/lib/constant";

interface EmployeeTableProps {
  employees: Employee[];
  isLoading?: boolean;
  onDelete?: (employee: Employee) => void;
  onEdit?: (employee: Employee) => void;
}

export function EmployeeTable({ employees, isLoading, onDelete, onEdit }: EmployeeTableProps) {
  const columns: ColumnDef<Employee>[] = [
    {
      id: "employee",
      header: () => <div className="text-sm font-semibold">Employee</div>,
      size: 300,
      cell: ({ row }) => {
        const employee = row.original;
        return (
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-md bg-muted flex items-center justify-center shrink-0">
              {employee.image ? (
                <Avatar size="default" className="rounded-md">
                  <AvatarImage src={employee.image.url} alt={employee.name} />
                </Avatar>
              ) : (
                <User className="size-4" />
              )}
            </div>
            <span className="text-sm font-normal">{employee.name}</span>
          </div>
        );
      },
    },
    {
      id: "role",
      header: () => <div className="text-sm font-semibold">Role</div>,
      cell: ({ row }) => {
        const role = row.original.role;
        return (
          <Badge variant={role === EmployeeRole.MANAGER ? "default" : "secondary"}>
            {role === EmployeeRole.MANAGER ? "Manager" : "Cashier"}
          </Badge>
        );
      },
    },
    {
      id: "email",
      header: () => <div className="text-sm font-semibold">Email</div>,
      cell: ({ row }) => {
        const email = row.original.email;
        return <div className="text-sm font-normal">{email || "-"}</div>;
      },
    },
    {
      id: "phone",
      header: () => <div className="text-sm font-semibold">Phone</div>,
      cell: ({ row }) => {
        const phone = row.original.phone;
        return <div className="text-sm font-normal">{phone || "-"}</div>;
      },
    },
    {
      id: "status",
      header: () => <div className="text-sm font-semibold">Status</div>,
      cell: ({ row }) => {
        const isActive = row.original.isActive;
        return (
          <Badge variant={isActive ? "default" : "secondary"}>
            {isActive ? "Active" : "Inactive"}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => {
        const employee = row.original;
        return (
          <div className="flex items-center gap-1 justify-end">
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground"
              onClick={(e) => {
                e.stopPropagation();
                onEdit?.(employee);
              }}
              title="Edit"
            >
              <Pencil className="size-4" />
            </Button>
            <Button
              variant="ghost-destructive"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                onDelete?.(employee);
              }}
              title="Delete"
            >
              <Trash2 className="size-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={employees}
      loading={isLoading}
      emptyMessage="No employees found"
      emptyDescription="Get started by adding your first employee"
      onRowClick={(row) => onEdit?.(row)}
    />
  );
}
