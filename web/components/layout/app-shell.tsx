import { SidebarProvider } from "@/components/ui/sidebar";

import { AppSidebar } from "./app-sidebar";
import { SetupProfileDialogTrigger } from "../profile/setup-profile-dialog";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh w-full">
      <SidebarProvider>
        <AppSidebar />
        <div className="flex flex-1 flex-col bg-background">
          {/* <header className="bg-card sticky top-0 z-50 border-b border-sidebar-border h-14">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-2 sm:px-6">
              <div className="flex items-center gap-4"></div>
              <div className="flex items-center gap-1.5">
                <ProfileDropdown />
              </div>
            </div>
          </header> */}
          <main className="mx-auto size-full flex-1 py-3">{children}</main>
          {/* <footer className="border-t border-sidebar-border">
            <div className="text-muted-foreground mx-auto flex size-full max-w-7xl items-center justify-center gap-3 px-4 py-3 max-sm:flex-col sm:gap-6 sm:px-6">
              <p className="text-xs text-balance max-sm:text-center">
                {`©${new Date().getFullYear()}`} Qlaris. Create with 💪 by{" "}
                <a href={BRAND.AUTHOR_URL} className="text-primary">
                  Rijal Ghodi
                </a>
              </p>
            </div>
          </footer> */}
          <SetupProfileDialogTrigger />
        </div>
      </SidebarProvider>
    </div>
  );
}

export default AppShell;
