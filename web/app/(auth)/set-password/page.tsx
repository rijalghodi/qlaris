import { SetPasswordForm } from "@/components/auth/set-password-form";
import { Suspense } from "react";

export default function SetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <SetPasswordForm />
    </Suspense>
  );
}
