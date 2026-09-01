"use client";

import AppLogo from "@/assets/icons/Logo";
import {
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";

export function TeamSwitcher() {
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
						<span className="truncate font-semibold text-2xl">ITSM</span>
						<span className="truncate text-xs"></span>
					</div>
				</SidebarMenuButton>
			</SidebarMenuItem>
		</SidebarMenu>
	);
}
