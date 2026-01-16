"use client";

import * as React from "react";

import { QueryProvider } from "./query-provider";
import { ConfirmationProvider } from "./ui/confirmation-dialog";
import { Toaster } from "./ui/sonner";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <ConfirmationProvider>
        {children}
        <Toaster />
      </ConfirmationProvider>
      {/* <NextThemesProvider
        attribute="class"
        defaultTheme="light"
        themes={["light", "dark"]}
        enableSystem={false}
        disableTransitionOnChange={false}
        enableColorScheme
      ></NextThemesProvider> */}
    </QueryProvider>
  );
}
