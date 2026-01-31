"use client";

import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v3";
import { PinInput } from "@/components/ui/pin-input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Role } from "@/lib/constant";
import type { LoginableEmployeeRes } from "@/services/api-auth";
import { useEffect } from "react";

const pinSchema = z.object({
  pin: z.string().length(6, "PIN must be exactly 6 digits"),
});

type PinFormData = z.infer<typeof pinSchema>;

interface Props {
  selectedEmployee: LoginableEmployeeRes;
  onSubmit: (pin: string) => void;
  onBack: () => void;
  isLoading?: boolean;
}

export function PinInputSection({ selectedEmployee, onSubmit, onBack, isLoading = false }: Props) {
  const form = useForm<PinFormData>({
    resolver: zodResolver(pinSchema),
    defaultValues: { pin: "" },
  });

  useEffect(() => {
    if (!selectedEmployee) {
      onBack();
    }
  }, [selectedEmployee, onBack]);

  if (!selectedEmployee) {
    return null;
  }

  return (
    <div className="space-y-6 max-w-md animate-in fade-in slide-in-from-bottom-4 duration-300 ease-out">
      <div className="flex gap-0.5 items-center">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
        </Button>
        <p className="text-lg font-semibold">Enter PIN</p>
      </div>

      <div className="flex items-start gap-3 p-3 border rounded-lg bg-muted/50">
        <Avatar className="h-12 w-12">
          <AvatarImage src={selectedEmployee.image?.url} alt={selectedEmployee.name} />
          <AvatarFallback>{selectedEmployee.name.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="space-y-1">
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
        <FormField
          control={form.control}
          name="pin"
          render={({ field }) => (
            <FormItem className="py-3 flex justify-start">
              <FormControl>
                <PinInput
                  length={6}
                  value={field.value}
                  onChange={field.onChange}
                  disabled={isLoading}
                  onComplete={() => onSubmit(field.value)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex gap-2 w-full justify-center">
          <Button
            type="button"
            className="h-10 rounded-full w-32"
            disabled={isLoading || form.watch("pin").length !== 6}
            onClick={() => onSubmit(form.watch("pin"))}
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
        </div>
      </Form>
    </div>
  );
}
