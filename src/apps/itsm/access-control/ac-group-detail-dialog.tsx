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
import {
	formatAcDateTime,
	formatAcNumber,
	acDeviceAddress,
} from "@/lib/ac/format";
import { acEmpSourceLabel } from "@/lib/ac/labels";
import { trpc } from "@/trpc/react";

import {
	AccessBadge,
	ActivatedBadge,
	DeletedBadge,
	DirectionBadge,
} from "./ac-badges";

function Field({ label, value }: { label: string; value: string }) {
	return (
		<div className="flex items-baseline justify-between gap-3 border-b py-1.5 last:border-b-0">
			<span className="shrink-0 text-xs text-muted-foreground">{label}</span>
			<span className="text-right text-xs font-medium">{value}</span>
		</div>
	);
}

/** Read-only detail for one access control group, keyed by `?gid=<id>`. */
export function AcGroupDetailDialog({
	groupId,
	onClose,
}: {
	groupId: number | null;
	onClose: () => void;
}) {
	const enabled = groupId !== null;
	const { data, isPending } = trpc.ac.group.useQuery(
		{ id: groupId ?? 0 },
		{ enabled },
	);
	const { data: members = [] } = trpc.ac.groupUsers.useQuery(
		{ id: groupId ?? 0 },
		{ enabled },
	);
	const { data: devices = [] } = trpc.ac.deviceChoices.useQuery(
		{ deviceIds: data?.deviceIds ?? [] },
		{ enabled: enabled && (data?.deviceIds.length ?? 0) > 0 },
	);

	const group = data?.group;

	return (
		<Dialog open={enabled} onOpenChange={(open) => !open && onClose()}>
			<DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-3xl">
				<DialogHeader>
					<DialogTitle>{group?.name ?? "Access control group"}</DialogTitle>
					<DialogDescription>
						{group ? `Group ${group.id}` : ""}
					</DialogDescription>
				</DialogHeader>

				{isPending || !group ? (
					<div className="flex items-center justify-center py-12">
						<Loader2 className="size-6 animate-spin text-muted-foreground" />
					</div>
				) : (
					<div className="space-y-4">
						<div className="flex flex-wrap items-center gap-1">
							{group.deletedAt && <DeletedBadge />}
							<ActivatedBadge activated={group.currentActivated} />
							<span className="text-xs text-muted-foreground">
								{formatAcNumber(data?.userCount ?? 0)} members ·{" "}
								{formatAcNumber(data?.deviceIds.length ?? 0)} devices
							</span>
						</div>

						<div className="border px-3">
							<Field
								label="Valid from"
								value={formatAcDateTime(group.startDatetime)}
							/>
							<Field
								label="Valid to"
								value={formatAcDateTime(group.endDatetime)}
							/>
							<Field
								label="Activated at"
								value={formatAcDateTime(group.activatedAt)}
							/>
							<Field
								label="Activated devices"
								value={group.activatedDevices ?? "—"}
							/>
							<Field
								label="Activated users"
								value={group.activatedUsers ?? "—"}
							/>
							<Field
								label="Created"
								value={formatAcDateTime(group.createdAt)}
							/>
							<Field
								label="Updated"
								value={formatAcDateTime(group.updatedAt)}
							/>
							{group.deletedAt && (
								<Field
									label="Deleted"
									value={formatAcDateTime(group.deletedAt)}
								/>
							)}
						</div>

						<div>
							<p className="mb-1 text-xs font-semibold">Devices</p>
							{devices.length === 0 ? (
								<p className="text-xs text-muted-foreground">
									No devices assigned to this group.
								</p>
							) : (
								<Table className="border">
									<TableHeader>
										<TableRow>
											<TableHead>Address</TableHead>
											<TableHead>Direction</TableHead>
											<TableHead>Location</TableHead>
											<TableHead>Description</TableHead>
										</TableRow>
									</TableHeader>
									<TableBody>
										{devices.map((device) => (
											<TableRow key={device.id}>
												<TableCell className="font-mono text-xs">
													{acDeviceAddress(device)}
												</TableCell>
												<TableCell>
													<DirectionBadge direction={device.acDirection} />
												</TableCell>
												<TableCell className="text-xs">
													{device.locationAbbreviation ??
														device.locationName ??
														"—"}
												</TableCell>
												<TableCell className="text-xs">
													{device.description ?? "—"}
												</TableCell>
											</TableRow>
										))}
									</TableBody>
								</Table>
							)}
						</div>

						<div>
							<p className="mb-1 text-xs font-semibold">
								Members ({formatAcNumber(members.length)})
							</p>
							{members.length === 0 ? (
								<p className="text-xs text-muted-foreground">
									No users reference this group.
								</p>
							) : (
								<div className="max-h-64 overflow-y-auto border">
									<Table>
										<TableHeader>
											<TableRow>
												<TableHead>User</TableHead>
												<TableHead>Person ID</TableHead>
												<TableHead>Source</TableHead>
												<TableHead>Status</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{members.map((member) => (
												<TableRow key={member.personId}>
													<TableCell className="font-medium">
														{member.name ?? "—"}
													</TableCell>
													<TableCell className="font-mono text-xs">
														{member.personId}
													</TableCell>
													<TableCell className="text-xs">
														{acEmpSourceLabel(member.empSource)}
													</TableCell>
													<TableCell>
														<AccessBadge access={member.access} />
													</TableCell>
												</TableRow>
											))}
										</TableBody>
									</Table>
								</div>
							)}
						</div>
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}
