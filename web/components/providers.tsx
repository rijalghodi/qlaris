"use client";

import * as React from "react";

import { QueryProvider } from "./query-provider";
import { ConfirmationProvider } from "./ui/confirmation-dialog";
import { BarcodeScanProvider } from "./ui/barcode-scan-dialog";
import { Toaster } from "./ui/sonner";
import { DialogManagerProvider } from "./ui/dialog-manager";
import { AddCategoryDialog } from "./category/add-category-dialog";
import { SetupMeDialog } from "./profile/setup-profile-dialog";
import { ConfirmDialog } from "./ui/dialog-confirm";
import { EditCategoryDialog } from "./category/edit-category-dialog";
import { SortCategoryDialog } from "./category/sort-category-dialog";
import { ThemeProvider as NextThemesProvider } from "next-themes";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      themes={["light", "dark"]}
      enableSystem={false}
      disableTransitionOnChange={false}
      enableColorScheme
    >
      <QueryProvider>
        <DialogManagerProvider
          dialogs={{
            addCategory: AddCategoryDialog,
            editCategory: EditCategoryDialog,
            sortCategory: SortCategoryDialog,
            setupMe: SetupMeDialog,
          }}
        >
          <ConfirmationProvider>
            <BarcodeScanProvider>
              {children}
              <Toaster />
            </BarcodeScanProvider>
          </ConfirmationProvider>
        </DialogManagerProvider>
      </QueryProvider>
    </NextThemesProvider>
  );
}
