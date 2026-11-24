"use client";

import { Loader2, Network, Server } from "lucide-react";
import { parseAsBoolean, useQueryState } from "nuqs";
import { useMemo, useState } from "react";

import {
	Empty,
	EmptyDescription,
	EmptyHeader,
	EmptyMedia,
	EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { acDeviceAddress } from "@/lib/ac/format";
import { trpc } from "@/trpc/react";

import { DeviceStatusBadge, DirectionBadge } from "./ac-badges";

/** Terminal list. This screen only reads `mes.peripherals`; it never calls a device. */
export function AcDevicesPanel() {
	const [activeOnly, setActiveOnly] = useQueryState(
		"dev",
		parseAsBoolean.withDefault(true),
	);
	const [filter, setFilter] = useState("");

	const { data: devices = [], isPending } = trpc.ac.devices.useQuery({
		activeOnly,
	});

	const filtered = useMemo(() => {
		const q = filter.trim().toLowerCase();
		if (!q) return devices;
		return devices.filter((device) =>
			[
				device.ip,
				device.deviceIp,
				device.description,
				device.locationName,
				device.locationAbbreviation,
				device.acDirection,
			]
				.filter(Boolean)
				.some((field) => String(field).toLowerCase().includes(q)),
		);
	}, [devices, filter]);

	return (
		<div className="flex min-h-0 flex-col gap-3">
			<div className="flex flex-wrap items-center gap-3">
				<Input
					type="search"
					value={filter}
					onChange={(event) => setFilter(event.target.value)}
					placeholder="Filter by IP, location or description…"
					className="h-8 max-w-sm"
				/>
				<Label className="flex cursor-pointer items-center gap-2 text-xs">
					<Switch
						checked={activeOnly}
						onCheckedChange={(checked) => setActiveOnly(checked)}
					/>
					Active devices only
				</Label>
			</div>

			<div className="min-h-0 overflow-hidden border">
				{isPending ? (
					<div className="flex items-center justify-center py-16">
						<Loader2 className="size-6 animate-spin text-muted-foreground" />
					</div>
				) : filtered.length === 0 ? (
					<Empty className="border-0 py-12">
						<EmptyHeader>
							<EmptyMedia variant="icon">
								<Server />
							</EmptyMedia>
							<EmptyTitle>
								{filter ? "No devices match" : "No devices found"}
							</EmptyTitle>
							<EmptyDescription>
								{filter
									? "Try a different filter value."
									: activeOnly
										? "No active access control terminals are registered."
										: "No access control terminals are registered."}
							</EmptyDescription>
						</EmptyHeader>
					</Empty>
				) : (
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>ID</TableHead>
								<TableHead>Address</TableHead>
								<TableHead>Direction</TableHead>
								<TableHead>Location</TableHead>
								<TableHead>Description</TableHead>
								<TableHead>Status</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{filtered.map((device) => (
								<TableRow key={device.id}>
									<TableCell className="font-mono text-xs">
										{device.id}
									</TableCell>
									<TableCell className="font-mono text-xs">
										{acDeviceAddress(device)}
									</TableCell>
									<TableCell>
										<DirectionBadge direction={device.acDirection} />
									</TableCell>
									<TableCell className="text-xs">
										<div className="flex flex-col">
											<span>
												{device.locationAbbreviation ??
													device.locationName ??
													"—"}
											</span>
											{device.locationAbbreviation &&
												device.locationName &&
												device.locationAbbreviation !== device.locationName && (
													<span className="text-muted-foreground">
														{device.locationName}
													</span>
												)}
										</div>
									</TableCell>
									<TableCell className="text-xs">
										{device.description ?? "—"}
									</TableCell>
									<TableCell>
										<DeviceStatusBadge
											active={device.active}
											failed={device.failedConnect}
										/>
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				)}
			</div>

			<p className="flex items-center gap-1.5 text-xs text-muted-foreground">
				<Network className="size-3.5" />
				Terminals are read from the MES inventory only. This screen never
				connects to a device.
			</p>
		</div>
	);
}
