"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useListLoginableEmployees, useLoginEmployee } from "@/services/api-auth";
import { ROUTES } from "@/lib/routes";
import type { LoginableEmployeeRes } from "@/services/api-auth";
import { BusinessCodeInput } from "./business-code-input";
import { EmployeeSelect } from "./employee-select";
import { PinInput } from "./pin-input";
import { Tabs, TabsContent } from "@/components/ui/tabs";

export function LoginEmployee() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [businessCode, setBusinessCode] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<LoginableEmployeeRes | null>(null);
  const [error, setError] = useState("");

  // Login mutation
  const { mutate: loginEmployee, isPending: loggingIn } = useLoginEmployee({
    onSuccess: (data) => {
      console.log("Employee login successful:", data);
      router.push(ROUTES.DASHBOARD);
    },
    onError: (errorMessage) => {
      setError(errorMessage || "An error occurred");
    },
  });

  // Step 1: Submit business code
  const handleBusinessCodeSubmit = (code: string) => {
    setError("");
    setBusinessCode(code);
    setStep(2);
  };

  // Step 2: Select employee
  const handleEmployeeSelect = (employee: LoginableEmployeeRes) => {
    setError("");
    setSelectedEmployee(employee);
    setStep(3);
  };

  // Step 3: Submit PIN
  const handlePinSubmit = (pin: string) => {
    if (!selectedEmployee) return;
    setError("");
    loginEmployee({
      businessCode,
      employeeId: selectedEmployee.id,
      pin,
    });
  };

  // Back button handlers
  const handleBackFromStep2 = () => {
    setStep(1);
    setBusinessCode("");
    setError("");
  };

  const handleBackFromStep3 = () => {
    setStep(2);
    setSelectedEmployee(null);
    setError("");
  };

  return (
    <div className="w-full max-w-2xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}

      <div className="space-y-2 text-center mb-20">
        <h1 className="text-2xl font-semibold">Employee Login</h1>
        {/* Error Message */}
        {error && (
          <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive text-center">
            {error}
          </div>
        )}
      </div>

      <Tabs
        defaultValue="1"
        value={step.toString()}
        onValueChange={(value) => setStep(Number(value) as 1 | 2 | 3)}
      >
        <TabsContent value="1">
          <BusinessCodeInput onSubmit={handleBusinessCodeSubmit} />
        </TabsContent>
        <TabsContent value="2">
          <EmployeeSelect
            businessCode={businessCode}
            onSelect={handleEmployeeSelect}
            onBack={handleBackFromStep2}
          />
        </TabsContent>
        <TabsContent value="3">
          <PinInput
            selectedEmployee={selectedEmployee as LoginableEmployeeRes}
            onSubmit={handlePinSubmit}
            onBack={handleBackFromStep3}
            isLoading={loggingIn}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
