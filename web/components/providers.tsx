"use client";

import * as React from "react";

import { QueryProvider } from "./query-provider";
import { ConfirmationProvider } from "./ui/confirmation-dialog";
import { BarcodeScanProvider } from "./ui/barcode-scan-dialog";
import { Toaster } from "./ui/sonner";
import { DialogManagerProvider } from "./ui/dialog-manager";
import { AddCategoryDialog } from "./category/add-category-dialog";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <DialogManagerProvider
        dialogs={{
          addCategory: AddCategoryDialog,
        }}
      >
        <ConfirmationProvider>
          <BarcodeScanProvider>
            {children}
            <Toaster />
          </BarcodeScanProvider>
        </ConfirmationProvider>
      </DialogManagerProvider>
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
