import {
  ArrowRightLeftIcon,
  CalendarClockIcon,
  ChartNoAxesCombinedIcon,
  ChartPieIcon,
  ChartSplineIcon,
  ClipboardListIcon,
  Clock9Icon,
  CrownIcon,
  FacebookIcon,
  HashIcon,
  InstagramIcon,
  LanguagesIcon,
  LinkedinIcon,
  SettingsIcon,
  SquareActivityIcon,
  TwitterIcon,
  Undo2Icon,
  UsersIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

import { ProfileDropdown } from "./profile-dropdown";
import { AppSidebar } from "./app-sidebar";
import { BRAND } from "@/lib/brand";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh w-full">
      <SidebarProvider>
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <header className="bg-card sticky top-0 z-50 border-b">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-4 py-2 sm:px-6">
              <div className="flex items-center gap-4">
                <SidebarTrigger className="[&_svg]:!size-5" />
                <Separator orientation="vertical" className="hidden !h-4 sm:block" />
                <Breadcrumb className="hidden sm:block">
                  <BreadcrumbList>
                    <BreadcrumbItem>
                      <BreadcrumbLink href="#">Home</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbLink href="#">Dashboard</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage>Free</BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
              <div className="flex items-center gap-1.5">
                <ProfileDropdown />
              </div>
            </div>
          </header>
          <main className="mx-auto size-full max-w-7xl flex-1 px-4 py-6 sm:px-6">
            <Card className="h-250">
              <CardContent className="h-full">
                <div className="h-full rounded-md border bg-[repeating-linear-gradient(45deg,var(--muted),var(--muted)_1px,var(--card)_2px,var(--card)_15px)]" />
                {children}
              </CardContent>
            </Card>
          </main>
          <footer>
            <div className="text-muted-foreground mx-auto flex size-full max-w-7xl items-center justify-between gap-3 px-4 py-3 max-sm:flex-col sm:gap-6 sm:px-6">
              <p className="text-xs text-balance max-sm:text-center">
                {`©${new Date().getFullYear()}`} Qlaris. Create with 💪 by{" "}
                <a href={BRAND.AUTHOR_URL} className="text-primary">
                  Rijal Ghodi
                </a>
              </p>
            </div>
          </footer>
        </div>
      </SidebarProvider>
    </div>
  );
}

export default AppShell;
