"use client";

import * as React from "react";
import Link from "next/link";
import {
  Apple,
  BarChartHorizontalBig,
  CircleCheckIcon,
  CircleHelpIcon,
  CircleIcon,
  ComputerIcon,
  Download,
  FilePenLineIcon,
  Monitor,
} from "lucide-react";

import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { mesSidebarMenu } from "@/lib/MES-Sidebar";
import { cn } from "@/lib/utils";

const documents: { title: string; href: string; description: string }[] = [
  {
    title: "IT Request From",
    href: "/Requests/IT-Request",
    description:
      "Submit and track your IT support requests, including hardware, software, and access issues.",
  },
  {
    title: "HR Leave Form",
    href: "",
    description: "Apply for leave and manage your time-off requests.",
  },
];

export function LandingPageNavigationMenu() {
  return (
    <NavigationMenu
      viewport={false}
      className="[&_[data-slot=navigation-menu-trigger]]:bg-transparent"
    >
      <NavigationMenuList>
        <NavigationMenuItem className="">
          <NavigationMenuTrigger>Home</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid gap-2 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
              <li className="row-span-3">
                <NavigationMenuLink asChild>
                  <a
                    className="from-muted/50 to-muted flex h-full w-full flex-col justify-end rounded-md bg-linear-to-b p-6 no-underline outline-hidden select-none focus:shadow-md"
                    href="/"
                  >
                    <div className="mt-4 mb-2 text-lg font-medium">
                      shadcn/ui
                    </div>
                    <p className="text-muted-foreground text-sm leading-tight">
                      Beautifully designed components built with Tailwind CSS.
                    </p>
                  </a>
                </NavigationMenuLink>
              </li>
              <ListItem href="/docs" title="Introduction">
                Re-usable components built using Radix UI and Tailwind CSS.
              </ListItem>
              <ListItem href="/docs/installation" title="Installation">
                How to install dependencies and structure your app.
              </ListItem>
              <ListItem href="/docs/primitives/typography" title="Typography">
                Styles for headings, paragraphs, lists...etc
              </ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>
            <FilePenLineIcon className="me-3 size-4" />
            Documents
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-2 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
              {documents.map((component) => (
                <ListItem
                  key={component.title}
                  title={component.title}
                  href={component.href}
                >
                  {component.description}
                </ListItem>
              ))}
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink
            asChild
            className={navigationMenuTriggerStyle()}
          ></NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink className="flex flex-row items-center gap-2 px-2 py-1">
            <Monitor className="text-foreground size-4" />
            Data Capture
          </NavigationMenuLink>
        </NavigationMenuItem>

        {/* Download with sub-items */}
        <NavigationMenuItem>
          <NavigationMenuTrigger className="flex items-center gap-2">
            <Download className="size-4" />
            Download
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid gap-2 p-4 w-40">
              <li>
                <NavigationMenuLink
                  href="/download/windows"
                  className="flex items-center gap-2 px-2 py-1"
                >
                  <Monitor />
                  Windows
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink
                  href="/download/ios"
                  className="flex items-center gap-2 px-2 py-1"
                >
                  <Apple />
                  iOS
                </NavigationMenuLink>
              </li>
              <li>
                <NavigationMenuLink
                  href="/download/linux"
                  className="flex items-center gap-2 px-2 py-1"
                >
                  {/* <Linux  /> */}
                  Linux
                </NavigationMenuLink>
              </li>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuTrigger>
            <BarChartHorizontalBig className="me-2 size-4" />
            MES Reports
          </NavigationMenuTrigger>
          <NavigationMenuContent className="flex flex-col !w-[220px] ">
            {mesSidebarMenu.reports.map((item) => (
              <NavigationMenuLink key={item.title} asChild>
                <Link href={item.url}>
                  <span>
                    <i className={cn(item.icon, "me-2")}></i>
                    {item.title}
                  </span>
                </Link>
              </NavigationMenuLink>
            ))}
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}

function ListItem({
  title,
  children,
  href,
  ...props
}: React.ComponentPropsWithoutRef<"li"> & { href: string }) {
  return (
    <li {...props}>
      <NavigationMenuLink asChild>
        <Link href={href}>
          <div className="text-sm leading-none font-medium">{title}</div>
          <p className="text-muted-foreground line-clamp-2 text-sm leading-snug">
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  );
}
