"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  useEditCurrentUser,
  useEditCurrentUserBusiness,
  useGetCurrentUser,
} from "@/services/api-user";
import { Button } from "../ui/button";
import { DialogFooter } from "../ui/dialog";
import { Input } from "../ui/input";
import { ContextDialogProps, dialogs } from "../ui/dialog-manager";
import { SelectInput } from "../ui/select-input";
import { NumberInput } from "../ui/number-input";
import { cn } from "@/lib/utils";

type SetupProfileInnerProps = {
  onSuccess?: () => void;
};

type FormData = {
  name: string;
  businessName: string;
  businessAddress: string;
  employeeSize: string;
  businessCategory: string;
};

const BUSINESS_CATEGORIES = [
  { label: "Cafe", value: "cafe" },
  { label: "Restaurant", value: "restaurant" },
  { label: "Food Stall", value: "food_stall" },
  { label: "Retail", value: "retail" },
  { label: "Grocery", value: "grocery" },
  { label: "Minimarket", value: "minimarket" },
  { label: "Bakery", value: "bakery" },
  { label: "Pharmacy", value: "pharmacy" },
  { label: "Fashion", value: "fashion" },
  { label: "Laundry", value: "laundry" },
  { label: "Barbershop", value: "barbershop" },
  { label: "Printing", value: "printing" },
  { label: "Other", value: "other" },
];

const EMPLOYEE_COUNT = [
  { label: "By Yourself", value: "0" },
  { label: "1-5", value: "5" },
  { label: "6-10", value: "10" },
  { label: "11-25", value: "25" },
  { label: "26+", value: "100" },
];

const STEPS = [
  { id: 1, title: "Your Name", field: "name" as const },
  { id: 2, title: "Business Name", field: "businessName" as const },
  { id: 3, title: "Business Address", field: "businessAddress" as const },
  { id: 4, title: "Employee Count", field: "employeeSize" as const },
  { id: 5, title: "Business Type", field: "businessCategory" as const },
];

const SkipSetupProfileKey = "qlaris.skipSetupProfile";

export function SetupProfileDialog({
  context,
  id,
  innerProps,
}: ContextDialogProps<SetupProfileInnerProps>) {
  const { data: userData, isLoading } = useGetCurrentUser();
  const [currentStep, setCurrentStep] = useState(1);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    trigger,
  } = useForm<FormData>({
    defaultValues: {
      name: userData?.data?.name || "",
      businessName: userData?.data?.business?.name || "",
      businessAddress: userData?.data?.business?.address || "",
      employeeSize: userData?.data?.business?.employeeSize,
      businessCategory: userData?.data?.business?.category,
    },
  });

  const editUser = useEditCurrentUser({
    onSuccess: () => {
      toast.success("Profile updated successfully");
    },
    onError: (error) => {
      toast.error(error);
    },
  });

  const editBusiness = useEditCurrentUserBusiness({
    onSuccess: () => {
      // Mark setup as completed in localStorage
      localStorage.setItem(SkipSetupProfileKey, "true");
      context.closeDialog(id);
      innerProps.onSuccess?.();
    },
    onError: (error) => {
      toast.error(error);
    },
  });

  const onSubmit = (data: FormData) => {
    // Update user name
    editUser.mutate({ name: data.name });
    // Update business info
    editBusiness.mutate({
      name: data.businessName,
      address: data.businessAddress,
      employeeSize: data.employeeSize,
      category: data.businessCategory,
    });
  };

  const handleNext = async () => {
    const currentField = STEPS[currentStep - 1].field;
    const isValid = await trigger(currentField);

    if (isValid) {
      if (currentStep < STEPS.length) {
        setCurrentStep(currentStep + 1);
      } else {
        handleSubmit(onSubmit)();
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    // Mark setup as skipped in localStorage
    localStorage.setItem(SkipSetupProfileKey, "true");
    context.closeDialog(id);
  };

  if (isLoading) {
    return <div className="py-8 text-center text-muted-foreground">Loading your profile...</div>;
  }

  const currentStepData = STEPS[currentStep - 1];
  const progress = (currentStep / STEPS.length) * 100;

  return (
    <div className="space-y-6">
      {/* Progress Bars */}
      <div className="flex gap-2">
        {STEPS.map((step) => (
          <div
            key={step.id}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-all",
              step.id <= currentStep ? "bg-primary" : "bg-muted"
            )}
          />
        ))}
      </div>

      {/* Step Indicator */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Step {currentStep} of {STEPS.length}
        </p>
        <h3 className="text-lg font-semibold mt-1">{currentStepData.title}</h3>
      </div>

      {/* Form Fields */}
      <div className="py-4">
        {currentStep === 1 && (
          <div className="grid gap-2">
            <Input
              id="name"
              placeholder="Enter your name"
              aria-invalid={!!errors.name}
              {...register("name", {
                required: "Name is required",
                maxLength: {
                  value: 255,
                  message: "Name must not exceed 255 characters",
                },
              })}
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>
        )}

        {currentStep === 2 && (
          <div className="grid gap-2">
            <Input
              id="businessName"
              placeholder="Enter your business name"
              aria-invalid={!!errors.businessName}
              {...register("businessName", {
                required: "Business name is required",
                maxLength: {
                  value: 255,
                  message: "Business name must not exceed 255 characters",
                },
              })}
            />
            {errors.businessName && (
              <p className="text-sm text-destructive">{errors.businessName.message}</p>
            )}
          </div>
        )}

        {currentStep === 3 && (
          <div className="grid gap-2">
            <Input
              id="businessAddress"
              placeholder="Enter your business address"
              aria-invalid={!!errors.businessAddress}
              {...register("businessAddress", {
                required: "Business address is required",
              })}
            />
            {errors.businessAddress && (
              <p className="text-sm text-destructive">{errors.businessAddress.message}</p>
            )}
          </div>
        )}

        {currentStep === 4 && (
          <div className="grid gap-2">
            <SelectInput
              placeholder="Select employee count"
              options={EMPLOYEE_COUNT}
              value={watch("employeeSize")}
              onChange={(value) => setValue("employeeSize", value || "0")}
            />
            {errors.employeeSize && (
              <p className="text-sm text-destructive">{errors.employeeSize.message}</p>
            )}
          </div>
        )}

        {currentStep === 5 && (
          <div className="grid gap-2">
            <SelectInput
              placeholder="Select business type"
              options={BUSINESS_CATEGORIES}
              value={watch("businessCategory")}
              onChange={(value) => setValue("businessCategory", value || "")}
            />
            {errors.businessCategory && (
              <p className="text-sm text-destructive">{errors.businessCategory.message}</p>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <DialogFooter className="flex-row justify-between sm:justify-between">
        <Button type="button" variant="ghost" onClick={handleSkip}>
          Skip for now
        </Button>
        <div className="flex gap-2">
          {currentStep > 1 && (
            <Button type="button" variant="outline" onClick={handleBack}>
              Back
            </Button>
          )}
          <Button
            type="button"
            onClick={handleNext}
            disabled={editUser.isPending || editBusiness.isPending}
          >
            {currentStep === STEPS.length
              ? editUser.isPending || editBusiness.isPending
                ? "Saving..."
                : "Finish"
              : "Next"}
          </Button>
        </div>
      </DialogFooter>
    </div>
  );
}

export function SetupProfileDialogTrigger() {
  // const { data: userData } = useGetCurrentUser();

  useEffect(() => {
    // Check if user has skipped setup
    const hasSkipped = localStorage.getItem(SkipSetupProfileKey) === "true";
    console.log(hasSkipped);

    if (hasSkipped) {
      return;
    }

    dialogs.openContextDialog({
      modal: "setupProfile",
      title: "Welcome! Let's set up your profile",
      description: "This will only take a minute",
      size: "lg",
      innerProps: {
        onSuccess: () => {},
      },
    });
  }, []);

  return null;
}
