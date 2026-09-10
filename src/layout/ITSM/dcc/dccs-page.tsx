"use client";

import {
	Activity,
	Loader2,
	Plus,
	RadioTower,
	Search,
	Siren,
	Table2,
	LayoutGrid,
	Wifi,
	WifiOff,
} from "lucide-react";
import { parseAsString, useQueryState } from "nuqs";
import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
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
import type { DccItem } from "@/server/routers/ITSM/dccs";
import { trpc } from "@/trpc/react";

import { DccDetailsDialog } from "./dcc-details-dialog";
import { DccFormDialog } from "./dcc-form-dialog";
import { DccRealtimeGrid } from "./dcc-realtime-dashboard";
import { DccsTable } from "./dccs-table";
import { useDccRealtime, PollingControls } from "./use-dcc-realtime";

function StatCard({
	label,
	value,
	icon,
	accent,
}: {
	label: string;
	value: string | number;
	icon: React.ReactNode;
	accent?: string;
}) {
	return (
		<Card>
			<CardHeader>
				<CardDescription>{label}</CardDescription>
				<CardTitle className="flex items-center gap-2 text-2xl">
					<span className={cn("text-primary", accent)}>{icon}</span>
					{value}
				</CardTitle>
			</CardHeader>
		</Card>
	);
}

export function DccsPage() {
	const {
		dccs,
		dashboard,
		isPending,
		pollingEnabled,
		setPollingEnabled,
		intervalMs,
		setIntervalMs,
		countdown,
		lastChecked,
		isChecking,
		checkNow,
		invalidate,
	} = useDccRealtime();

	const [query, setQuery] = useQueryState("q", {
		defaultValue: "",
		history: "replace",
	});
	const [dccID, setDccID] = useQueryState("id", parseAsString);
	const [view, setView] = useQueryState("view", {
		defaultValue: "table",
		history: "replace",
	});
	const activeView = view === "realtime" ? "realtime" : "table";

	const [formOpen, setFormOpen] = useState(false);
	const [editingDcc, setEditingDcc] = useState<DccItem | null>(null);

	const detailsDcc = useMemo(
		() => dccs.find((d) => String(d.id) === dccID) ?? null,
		[dccs, dccID],
	);

	const filtered = useMemo(() => {
		const q = query.trim().toLowerCase();
		if (!q) {
			return dccs;
		}
		return dccs.filter((dcc) => {
			const parts = [
				dcc.name,
				dcc.dccCode,
				dcc.ipAddress,
				dcc.cardReaderIp,
				dcc.screenInch,
			];
			return parts
				.filter(Boolean)
				.some((part) => String(part).toLowerCase().includes(q));
		});
	}, [dccs, query]);

	const openAdd = () => {
		setEditingDcc(null);
		setFormOpen(true);
	};

	const openEdit = (dcc: DccItem) => {
		setEditingDcc(dcc);
		setFormOpen(true);
	};

	const handleFormSuccess = () => {
		setFormOpen(false);
		setEditingDcc(null);
		invalidate();
	};

	const closeDetails = () => setDccID(null, { history: "replace" });

	const handleDeleted = () => {
		closeDetails();
		invalidate();
	};

	return (
		<div className="flex h-full min-h-0 flex-col space-y-4 p-4 md:p-6">
			<div className="flex min-w-0 flex-col gap-4">
				<div className="flex flex-wrap items-center justify-between gap-3">
					<div>
						<h1 className="text-xl font-semibold tracking-tight">DCCs</h1>
						<p className="text-xs text-muted-foreground">
							Raspberry Pi card reader stations (
							{isPending ? "…" : filtered.length})
						</p>
					</div>
					<div className="flex items-center gap-2">
						<div className="flex items-center border">
							<Button
								size="sm"
								variant={activeView === "table" ? "default" : "ghost"}
								className="h-8 rounded-none px-2.5 text-xs"
								onClick={() => setView("table")}
							>
								<Table2 className="size-3.5" />
								Table
							</Button>
							<Button
								size="sm"
								variant={activeView === "realtime" ? "default" : "ghost"}
								className="h-8 rounded-none px-2.5 text-xs"
								onClick={() => setView("realtime")}
							>
								<LayoutGrid className="size-3.5" />
								Realtime
							</Button>
						</div>
						<Button onClick={openAdd} size="default">
							<Plus data-icon="inline-start" />
							Add DCC
						</Button>
					</div>
				</div>

				{/* Dashboard stats */}
				<div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
					<StatCard
						label="Total DCCs"
						value={dashboard?.total ?? "…"}
						icon={<RadioTower className="size-5" />}
					/>
					<StatCard
						label="Connected"
						value={dashboard?.connected ?? "…"}
						icon={<Wifi className="size-5" />}
						accent="text-green-600"
					/>
					<StatCard
						label="Disconnected"
						value={dashboard?.disconnected ?? "…"}
						icon={<WifiOff className="size-5" />}
						accent="text-red-600"
					/>
					<StatCard
						label="Not checked yet"
						value={dashboard?.unchecked ?? "…"}
						icon={<Siren className="size-5" />}
					/>
				</div>

				{/* Polling controls */}
				<PollingControls
					pollingEnabled={pollingEnabled}
					setPollingEnabled={setPollingEnabled}
					intervalMs={intervalMs}
					setIntervalMs={setIntervalMs}
					countdown={countdown}
					lastChecked={lastChecked}
					isChecking={isChecking}
					checkNow={checkNow}
				/>

				{activeView === "table" && (
					<div className="relative w-full max-w-lg">
						<Search
							data-icon="inline-start"
							className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
						/>
						<Input
							type="search"
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							placeholder="Search by name, code, IP…"
							className="h-9 pl-8"
						/>
					</div>
				)}
			</div>

			{activeView === "table" ? (
				isPending ? (
					<div className="flex flex-1 items-center justify-center">
						<Loader2 className="size-6 animate-spin text-muted-foreground" />
					</div>
				) : filtered.length === 0 ? (
					<Empty className="flex-1 border">
						<EmptyHeader>
							<EmptyMedia variant="icon">
								<RadioTower />
							</EmptyMedia>
							<EmptyTitle>
								{dccs.length === 0 ? "No DCCs yet" : "No DCCs found"}
							</EmptyTitle>
							<EmptyDescription>
								{dccs.length === 0
									? "Add your first DCC station to begin monitoring connectivity."
									: "Try adjusting your search."}
							</EmptyDescription>
						</EmptyHeader>
						<EmptyContent>
							{dccs.length === 0 && (
								<Button size="sm" onClick={openAdd}>
									<Plus data-icon="inline-start" />
									Add the first DCC
								</Button>
							)}
						</EmptyContent>
					</Empty>
				) : (
					<DccsTable
						dccs={filtered}
						onDetails={(dcc) => setDccID(String(dcc.id))}
						onEdit={openEdit}
					/>
				)
			) : (
				<div className="min-h-0 flex-1 overflow-y-auto">
					<DccRealtimeGrid
						dccs={dccs}
						isPending={isPending}
						onCardClick={(dcc) => setDccID(String(dcc.id))}
					/>
				</div>
			)}

			<DccFormDialog
				open={formOpen}
				onOpenChange={setFormOpen}
				dcc={editingDcc}
				onSuccess={handleFormSuccess}
			/>

			<DccDetailsDialog
				dcc={detailsDcc}
				onOpenChange={(d) =>
					setDccID(d?.id ? String(d.id) : null, { history: "replace" })
				}
				onEdit={() => {
					if (detailsDcc) {
						closeDetails();
						setEditingDcc(detailsDcc);
						setFormOpen(true);
					}
				}}
				onDeleted={handleDeleted}
			/>
		</div>
	);
}
