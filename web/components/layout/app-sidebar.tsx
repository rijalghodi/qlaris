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
  FileClock,
  FileStack,
  FolderClock,
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
  Users,
  UsersIcon,
  UsersRound,
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
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { ROUTES } from "@/lib/routes";
import { usePathname } from "next/navigation";
import { ProfileDropdown } from "./profile-dropdown";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useGetCurrentUser } from "@/services/api-user";
import { Skeleton } from "../ui/skeleton";

export function AppSidebar() {
  const { data: user, isLoading, isFetching } = useGetCurrentUser();
  const userImage = user?.data?.googleImage;
  const userName = user?.data?.name || "User";
  const userEmail = user?.data?.email || "";
  const pathname = usePathname();

  const { open } = useSidebar();
  return (
    <Sidebar variant="sidebar" collapsible="icon">
      {isLoading || isFetching ? (
        <SidebarLoading />
      ) : (
        <>
          <SidebarHeader className="relative">
            <SidebarMenu>
              <ProfileDropdown
                align="start"
                trigger={
                  <SidebarMenuItem>
                    <SidebarMenuButton variant="default" className="py-2 h-fit" title="Profile">
                      <Avatar className="size-8">
                        <AvatarImage src={userImage} alt={userName} />
                        <AvatarFallback>{userName[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{userName}</p>
                        <p className="text-xs text-muted-foreground">{userEmail}</p>
                      </div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                }
              />
            </SidebarMenu>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname.startsWith(ROUTES.DASHBOARD)}
                      title="Dashboard"
                    >
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
                      isActive={pathname == ROUTES.NEW_TRANSACTION}
                      title="New Transaction"
                    >
                      <Link href={ROUTES.NEW_TRANSACTION}>
                        <Plus />
                        <span>New Transaction</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname.startsWith(ROUTES.PRODUCTS)}
                      title="Products"
                    >
                      <Link href={ROUTES.PRODUCTS}>
                        <Box />
                        <span>Products</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname.startsWith(ROUTES.CATEGORIES)}
                      title="Categories"
                    >
                      <Link href={ROUTES.CATEGORIES}>
                        <Tags />
                        <span>Categories</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={
                        pathname.startsWith(ROUTES.TRANSACTIONS) &&
                        pathname !== ROUTES.NEW_TRANSACTION
                      }
                      title="Transaction History"
                    >
                      <Link href={ROUTES.TRANSACTIONS}>
                        <File />
                        <span>Transaction History</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      asChild
                      isActive={
                        pathname.startsWith(ROUTES.EMPLOYEES) && pathname !== ROUTES.EMPLOYEES
                      }
                      title="Employees"
                    >
                      <Link href={ROUTES.EMPLOYEES}>
                        <UsersRound />
                        <span>Employees</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <div className="flex items-center justify-between gap-2 bg-transparent hover:bg-transparent focus:bg-transparent active:bg-transparent">
                  {open && (
                    <Link href={ROUTES.LANDING} className="flex items-center gap-2">
                      <ShoppingBagIcon className="size-6! text-primary" strokeWidth={2.5} />
                      <span className="font-semibold text-2xl bg-linear-to-r from-lime-600 to-lime-700 bg-clip-text text-transparent tracking-normal leading-none">
                        Qlaris
                      </span>
                    </Link>
                  )}
                  <SidebarTrigger title="Toggle Sidebar" className="size-11 rounded-full" />
                </div>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </>
      )}
    </Sidebar>
  );
}

function SidebarLoading() {
  return (
    <SidebarContent className="flex flex-col gap-3 py-8 px-3">
      <Skeleton className="h-10 bg-sidebar-accent" />
      <Skeleton className="h-10 bg-sidebar-accent" />
      <Skeleton className="h-10 bg-sidebar-accent" />
      <Skeleton className="h-10 bg-sidebar-accent" />
      <Skeleton className="h-10 bg-sidebar-accent" />
    </SidebarContent>
  );
}
