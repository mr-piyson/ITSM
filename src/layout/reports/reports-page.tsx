"use client";

import { BarChart3, Monitor, Printer, ShoppingCart } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

const REPORTS = [
	{
		title: "Assets Report",
		description:
			"Full asset inventory filtered by device status and asset types, with owner and location details.",
		href: "/app/reports/assets",
		icon: Monitor,
	},
	{
		title: "Printers Report",
		description:
			"Toner replacements and printer maintenance actions within a date range.",
		href: "/app/reports/printers",
		icon: Printer,
	},
	{
		title: "Stock Report",
		description:
			"Purchases and items provided to employees within a date range, with totals.",
		href: "/app/reports/stock",
		icon: ShoppingCart,
	},
];

export function ReportsPage() {
	return (
		<div className="flex h-full min-h-0 flex-col space-y-4 overflow-y-auto p-4 md:p-6">
			<div>
				<h1 className="text-xl font-semibold tracking-tight">Reports</h1>
				<p className="text-xs text-muted-foreground">
					Printable operational reports with CSV and PDF export.
				</p>
			</div>

			<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
				{REPORTS.map((report) => {
					const Icon = report.icon;
					return (
						<Button
							key={report.href}
							variant="outline"
							className="h-auto flex-col items-start gap-2 p-4 text-left"
							render={<Link href={report.href} />}
							nativeButton={false}
						>
							<span className="flex size-9 items-center justify-center border bg-muted/50">
								<Icon className="size-4 text-muted-foreground" />
							</span>
							<span className="text-sm font-semibold">{report.title}</span>
							<span className="text-xs font-normal text-muted-foreground">
								{report.description}
							</span>
						</Button>
					);
				})}
			</div>

			<p className="flex items-center gap-2 text-xs text-muted-foreground">
				<BarChart3 className="size-3.5" />
				Every report supports on-screen filtering, CSV export and PDF export.
			</p>
		</div>
	);
}
