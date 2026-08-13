"use client";

import { HandHelping, Loader2, Plus, Search } from "lucide-react";
import { parseAsString, useQueryState } from "nuqs";
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
import { trpc } from "@/trpc/react";

import { ProvideDetailsDialog } from "./provide-details-dialog";
import { ProvideFormDialog } from "./provide-form-dialog";
import { ProvideTable } from "./provide-table";

export function ProvidePage() {
	const utils = trpc.useUtils();
	const { data: provides = [], isPending } = trpc.provides.list.useQuery();

	const [query, setQuery] = useQueryState("q", {
		defaultValue: "",
		history: "replace",
	});
	const [provideId, setProvideId] = useQueryState("id", parseAsString);

	const [formOpen, setFormOpen] = useState(false);

	const detailsProvide = useMemo(
		() => provides.find((p) => String(p.id) === provideId) ?? null,
		[provides, provideId],
	);

	const filtered = useMemo(() => {
		const q = query.trim().toLowerCase();
		if (!q) {
			return provides;
		}
		return provides.filter((provide) => {
			const parts = [
				provide.employeeName,
				String(provide.empID),
				provide.requestedByName,
				provide.receivedByName,
				provide.provideBy,
				provide.notes,
				...provide.items.map((item) => `${item.itemName} ${item.itemBrand}`),
			];
			return parts
				.filter(Boolean)
				.some((part) => String(part).toLowerCase().includes(q));
		});
	}, [provides, query]);

	const invalidate = () => utils.provides.list.invalidate();

	const handleFormSuccess = () => {
		setFormOpen(false);
		invalidate();
	};

	const closeDetails = () => setProvideId(null, { history: "replace" });

	return (
		<div className="flex h-full min-h-0 flex-col space-y-4 p-4 md:p-6">
			<div className="flex min-w-0 flex-col gap-4">
				<div className="flex flex-wrap items-center justify-between gap-3">
					<div>
						<h1 className="text-xl font-semibold tracking-tight">
							Item Provides
						</h1>
						<p className="text-xs text-muted-foreground">
							Provides ({isPending ? "…" : filtered.length})
						</p>
					</div>
					<Button onClick={() => setFormOpen(true)}>
						<Plus data-icon="inline-start" />
						New Provide
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
						placeholder="Search employee, item, provider…"
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
							<HandHelping />
						</EmptyMedia>
						<EmptyTitle>
							{provides.length === 0 ? "No provides yet" : "No provides found"}
						</EmptyTitle>
						<EmptyDescription>
							{provides.length === 0
								? "Provide stock items to an employee to get started."
								: "Try adjusting your search."}
						</EmptyDescription>
					</EmptyHeader>
					<EmptyContent>
						{provides.length === 0 && (
							<Button size="sm" onClick={() => setFormOpen(true)}>
								<Plus data-icon="inline-start" />
								Create the first provide
							</Button>
						)}
					</EmptyContent>
				</Empty>
			) : (
				<ProvideTable
					provides={filtered}
					onDetails={(provide) => setProvideId(String(provide.id))}
				/>
			)}

			<ProvideFormDialog
				open={formOpen}
				onOpenChange={setFormOpen}
				onSuccess={handleFormSuccess}
			/>

			<ProvideDetailsDialog
				provide={detailsProvide}
				onOpenChange={(open) => {
					if (!open) {
						closeDetails();
					}
				}}
			/>
		</div>
	);
}
