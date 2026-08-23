"use client";

import {
	BarChart3,
	CalendarDays,
	ClipboardList,
	Database,
	FileSignature,
	PackageCheck,
	Printer,
	Server,
	ShoppingCart,
	Store,
	type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";

import { Button } from "@/components/ui/button";

const MODULES: Record<
	string,
	{ title: string; description: string; icon: LucideIcon }
> = {
	booking: {
		title: "Booking",
		description:
			"Reserve and manage asset bookings for employees. This module is coming soon.",
		icon: CalendarDays,
	},
	provide: {
		title: "Provide",
		description:
			"Track items provided to employees and manage provide requests. This module is coming soon.",
		icon: PackageCheck,
	},
	purchases: {
		title: "Purchases / Services",
		description:
			"Manage purchase orders, quotations, and service requests. This module is coming soon.",
		icon: ShoppingCart,
	},
	printers: {
		title: "Printers",
		description:
			"Manage printers, toner usage, and maintenance actions. This module is coming soon.",
		icon: Printer,
	},
	servers: {
		title: "Servers",
		description:
			"Track server inventory, maintenance schedules, and backup status. This module is coming soon.",
		icon: Server,
	},
	tapes: {
		title: "Backup Tapes",
		description:
			"Manage backup tapes, rotation, and retention. This module is coming soon.",
		icon: Database,
	},
	vendors: {
		title: "Vendors",
		description:
			"Manage vendor records, contacts, and purchase history. This module is coming soon.",
		icon: Store,
	},
	contracts: {
		title: "Contracts",
		description:
			"Track service contracts, renewal dates, and support agreements. This module is coming soon.",
		icon: FileSignature,
	},
	reports: {
		title: "Reports",
		description:
			"Generate and export stock, printer, and asset reports. This module is coming soon.",
		icon: BarChart3,
	},
	requests: {
		title: "Requests",
		description:
			"Manage change requests, approvals, and their replies. This module is coming soon.",
		icon: ClipboardList,
	},
};

export default function ModulePlaceholder() {
	const params = useParams<{ slug?: string | string[] }>();
	const rawSlug = params.slug;
	const slug = Array.isArray(rawSlug) ? rawSlug[0] : rawSlug;
	const module = slug ? MODULES[slug] : undefined;

	if (!module) {
		notFound();
	}

	const Icon = module.icon;

	return (
		<div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
			<div className="flex size-14 items-center justify-center border bg-muted/50">
				<Icon className="size-6 text-muted-foreground" />
			</div>
			<div className="flex flex-col gap-1">
				<h1 className="text-lg font-semibold tracking-tight">{module.title}</h1>
				<p className="max-w-sm text-xs text-muted-foreground">
					{module.description}
				</p>
			</div>
			<Button
				variant="outline"
				size="sm"
				render={<Link href="/app/dashboard" />}
				nativeButton={false}
			>
				Back to dashboard
			</Button>
		</div>
	);
}
