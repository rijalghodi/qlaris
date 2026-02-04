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
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ROUTES } from "@/lib/routes";
import { CheckCircle2, X } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { setAuthCookie } from "@/lib/auth-cookie";

export function GoogleSuccess() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);

  useEffect(() => {
    const accessToken = searchParams.get("accessToken");
    const accessTokenExpiresAt = searchParams.get("accessTokenExpiresAt");
    const refreshToken = searchParams.get("refreshToken");
    const refreshTokenExpiresAt = searchParams.get("refreshTokenExpiresAt");

    if (accessToken && accessTokenExpiresAt && refreshToken && refreshTokenExpiresAt) {
      try {
        setAuthCookie({
          accessToken,
          accessTokenExpires: accessTokenExpiresAt,
          refreshToken,
          refreshTokenExpires: refreshTokenExpiresAt,
        });
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setSuccess(true);
        router.push(ROUTES.DASHBOARD);
      } catch (err) {
        console.error(err);
        setError("Failed to set authentication cookies");
      }
    } else {
      // If params are missing, it's an error.
      // Use setTimeout to avoid synchronous state update warning during effect, if any.
      const timer = setTimeout(() => {
        setError("Missing token parameters");
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [router, searchParams]);

  // Loading State (initial state)
  if (!success && !error) {
    return (
      <Empty className="animate-in fade-in slide-in-from-bottom-4 duration-500">
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
