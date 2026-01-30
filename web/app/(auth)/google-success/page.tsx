"use client";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ROUTES } from "@/lib/routes";
import { Loader2, CheckCircle2, X } from "lucide-react";
import { setAuthCookie } from "@/lib/auth-cookie";
import { Spinner } from "@/components/ui/spinner";

export default function GoogleSuccessPage() {
  return (
    <Suspense fallback={null}>
      <GoogleSuccess />
    </Suspense>
  );
}

export function GoogleSuccess() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const accessToken = searchParams.get("accessToken");
  const refreshToken = searchParams.get("refreshToken");

  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);

  useEffect(() => {
    try {
      setSuccess(true);
      router.push(ROUTES.DASHBOARD);
    } catch (err) {
      setError("Failed to set authentication cookies");
      console.error(err);
    }
  }, [accessToken, refreshToken, router]);

  // Loading State (initial state)
  if (!success && !error) {
    return (
      <Empty>
        <EmptyMedia>
          <Spinner className="h-12 w-12 animate-spin text-primary" />
        </EmptyMedia>
        <EmptyHeader>
          <EmptyTitle>Completing Sign In</EmptyTitle>
          <EmptyDescription>Please wait while we complete your Google sign in...</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  // Success State
  if (success) {
    return (
      <Empty>
        <EmptyMedia>
          <CheckCircle2 className="h-12 w-12 text-primary" />
        </EmptyMedia>
        <EmptyHeader>
          <EmptyTitle>Successfully Signed In!</EmptyTitle>
          <EmptyDescription>Welcome! Redirecting to dashboard...</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button
            className="h-10 w-full rounded-full"
            onClick={() => router.push(ROUTES.DASHBOARD)}
          >
            Go to Dashboard Now
          </Button>
        </EmptyContent>
      </Empty>
    );
  }

  // Error State
  if (error) {
    return (
      <Empty>
        <EmptyMedia variant="icon" className="bg-destructive/10">
          <X className="h-12 w-12 text-destructive" />
        </EmptyMedia>
        <EmptyHeader>
          <EmptyTitle>Sign In Failed</EmptyTitle>
          <EmptyDescription className="text-destructive">{error}</EmptyDescription>
        </EmptyHeader>
        <EmptyContent className="flex flex-col gap-2 w-full">
          <Button className="h-10 w-full rounded-full" onClick={() => router.push(ROUTES.LOGIN)}>
            Back to Login
          </Button>
        </EmptyContent>
      </Empty>
    );
  }

  return null;
}
