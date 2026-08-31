"use client";

import { Boxes, Monitor, Plus, Printer, type LucideIcon } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

type QuickAction = {
	label: string;
	description: string;
	href: string;
	icon: LucideIcon;
};

const ACTIONS: QuickAction[] = [
	{
		label: "Add Asset",
		description: "Register a new device",
		href: "/app/assets",
		icon: Monitor,
	},
	{
		label: "Add Printer",
		description: "Register a new printer",
		href: "/app/printers",
		icon: Printer,
	},
	{
		label: "Add Item",
		description: "Add stock to inventory",
		href: "/app/stock",
		icon: Boxes,
	},
];

export function QuickActions() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Quick actions</CardTitle>
				<CardDescription>Common tasks to get started</CardDescription>
			</CardHeader>
			<CardContent className="grid gap-2 sm:grid-cols-3">
				{ACTIONS.map(({ label, description, href, icon: Icon }) => (
					<Button
						key={label}
						variant="outline"
						className="h-auto flex-col items-start gap-1 px-3 py-2.5"
						render={<Link href={href} />}
						nativeButton={false}
					>
						<span className="flex items-center gap-1.5 font-medium">
							<Plus data-icon="inline-start" className="size-3.5" />
							<Icon className="size-3.5" />
							{label}
						</span>
						<span className="text-muted-foreground">{description}</span>
					</Button>
				))}
			</CardContent>
		</Card>
	);
}
