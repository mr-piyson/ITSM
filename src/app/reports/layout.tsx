"use client"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import Link from "next/link"
import { usePathname } from "next/navigation"
import type * as React from "react"

import MESLogo from "@/assets/icons/MESLogo"
import { ModeToggle } from "@/components/ui/mode-toggle"
import { Separator } from "@/components/ui/separator"
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar"
import { SidebarTrigger } from "@/components/ui/sidebar"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { routes } from "@/lib/routes"

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
  )
}

function SiteHeader() {
  return (
    <header className="bg-sidebar flex h-(--header-height) shrink-0 items-center gap-2  transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <div className="ml-auto flex items-center gap-2">
          <ModeToggle />
        </div>
      </div>
    </header>
  )
}

function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const path = usePathname()
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      {/* This is the App Sidebar header */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <MESLogo className="h-8 w-full" />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      {/* This is the App Sidebar Content */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent className="flex flex-col gap-2">
            <SidebarGroup>
              <Separator className="my-2" />
              <SidebarMenu className="gap-1">
                {routes.mesReports.map((item) => (
                  <Link href={item.href ? item.href : ""} key={item.title}>
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        isActive={path === item.href}
                        className="data-[active=true]:border-bfg border-2 border-transparent"
                        tooltip={item.title}
                      >
                        <i className={`${item.icon} size-6`}></i>
                        <span className="text-md ">{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  </Link>
                ))}
              </SidebarMenu>
            </SidebarGroup>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
