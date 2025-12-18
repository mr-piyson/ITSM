"use client";

import {
  Apple,
  BarChartHorizontalBig,
  Download,
  FilePenLineIcon,
  Menu,
  Monitor,
  Moon,
  Sun,
} from "lucide-react";
import Link from "next/link";
import { useTheme } from "next-themes";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { routes } from "@/lib/routes";

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

export function NavigationToolbar(props: any) {
  const [isScrolled, setIsScrolled] = React.useState(false);
  const { setTheme } = useTheme();

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

            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="flex items-baseline space-x-4">
                <NavigationMenu
                  viewport={false}
                  className="**:data-[slot=navigation-menu-trigger]:bg-transparent"
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
                                  Beautifully designed components built with
                                  Tailwind CSS.
                                </p>
                              </a>
                            </NavigationMenuLink>
                          </li>
                          <ListItem href="/docs" title="Introduction">
                            Re-usable components built using Radix UI and
                            Tailwind CSS.
                          </ListItem>
                          <ListItem
                            href="/docs/installation"
                            title="Installation"
                          >
                            How to install dependencies and structure your app.
                          </ListItem>
                          <ListItem
                            href="/docs/primitives/typography"
                            title="Typography"
                          >
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
                      <NavigationMenuContent className="flex flex-col w-[220px]! ">
                        {routes.mesReports.map((item) => (
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
              </div>
            </div>

            {/* Theme Toggle */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
                  <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
                  <span className="sr-only">Toggle theme</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setTheme("light")}>
                  Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("dark")}>
                  Dark
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setTheme("system")}>
                  System
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Desktop Sign In Button */}
            <div className="hidden md:block">
              <Link href="/auth">
                <Button>Sign In</Button>
              </Link>
            </div>

            {/* Mobile Navigation */}
            <div className="md:hidden">
              <Drawer>
                <DrawerTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="w-6 h-6" />
                  </Button>
                </DrawerTrigger>
                <DrawerContent className="w-[300px] sm:w-[400px]">
                  <div className="flex flex-col space-y-4 mt-8">
                    <div className="flex items-center mb-4">
                      <div className="w-8 h-8 bg-linear-to-r from-primary to-primary/80 rounded-lg flex items-center justify-center">
                        <Monitor className="w-5 h-5 text-primary-foreground" />
                      </div>
                      <span className="ml-2 text-lg font-bold">ITSM</span>
                    </div>
                    <Separator />
                    <Link href="/auth">
                      <Button>Sign In</Button>
                    </Link>
                  </div>
                </DrawerContent>
              </Drawer>
            </div>
          </div>
        </div>
      </nav>
      <div className="h-16" />
    </>
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
