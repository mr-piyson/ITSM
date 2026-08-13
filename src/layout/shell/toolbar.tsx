"use client";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

import { NavPath } from "./navigate-path";
import { UserMenu } from "./user-menu";

export default function Toolbar(props: any) {
	return (
		<header
			className={cn(
				"flex sticky z-10 top-0 bg-sidebar/95 h-12 shrink-0 items-center gap-2 overflow-hidden border-b px-4 flex-nowrap ",
				props.className,
			)}
		>
			{/* Left hand side */}
			<div className="h-full w-full flex left flex-1 min-w-0 items-center gap-2 ">
				<SidebarTrigger className="-ml-1" />
				<Separator orientation="vertical" className="mr-2  h-4" />
				<NavPath />
			</div>
			{/* Right hand side */}
			<div className="flex items-center gap-2">
				<UserMenu />
			</div>
		</header>
	);
}
