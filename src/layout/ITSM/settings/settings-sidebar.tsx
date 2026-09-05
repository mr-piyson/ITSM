"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { SearchIcon } from "lucide-react";

import { routes } from "@/lib/routes";
import { cn } from "@/lib/utils";

export function SettingsSidebar() {
	const pathname = usePathname();
	const inputRef = useRef<HTMLInputElement>(null);
	const [query, setQuery] = useState("");
	const [activeIndex, setActiveIndex] = useState(-1);
	const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);

	const filtered = useMemo(() => {
		const items = routes.settings.filter(
			(r): r is (typeof routes.settings)[number] & { href: string } =>
				Boolean(r.href),
		);
		if (!query.trim()) return items;
		const q = query.toLowerCase();
		return items.filter(
			(r) =>
				r.title.toLowerCase().includes(q) ||
				r.description?.toLowerCase().includes(q),
		);
	}, [query]);

	useEffect(() => {
		setActiveIndex(-1);
	}, [query]);

	useEffect(() => {
		inputRef.current?.focus();
	}, []);

	const scrollToIndex = useCallback((index: number) => {
		itemRefs.current[index]?.scrollIntoView({ block: "nearest" });
	}, []);

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent<HTMLInputElement>) => {
			if (e.key === "ArrowDown") {
				e.preventDefault();
				setActiveIndex((prev) => {
					const next = Math.min(prev + 1, filtered.length - 1);
					scrollToIndex(next);
					return next;
				});
			} else if (e.key === "ArrowUp") {
				e.preventDefault();
				setActiveIndex((prev) => {
					const next = Math.max(prev - 1, 0);
					scrollToIndex(next);
					return next;
				});
			} else if (e.key === "Enter" && activeIndex >= 0) {
				e.preventDefault();
				const item = filtered[activeIndex];
				if (item?.href) {
					window.location.href = item.href;
				}
			} else if (e.key === "Escape") {
				setQuery("");
				setActiveIndex(-1);
				inputRef.current?.blur();
			}
		},
		[activeIndex, filtered, scrollToIndex],
	);

	return (
		<aside className="flex w-full shrink-0 flex-col border-b bg-muted/30 md:sticky md:top-0 md:max-h-[calc(100svh-3rem)] md:w-64 md:border-r md:border-b-0">
			<div className="border-b p-2">
				<div className="relative">
					<SearchIcon className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
					<input
						ref={inputRef}
						type="text"
						placeholder="Search settings…"
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						onKeyDown={handleKeyDown}
						className="h-9 w-full rounded-md border bg-background pl-8 pr-3 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
					/>
				</div>
			</div>
			<nav className="flex flex-1 gap-1 overflow-x-auto p-2 md:flex-col md:overflow-y-auto md:overflow-x-visible md:space-y-1">
				{filtered.map(({ title, href, icon: Icon, description }, index) => {
					const isActive = pathname === href;
					const isHighlighted = index === activeIndex;
					return (
						<Link
							key={href}
							ref={(el) => {
								itemRefs.current[index] = el;
							}}
							href={href}
							className={cn(
								"flex shrink-0 items-center gap-3 rounded-md px-3 py-2.5 transition-colors md:items-start",
								"text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground",
								isActive &&
									"bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground",
								isHighlighted &&
									!isActive &&
									"bg-accent text-accent-foreground",
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
				{filtered.length === 0 && (
					<p className="px-3 py-2 text-sm text-muted-foreground">
						No settings found.
					</p>
				)}
			</nav>
		</aside>
	);
}
