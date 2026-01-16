import { AppLayout } from "@/components/layout/app-layout";
import React from "react";

type Props = {
  children: React.ReactNode;
};

export default function Layout({ children }: Props) {
  return <AppLayout>{children}</AppLayout>;
}
