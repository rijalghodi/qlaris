import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";

type Props = {};

export default function RowsPerPage({}: Props) {
  return (
    <div className="text-xs text-muted-foreground flex items-center gap-1">
      <span>Items per page</span>{" "}
      <Select>
        <SelectTrigger className="w-15 h-8 inline-flex text-xs font-medium text-foreground px-3">
          <SelectValue placeholder="10" />
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
