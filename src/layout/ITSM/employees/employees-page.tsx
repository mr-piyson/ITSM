"use client";

import { AlertCircle, FilterX, Loader2, Search, X } from "lucide-react";
import { useQueryState } from "nuqs";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { trpc } from "@/trpc/react";
import {
	filterModelParser,
	employeeMatchesFilters,
} from "@/lib/employees-filters";
import { AzureSummariesProvider } from "@/hooks/use-azure-summaries";

import { EmployeesTable } from "./employees-table";

const SEARCH_DEBOUNCE_MS = 250;

export function EmployeesPage() {
	const router = useRouter();
	const {
		data: employees = [],
		isPending,
		isError,
		refetch,
	} = trpc.employees.list.useQuery();

	const [query, setQuery] = useQueryState("q", {
		defaultValue: "",
		history: "replace",
	});
	const [filterModel, setFilterModel] = useQueryState(
		"filters",
		filterModelParser,
	);

	// Local input state keeps typing instant; the URL/filtering updates debounced.
	const [input, setInput] = useState(query);
	const searchRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		if (input === query) return;
		const t = setTimeout(() => setQuery(input || null), SEARCH_DEBOUNCE_MS);
		return () => clearTimeout(t);
	}, [input, query, setQuery]);

	// Reflect external query changes (back/forward, clear all).
	useEffect(() => {
		setInput(query);
	}, [query]);

	// "/" focuses search, like most admin tools.
	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			const el = e.target as HTMLElement | null;
			const typing =
				el?.tagName === "INPUT" ||
				el?.tagName === "TEXTAREA" ||
				el?.isContentEditable;
			if (e.key === "/" && !typing && !e.metaKey && !e.ctrlKey) {
				e.preventDefault();
				searchRef.current?.focus();
			}
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, []);

	const filtered = useMemo(() => {
		const q = query.trim().toLowerCase();
		let list = employees;
		if (q) {
			list = list.filter(
				(e) =>
					e.name?.toLowerCase().includes(q) ||
					e.emplCode.toLowerCase().includes(q) ||
					e.email?.toLowerCase().includes(q),
			);
		}
		return list.filter((e) => employeeMatchesFilters(e, filterModel));
	}, [employees, query, filterModel]);

	const activeFilterCount = filterModel ? Object.keys(filterModel).length : 0;
	const hasActiveFilters = query.trim() !== "" || activeFilterCount > 0;

	const handleView = useCallback(
		(emplCode: string) => {
			router.push(`/app/employees/${encodeURIComponent(emplCode)}`);
		},
		[router],
	);

	const clearAll = () => {
		setInput("");
		setQuery(null);
		setFilterModel(null);
	};

	return (
		<AzureSummariesProvider>
			<div className="flex h-full min-h-0 flex-col space-y-4 p-4 md:p-6">
				<div className="flex min-w-0 flex-col gap-4">
					<div className="flex flex-wrap items-center justify-between gap-3">
						<div>
							<h1 className="text-xl font-semibold tracking-tight">
								Employees
							</h1>
							<p className="text-xs text-muted-foreground" aria-live="polite">
								{isPending
									? "Loading…"
									: hasActiveFilters
										? `${filtered.length} of ${employees.length} employees`
										: `${employees.length} employees`}
							</p>
						</div>
					</div>

					<div className="flex flex-wrap items-center gap-2">
						<div
							role="search"
							className="flex w-full max-w-lg items-center gap-2 rounded-none border bg-background px-2.5 transition-colors focus-within:border-ring focus-within:ring-1 focus-within:ring-ring/50"
						>
							<Search
								aria-hidden
								className="size-4 shrink-0 text-muted-foreground"
							/>
							<Input
								ref={searchRef}
								type="search"
								value={input}
								onChange={(e) => setInput(e.target.value)}
								onKeyDown={(e) => {
									if (e.key === "Escape") {
										setInput("");
										setQuery(null);
									}
								}}
								aria-label="Search employees"
								placeholder="Search name, code or email…  ( / )"
								className="h-8 border-0 pl-0 shadow-none focus-visible:ring-0 [&::-webkit-search-cancel-button]:hidden"
							/>
							{input && (
								<button
									type="button"
									aria-label="Clear search"
									onClick={() => {
										setInput("");
										setQuery(null);
										searchRef.current?.focus();
									}}
									className="text-muted-foreground hover:text-foreground"
								>
									<X className="size-4" />
								</button>
							)}
						</div>

						{hasActiveFilters && (
							<Button variant="outline" size="sm" onClick={clearAll}>
								<FilterX />
								Clear
								{activeFilterCount > 0
									? ` (${activeFilterCount} column filter${activeFilterCount > 1 ? "s" : ""})`
									: " search"}
							</Button>
						)}
					</div>
				</div>

				{isPending ? (
					<div
						className="flex flex-1 items-center justify-center"
						role="status"
						aria-label="Loading employees"
					>
						<Loader2 className="size-6 animate-spin text-muted-foreground" />
					</div>
				) : isError ? (
					<div className="flex flex-1 flex-col items-center justify-center gap-3 border border-dashed py-16 text-center">
						<AlertCircle className="size-6 text-destructive" />
						<p className="text-sm text-muted-foreground">
							Couldn&apos;t load employees.
						</p>
						<Button variant="outline" size="sm" onClick={() => refetch()}>
							Try again
						</Button>
					</div>
				) : filtered.length === 0 ? (
					<div className="flex flex-1 flex-col items-center justify-center gap-3 border border-dashed py-16 text-center">
						<p className="text-sm text-muted-foreground">
							{hasActiveFilters
								? "No employees match your search or filters."
								: "No employees found."}
						</p>
						{hasActiveFilters && (
							<Button variant="outline" size="sm" onClick={clearAll}>
								<FilterX />
								Clear search &amp; filters
							</Button>
						)}
					</div>
				) : (
					<EmployeesTable
						employees={filtered}
						onView={handleView}
						filterModel={filterModel}
						onFilterModelChange={setFilterModel}
					/>
				)}
			</div>
		</AzureSummariesProvider>
	);
}
