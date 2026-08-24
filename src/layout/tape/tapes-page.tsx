"use client";

import {
	Database,
	LayoutGrid,
	Loader2,
	Plus,
	Search,
	Table2,
} from "lucide-react";
import { parseAsString, parseAsStringEnum, useQueryState } from "nuqs";
import { useEffect, useMemo, useState } from "react";

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
import { MONTHS, compareTapes, locationLabel } from "@/lib/tape-constants";
import { cn } from "@/lib/utils";
import type { TapeItem } from "@/server/routers/tapes";
import { trpc } from "@/trpc/react";

import { TapeDetailsDialog } from "./tape-details-dialog";
import { TapeFormDialog } from "./tape-form-dialog";
import { TapesGrid } from "./tapes-grid";
import { TapesTable } from "./tapes-table";

const VIEW_VALUES = ["table", "grid"] as const;

export function TapesPage() {
	const utils = trpc.useUtils();
	const { data: tapes = [], isPending } = trpc.tapes.list.useQuery();

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
	const [tapeIDParam, setTapeIDParam] = useQueryState("id", parseAsString);

	const [monthFilter, setMonthFilter] = useState<string>("All");
	const [formOpen, setFormOpen] = useState(false);
	const [editingTape, setEditingTape] = useState<TapeItem | null>(null);

	// Small screens start in grid view unless a view was already chosen.
	useEffect(() => {
		if (
			typeof window !== "undefined" &&
			!window.location.search.includes("view=") &&
			window.matchMedia("(max-width: 767px)").matches
		) {
			setView("grid");
		}
	}, [setView]);

	const sorted = useMemo(() => [...tapes].sort(compareTapes), [tapes]);

	const filtered = useMemo(() => {
		const q = query.trim().toLowerCase();
		return sorted.filter((tape) => {
			if (monthFilter !== "All" && tape.month !== monthFilter) {
				return false;
			}
			if (!q) {
				return true;
			}
			const parts = [
				tape.tapeID,
				locationLabel(tape.location),
				tape.month,
				tape.year,
				tape.sequenceNum,
				tape.status,
				tape.free,
			];
			return parts
				.filter(Boolean)
				.some((part) => String(part).toLowerCase().includes(q));
		});
	}, [sorted, query, monthFilter]);

	const openAdd = () => {
		setEditingTape(null);
		setFormOpen(true);
	};

	const openEdit = (tape: TapeItem) => {
		setEditingTape(tape);
		setFormOpen(true);
	};

	const closeDetails = () => setTapeIDParam(null, { history: "replace" });

	const handleFormSuccess = () => {
		setFormOpen(false);
		setEditingTape(null);
		utils.tapes.list.invalidate();
	};

	const detailsTape = useMemo(
		() => filtered.find((t) => String(t.id) === tapeIDParam) ?? null,
		[filtered, tapeIDParam],
	);

	const handleFormatted = () => {
		closeDetails();
		utils.tapes.list.invalidate();
	};

	const handleDeleted = () => {
		closeDetails();
		utils.tapes.list.invalidate();
	};

	return (
		<div className="flex h-full min-h-0 flex-col space-y-4 p-4 md:p-6">
			<div className="flex min-w-0 flex-col gap-4">
				<div className="flex flex-wrap items-center justify-between gap-3">
					<div>
						<h1 className="text-xl font-semibold tracking-tight">
							Backup Tapes
						</h1>
						<p className="text-xs text-muted-foreground">
							Tapes ({isPending ? "…" : filtered.length})
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
							Add Tape
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
						placeholder="Search by ID, location, period…"
						className="h-9 pl-8"
					/>
				</div>

				<div
					className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1"
					role="group"
					aria-label="Filter by month"
				>
					{["All", ...MONTHS].map((month) => (
						<button
							key={month}
							type="button"
							aria-pressed={monthFilter === month}
							onClick={() => setMonthFilter(month)}
							className={cn(
								"shrink-0 whitespace-nowrap rounded-none border px-2.5 py-1 text-xs font-medium transition-colors",
								monthFilter === month
									? "border-primary bg-primary text-primary-foreground"
									: "bg-background text-muted-foreground hover:bg-muted",
							)}
						>
							{month}
						</button>
					))}
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
							<Database />
						</EmptyMedia>
						<EmptyTitle>
							{tapes.length === 0 ? "No tapes yet" : "No tapes found"}
						</EmptyTitle>
						<EmptyDescription>
							{tapes.length === 0
								? "Add your first backup tape to start tracking rotations."
								: "Try adjusting your search or month filter."}
						</EmptyDescription>
					</EmptyHeader>
					<EmptyContent>
						{tapes.length === 0 && (
							<Button size="sm" onClick={openAdd}>
								<Plus data-icon="inline-start" />
								Add the first tape
							</Button>
						)}
					</EmptyContent>
				</Empty>
			) : view === "table" ? (
				<TapesTable
					tapes={filtered}
					onDetails={(tape) => setTapeIDParam(String(tape.id))}
					onEdit={openEdit}
				/>
			) : (
				<TapesGrid
					tapes={filtered}
					onDetails={(tape) => setTapeIDParam(String(tape.id))}
					onEdit={openEdit}
				/>
			)}

			<TapeFormDialog
				open={formOpen}
				onOpenChange={setFormOpen}
				tape={editingTape}
				onSuccess={handleFormSuccess}
			/>

			<TapeDetailsDialog
				tape={detailsTape}
				onOpenChange={(tape) =>
					setTapeIDParam(tape?.id ? String(tape.id) : null, {
						history: "replace",
					})
				}
				onEdit={() => {
					if (detailsTape) {
						closeDetails();
						openEdit(detailsTape);
					}
				}}
				onFormatted={handleFormatted}
				onDeleted={handleDeleted}
			/>
		</div>
	);
}
