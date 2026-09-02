"use client";

import { Loader2 } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
	SidebarGroup,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	useSidebar,
} from "@/components/ui/sidebar";
import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

export function AppSidebarContent() {
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
		<>
			{routes.appSidebar.map((group, groupIndex) => (
				<SidebarGroup key={group.label ?? `group-${groupIndex}`}>
					{group.label && <SidebarGroupLabel>{group.label}</SidebarGroupLabel>}
					<SidebarMenu>
						{group.items.map(({ title, href, icon: Icon }) => (
							<SidebarMenuItem key={title}>
								<SidebarMenuButton
									isActive={isActive(href)}
									className={cn(
										isActive(href) ? "text-white! bg-primary! rounded-sm" : "",
										loading === href && !open && !isMobile ? "hidden" : "",
									)}
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
									<Icon className={cn("ms-1 size-6 shrink-0")} />
									<div className="flex items-center justify-between w-full">
										<span className={cn(" text-base")}>{title}</span>
										{loading === href && (
											<Loader2 className="mx-2 size-3 animate-spin text-foreground" />
										)}
									</div>
								</SidebarMenuButton>
							</SidebarMenuItem>
						))}
					</SidebarMenu>
				</SidebarGroup>
			))}
		</>
	);
}
