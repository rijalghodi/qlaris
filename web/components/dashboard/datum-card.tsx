import React from "react";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "../ui/card";
import { ArrowDown, ArrowUp } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  title: string;
  value: string;
  comparison?: {
    valuePercent: string;
    isUp: boolean;
    label: string;
  };
  decoration: React.ReactNode;
};

export function DatumCard({ title, value, comparison, decoration }: Props) {
  return (
    <Card>
      <CardHeader>
        <div>
          <h2 className="text-lg font-semibold mb-4">{title}</h2>
        </div>
        <p className="text-2xl leading-none tracking-tight font-semibold mb-2">{value}</p>
        <p className="text-sm text-muted-foreground">
          <span
            className={cn("font-semibold", comparison?.isUp ? "text-success" : "text-destructive")}
          >
            {comparison?.isUp ? (
              <ArrowUp className="inline size-4" />
            ) : (
              <ArrowDown className="inline size-4" />
            )}
            {comparison?.valuePercent}
          </span>{" "}
          {comparison?.label}
        </p>
        <CardAction>{decoration}</CardAction>
      </CardHeader>
    </Card>
  );
}
