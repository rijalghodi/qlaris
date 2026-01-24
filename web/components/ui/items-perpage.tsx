import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";

type Props = {
  value?: number;
  onChange?: (value: number) => void;
  totalItems?: number;
};

export default function ItemsPerPage({ value, onChange, totalItems }: Props) {
  return (
    <div className="text-xs text-muted-foreground flex items-center gap-1">
      <span>Items per Page:</span>{" "}
      <Select value={value?.toString()} onValueChange={(value) => onChange?.(Number(value))}>
        <SelectTrigger className="w-15 h-8 inline-flex text-xs font-medium text-foreground px-3">
          <SelectValue placeholder="10" defaultValue={value?.toString()} />
        </SelectTrigger>
        <SelectContent className="w-10">
          <SelectItem value="10">10</SelectItem>
          <SelectItem value="25">25</SelectItem>
          <SelectItem value="50">50</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
