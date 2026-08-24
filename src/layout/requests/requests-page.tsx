"use client";

import { ClipboardList, Loader2, Plus, Search } from "lucide-react";
import { parseAsStringLiteral, useQueryState } from "nuqs";
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
import {
	REQUEST_STATUSES,
	statusLabel,
	type RequestStatus,
} from "@/lib/request-constants";
import { cn } from "@/lib/utils";
import type { RequestItem } from "@/server/routers/requests";
import { trpc } from "@/trpc/react";

import { RequestDetailsDialog } from "./request-details-dialog";
import { RequestFormDialog } from "./request-form-dialog";
import { RequestsTable } from "./requests-table";

const STATUS_FILTERS = ["all", ...REQUEST_STATUSES] as const;
const STATUS_FILTER_VALUES = [...STATUS_FILTERS] as unknown as string[];

export function RequestsPage() {
	const utils = trpc.useUtils();
	const meQuery = trpc.auth.me.useQuery();

	const [statusParam, setStatusParam] = useQueryState(
		"status",
		parseAsStringLiteral(STATUS_FILTER_VALUES).withDefault("all"),
	);
	const [query, setQuery] = useQueryState("q", {
		defaultValue: "",
		history: "replace",
	});
	const [idParam, setIdParam] = useQueryState("id", {
		defaultValue: "",
		history: "replace",
	});

	const [formOpen, setFormOpen] = useState(false);

	const { data: requests = [], isPending } = trpc.requests.list.useQuery({
		status: statusParam as "all" | RequestStatus,
	});

	const filtered = useMemo(() => {
		const q = query.trim().toLowerCase();
		if (!q) {
			return requests;
		}
		return requests.filter((request) => {
			const parts = [
				request.id,
				request.userName,
				request.slctname,
				request.otherpg,
				request.newpg,
				request.descrip,
				request.status,
				request.requestPrio,
			];
			return parts
				.filter(Boolean)
				.some((part) => String(part).toLowerCase().includes(q));
		});
	}, [requests, query]);

	const detailsRequest = useMemo(
		() => requests.find((r) => String(r.id) === idParam) ?? null,
		[requests, idParam],
	);

	const closeDetails = () => setIdParam("", { history: "replace" });

	const handleChanged = () => {
		utils.requests.list.invalidate();
	};

	return (
		<div className="flex h-full min-h-0 flex-col space-y-4 p-4 md:p-6">
			<div className="flex min-w-0 flex-col gap-4">
				<div className="flex flex-wrap items-center justify-between gap-3">
					<div>
						<h1 className="text-xl font-semibold tracking-tight">Requests</h1>
						<p className="text-xs text-muted-foreground">
							System change requests ({isPending ? "…" : filtered.length})
						</p>
					</div>
					<Button onClick={() => setFormOpen(true)} size="default">
						<Plus data-icon="inline-start" />
						New Request
					</Button>
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
						placeholder="Search by ID, user, page, description…"
						className="h-9 pl-8"
					/>
				</div>

				<div
					className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1"
					role="group"
					aria-label="Filter by status"
				>
					{STATUS_FILTERS.map((status) => (
						<button
							key={status}
							type="button"
							aria-pressed={statusParam === status}
							onClick={() => setStatusParam(status)}
							className={cn(
								"shrink-0 whitespace-nowrap rounded-none border px-2.5 py-1 text-xs font-medium transition-colors",
								statusParam === status
									? "border-primary bg-primary text-primary-foreground"
									: "bg-background text-muted-foreground hover:bg-muted",
							)}
						>
							{status === "all" ? "All" : statusLabel(status)}
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
							<ClipboardList />
						</EmptyMedia>
						<EmptyTitle>
							{requests.length === 0 ? "No requests yet" : "No requests found"}
						</EmptyTitle>
						<EmptyDescription>
							{requests.length === 0
								? meQuery.data?.type === "admin"
									? "Change requests submitted by users will appear here."
									: "Submit a change request to propose an improvement."
								: "Try adjusting your search or status filter."}
						</EmptyDescription>
					</EmptyHeader>
					<EmptyContent>
						{requests.length === 0 && (
							<Button size="sm" onClick={() => setFormOpen(true)}>
								<Plus data-icon="inline-start" />
								Submit the first request
							</Button>
						)}
					</EmptyContent>
				</Empty>
			) : (
				<RequestsTable
					requests={filtered}
					onDetails={(request: RequestItem) => setIdParam(String(request.id))}
				/>
			)}

			<RequestFormDialog
				open={formOpen}
				onOpenChange={setFormOpen}
				onSuccess={() => {
					setFormOpen(false);
					utils.requests.list.invalidate();
				}}
			/>

			<RequestDetailsDialog
				request={detailsRequest}
				onOpenChange={closeDetails}
				onChanged={handleChanged}
			/>
		</div>
	);
}
