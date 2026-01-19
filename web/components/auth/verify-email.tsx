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
import { useVerifyEmail } from "@/services/api-auth";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ROUTES } from "@/lib/route";
import { Loader2, CheckCircle2, XCircle, X } from "lucide-react";

export function VerifyEmail() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(3);

  const { mutate: verifyEmail, isPending } = useVerifyEmail({
    onSuccess: (data) => {
      console.log("Email verification successful:", data);
      setSuccess(true);
      setError("");
    },
    onError: (errorMessage) => {
      console.error("Email verification error:", errorMessage);
      setError(errorMessage);
      setSuccess(false);
    },
  });

  useEffect(() => {
    if (token) {
      // Automatically verify when token is present
      verifyEmail({ token });
    } else {
      setError("Verification token is missing");
    }
  }, [token]);

  // Countdown and redirect after successful verification
  useEffect(() => {
    if (success) {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            router.push(ROUTES.DASHBOARD);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [success, router]);

  // Loading State
  if (isPending) {
    return (
      <Empty>
        <EmptyMedia>
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </EmptyMedia>
        <EmptyHeader>
          <EmptyTitle>Email Verification</EmptyTitle>
          <EmptyDescription>Please wait while we verify your email...</EmptyDescription>
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
          <EmptyTitle>Email Verified Successfully!</EmptyTitle>
          <EmptyDescription>
            Your email has been verified. Redirecting to dashboard in {countdown} second
            {countdown !== 1 ? "s" : ""}...
          </EmptyDescription>
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
          <EmptyTitle>Verification Failed</EmptyTitle>
          <EmptyDescription className="text-destructive">{error}</EmptyDescription>
        </EmptyHeader>
        <EmptyContent className="flex flex-col gap-2 w-full">
          <Button
            className="h-10 w-full rounded-full"
            onClick={() => router.push(ROUTES.SEND_VERIFICATION)}
          >
            Request New Verification Link
          </Button>
          <Button
            variant="outline"
            className="h-10 w-full rounded-full"
            onClick={() => router.push(ROUTES.LOGIN)}
          >
            Back to Login
          </Button>
        </EmptyContent>
      </Empty>
    );
  }

  return null;
}
