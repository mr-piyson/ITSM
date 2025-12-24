"use client";

import { Monitor } from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Menu, X, ChevronDown } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import { RouteItem, routes } from "@/lib/routes";

export function NavigationToolbar(props: any) {
  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useLayoutEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  return (
    <>
      <nav
        className={`fixed w-full z-10 transition-all duration-300 ${
          isScrolled ? "bg-background/95 border-b" : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="shrink-0 flex items-center">
                <div className="w-10 h-10 bg-linear-to-r from-primary to-primary/80 rounded-lg flex items-center justify-center">
                  <Monitor className="w-6 h-6 text-primary-foreground" />
                </div>
                <span className="ml-3 text-xl font-bold text-foreground">
                  ITSM
                </span>
              </div>
            </div>

            {/* Navigation  Menu */}
            <NavMenu />

            {/* Desktop Sign In Button */}
            <div className="hidden md:block">
              <Link href="/auth">
                <Button>Sign In</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>
      <div className="h-16" />
    </>
  );
}

function DesktopNavItem({ item }: { item: RouteItem }) {
  const Icon = item.icon;

  if (item.children) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-2">
            <svg className={item.icon} />
            {item.title}
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          {item.children.map((child) => (
            <DesktopDropdownItem key={child.title} item={child} />
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Button variant="ghost" asChild>
      <Link href={item.href || "#"} className="flex items-center gap-2">
        <svg className={item.icon} />
        {item.title}
      </Link>
    </Button>
  );
}

function DesktopDropdownItem({ item }: { item: RouteItem }) {
  const Icon = item.icon;

  if (item.children) {
    return (
      <DropdownMenuSub>
        <DropdownMenuSubTrigger className="flex items-center gap-2">
          <svg className={item.icon} />
          {item.title}
        </DropdownMenuSubTrigger>
        <DropdownMenuSubContent className="w-48">
          {item.children.map((child) => (
            <DesktopDropdownItem key={child.title} item={child} />
          ))}
        </DropdownMenuSubContent>
      </DropdownMenuSub>
    );
  }

  return (
    <DropdownMenuItem asChild>
      <Link
        href={item.href || "#"}
        className="flex items-center gap-2 cursor-pointer"
      >
        <svg className={item.icon} />
        {item.title}
      </Link>
    </DropdownMenuItem>
  );
}

function MobileNavItem({
  item,
  onNavigate,
  depth = 0,
}: {
  item: RouteItem;
  onNavigate: () => void;
  depth?: number;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const Icon = item.icon;

  if (item.children) {
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger
          className="flex items-center justify-between w-full px-4 py-3 text-sm hover:bg-accent rounded-md transition-colors"
          style={{ paddingLeft: `${1 + depth * 0.75}rem` }}
        >
          <div className="flex items-center gap-3">
            <svg className={item.icon} />
            <span>{item.title}</span>
          </div>
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-transform",
              isOpen && "rotate-180"
            )}
          />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-1 mt-1">
          {item.children.map((child) => (
            <MobileNavItem
              key={child.title}
              item={child}
              onNavigate={onNavigate}
              depth={depth + 1}
            />
          ))}
        </CollapsibleContent>
      </Collapsible>
    );
  }

  return (
    <Link
      href={item.href || "#"}
      onClick={onNavigate}
      className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-accent rounded-md transition-colors"
      style={{ paddingLeft: `${1 + depth * 0.75}rem` }}
    >
      <svg className={item.icon} />
      {item.title}
    </Link>
  );
}

export function NavMenu() {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();

  const handleNavigate = () => {
    setOpen(false);
  };

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </DrawerTrigger>
        <DrawerContent className="h-[85vh]">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b">
              <DrawerTitle>Navigation</DrawerTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <nav className="flex-1 overflow-y-auto p-4 space-y-1">
              {routes.landingPage.map((item) => (
                <MobileNavItem
                  key={item.title}
                  item={item}
                  onNavigate={handleNavigate}
                />
              ))}
            </nav>
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <nav className="hidden md:flex items-center gap-2">
      {routes.landingPage.map((item) => (
        <DesktopNavItem key={item.title} item={item} />
      ))}
    </nav>
  );
}
