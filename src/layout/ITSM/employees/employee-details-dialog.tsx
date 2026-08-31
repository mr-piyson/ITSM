"use client";

import { useState } from "react";

import { Loader2, Pencil, Power } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { assetTypeBadge } from "@/lib/assets-constants";
import {
	LICENSE_LABELS,
	employeeCategory,
	employeeImageUrl,
} from "@/lib/employees-constants";
import { cn } from "@/lib/utils";
import type { EmployeeItem } from "@/server/routers/ITSM/employees";
import { trpc } from "@/trpc/react";

import { O365FormDialog } from "./o365-form";

type EmployeeDetailsDialogProps = {
	employee: EmployeeItem | null;
	onOpenChange: (employee: EmployeeItem | null) => void;
	onEdit: () => void;
	onDeactivate: (employee: EmployeeItem) => void;
	onOffice365Updated: () => void;
};

function Row({ label, value }: { label: string; value?: string | null }) {
	return (
		<div className="flex items-center justify-between gap-3 py-1.5">
			<span className="text-xs text-muted-foreground">{label}</span>
			<span className="text-right text-xs font-medium break-words">
				{value || "-"}
			</span>
		</div>
	);
}

function SectionHeader({ title, count }: { title: string; count?: number }) {
	return (
		<h4 className="flex items-center gap-2 text-sm font-semibold">
			{title}
			{count !== undefined && (
				<span className="rounded-none bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
					{count}
				</span>
			)}
		</h4>
	);
}

export function EmployeeDetailsDialog({
	employee,
	onOpenChange,
	onEdit,
	onDeactivate,
	onOffice365Updated,
}: EmployeeDetailsDialogProps) {
	const { data: detail, isPending } = trpc.employees.details.useQuery(
		{ empID: employee?.empID ?? 0 },
		{ enabled: !!employee },
	);
	const [o365Open, setO365Open] = useState(false);

	const imageUrl = employee ? employeeImageUrl(employee.image) : null;
	const category = employee ? employeeCategory(employee.empID) : null;

	const licenseLabel = detail?.office365?.license
		? (LICENSE_LABELS[detail.office365.license] ?? detail.office365.license)
		: null;
	const authList = detail?.office365
		? [
				detail.office365.authenticationTwoFactor ? "Two Factor" : null,
				detail.office365.authenticationAuthenticator ? "Authenticator" : null,
				detail.office365.authenticationPhone ? "Phone" : null,
			].filter(Boolean)
		: [];
	const otherLicenses = detail?.office365
		? [
				detail.office365.msProject ? "MS Project" : null,
				detail.office365.powerPi ? "Power Bi Pro" : null,
			].filter(Boolean)
		: [];

	return (
		<Dialog
			open={!!employee}
			onOpenChange={(open) => {
				if (!open) {
					onOpenChange(null);
				}
			}}
		>
			<DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
				<DialogHeader>
					<DialogTitle>Employee Details</DialogTitle>
					<DialogDescription>
						{employee ? `${employee.empID} — ${employee.name}` : ""}
					</DialogDescription>
				</DialogHeader>

				{isPending || !detail ? (
					<div className="flex h-48 items-center justify-center">
						<Loader2 className="size-6 animate-spin text-muted-foreground" />
					</div>
				) : (
					<div className="space-y-5">
						{/* Header */}
						<div className="flex items-center gap-4">
							<Avatar className="size-14">
								{imageUrl && <AvatarImage src={imageUrl} alt={detail.name} />}
								<AvatarFallback className="text-lg">
									{detail.name[0]?.toUpperCase()}
								</AvatarFallback>
							</Avatar>
							<div className="min-w-0 flex-1 space-y-1">
								<div className="flex flex-wrap items-center gap-2">
									{category && (
										<span
											className={cn(
												"inline-flex whitespace-nowrap px-1.5 py-0.5 text-xs",
												category === "Staff"
													? "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-100"
													: "bg-muted text-muted-foreground",
											)}
										>
											{category}
										</span>
									)}
								</div>
								<p className="truncate text-base font-semibold">
									{detail.name}
								</p>
								<p className="truncate font-mono text-xs text-muted-foreground">
									{detail.empID}
								</p>
							</div>
						</div>

						{/* Assets */}
						<div className="space-y-2">
							<SectionHeader title="Assets" count={detail.assets.length} />
							{detail.assets.length === 0 ? (
								<p className="text-xs text-muted-foreground">No assets</p>
							) : (
								<div className="rounded-none border">
									{detail.assets.map((asset) => (
										<div
											key={asset.code}
											className="flex items-center gap-2 border-b px-3 py-2 text-xs last:border-b-0"
										>
											<span
												className={cn(
													"shrink-0 whitespace-nowrap px-1.5 py-0.5 text-xs",
													assetTypeBadge(asset.type),
												)}
											>
												{asset.type ?? "-"}
											</span>
											<span className="min-w-0 truncate font-mono">
												{asset.code}
											</span>
											<span className="ml-auto shrink-0 truncate text-muted-foreground">
												{[asset.manufacturer, asset.model]
													.filter(Boolean)
													.join(" ") || "-"}
											</span>
										</div>
									))}
								</div>
							)}
						</div>

						{/* Printers */}
						<div className="space-y-2">
							<SectionHeader title="Printers" count={detail.printers.length} />
							{detail.printers.length === 0 ? (
								<p className="text-xs text-muted-foreground">No printers</p>
							) : (
								<div className="rounded-none border">
									{detail.printers.map((printer) => (
										<div
											key={printer.id}
											className="border-b px-3 py-2 text-xs last:border-b-0"
										>
											{printer.name}
										</div>
									))}
								</div>
							)}
						</div>

						{/* Provided */}
						<div className="space-y-2">
							<SectionHeader title="Provided" count={detail.provided.length} />
							{detail.provided.length === 0 ? (
								<p className="text-xs text-muted-foreground">
									Nothing provided
								</p>
							) : (
								<div className="rounded-none border">
									{detail.provided.map((item, index) => (
										<div
											key={index}
											className="border-b px-3 py-2 text-xs last:border-b-0"
										>
											{item.name}
										</div>
									))}
								</div>
							)}
						</div>

						<Separator />

						{/* Office 365 */}
						<div className="space-y-3">
							<div className="flex items-center justify-between">
								<SectionHeader title="Office 365" />
								<Button
									variant="outline"
									size="sm"
									onClick={() => setO365Open(true)}
								>
									<Pencil />
									Edit Office 365
								</Button>
							</div>
							<div className="rounded-none border px-3 py-2">
								<Row label="Email" value={detail.email} />
								<Row label="License" value={licenseLabel} />
								<Row
									label="Other Licenses"
									value={otherLicenses.length ? otherLicenses.join(", ") : null}
								/>
								<Row
									label="Authentication"
									value={authList.length ? authList.join(", ") : "Disabled"}
								/>
								<Row
									label="Office 365 Groups"
									value={
										detail.groups.length
											? detail.groups.map((g) => g.groupName).join(", ")
											: null
									}
								/>
								<Row
									label="Recipient Limit"
									value={detail.office365?.recipientLimit}
								/>
								<Row
									label="One Drive"
									value={
										detail.office365
											? detail.office365.oneDrive
												? "Enabled"
												: "Disabled"
											: null
									}
								/>
								<Row label="Mail Type" value={detail.office365?.mailType} />
								<Row
									label="Mail Storage Size"
									value={detail.office365?.mailStorageSize}
								/>
								<Row
									label="Online Mailbox Archive"
									value={
										detail.office365
											? detail.office365.onlineMailboxArchive
												? "Enabled"
												: "Disabled"
											: null
									}
								/>
								<Row
									label="Online Archive Storage Size"
									value={detail.office365?.onlineArchiveStorageSize}
								/>
							</div>
						</div>
					</div>
				)}

				<DialogFooter>
					<Button variant="outline" onClick={onEdit} disabled={!detail}>
						<Pencil data-icon="inline-start" />
						Edit
					</Button>
					<Button
						variant="destructive"
						disabled={!detail}
						onClick={() => employee && onDeactivate(employee)}
					>
						<Power data-icon="inline-start" />
						Deactivate
					</Button>
				</DialogFooter>
			</DialogContent>

			{employee && detail && (
				<O365FormDialog
					open={o365Open}
					onOpenChange={setO365Open}
					empID={employee.empID}
					employeeName={detail.name}
					office365={detail.office365}
					groups={detail.groups}
					onSuccess={onOffice365Updated}
				/>
			)}
		</Dialog>
	);
}
