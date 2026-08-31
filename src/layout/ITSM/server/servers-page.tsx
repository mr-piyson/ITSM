"use client";

import {
	LayoutGrid,
	Loader2,
	Plus,
	Search,
	Server,
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
import type { ServerItem } from "@/server/routers/ITSM/servers";
import { trpc } from "@/trpc/react";

import { ServerActionDialog } from "./server-action-dialog";
import { ServerDetailsDialog } from "./server-details-dialog";
import { ServerFormDialog } from "./server-form-dialog";
import { ServersGrid } from "./servers-grid";
import { ServersTable } from "./servers-table";

const VIEW_VALUES = ["table", "grid"] as const;

export function ServersPage() {
	const utils = trpc.useUtils();
	const { data: servers = [], isPending } = trpc.servers.list.useQuery();

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
	const [serverID, setServerID] = useQueryState("id", parseAsString);

	const [formOpen, setFormOpen] = useState(false);
	const [editingServer, setEditingServer] = useState<ServerItem | null>(null);
	const [actionOpen, setActionOpen] = useState(false);

	const detailsServer = useMemo(
		() => servers.find((s) => String(s.id) === serverID) ?? null,
		[servers, serverID],
	);

	const filtered = useMemo(() => {
		const q = query.trim().toLowerCase();
		if (!q) {
			return servers;
		}
		return servers.filter((server) => {
			const parts = [
				server.name,
				server.type,
				server.os,
				server.hostIP,
				server.serverIP,
				server.host,
			];
			return parts
				.filter(Boolean)
				.some((part) => String(part).toLowerCase().includes(q));
		});
	}, [servers, query]);

	const openAdd = () => {
		setEditingServer(null);
		setFormOpen(true);
	};

	const openEdit = (server: ServerItem) => {
		setEditingServer(server);
		setFormOpen(true);
	};

	const handleFormSuccess = () => {
		setFormOpen(false);
		setEditingServer(null);
		utils.servers.list.invalidate();
		utils.servers.byId.invalidate();
	};

	const closeDetails = () => setServerID(null, { history: "replace" });

	const handleDeleted = () => {
		closeDetails();
		utils.servers.list.invalidate();
		utils.servers.byId.invalidate();
	};

	const handleActionSuccess = () => {
		setActionOpen(false);
		utils.servers.byId.invalidate();
		utils.servers.list.invalidate();
	};

	return (
		<div className="flex h-full min-h-0 flex-col space-y-4 p-4 md:p-6">
			<div className="flex min-w-0 flex-col gap-4">
				<div className="flex flex-wrap items-center justify-between gap-3">
					<div>
						<h1 className="text-xl font-semibold tracking-tight">Servers</h1>
						<p className="text-xs text-muted-foreground">
							Servers ({isPending ? "…" : filtered.length})
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
							Add Server
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
						placeholder="Search by name, IP, OS, type…"
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
							<Server />
						</EmptyMedia>
						<EmptyTitle>
							{servers.length === 0 ? "No servers yet" : "No servers found"}
						</EmptyTitle>
						<EmptyDescription>
							{servers.length === 0
								? "Add your first server to the inventory."
								: "Try adjusting your search."}
						</EmptyDescription>
					</EmptyHeader>
					<EmptyContent>
						{servers.length === 0 && (
							<Button size="sm" onClick={openAdd}>
								<Plus data-icon="inline-start" />
								Add the first server
							</Button>
						)}
					</EmptyContent>
				</Empty>
			) : view === "table" ? (
				<ServersTable
					servers={filtered}
					onDetails={(server) => setServerID(String(server.id))}
					onEdit={openEdit}
				/>
			) : (
				<ServersGrid
					servers={filtered}
					onDetails={(server) => setServerID(String(server.id))}
					onEdit={openEdit}
				/>
			)}

			<ServerFormDialog
				open={formOpen}
				onOpenChange={setFormOpen}
				server={editingServer}
				onSuccess={handleFormSuccess}
			/>

			<ServerDetailsDialog
				server={detailsServer}
				onOpenChange={(s) =>
					setServerID(s?.id ? String(s.id) : null, { history: "replace" })
				}
				onEdit={() => {
					if (detailsServer) {
						closeDetails();
						setEditingServer(detailsServer);
						setFormOpen(true);
					}
				}}
				onAction={() => {
					setActionOpen(true);
				}}
				onDeleted={handleDeleted}
			/>

			<ServerActionDialog
				open={actionOpen}
				onOpenChange={setActionOpen}
				server={detailsServer}
				onSuccess={handleActionSuccess}
			/>
		</div>
	);
}
