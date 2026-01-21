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

import { ProfileDropdown } from "./profile-dropdown";

export function AppSidebar() {
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
                <Link href="#" className="flex items-center gap-2">
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
                <SidebarMenuButton
                  asChild
                  variant="default"
                  isActive
                  // className="bg-primary text-primary-foreground hover:text-primary-foreground hover:bg-primary/80 h-10"
                >
                  <Link href={ROUTES.NEW_ORDER}>
                    <Sparkle />
                    <span>Transaction</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href={ROUTES.DASHBOARD}>
                    <LayoutDashboard />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href={ROUTES.PRODUCTS}>
                    <Box />
                    <span>Products</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href={ROUTES.CATEGORIES}>
                    <Tags />
                    <span>Categories</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href={ROUTES.TRANSACTIONS}>
                    <ArrowRightLeftIcon />
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
