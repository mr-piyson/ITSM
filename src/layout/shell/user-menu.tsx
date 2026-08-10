"use client";

import { ChevronsUpDown, LogOut, Moon } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
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
import { trpc } from "@/trpc/react";

export function UserMenu(props: any) {
	const signOutMutation = trpc.auth.signOut.useMutation({
		onSuccess: () => {
			window.location.href = "/auth";
		},
	});

	return (
		<DropdownMenu>
			<DropdownMenuTrigger
				render={
					<Button
						variant={"ghost"}
						className=" data-[state=open]:border-border  border-2 border-transparent"
					>
						<Avatar className="h-8 w-8">
							<AvatarImage
							// src={account?.image ?? undefined}
							// alt={account?.name}
							/>
							<AvatarFallback>U</AvatarFallback>
						</Avatar>
						<div className="max-sm:hidden grid flex-1 text-left text-sm leading-tight">
							<span className="truncate font-semibold">Name</span>
							<span className="truncate text-xs">Email</span>
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
								<AvatarImage
									// src={account?.image ?? undefined}
									alt={"Name"}
								/>
								<AvatarFallback>{"name"}</AvatarFallback>
							</Avatar>
							<div className="grid flex-1 text-left text-sm leading-tight">
								<span className="truncate font-semibold">{"name"}</span>
								<span className="truncate text-xs">{"email"}</span>
							</div>
						</div>
					</DropdownMenuLabel>
				</DropdownMenuGroup>
				<DropdownMenuSeparator />

				<DropdownMenuGroup>
					<DropdownMenuItem>
						<Moon />
						Dark Mode
						<CommandShortcut></CommandShortcut>
					</DropdownMenuItem>
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
