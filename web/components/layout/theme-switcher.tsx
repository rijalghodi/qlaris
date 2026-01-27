"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

type Props = {
  variant?: "single" | "buttons" | "dropdown";
};

export function ThemeSwitcher({ variant = "single" }: Props) {
  const { setTheme, theme, resolvedTheme } = useTheme();

  if (variant === "single") {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setTheme(resolvedTheme === "light" ? "dark" : "light")}
      >
        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  }

  if (variant === "dropdown") {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="relative">
            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
            <DropdownMenuRadioItem value="light">
              <Sun className="mr-2 h-4 w-4" />
              <span>Light</span>
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="dark">
              <Moon className="mr-2 h-4 w-4" />
              <span>Dark</span>
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="system">
              <Monitor className="mr-2 h-4 w-4" />
              <span>System</span>
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  if (variant === "buttons") {
    return (
      <div className="flex items-center gap-1 rounded-md p-1 bg-muted">
        <button
          type="button"
          onClick={() => setTheme("light")}
          className={cn(
            "relative rounded-md p-1.5 transition cursor-pointer",
            theme === "light"
              ? "bg-background text-foreground shadow"
              : "text-muted-foreground hover:bg-accent"
          )}
        >
          <Sun className="h-4 w-4" />
          <span className="sr-only">Light mode</span>
        </button>

        <button
          type="button"
          onClick={() => setTheme("dark")}
          className={cn(
            "relative rounded-md p-1.5 transition cursor-pointer",
            theme === "dark"
              ? "bg-background text-foreground shadow"
              : "text-muted-foreground hover:bg-accent"
          )}
        >
          <Moon className="h-4 w-4" />
          <span className="sr-only">Dark mode</span>
        </button>
      </div>
    );
  }
}
