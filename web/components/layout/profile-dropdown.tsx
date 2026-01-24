"use client";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";
import { CreditCardIcon, LogOutIcon, SettingsIcon, UserIcon } from "lucide-react";

import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import { useLogout } from "@/services/api-auth";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { ReactNode } from "react";
import { Button } from "../ui/button";
import { useGetCurrentUser } from "@/services/api-user";

type Props = {
  trigger?: ReactNode;
  defaultOpen?: boolean;
  align?: "start" | "center" | "end";
};

export function ProfileDropdown({ trigger, defaultOpen, align }: Props) {
  const { mutateAsync: logout } = useLogout({});
  const { data: user } = useGetCurrentUser();

  const userName = user?.data?.name || "User";
  const userEmail = user?.data?.email || "";
  const userImage = user?.data?.googleImage;

  return (
    <DropdownMenu defaultOpen={defaultOpen}>
      <DropdownMenuTrigger asChild>
        {trigger ?? (
          <Button variant="ghost" size="icon" className="size-9.5">
            <Avatar className="size-9.5 rounded-md">
              <AvatarImage src={userImage} />
              <AvatarFallback>{userName[0]}</AvatarFallback>
            </Avatar>
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-60" align={align || "end"}>
        <DropdownMenuLabel className="flex items-center gap-4 px-4 py-2.5 font-normal">
          <div className="relative">
            <Avatar className="size-8">
              <AvatarImage src={userImage} alt={userName} />
              <AvatarFallback>{userName[0]}</AvatarFallback>
            </Avatar>
            <span className="ring-card absolute right-0 bottom-0 block size-2 rounded-full bg-green-600 ring-2" />
          </div>
          <div className="flex flex-1 flex-col items-start">
            <span className="text-foreground text-sm font-semibold">{userName}</span>
            <span className="text-muted-foreground text-xs">{userEmail}</span>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href={ROUTES.MY_ACCOUNT}>
              <UserIcon />
              <span>My Account</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem variant="destructive" onClick={() => logout()}>
          <LogOutIcon />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
