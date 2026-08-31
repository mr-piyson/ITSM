"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

export function SettingsSidebar() {
	const pathname = usePathname();

	return (
		<aside className="flex w-full shrink-0 flex-col border-b bg-muted/30 md:w-64 md:border-r md:border-b-0">
			<nav className="flex flex-1 gap-1 overflow-x-auto p-2 md:flex-col md:overflow-y-auto md:overflow-x-visible md:space-y-1">
				{routes.settings.map(({ title, href, icon: Icon, description }) => {
					if (!href) return null;
					const isActive = pathname === href;
					return (
						<Link
							key={href}
							href={href}
							className={cn(
								"flex shrink-0 items-center gap-3 rounded-md px-3 py-2.5 transition-colors md:items-start",
								"text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground",
								isActive &&
									"bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
							)}
						>
							<Icon className="mt-0.5 size-5 shrink-0" />
							<span className="flex min-w-0 flex-col">
								<span className="font-medium leading-none">{title}</span>
								{description && (
									<span className="mt-1 hidden text-xs opacity-80 md:block">
										{description}
									</span>
								)}
							</span>
						</Link>
					);
				})}
			</nav>
		</aside>
	);
}
