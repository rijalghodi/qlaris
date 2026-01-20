"use client";

import React, { useState } from "react";
import { useZxing } from "react-zxing";
import { ScanBarcode, X } from "lucide-react";
import { Button } from "./button";

type Props = {
  onChange?: (value: string) => void;
  onSuccess?: (value: string) => void;
};

export function BarcodeScan({ onChange, onSuccess }: Props) {
  const [scannedValue, setScannedValue] = useState<string>("");
  const [error, setError] = useState<string>("");

  const { ref } = useZxing({
    onDecodeResult(result) {
      const barcodeValue = result.getText();
      if (barcodeValue) {
        setScannedValue(barcodeValue);
        onChange?.(barcodeValue);
        onSuccess?.(barcodeValue);
      }
    },
    onError(error) {
      console.error("Barcode scanner error:", error);
      if (error instanceof Error) {
        setError(error.message);
      }
    },
  });

  return (
    <>
      <div className="relative w-full h-full flex items-center justify-center bg-black">
        {error ? (
          <div className="text-center text-white p-6">
            <div className="text-lg font-semibold mb-2">Camera Error</div>
            <div className="text-sm text-gray-300 mb-4">{error}</div>
            <Button
              variant="default"
              onClick={() => {
                setError("");
              }}
            >
              Try Again
            </Button>
          </div>
        ) : (
          <>
            <video ref={ref} className="w-full h-full object-cover" playsInline />

            {/* Scanning overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="relative w-64 h-64 border-4 border-primary rounded-lg shadow-lg">
                {/* Corner indicators */}
                <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-white rounded-tl-lg" />
                <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-white rounded-tr-lg" />
                <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-white rounded-bl-lg" />
                <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-white rounded-br-lg" />

                {/* Scanning line animation */}
                <div className="absolute inset-0 overflow-hidden rounded">
                  <div className="absolute top-0 left-0 right-0 h-1 bg-primary animate-scan" />
                </div>
              </div>
            </div>

            {scannedValue && (
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-full font-semibold shadow-lg animate-in fade-in slide-in-from-bottom-4">
                ✓ Scanned successfully!
              </div>
            )}
          </>
        )}
      </div>

      <style jsx>{`
        @keyframes scan {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(256px);
          }
        }
        .animate-scan {
          animation: scan 2s linear infinite;
        }
      `}</style>
    </>
  );
}
