"use client";

import { Button } from "@/components/ui/button";
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
import { z } from "zod/v3";
import { InputOTP } from "@/components/ui/input-otp";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Role } from "@/lib/constant";
import type { LoginableEmployeeRes } from "@/services/api-auth";

const pinSchema = z.object({
  pin: z.string().length(6, "PIN must be exactly 6 digits"),
});

type PinFormData = z.infer<typeof pinSchema>;

interface PinInputProps {
  selectedEmployee: LoginableEmployeeRes;
  onSubmit: (pin: string) => void;
  onBack: () => void;
  isLoading?: boolean;
}

export function PinInput({ selectedEmployee, onSubmit, onBack, isLoading = false }: PinInputProps) {
  const form = useForm<PinFormData>({
    resolver: zodResolver(pinSchema),
    defaultValues: { pin: "" },
  });

  const handleSubmit = (data: PinFormData) => {
    onSubmit(data.pin);
  };

  return (
    <div className="space-y-4">
      <Button variant="ghost" size="sm" onClick={onBack} className="mb-2">
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
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
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
            disabled={isLoading || form.watch("pin").length !== 6}
          >
            {isLoading ? (
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
  );
}
