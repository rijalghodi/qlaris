"use client";

import { Loader2 } from "lucide-react";

import { Breadcrumb } from "@/components/ui/breadcrumb";

import { useGetCurrentUser } from "@/services/api-user";
import { ROUTES } from "@/lib/routes";
import { EditProfileCard } from "@/components/profile/edit-profile-card";
import { EditPasswordCard } from "@/components/profile/edit-password-card";
import { DeleteAccountCard } from "@/components/profile/delete-account-card";

export default function AccountPage() {
  const { data: userResponse, isLoading, error } = useGetCurrentUser();
  const user = userResponse?.data;

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex h-[50vh] items-center justify-center text-destructive">
        Failed to load user profile.
      </div>
    );
  }

  return (
    <div className="container mx-auto py-5 px-4 sm:px-6 max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold leading-none">My Account</h1>
        <Breadcrumb
          items={[
            { label: "Dashboard", href: ROUTES.DASHBOARD },
            { label: "My Account", href: ROUTES.MY_ACCOUNT },
          ]}
        />
      </div>

      <div className="grid gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <EditProfileCard user={user} />
        <EditPasswordCard />
        <DeleteAccountCard userId={user.id} />
      </div>
    </div>
  );
}
