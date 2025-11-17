"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import AppLogo from "@/assets/Icons/Logo";
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
  account: users | null;
}

export default function App(props: AppProps) {
  return (
    <QueryClientProvider client={new QueryClient()}>
      <SidebarProvider className="flex h-screen overflow-hidden">
        <AppSidebar account={props.account} />
        <div className="relative flex flex-col flex-1 min-h-full">
          {/* Toolbar fixed at top */}
          <Toolbar className="sticky top-0 z-10" account={props.account} />

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

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  account: users | null;
}

export function AppSidebar({ ...props }: AppSidebarProps) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <AppSidebarContent role={props.account?.type} />
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
          className="!opacity-100 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
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

import type { users } from "@prisma/client";
import { ChevronsUpDown, Loader2, LogOut, Moon } from "lucide-react";
import { useEffect, useState } from "react";
import { signOut } from "@/app/auth/auth.actions";
import { Button } from "@/components/ui/button";
import { Activities } from "@/lib/Activities";
import { cn } from "@/lib/utils";
import Toolbar from "./Toobar";

// This component renders the user profile in the sidebar, allowing users to switch themes and log out.
export function UserMenu({ account }: { account: users | null }) {
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
              alt={account?.name}
            />
            <AvatarFallback>{account?.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="max-sm:hidden grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">{account?.name}</span>
            <span className="truncate text-xs">{account?.email}</span>
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
                alt={account?.name}
                covered
              />
              <AvatarFallback>{account?.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">{account?.name}</span>
              <span className="truncate text-xs">{account?.email}</span>
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
export function AppSidebarContent(props: { role: string | undefined }) {
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

  const isActive = (Activity: string) => {
    const url = path.split("/").slice(0, 3).join("/");
    return url === Activity;
  };
  return (
    <SidebarGroup>
      <SidebarMenu>
        {Activities(props.role).map(({ title, url, icon }) => (
          <SidebarMenuItem key={title}>
            <SidebarMenuButton
              isActive={isActive(url)}
              className="flex data-[active=true]:bg-primary data-[active=false]:text-primary-foreground"
              tooltip={title}
              size={"lg"}
              onClick={() => {
                const match = path.match(/^\/App\/[^/]+/);
                match && match[0] === url ? setLoading("") : setLoading(url);
                router.push(url);
              }}
            >
              {/* <Link href={url} className="flex justify-center items-center"> */}
              <i
                className={cn(
                  "ms-1 size-6 shrink-0",
                  icon,
                  isActive(url) ? "text-white" : "text-foreground/92",
                  loading === url && !open && !isMobile ? "hidden" : ""
                )}
              />
              <div className="flex items-center justify-between w-full">
                <span
                  className={cn(
                    " text-base",
                    isActive(url) ? "text-white" : "text-foreground/92",
                    loading === url && !open && !isMobile ? "hidden" : ""
                  )}
                >
                  {title}
                </span>
                {loading === url && (
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
