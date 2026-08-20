"use client";

import { useTheme } from "next-themes";
import { ChevronsUpDown, LogOut, Moon } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { trpc } from "@/trpc/react";

function getInitials(name?: string | null, email?: string | null) {
	const source = name?.trim() || email?.trim() || "";
	const parts = source.split(/[\s@._-]+/).filter(Boolean);
	if (parts.length >= 2) {
		return (parts[0][0] + parts[1][0]).toUpperCase();
	}
	return source.slice(0, 2).toUpperCase();
}

export function UserMenu(props: any) {
	const { data: user } = trpc.auth.me.useQuery();
	const { resolvedTheme, setTheme } = useTheme();

	const signOutMutation = trpc.auth.signOut.useMutation({
		onSuccess: () => {
			window.location.href = "/auth";
		},
	});

	const isDark = resolvedTheme === "dark";
	const name = user?.name ?? "User";
	const email = user?.email ?? "";
	const initials = getInitials(user?.name, user?.email);

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				render={
					<Button
						variant={"ghost"}
						className=" data-[state=open]:border-border  border-2 border-transparent"
					>
						<Avatar className="h-8 w-8">
							<AvatarImage src={undefined} alt={name} />
							<AvatarFallback>{initials}</AvatarFallback>
						</Avatar>
						<div className="max-sm:hidden grid flex-1 text-left text-sm leading-tight">
							<span className="truncate font-semibold">{name}</span>
							<span className="truncate text-xs">{email}</span>
						</div>
						<ChevronsUpDown className="max-sm:hidden ml-auto size-4" />
					</Button>
				}
			></DropdownMenuTrigger>
			<DropdownMenuContent
				className="bg-popover/95 w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
				side={"bottom"}
				align="end"
				sideOffset={4}
			>
				<DropdownMenuGroup>
					<DropdownMenuLabel className="p-0 font-normal">
						<div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
							<Avatar className="h-8 w-8 ">
								<AvatarImage src={undefined} alt={name} />
								<AvatarFallback>{initials}</AvatarFallback>
							</Avatar>
							<div className="grid flex-1 text-left text-sm leading-tight">
								<span className="truncate font-semibold">{name}</span>
								<span className="truncate text-xs">{email}</span>
							</div>
						</div>
					</DropdownMenuLabel>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />

				<DropdownMenuGroup>
					<div className="flex cursor-default items-center gap-2 rounded-none px-2 py-2 text-xs outline-hidden select-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4">
						<Moon />
						<span className="flex-1">Dark Mode</span>
						<Switch
							size={"sm"}
							checked={isDark}
							onCheckedChange={(checked) =>
								setTheme(checked ? "dark" : "light")
							}
						/>
					</div>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<DropdownMenuItem onClick={() => signOutMutation.mutate()}>
					<LogOut />
					Log out
				</DropdownMenuItem>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
