"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import {
	Sidebar,
	SidebarContent,
	SidebarHeader,
	SidebarProvider,
	SidebarRail,
} from "@/components/ui/sidebar";
import { trpc } from "@/trpc/react";

import { AppSidebarContent } from "./app-sidebar-content";
import { TeamSwitcher } from "./team-switcher";
import Toolbar from "./toolbar";

interface AppShellProps {
	children: React.ReactNode;
}

export default function AppShell(props: AppShellProps) {
	const router = useRouter();
	const { data: user, isPending } = trpc.auth.me.useQuery();

	useEffect(() => {
		if (!isPending && !user) {
			router.replace("/auth");
		}
	}, [isPending, user, router]);

	if (isPending) {
		return (
			<div className="flex h-screen items-center justify-center">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
			</div>
		);
	}

	return (
		<SidebarProvider className="flex h-svh overflow-hidden">
			<AppSidebar />
			<div className="relative flex min-h-0 flex-1 flex-col">
				<Toolbar className="sticky top-0 z-10" />
				<div className="relative min-h-0 flex-1 overflow-auto">{props.children}</div>
			</div>
		</SidebarProvider>
	);
}

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
