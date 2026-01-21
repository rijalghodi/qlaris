"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useEditCurrentUser, useGetCurrentUser } from "@/services/api-user";
import { Button } from "../ui/button";
import { DialogFooter } from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { ContextDialogProps, dialogs } from "../ui/dialog-manager";

type SetupMeInnerProps = {
  onSuccess?: () => void;
};

type FormData = {
  name: string;
  businessName: string;
  businessAddress: string;
};

export function SetupMeDialog({ context, id, innerProps }: ContextDialogProps<SetupMeInnerProps>) {
  const { data: userData, isLoading } = useGetCurrentUser();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      name: userData?.data?.name || "",
      businessName: userData?.data?.businessName || "",
      businessAddress: userData?.data?.businessAddress || "",
    },
  });

  const editUser = useEditCurrentUser({
    onSuccess: () => {
      toast.success("Profile updated successfully");
      context.closeDialog(id);
      innerProps.onSuccess?.();
    },
    onError: (error) => {
      toast.error(error);
    },
  });

  const onSubmit = (data: FormData) => {
    editUser.mutate(data);
  };

  if (isLoading) {
    return <div className="py-8 text-center text-muted-foreground">Loading your profile...</div>;
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor="name">Name</Label>
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

        <div className="grid gap-2">
          <Label htmlFor="businessName">Business Name</Label>
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

        <div className="grid gap-2">
          <Label htmlFor="businessAddress">Business Address</Label>
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
      </div>

      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={() => context.closeDialog(id)}
          disabled={editUser.isPending}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={editUser.isPending}>
          {editUser.isPending ? "Saving..." : "Save Changes"}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function SetupMeTrigger() {
  const { data: userData, isLoading, isFetching } = useGetCurrentUser();

  useEffect(() => {
    if (!userData?.data?.isDataCompleted && !isLoading && !isFetching) {
      dialogs.openContextDialog({
        modal: "setupMe",
        title: "Setup Your Profile",
        description: "Complete your profile to get started.",
        size: "sm",
        innerProps: {
          onSuccess: () => {},
        },
      });
    }
  }, [userData, isLoading, isFetching]);

  return null;
}
