"use client";

import { parseCsvInts } from "@/lib/ac/csv";
import { formatAcDateTime, formatAcNumber } from "@/lib/ac/format";
import type { AcGroupRecord } from "@/lib/ac/types";

import { Badge } from "@/components/ui/badge";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";

import { DeletedBadge } from "./ac-badges";

export function AcGroupsTable({
	groups,
	selectedGroupId,
	onSelect,
}: {
	groups: (AcGroupRecord & { userCount: number })[];
	selectedGroupId: number | null;
	onSelect: (id: number) => void;
}) {
	return (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>ID</TableHead>
					<TableHead>Name</TableHead>
					<TableHead>Devices</TableHead>
					<TableHead>Users</TableHead>
					<TableHead>Validity</TableHead>
					<TableHead>Activated</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{groups.map((group) => {
					const deviceCount = parseCsvInts(group.devices).length;
					const selected = selectedGroupId === group.id;
					return (
						<TableRow
							key={group.id}
							data-state={selected ? "selected" : undefined}
							className="cursor-pointer"
							onClick={() => onSelect(group.id)}
						>
							<TableCell className="font-mono text-xs">{group.id}</TableCell>
							<TableCell>
								<div className="flex flex-wrap items-center gap-1">
									<span className="font-medium">{group.name}</span>
									{group.deletedAt && <DeletedBadge />}
								</div>
							</TableCell>
							<TableCell className="text-xs">
								{deviceCount === 0 ? (
									<span className="text-muted-foreground">—</span>
								) : (
									formatAcNumber(deviceCount)
								)}
							</TableCell>
							<TableCell className="text-xs">
								{formatAcNumber(group.userCount)}
							</TableCell>
							<TableCell>
								{group.startDatetime || group.endDatetime ? (
									<span className="text-xs">
										{formatAcDateTime(group.startDatetime)} –{" "}
										{formatAcDateTime(group.endDatetime)}
									</span>
								) : (
									<Badge variant="outline" className="text-muted-foreground">
										Always valid
									</Badge>
								)}
							</TableCell>
							<TableCell>
								{group.currentActivated === 1 ? (
									<div className="flex flex-col gap-0.5">
										<Badge variant="secondary">Active</Badge>
										<span className="text-xs text-muted-foreground">
											{formatAcDateTime(group.activatedAt)}
										</span>
									</div>
								) : (
									<span className="text-xs text-muted-foreground">
										{group.activatedAt
											? `Inactive · ${formatAcDateTime(group.activatedAt)}`
											: "Not activated"}
									</span>
								)}
							</TableCell>
						</TableRow>
					);
				})}
			</TableBody>
		</Table>
	);
}
