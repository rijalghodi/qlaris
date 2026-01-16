"use client";

import { LogOutIcon } from "lucide-react";

import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { useGetCurrentUser, useLogout } from "@/services/api-auth";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

export function ProfileButton() {
  const { logout } = useLogout();
  const { data: user } = useGetCurrentUser();

  const userName = user?.data?.name || "User";
  const userEmail = user?.data?.email || "";
  const userImage = user?.data?.googleImage;

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild className="data-[state=open]:bg-sidebar-accent">
            <SidebarMenuButton size="default">
              <Avatar className="size-6">
                <AvatarImage src={userImage} />
                <AvatarFallback>{userName}</AvatarFallback>
              </Avatar>
              <span>{userName}</span>
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[240px] rounded-lg" align="start">
            <DropdownMenuLabel className="flex items-center gap-2">
              <Avatar className="size-6">
                <AvatarImage src={userImage} />
                <AvatarFallback>{userName}</AvatarFallback>
              </Avatar>
              <div className="space-y-0.5">
                <div className="text-xs font-medium">{userName}</div>
                <div className="text-xs text-muted-foreground">{userEmail}</div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="cursor-pointer" onClick={logout}>
              <LogOutIcon />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
