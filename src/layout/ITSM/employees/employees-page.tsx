"use client";

import { LayoutGrid, Loader2, Search, Table2 } from "lucide-react";
import { parseAsInteger, parseAsStringEnum, useQueryState } from "nuqs";
import { useMemo } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { EmployeeItem } from "@/server/routers/ITSM/employees";
import { trpc } from "@/trpc/react";

import { EmployeesGrid } from "./employees-grid";
import { EmployeesTable } from "./employees-table";

const VIEW_VALUES = ["table", "grid"] as const;
const TAB_VALUES = ["all", "staff", "worker"] as const;

type Tab = (typeof TAB_VALUES)[number];

export function EmployeesPage() {
	const { data: employees = [], isPending } = trpc.employees.list.useQuery();

	const [query, setQuery] = useQueryState("q", {
		defaultValue: "",
		history: "replace",
	});
	const [view, setView] = useQueryState(
		"view",
		parseAsStringEnum([...VIEW_VALUES])
			.withDefault("table")
			.withOptions({ history: "replace" }),
	);
	const [tab, setTab] = useQueryState(
		"tab",
		parseAsStringEnum([...TAB_VALUES])
			.withDefault("all")
			.withOptions({ history: "replace" }),
	);
	const [empID, setEmpID] = useQueryState("emp", parseAsInteger);

	const staffCount = useMemo(
		() => employees.filter((e) => e.staffType === "S").length,
		[employees],
	);

	const workerCount = useMemo(
		() => employees.filter((e) => e.staffType === "W").length,
		[employees],
	);

	const filtered = useMemo(() => {
		const q = query.trim().toLowerCase();
		return employees.filter((employee) => {
			if (tab === "staff" && employee.staffType !== "S") {
				return false;
			}
			if (tab === "worker" && employee.staffType !== "W") {
				return false;
			}
			if (!q) {
				return true;
			}
			return (
				employee.name?.toLowerCase().includes(q) ||
				employee.emplCode.toLowerCase().includes(q)
			);
		});
	}, [employees, query, tab]);

	return (
		<div className="flex h-full min-h-0 flex-col space-y-4 p-4 md:p-6">
			<div className="flex min-w-0 flex-col gap-4">
				<div className="flex flex-wrap items-center justify-between gap-3">
					<div>
						<h1 className="text-xl font-semibold tracking-tight">Employees</h1>
						<p className="text-xs text-muted-foreground">
							Employees ({isPending ? "…" : filtered.length})
						</p>
					</div>
					<div className="flex items-center gap-2">
						<div className="flex items-center overflow-hidden rounded-none border">
							<button
								type="button"
								onClick={() => setView("table")}
								title="Table view"
								className={cn(
									"flex size-8 items-center justify-center border-r transition-colors",
									view === "table"
										? "bg-primary text-primary-foreground"
										: "bg-background text-muted-foreground hover:bg-muted",
								)}
							>
								<Table2 className="size-4" />
							</button>
							<button
								type="button"
								onClick={() => setView("grid")}
								title="Grid view"
								className={cn(
									"flex size-8 items-center justify-center transition-colors",
									view === "grid"
										? "bg-primary text-primary-foreground"
										: "bg-background text-muted-foreground hover:bg-muted",
								)}
							>
								<LayoutGrid className="size-4" />
							</button>
						</div>
					</div>
				</div>

				<div className="flex min-w-0 flex-col gap-3">
					<div className="flex w-full max-w-lg items-center gap-2 rounded-none border bg-background px-2.5 transition-colors focus-within:border-ring focus-within:ring-1 focus-within:ring-ring/50">
						<Search
							data-icon="inline-start"
							className="size-4 shrink-0 text-muted-foreground"
						/>
						<Input
							type="search"
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							placeholder="Search by name or code…"
							className="h-8 border-0 pl-0 shadow-none focus-visible:ring-0"
						/>
					</div>

					<Tabs value={tab} onValueChange={(value) => setTab(value as Tab)}>
						<TabsList>
							<TabsTrigger value="all">All</TabsTrigger>
							<TabsTrigger value="staff">Staff ({staffCount})</TabsTrigger>
							<TabsTrigger value="worker">
								Worker ({workerCount})
							</TabsTrigger>
						</TabsList>
					</Tabs>
				</div>
			</div>

			{isPending ? (
				<div className="flex flex-1 items-center justify-center">
					<Loader2 className="size-6 animate-spin text-muted-foreground" />
				</div>
			) : filtered.length === 0 ? (
				<div className="flex flex-1 flex-col items-center justify-center gap-2 border border-dashed py-16 text-center">
					<p className="text-sm text-muted-foreground">No employees found</p>
				</div>
			) : view === "table" ? (
				<EmployeesTable employees={filtered} />
			) : (
				<EmployeesGrid employees={filtered} />
			)}
		</div>
	);
}
