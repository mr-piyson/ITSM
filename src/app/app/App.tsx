"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import AppLogo from "@/assets/icons/Logo";
import { ThemeSwitcher } from "@/components/Theme-Provider";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CommandShortcut } from "@/components/ui/command";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  useSidebar,
} from "@/components/ui/sidebar";

// const open = atom(true);
interface AppProps {
  children: React.ReactNode;
}

export default function App(props: AppProps) {
  return (
    <QueryClientProvider client={new QueryClient()}>
      <SidebarProvider className="flex h-screen overflow-hidden">
        <AppSidebar />
        <div className="relative flex flex-col flex-1 min-h-full">
          {/* Toolbar fixed at top */}
          <Toolbar className="sticky top-0 z-10" />

          {/* Scrollable main area */}
          <div className="flex-1 overflow-auto relative">{props.children}</div>
        </div>
      </SidebarProvider>
    </QueryClientProvider>
  );
}

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

// This is sample data.

export function AppSidebar({ ...props }: any) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <AppSidebarContent />
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}

export function TeamSwitcher() {
  const { isMobile } = useSidebar();

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          className="opacity-100! data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
          disabled
        >
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg  text-sidebar-primary-foreground">
            <AppLogo className="size-7" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold text-lg">ITSM</span>
            <span className="truncate text-xs"></span>
          </div>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}

import { ChevronsUpDown, Loader2, LogOut, Moon } from "lucide-react";
import { useEffect, useState } from "react";
import { signOut } from "@/app/auth/auth.actions";
import { Button } from "@/components/ui/button";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";
import Toolbar from "./Toolbar";

// This component renders the user profile in the sidebar, allowing users to switch themes and log out.
export function UserMenu(props: any) {
  const { isMobile } = useSidebar();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant={"ghost"}
          className=" data-[state=open]:border-border  border-2 border-transparent"
        >
          <Avatar className="h-8 w-8">
            <AvatarImage
            // src={account?.image ?? undefined}
            // alt={account?.name}
            />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
          <div className="max-sm:hidden grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">Name</span>
            <span className="truncate text-xs">Email</span>
          </div>
          <ChevronsUpDown className="max-sm:hidden ml-auto size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="bg-popover/95 w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
        side={"bottom"}
        align="end"
        sideOffset={4}
      >
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            <Avatar className="h-8 w-8 ">
              <AvatarImage
                // src={account?.image ?? undefined}
                alt={"Name"}
                covered
              />
              <AvatarFallback>{"name"}</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">{"name"}</span>
              <span className="truncate text-xs">{"email"}</span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <Moon />
            Dark Mode
            <CommandShortcut>
              <ThemeSwitcher />
            </CommandShortcut>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={async () => {
            await signOut();
          }}
        >
          <LogOut />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// Sidebar navigation for the main activities of the application.
export function AppSidebarContent(props: any) {
  const { isMobile, open, setOpenMobile } = useSidebar();
  const router = useRouter();
  const path = usePathname();
  const [loading, setLoading] = useState("");

  useEffect(() => {
    if (loading === path) {
      setLoading("");
      setOpenMobile(false);
    }
  }, [path, setOpenMobile, loading]);

  const isActive = (Activity: string | undefined) => {
    const url = path.split("/").slice(0, 3).join("/");
    return url === Activity;
  };
  return (
    <SidebarGroup>
      <SidebarMenu>
        {routes.appSidebar.map(({ title, href, icon }) => (
          <SidebarMenuItem key={title}>
            <SidebarMenuButton
              isActive={isActive(href)}
              className="flex data-[active=true]:bg-primary data-[active=false]:text-primary-foreground"
              tooltip={title}
              size={"lg"}
              onClick={() => {
                const match = path.match(/^\/App\/[^/]+/);
                match && match[0] === href
                  ? setLoading("")
                  : setLoading(href as string);
                href && router.push(href);
              }}
            >
              {/* <Link href={url} className="flex justify-center items-center"> */}
              <i
                className={cn(
                  "ms-1 size-6 shrink-0",
                  icon,
                  isActive(href) ? "text-white" : "text-foreground/92",
                  loading === href && !open && !isMobile ? "hidden" : ""
                )}
              />
              <div className="flex items-center justify-between w-full">
                <span
                  className={cn(
                    " text-base",
                    isActive(href) ? "text-white" : "text-foreground/92",
                    loading === href && !open && !isMobile ? "hidden" : ""
                  )}
                >
                  {title}
                </span>
                {loading === href && (
                  <Loader2 className="mx-2 size-3 animate-spin text-foreground" />
                )}
              </div>
              {/* </Link> */}
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
