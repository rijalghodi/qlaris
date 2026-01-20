"use client";

import React, { createContext, useContext, useState } from "react";
import { ScanBarcode, X } from "lucide-react";
import { Button } from "./button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./dialog";
import { BarcodeScan } from "./barcode-scan";
import { cn } from "@/lib/utils";

// Context types
type BarcodeScanContextType = {
  isOpen: boolean;
  openScanner: (callback: (value: string) => void) => void;
  closeScanner: () => void;
};

// Create context
const BarcodeScanContext = createContext<BarcodeScanContextType | undefined>(undefined);

// Provider component
export function BarcodeScanProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [callback, setCallback] = useState<((value: string) => void) | undefined>();
  const [scannedValue, setScannedValue] = useState<string>("");

  const openScanner = (onScan: (value: string) => void) => {
    setCallback(() => onScan);
    setIsOpen(true);
    setScannedValue("");
  };

  const closeScanner = () => {
    setIsOpen(false);
    setCallback(undefined);
    setScannedValue("");
  };

  const handleSuccess = (value: string) => {
    setScannedValue(value);
    callback?.(value);
    // Close dialog after successful scan
    setTimeout(() => {
      closeScanner();
    }, 500);
  };

  return (
    <BarcodeScanContext.Provider value={{ isOpen, openScanner, closeScanner }}>
      {children}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-full max-h-full w-screen h-screen p-0">
          <DialogHeader className="p-4">
            <DialogTitle className="text-lg text-center font-semibold">
              <ScanBarcode className="size-5 text-primary inline mr-2" />
              Scan Barcode
            </DialogTitle>
          </DialogHeader>

          <BarcodeScan onSuccess={handleSuccess} />
        </DialogContent>
      </Dialog>
    </BarcodeScanContext.Provider>
  );
}

// Hook to use the barcode scanner
export function useBarcodeScan() {
  const context = useContext(BarcodeScanContext);
  if (!context) {
    throw new Error("useBarcodeScan must be used within BarcodeScanProvider");
  }
  return context;
}

type Props = {
  value?: string;
  onChange?: (value?: string) => void;
  className?: string;
  children?: (props: { value?: string; open?: () => void }) => React.ReactNode;
};

export function BarcodeDialogInput({ value, onChange, className, children }: Props) {
  const { openScanner } = useBarcodeScan();

  const open = () => {
    openScanner?.((scannedValue) => {
      onChange?.(scannedValue);
    });
  };

  if (children) {
    return children({ value, open });
  }

  return (
    <Button
      type="button"
      variant="secondary"
      onClick={open}
      className={cn(
        "w-full h-full min-h-[100px] rounded-xl bg-input hover:bg-primary/5 border-2 hover:border-2 hover:border-ring hover:border-dashed text-muted-foreground",
        className
      )}
    >
      <ScanBarcode className="h-4 w-4 text-primary" />
      <span className="text-sm">Scan Barcode</span>
    </Button>
  );
}
