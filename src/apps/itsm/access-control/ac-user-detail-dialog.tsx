"use client";

import { Loader2 } from "lucide-react";

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { readCards } from "@/lib/ac/csv";
import { formatAcDateTime } from "@/lib/ac/format";
import { acEmpSourceLabel, acVerifyModeLabel } from "@/lib/ac/labels";
import type { AcUserRecord } from "@/lib/ac/types";
import { trpc } from "@/trpc/react";

import { AcUserPhoto } from "./ac-photo";
import {
	AccessBadge,
	AdminBadge,
	CardTypeBadge,
	ValidityBadge,
	VerifyModeBadge,
} from "./ac-badges";

function Field({ label, value }: { label: string; value: string }) {
	return (
		<div className="flex items-baseline justify-between gap-3 border-b py-1.5 last:border-b-0">
			<span className="shrink-0 text-xs text-muted-foreground">{label}</span>
			<span className="text-right text-xs font-medium">{value}</span>
		</div>
	);
}

function UserSummary({ user }: { user: AcUserRecord }) {
	return (
		<>
			<Field label="Person ID" value={user.personId} />
			<Field
				label="Employee ID"
				value={user.employeeId === null ? "—" : String(user.employeeId)}
			/>
			<Field label="Employee source" value={acEmpSourceLabel(user.empSource)} />
			<Field label="Model" value={user.model ?? "—"} />
			<Field label="Device IP" value={user.deviceIp ?? "—"} />
			<Field label="Sync source" value={user.syncSource ?? "—"} />
			<Field label="Synced at" value={formatAcDateTime(user.syncDatetime)} />
			<Field
				label="Sync updated"
				value={formatAcDateTime(user.syncUpdatedAt)}
			/>
			<Field label="Created" value={formatAcDateTime(user.createdAt)} />
			<Field label="Updated" value={formatAcDateTime(user.updatedAt)} />
			<Field label="Verify mode" value={acVerifyModeLabel(user.verifyMode)} />
			<Field label="Begin time" value={formatAcDateTime(user.beginTime)} />
			<Field label="End time" value={formatAcDateTime(user.endTime)} />
		</>
	);
}

/** Read-only detail for one access control user, keyed by `?id=<person_id>`. */
export function AcUserDetailDialog({
	personId,
	onClose,
}: {
	personId: string | null;
	onClose: () => void;
}) {
	const { data, isPending } = trpc.ac.user.useQuery(
		{ personId: personId ?? "" },
		{ enabled: !!personId },
	);

	const cards = readCards(data?.user.cards);
	const user = data?.user;

	return (
		<Dialog open={!!personId} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
				<DialogHeader>
					<DialogTitle>{user?.name ?? "Access control user"}</DialogTitle>
					<DialogDescription>
						{personId ? `Person ID ${personId}` : ""}
					</DialogDescription>
				</DialogHeader>

				{isPending || !user ? (
					<div className="flex items-center justify-center py-12">
						<Loader2 className="size-6 animate-spin text-muted-foreground" />
					</div>
				) : (
					<div className="space-y-4">
						<div className="flex flex-wrap items-start gap-4">
							<AcUserPhoto
								name={user.name}
								personId={user.personId}
								photo={data?.photo}
								variant="full"
								size="lg"
								className="size-24 rounded-none"
							/>
							<div className="flex-1 space-y-3">
								<div className="flex flex-wrap items-center gap-1">
									<AccessBadge access={user.access} />
									{user.isAdmin === 1 && <AdminBadge />}
									<ValidityBadge endTime={user.endTime} />
									<VerifyModeBadge mode={user.verifyMode} />
								</div>

								<div>
									<p className="text-xs text-muted-foreground">Groups</p>
									<div className="mt-1 flex flex-wrap gap-1">
										{data && data.groups.length > 0 ? (
											data.groups.map((group) => (
												<span
													key={group.id}
													className="inline-flex items-center border px-2 py-0.5 text-xs font-medium"
												>
													{group.name}
												</span>
											))
										) : (
											<span className="text-xs text-muted-foreground">
												No group assigned
											</span>
										)}
									</div>
								</div>
							</div>
						</div>

						<div>
							<p className="mb-1 text-xs font-semibold">Cards</p>
							{cards.length === 0 ? (
								<p className="text-xs text-muted-foreground">
									No cards stored for this user.
								</p>
							) : (
								<Table className="border">
									<TableHeader>
										<TableRow>
											<TableHead>Card No</TableHead>
											<TableHead>Type</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{cards.map((card) => (
											<TableRow key={card.cardNo}>
												<TableCell className="font-mono text-xs">
													{card.cardNo}
												</TableCell>
												<TableCell>
													<CardTypeBadge type={card.cardType} />
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							)}
						</div>

						<div>
							<p className="mb-1 text-xs font-semibold">Record</p>
							<div className="border px-3">
								<UserSummary user={user} />
							</div>
						</div>

						{!data?.photo && (
							<p className="text-xs text-muted-foreground">
								No face photo is linked to this user.
							</p>
						)}
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}
