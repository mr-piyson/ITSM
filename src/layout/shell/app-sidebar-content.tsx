"use client";

import { Loader2 } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import {
	SidebarGroup,
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
		<SidebarGroup>
			<SidebarMenu>
				{routes.appSidebar.map(({ title, href, icon: Icon }) => (
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
							<Icon
								className={cn(
									"ms-1 size-6 shrink-0",
									isActive(href) ? "text-white" : "text-foreground/92",
									loading === href && !open && !isMobile ? "hidden" : "",
								)}
							/>
							<div className="flex items-center justify-between w-full">
								<span
									className={cn(
										" text-base",
										isActive(href) ? "text-white" : "text-foreground/92",
										loading === href && !open && !isMobile ? "hidden" : "",
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
