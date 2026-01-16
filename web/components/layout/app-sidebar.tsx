"use client";

import {
  ArrowRightLeftIcon,
  ChartNoAxesCombinedIcon,
  ChartPieIcon,
  ChartSplineIcon,
  ClipboardListIcon,
  Clock9Icon,
  CrownIcon,
  Gift,
  HashIcon,
  Home,
  ListTodo,
  SquareActivityIcon,
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
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                className="bg-transparent hover:bg-transparent focus:bg-transparent active:bg-transparent"
              >
                <Link href="#">
                  <Gift className="size-7!" />
                  <span className="font-semibold text-2xl">QLaris</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarGroup>
          {/* <SidebarGroupLabel>Pages</SidebarGroupLabel> */}
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="#">
                    <ChartSplineIcon />
                    <span>Content Performance</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="#">
                    <UsersIcon />
                    <span>Audience Insight</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="#">
                    <ChartPieIcon />
                    <span>Engagement Metrics</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="#">
                    <HashIcon />
                    <span>Hashtag Performance</span>
                  </a>
                </SidebarMenuButton>
                <SidebarMenuBadge className="bg-primary/10 rounded-full">3</SidebarMenuBadge>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="#">
                    <ArrowRightLeftIcon />
                    <span>Competitor Analysis</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="#">
                    <Clock9Icon />
                    <span>Campaign Tracking</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="#">
                    <ClipboardListIcon />
                    <span>Sentiment Tracking</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="#">
                    <CrownIcon />
                    <span>Influencer</span>
                  </a>
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
