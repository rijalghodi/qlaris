"use client";

import { Box, File, LayoutDashboard, Plus, ShoppingBagIcon, Tags, UsersRound } from "lucide-react";
import Link from "next/link";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
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
import { useMemo } from "react";
import { Role } from "@/lib/constant";

export function AppSidebar() {
  const { data: user, isLoading, isFetching } = useGetCurrentUser();
  const userImage = user?.data?.googleImage;
  const userName = user?.data?.name || "User";
  const userEmail = user?.data?.email || "";
  const pathname = usePathname();

  const { open } = useSidebar();

  const menus = useMemo(() => {
    const menuItems = [
      {
        title: "Dashboard",
        href: ROUTES.DASHBOARD,
        isActive: pathname.startsWith(ROUTES.DASHBOARD),
        icon: LayoutDashboard,
        role: [Role.OWNER, Role.CASHIER, Role.MANAGER],
      },
      {
        title: "New Transaction",
        href: ROUTES.NEW_TRANSACTION,
        isActive: pathname === ROUTES.NEW_TRANSACTION,
        icon: Plus,
        role: [Role.OWNER, Role.CASHIER, Role.MANAGER],
      },
      {
        title: "Products",
        href: ROUTES.PRODUCTS,
        isActive: pathname.startsWith(ROUTES.PRODUCTS),
        icon: Box,
        role: [Role.OWNER, Role.MANAGER],
      },
      {
        title: "Categories",
        href: ROUTES.CATEGORIES,
        isActive: pathname.startsWith(ROUTES.CATEGORIES),
        icon: Tags,
        role: [Role.OWNER, Role.MANAGER],
      },
      {
        title: "Transaction History",
        href: ROUTES.TRANSACTIONS,
        isActive: pathname.startsWith(ROUTES.TRANSACTIONS) && pathname !== ROUTES.NEW_TRANSACTION,
        icon: File,
        role: [Role.OWNER, Role.CASHIER, Role.MANAGER],
      },
      {
        title: "Employees",
        href: ROUTES.EMPLOYEES,
        isActive: pathname.startsWith(ROUTES.EMPLOYEES),
        icon: UsersRound,
        role: [Role.OWNER],
      },
    ];

    // filter menu items based on user role
    const filteredMenuItems = menuItems.filter(
      (item) => user?.data?.role && item.role.includes(user?.data?.role)
    );

    return filteredMenuItems;
  }, [user?.data?.role, pathname]);

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
                  {menus.map((menu) => (
                    <SidebarMenuItem key={menu.href}>
                      <SidebarMenuButton asChild isActive={menu.isActive} title={menu.title}>
                        <Link href={menu.href}>
                          <menu.icon />
                          <span>{menu.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
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
                      <span className="font-semibold text-2xl text-primary">Qlaris</span>
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
