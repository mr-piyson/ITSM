"use client";

import {
	LayoutGrid,
	Loader2,
	Plus,
	Printer,
	Search,
	Table2,
} from "lucide-react";
import { parseAsString, parseAsStringEnum, useQueryState } from "nuqs";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
	Empty,
	EmptyContent,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { PrinterItem } from "@/server/routers/printers";
import { trpc } from "@/trpc/react";

import { PrinterActionDialog } from "./printer-action-dialog";
import { PrinterDetailsDialog } from "./printer-details-dialog";
import { PrinterFormDialog } from "./printer-form-dialog";
import { PrintersGrid } from "./printers-grid";
import { PrintersTable } from "./printers-table";

const VIEW_VALUES = ["table", "grid"] as const;

export function PrintersPage() {
	const utils = trpc.useUtils();
	const { data: printers = [], isPending } = trpc.printers.list.useQuery();

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
	const [printerID, setPrinterID] = useQueryState("id", parseAsString);

	const [formOpen, setFormOpen] = useState(false);
	const [editingPrinter, setEditingPrinter] = useState<PrinterItem | null>(
		null,
	);
	const [actionOpen, setActionOpen] = useState(false);

	const detailsPrinter = useMemo(
		() => printers.find((p) => String(p.id) === printerID) ?? null,
		[printers, printerID],
	);

	const filtered = useMemo(() => {
		const q = query.trim().toLowerCase();
		if (!q) {
			return printers;
		}
		return printers.filter((printer) => {
			const parts = [
				printer.name,
				printer.location,
				printer.usedBy,
				printer.department,
			];
			return parts
				.filter(Boolean)
				.some((part) => String(part).toLowerCase().includes(q));
		});
	}, [printers, query]);

	const openAdd = () => {
		setEditingPrinter(null);
		setFormOpen(true);
	};

	const openEdit = (printer: PrinterItem) => {
		setEditingPrinter(printer);
		setFormOpen(true);
	};

	const handleFormSuccess = () => {
		setFormOpen(false);
		setEditingPrinter(null);
		utils.printers.list.invalidate();
		utils.printers.byId.invalidate();
	};

	const closeDetails = () => setPrinterID(null, { history: "replace" });

	const handleDeleted = () => {
		closeDetails();
		utils.printers.list.invalidate();
		utils.printers.byId.invalidate();
	};

	const handleActionSuccess = () => {
		setActionOpen(false);
		utils.printers.byId.invalidate();
		utils.printers.list.invalidate();
	};

	return (
		<div className="flex h-full min-h-0 flex-col space-y-4 p-4 md:p-6">
			<div className="flex min-w-0 flex-col gap-4">
				<div className="flex flex-wrap items-center justify-between gap-3">
					<div>
						<h1 className="text-xl font-semibold tracking-tight">Printers</h1>
						<p className="text-xs text-muted-foreground">
							Printers ({isPending ? "…" : filtered.length})
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
							Add Printer
						</Button>
					</div>
				</div>

				<div className="relative w-full max-w-lg">
					<Search
						data-icon="inline-start"
						className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
					/>
					<Input
						type="search"
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						placeholder="Search by name, location, used by…"
						className="h-9 pl-8"
					/>
				</div>
			</div>

			{isPending ? (
				<div className="flex flex-1 items-center justify-center">
					<Loader2 className="size-6 animate-spin text-muted-foreground" />
				</div>
			) : filtered.length === 0 ? (
				<Empty className="flex-1 border">
					<EmptyHeader>
						<EmptyMedia variant="icon">
							<Printer />
						</EmptyMedia>
						<EmptyTitle>
							{printers.length === 0 ? "No printers yet" : "No printers found"}
						</EmptyTitle>
						<EmptyDescription>
							{printers.length === 0
								? "Add your first printer to the inventory."
								: "Try adjusting your search."}
						</EmptyDescription>
					</EmptyHeader>
					<EmptyContent>
						{printers.length === 0 && (
							<Button size="sm" onClick={openAdd}>
								<Plus data-icon="inline-start" />
								Add the first printer
							</Button>
						)}
					</EmptyContent>
				</Empty>
			) : view === "table" ? (
				<PrintersTable
					printers={filtered}
					onDetails={(printer) => setPrinterID(String(printer.id))}
					onEdit={openEdit}
				/>
			) : (
				<PrintersGrid
					printers={filtered}
					onDetails={(printer) => setPrinterID(String(printer.id))}
					onEdit={openEdit}
				/>
			)}

			<PrinterFormDialog
				open={formOpen}
				onOpenChange={setFormOpen}
				printer={editingPrinter}
				onSuccess={handleFormSuccess}
			/>

			<PrinterDetailsDialog
				printer={detailsPrinter}
				onOpenChange={(printer) =>
					setPrinterID(printer?.id ? String(printer.id) : null, {
						history: "replace",
					})
				}
				onEdit={() => {
					if (detailsPrinter) {
						closeDetails();
						setEditingPrinter(detailsPrinter);
						setFormOpen(true);
					}
				}}
				onAction={() => {
					setActionOpen(true);
				}}
				onDeleted={handleDeleted}
			/>

			<PrinterActionDialog
				open={actionOpen}
				onOpenChange={setActionOpen}
				printer={detailsPrinter}
				onSuccess={handleActionSuccess}
			/>
		</div>
	);
}
