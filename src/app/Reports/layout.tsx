"use client";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";

export default function Page(props: any) {
  return (
    <QueryClientProvider client={new QueryClient()}>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SiteHeader />
          {props.children}
        </SidebarInset>
      </SidebarProvider>
    </QueryClientProvider>
  );
}

import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

function SiteHeader() {
  const path = usePathname();
  const title = path?.split("/").pop()?.replace(/-/g, " ");
  const { theme, setTheme } = useTheme();
  return (
    <header className="bg-sidebar flex h-(--header-height) shrink-0 items-center gap-2  transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">{title}</h1>
        {/* Left Side */}
        <div className="ml-auto flex items-center gap-2">
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}

import * as React from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <MESLogo className="h-8 w-full" />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain
          items={[
            {
              title: "Panel Report",
              url: "/Reports/Panel-Report",
              icon: "icon-[mingcute--board-line]",
            },
            {
              title: "Package Report",
              url: "/Reports/Package-Report",
              icon: "icon-[solar--box-outline]",
            },
            {
              title: "Inspection Report",
              url: "/Reports/Inspection-Report",
              icon: "icon-[lucide--route]",
            },
          ]}
        />
      </SidebarContent>
    </Sidebar>
  );
}

import Link from "next/link";
import { usePathname } from "next/navigation";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import MESLogo from "@/Assets/Icons/MESLogo";
import { useTheme } from "next-themes";
import { ModeToggle } from "@/components/ui/mode-toggle";

function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: string;
  }[];
}) {
  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarGroup>
          <SidebarGroupLabel className="text-sm font-semibold">
            Main Reports
          </SidebarGroupLabel>
          <SidebarGroupContent className="flex flex-col gap-2">
            <Separator className="my-2" />
            <SidebarMenu className="gap-1">
              {items.map((item) => (
                <Link href={item.url} key={item.title}>
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      isActive={usePathname() === item.url}
                      className="data-[active=true]:border-[#00b7b0] border-2 border-transparent"
                      tooltip={item.title}
                    >
                      <i className={`${item.icon} size-6`}></i>
                      <span className="text-md ">{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </Link>
              ))}
            </SidebarMenu>
            <Separator className="my-2" />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
