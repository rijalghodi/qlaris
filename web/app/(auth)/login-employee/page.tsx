"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useListLoginableEmployees, useLoginEmployee } from "@/services/api-auth";
import { ROUTES } from "@/lib/routes";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Role } from "@/lib/constant";
import type { LoginableEmployeeRes } from "@/services/api-auth";

// Step 1: Business Code Schema
const businessCodeSchema = z.object({
  businessCode: z.string().min(1, "Business code is required"),
});

type BusinessCodeFormData = z.infer<typeof businessCodeSchema>;

// Step 3: PIN Schema
const pinSchema = z.object({
  pin: z.string().length(6, "PIN must be exactly 6 digits"),
});

type PinFormData = z.infer<typeof pinSchema>;

export default function LoginEmployeePage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [businessCode, setBusinessCode] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<LoginableEmployeeRes | null>(null);
  const [error, setError] = useState("");

  // Form for business code
  const businessCodeForm = useForm<BusinessCodeFormData>({
    resolver: zodResolver(businessCodeSchema),
    defaultValues: { businessCode: "" },
  });

  // Form for PIN
  const pinForm = useForm<PinFormData>({
    resolver: zodResolver(pinSchema),
    defaultValues: { pin: "" },
  });

  // Fetch employees when business code is set
  const { data: employeesResponse, isLoading: loadingEmployees } =
    useListLoginableEmployees(businessCode);
  const employees = employeesResponse?.data || [];

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
  const onBusinessCodeSubmit = (data: BusinessCodeFormData) => {
    setError("");
    setBusinessCode(data.businessCode);
    setStep(2);
  };

  // Step 2: Select employee
  const onEmployeeSelect = (employee: LoginableEmployeeRes) => {
    setError("");
    setSelectedEmployee(employee);
    setStep(3);
  };

  // Step 3: Submit PIN
  const onPinSubmit = (data: PinFormData) => {
    if (!selectedEmployee) return;
    setError("");
    loginEmployee({
      businessCode,
      employeeId: selectedEmployee.id,
      pin: data.pin,
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
    pinForm.reset();
    setError("");
  };

  return (
    <div className="w-full max-w-md space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold">Employee Login</h1>
        <p className="text-sm text-muted-foreground">
          {step === 1 && "Enter your business code to continue"}
          {step === 2 && "Select your profile"}
          {step === 3 && "Enter your PIN"}
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive text-center">
          {error}
        </div>
      )}

      {/* Step 1: Business Code Input */}
      {step === 1 && (
        <div className="space-y-4 animate-in slide-in-from-right duration-300">
          <Form {...businessCodeForm}>
            <form
              onSubmit={businessCodeForm.handleSubmit(onBusinessCodeSubmit)}
              className="space-y-4"
            >
              <FormField
                control={businessCodeForm.control}
                name="businessCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Code</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter business code" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="h-10 w-full rounded-full">
                Continue
              </Button>
            </form>
          </Form>

          <p className="text-center text-sm text-muted-foreground">
            Not an employee?{" "}
            <Link
              href={ROUTES.LOGIN}
              className="hover:underline underline-offset-4 font-medium text-foreground"
            >
              Login as Owner
            </Link>
          </p>
        </div>
      )}

      {/* Step 2: Employee Selection */}
      {step === 2 && (
        <div className="space-y-4 animate-in slide-in-from-right duration-300">
          <Button variant="ghost" size="sm" onClick={handleBackFromStep2} className="mb-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          {loadingEmployees ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : employees.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No employees found for this business code
            </div>
          ) : (
            <div className="grid gap-3">
              {employees.map((employee) => (
                <button
                  key={employee.id}
                  onClick={() => onEmployeeSelect(employee)}
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
          )}
        </div>
      )}

      {/* Step 3: PIN Input */}
      {step === 3 && selectedEmployee && (
        <div className="space-y-4 animate-in slide-in-from-right duration-300">
          <Button variant="ghost" size="sm" onClick={handleBackFromStep3} className="mb-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>

          {/* Selected Employee Info */}
          <div className="flex items-center gap-4 p-4 border rounded-lg bg-muted/50">
            <Avatar className="h-12 w-12">
              <AvatarImage src={selectedEmployee.image?.url} alt={selectedEmployee.name} />
              <AvatarFallback>{selectedEmployee.name.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{selectedEmployee.name}</p>
              <Badge
                variant={selectedEmployee.role === Role.MANAGER ? "default" : "secondary"}
                className="mt-1"
              >
                {selectedEmployee.role === Role.MANAGER ? "Manager" : "Cashier"}
              </Badge>
            </div>
          </div>

          {/* PIN Form */}
          <Form {...pinForm}>
            <form onSubmit={pinForm.handleSubmit(onPinSubmit)} className="space-y-4">
              <FormField
                control={pinForm.control}
                name="pin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>PIN</FormLabel>
                    <FormControl>
                      <div className="flex justify-center">
                        <InputOTP {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="h-10 w-full rounded-full"
                disabled={loggingIn || pinForm.watch("pin").length !== 6}
              >
                {loggingIn ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>
            </form>
          </Form>
        </div>
      )}
    </div>
  );
}
