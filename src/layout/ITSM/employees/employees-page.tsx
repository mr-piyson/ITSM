"use client";

import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { LayoutGrid, Loader2, Plus, Power, Search, Table2 } from "lucide-react";
import { parseAsInteger, parseAsStringEnum, useQueryState } from "nuqs";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { EmployeeItem } from "@/server/routers/ITSM/employees";
import { trpc } from "@/trpc/react";

import { EmployeeDetailsDialog } from "./employee-details-dialog";
import { EmployeeFormDialog } from "./employee-form";
import { EmployeesGrid } from "./employees-grid";
import { EmployeesTable } from "./employees-table";

const VIEW_VALUES = ["table", "grid"] as const;
const TAB_VALUES = ["all", "staff", "nonstaff"] as const;

type Tab = (typeof TAB_VALUES)[number];

export function EmployeesPage() {
	const utils = trpc.useUtils();
	const { data: employees = [], isPending } = trpc.employees.list.useQuery();
	const deactivateMutation = trpc.employees.deactivate.useMutation();

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

	const [formOpen, setFormOpen] = useState(false);
	const [editingEmployee, setEditingEmployee] = useState<EmployeeItem | null>(
		null,
	);
	const [deactivateTarget, setDeactivateTarget] = useState<EmployeeItem | null>(
		null,
	);

	const staffCount = useMemo(
		() => employees.filter((employee) => employee.empID <= 100000).length,
		[employees],
	);

	const detailsEmployee = useMemo(
		() => employees.find((employee) => employee.empID === empID) ?? null,
		[employees, empID],
	);

	const filtered = useMemo(() => {
		const q = query.trim().toLowerCase();
		return employees.filter((employee) => {
			if (tab === "staff" && employee.empID > 100000) {
				return false;
			}
			if (tab === "nonstaff" && employee.empID <= 100000) {
				return false;
			}
			if (!q) {
				return true;
			}
			return (
				employee.name.toLowerCase().includes(q) ||
				String(employee.empID).includes(q)
			);
		});
	}, [employees, query, tab]);

	const openAdd = () => {
		setEditingEmployee(null);
		setFormOpen(true);
	};

	const openEdit = (employee: EmployeeItem) => {
		setEditingEmployee(employee);
		setFormOpen(true);
	};

	const handleFormSuccess = () => {
		setFormOpen(false);
		setEditingEmployee(null);
		utils.employees.list.invalidate();
		utils.employees.details.invalidate();
	};

	const handleDetailsOffice365Updated = () => {
		utils.employees.details.invalidate();
	};

	const handleDeactivate = async () => {
		if (!deactivateTarget) {
			return;
		}
		try {
			await deactivateMutation.mutateAsync({
				empID: deactivateTarget.empID,
			});
			toast.success("Employee deactivated");
			setDeactivateTarget(null);
			if (deactivateTarget.empID === empID) {
				setEmpID(null, { history: "replace" });
			}
			utils.employees.list.invalidate();
			utils.employees.details.invalidate();
		} catch (error) {
			toast.error(
				error instanceof Error
					? error.message
					: "Failed to deactivate employee",
			);
		}
	};

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
						<Button onClick={openAdd} size="default">
							<Plus data-icon="inline-start" />
							Add Employee
						</Button>
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
							placeholder="Search by name or ID…"
							className="h-8 border-0 pl-0 shadow-none focus-visible:ring-0"
						/>
					</div>

					<Tabs value={tab} onValueChange={(value) => setTab(value as Tab)}>
						<TabsList>
							<TabsTrigger value="all">All</TabsTrigger>
							<TabsTrigger value="staff">Staff ({staffCount})</TabsTrigger>
							<TabsTrigger value="nonstaff">
								nonStaff ({employees.length - staffCount})
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
					<Button variant="outline" size="sm" onClick={openAdd}>
						<Plus data-icon="inline-start" />
						Add the first employee
					</Button>
				</div>
			) : view === "table" ? (
				<EmployeesTable
					employees={filtered}
					onDetails={(employee) => setEmpID(employee.empID)}
					onEdit={openEdit}
					onDeactivate={setDeactivateTarget}
				/>
			) : (
				<EmployeesGrid
					employees={filtered}
					onDetails={(employee) => setEmpID(employee.empID)}
					onEdit={openEdit}
					onDeactivate={setDeactivateTarget}
				/>
			)}

			<EmployeeFormDialog
				open={formOpen}
				onOpenChange={setFormOpen}
				employee={editingEmployee}
				onSuccess={handleFormSuccess}
			/>

			<EmployeeDetailsDialog
				employee={detailsEmployee}
				onOpenChange={(employee) =>
					setEmpID(employee?.empID ?? null, { history: "replace" })
				}
				onEdit={() => {
					if (detailsEmployee) {
						setEmpID(null, { history: "replace" });
						setEditingEmployee(detailsEmployee);
						setFormOpen(true);
					}
				}}
				onDeactivate={setDeactivateTarget}
				onOffice365Updated={handleDetailsOffice365Updated}
			/>

			<AlertDialog
				open={!!deactivateTarget}
				onOpenChange={(open) => {
					if (!open) {
						setDeactivateTarget(null);
					}
				}}
			>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Deactivate this employee?</AlertDialogTitle>
						<AlertDialogDescription>
							This will remove <strong>{deactivateTarget?.name}</strong> (ID:{" "}
							{deactivateTarget?.empID}) from the active employee list. The
							action can be reviewed in the change logs.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Cancel</AlertDialogCancel>
						<AlertDialogAction
							variant="destructive"
							disabled={deactivateMutation.isPending}
							onClick={handleDeactivate}
						>
							{deactivateMutation.isPending ? (
								<Loader2 className="animate-spin" />
							) : (
								<Power data-icon="inline-start" />
							)}
							Deactivate
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	);
}
