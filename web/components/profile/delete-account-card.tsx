"use client";

import { Loader2, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

import { useDeleteUser } from "@/services/api-user";
import { useLogout } from "@/services/api-auth";
import { useConfirmation } from "@/components/ui/confirmation-dialog";

export function DeleteAccountCard({ userId }: { userId: string }) {
  const { mutateAsync: logout } = useLogout({});
  const { confirm } = useConfirmation();

  const { mutate: deleteUser, isPending } = useDeleteUser({
    onSuccess: async () => {
      await logout();
    },
  });

  const handleDelete = () => {
    confirm({
      title: "Delete Account",
      message:
        "Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently lost.",
      variant: "destructive",
      confirmLabel: "Delete Account",
      onConfirm: () => {
        deleteUser(userId);
      },
    });
  };

  if (!userId) return null;

  return (
    <Card className="border-destructive/50">
      <CardHeader>
        <CardTitle className="text-destructive">Delete Account</CardTitle>
        <CardDescription>
          This will delete your account permanently. You can no longer access data related to your
          account.
        </CardDescription>
      </CardHeader>
      <CardFooter className="justify-end border-t bg-destructive/5 py-4">
        <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <Trash2 className="mr-2 h-4 w-4" />
          Delete Account
        </Button>
      </CardFooter>
    </Card>
  );
}
