import React from "react";

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./app-sidebar";

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-svh w-screen">
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className="h-svh bg-sidebar">{children}</SidebarInset>
      </SidebarProvider>
    </div>
  );
}
