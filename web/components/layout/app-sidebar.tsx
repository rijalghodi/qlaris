"use client";

import {
  ArrowRight,
  ArrowRightLeftIcon,
  Box,
  ChartNoAxesCombinedIcon,
  ChartPieIcon,
  ChartSplineIcon,
  ClipboardListIcon,
  Clock9Icon,
  CrownIcon,
  File,
  Gift,
  HashIcon,
  Home,
  LayoutDashboard,
  ListTodo,
  Plus,
  ShoppingBag,
  ShoppingBagIcon,
  ShoppingBasket,
  Sparkle,
  Sparkles,
  SquareActivityIcon,
  Tags,
  UsersIcon,
} from "lucide-react";
import Link from "next/link";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { ROUTES } from "@/lib/routes";
import { usePathname } from "next/navigation";

export function AppSidebar() {
  const pathname = usePathname();
  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarContent>
        <SidebarHeader className="border-b border-sidebar-border h-14">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                className="bg-transparent hover:bg-transparent focus:bg-transparent active:bg-transparent"
              >
                <Link href={ROUTES.LANDING} className="flex items-center gap-2">
                  <ShoppingBagIcon className="size-6! text-primary" strokeWidth={2.5} />
                  <span className="font-semibold text-2xl bg-linear-to-r from-lime-600 to-lime-700 bg-clip-text text-transparent tracking-normal leading-none">
                    Qlaris
                  </span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname.startsWith(ROUTES.DASHBOARD)}>
                  <Link href={ROUTES.DASHBOARD}>
                    <LayoutDashboard />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  variant="default"
                  isActive={pathname == ROUTES.NEW_ORDER}
                >
                  <Link href={ROUTES.NEW_ORDER}>
                    <Plus />
                    <span>Transaction</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname.startsWith(ROUTES.PRODUCTS)}>
                  <Link href={ROUTES.PRODUCTS}>
                    <Box />
                    <span>Products</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname.startsWith(ROUTES.CATEGORIES)}>
                  <Link href={ROUTES.CATEGORIES}>
                    <Tags />
                    <span>Categories</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname.startsWith(ROUTES.TRANSACTIONS)}>
                  <Link href={ROUTES.TRANSACTIONS}>
                    <File />
                    <span>Transaction History</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem className="flex justify-end items-center">
            <SidebarTrigger className="rounded-full size-12" title="Toggle Sidebar" />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
