import { cn } from "@/lib/utils";
import { ShoppingBagIcon } from "lucide-react";

export const LogoText = ({
  className,
  size = "default",
  color = "primary",
}: {
  className?: string;
  size?: "sm" | "default";
  color?: "primary" | "white";
}) => {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <ShoppingBagIcon
        className={cn(
          "size-5",
          size === "sm" && "size-4",
          color === "primary" ? "text-primary" : "text-white"
        )}
        strokeWidth={2.5}
      />
      <span
        className={cn(
          "font-semibold bg-clip-text text-transparent",
          color === "primary" ? "bg-linear-to-r from-primary to-primary/70" : "bg-white",
          size === "sm" ? "text-xl" : "text-2xl"
        )}
      >
        Qlaris
      </span>
    </div>
  );
};
