"use client";

import { HandHelping, Laptop, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { EmployeeCombobox } from "@/components/employee-combobox";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import {
	ASSET_STATUSES,
	assetImageUrl,
	assetTypeBadge,
} from "@/lib/assets-constants";
import { cn } from "@/lib/utils";
import { trpc } from "@/trpc/react";

type EmployeeInventorySectionProps = {
	code: string;
};

const STATUS_NONE = "__none__";

function SectionCard({
	title,
	icon: Icon,
	count,
	pending,
	empty,
	children,
}: {
	title: string;
	icon: typeof Laptop;
	count: number;
	pending: boolean;
	empty: string;
	children: React.ReactNode;
}) {
	return (
		<div className="space-y-3">
			<div className="flex items-center gap-2">
				<Icon className="size-4 text-muted-foreground" />
				<h3 className="text-sm font-semibold">{title}</h3>
				<span className="text-xs text-muted-foreground">
					({pending ? "…" : count})
				</span>
			</div>
			<div className="overflow-hidden rounded-none border">
				{pending ? (
					<div className="flex items-center justify-center gap-2 p-6 text-sm text-muted-foreground">
						<Loader2 className="size-4 animate-spin" />
						Loading…
					</div>
				) : count === 0 ? (
					<p className="p-6 text-center text-sm text-muted-foreground">
						{empty}
					</p>
				) : (
					children
				)}
			</div>
		</div>
	);
}

export function EmployeeInventorySection({
	code,
}: EmployeeInventorySectionProps) {
	const utils = trpc.useUtils();
	const { data: assets = [], isPending: assetsPending } =
		trpc.assets.byOwner.useQuery({ code }, { enabled: !!code });
	const { data: provides = [], isPending: providesPending } =
		trpc.provides.byEmployee.useQuery({ code }, { enabled: !!code });
	const { data: employees = [] } = trpc.employees.pickList.useQuery();

	const updateAsset = trpc.assets.update.useMutation({
		onSuccess: async () => {
			toast.success("Asset updated");
			await Promise.all([
				utils.assets.byOwner.invalidate({ code }),
				utils.assets.list.invalidate(),
				utils.bookings.availableAssets.invalidate(),
			]);
		},
		onError: (error) => toast.error(error.message),
	});

	const changeStatus = (id: number, deviceStatus: string) => {
		updateAsset.mutate({ id, data: { deviceStatus: deviceStatus || null } });
	};

	const changeOwner = (id: number, emplCode: string | null) => {
		updateAsset.mutate({ id, data: { emplCode } });
	};

	const providedLines = provides.flatMap((provide) =>
		provide.items.map((item) => ({ provide, item })),
	);

	return (
		<div className="space-y-6">
			<SectionCard
				title="Assets"
				icon={Laptop}
				count={assets.length}
				pending={assetsPending}
				empty="No assets assigned to this employee."
			>
				<div className="max-h-[26rem] overflow-auto">
					<Table>
						<TableHeader className="sticky top-0 z-10 bg-popover">
							<TableRow>
								<TableHead>Asset</TableHead>
								<TableHead>Type</TableHead>
								<TableHead>Location</TableHead>
								<TableHead className="w-40">Status</TableHead>
								<TableHead className="w-72">Owner</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{assets.map((asset) => {
								const image = assetImageUrl(asset.image);
								return (
									<TableRow key={asset.id}>
										<TableCell>
											<div className="flex items-center gap-2">
												{image ? (
													<img
														src={image}
														alt={asset.code}
														className="h-8 w-11 shrink-0 object-cover"
													/>
												) : null}
												<div className="min-w-0">
													<span className="block font-mono text-xs font-medium">
														{asset.code}
													</span>
													<span className="block max-w-56 truncate text-xs text-muted-foreground">
														{asset.deviceName || asset.model || "-"}
													</span>
												</div>
											</div>
										</TableCell>
										<TableCell>
											{asset.type ? (
												<span
													className={cn(
														"inline-flex rounded-none px-2 py-0.5 text-xs font-medium",
														assetTypeBadge(asset.type),
													)}
												>
													{asset.type}
												</span>
											) : (
												"-"
											)}
										</TableCell>
										<TableCell className="text-xs">
											{asset.location || "-"}
										</TableCell>
										<TableCell>
											<Select
												value={asset.deviceStatus ?? STATUS_NONE}
												onValueChange={(value) =>
													changeStatus(
														asset.id,
														value === STATUS_NONE ? "" : (value ?? ""),
													)
												}
												disabled={updateAsset.isPending}
											>
												<SelectTrigger className="h-8 w-full">
													<SelectValue placeholder="Set status" />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value={STATUS_NONE}>—</SelectItem>
													{ASSET_STATUSES.map((status) => (
														<SelectItem key={status} value={status}>
															{status}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</TableCell>
										<TableCell>
											<EmployeeCombobox
												value={asset.emplCode || null}
												onSelect={(employee) =>
													changeOwner(asset.id, employee?.emplCode ?? null)
												}
												employees={employees}
												allowNone
												noneLabel="In IT (no owner)"
												noneHint="IT pool"
												className="h-8"
											/>
										</TableCell>
									</TableRow>
								);
							})}
						</TableBody>
					</Table>
				</div>
			</SectionCard>

			<SectionCard
				title="Provided Items"
				icon={HandHelping}
				count={providedLines.length}
				pending={providesPending}
				empty="No stock items provided to this employee."
			>
				<div className="max-h-[26rem] overflow-auto">
					<Table>
						<TableHeader className="sticky top-0 z-10 bg-popover">
							<TableRow>
								<TableHead>Item</TableHead>
								<TableHead>Brand</TableHead>
								<TableHead className="w-20">Qty</TableHead>
								<TableHead>Provided</TableHead>
								<TableHead>Provider</TableHead>
								<TableHead>Notes</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{providedLines.map(({ provide, item }) => (
								<TableRow key={item.id}>
									<TableCell className="font-medium">
										{item.itemName || "-"}
									</TableCell>
									<TableCell className="text-xs text-muted-foreground">
										{item.itemBrand || "-"}
									</TableCell>
									<TableCell className="font-mono text-xs">
										{item.quantity}
									</TableCell>
									<TableCell className="whitespace-nowrap text-xs">
										{provide.date || "-"}
									</TableCell>
									<TableCell className="text-xs">
										{provide.provideBy || "-"}
									</TableCell>
									<TableCell className="max-w-48 truncate text-xs text-muted-foreground">
										{provide.notes || "-"}
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</div>
			</SectionCard>
		</div>
	);
}
