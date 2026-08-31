"use client";

import { Boxes, HandHelping } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { employeeImageUrl } from "@/lib/employees-constants";
import { formatProvideDate } from "@/lib/provide-constants";
import type { ProvideItem } from "@/server/routers/ITSM/provide";

export function ProvideDetailsDialog({
	provide,
	onOpenChange,
}: {
	provide: ProvideItem | null;
	onOpenChange: (open: boolean) => void;
}) {
	const imageUrl = employeeImageUrl(provide?.employeeImage);

	return (
		<Dialog open={provide !== null} onOpenChange={onOpenChange}>
			<DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
				{provide && (
					<>
						<DialogHeader>
							<DialogTitle className="flex items-center gap-2">
								<span className="font-mono">#{provide.id}</span>
								<span className="text-muted-foreground">
									{formatProvideDate(provide.date)}
								</span>
							</DialogTitle>
							<DialogDescription>Provide details</DialogDescription>
						</DialogHeader>

						<div className="space-y-4">
							{/* Recipient */}
							<div className="flex items-center gap-3">
								<Avatar className="size-11 shrink-0">
									{imageUrl && (
										<AvatarImage src={imageUrl} alt={provide.employeeName} />
									)}
									<AvatarFallback>
										{provide.employeeName[0]?.toUpperCase() ?? "?"}
									</AvatarFallback>
								</Avatar>
								<div className="min-w-0">
									<p className="truncate font-medium">
										{provide.employeeName || "-"}
									</p>
									<p className="text-xs text-muted-foreground">
										Employee ID {provide.empID}
									</p>
								</div>
							</div>

							<Separator />

							{/* Parties */}
							<div className="grid grid-cols-1 gap-3">
								<div>
									<p className="text-xs font-semibold text-muted-foreground">
										Requested by
									</p>
									<p className="text-sm">
										{provide.requestedByName || "-"}
										<span className="ml-1 text-xs text-muted-foreground">
											({provide.requestBy})
										</span>
									</p>
								</div>
								<div>
									<p className="text-xs font-semibold text-muted-foreground">
										Received by
									</p>
									<p className="text-sm">
										{provide.receivedByName || "-"}
										<span className="ml-1 text-xs text-muted-foreground">
											({provide.recievedBy})
										</span>
									</p>
								</div>
								<div>
									<p className="text-xs font-semibold text-muted-foreground">
										Provided by
									</p>
									<p className="text-sm">{provide.provideBy || "-"}</p>
								</div>
							</div>

							<Separator />

							{/* Items */}
							<div className="space-y-2">
								<div className="flex items-center gap-1.5">
									<Boxes className="size-4 text-muted-foreground" />
									<p className="text-xs font-semibold text-muted-foreground">
										Items ({provide.items.length})
									</p>
								</div>
								{provide.items.length === 0 ? (
									<p className="text-sm text-muted-foreground">No items</p>
								) : (
									<ul className="space-y-1.5">
										{provide.items.map((item) => (
											<li
												key={item.id}
												className="flex items-baseline justify-between gap-3 rounded-md border px-2.5 py-1.5"
											>
												<span className="min-w-0">
													<span className="block truncate text-sm font-medium">
														{item.itemName}
													</span>
													<span className="block truncate text-xs text-muted-foreground">
														{item.itemBrand || "-"}
													</span>
												</span>
												<span className="shrink-0 whitespace-nowrap text-sm font-semibold">
													× {item.quantity}
												</span>
											</li>
										))}
									</ul>
								)}
							</div>

							{provide.notes && (
								<div className="space-y-1">
									<p className="text-xs font-semibold text-muted-foreground">
										Notes
									</p>
									<p className="text-sm whitespace-pre-wrap">{provide.notes}</p>
								</div>
							)}

							<div className="flex items-center gap-1.5 border-t pt-3 text-xs text-muted-foreground">
								<HandHelping className="size-3.5" />
								<span>
									{provide.createdByName
										? `Logged by ${provide.createdByName}`
										: "Provide record"}
								</span>
							</div>
						</div>
					</>
				)}
			</DialogContent>
		</Dialog>
	);
}
