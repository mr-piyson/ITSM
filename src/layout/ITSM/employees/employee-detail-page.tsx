"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Mail, BadgeCheck, Building2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
	employeeImageUrl,
	employeeStaffLabel,
} from "@/lib/employees-constants";
import { cn } from "@/lib/utils";
import { trpc } from "@/trpc/react";
import { useAzureStatus } from "@/hooks/use-azure-status";

type EmployeeDetailPageProps = {
	code: string;
};

function Row({ label, value }: { label: string; value?: string | null }) {
	return (
		<div className="flex flex-col gap-0.5">
			<span className="text-xs text-muted-foreground">{label}</span>
			<span className="text-sm font-medium break-words">{value || "-"}</span>
		</div>
	);
}

export function EmployeeDetailPage({ code }: EmployeeDetailPageProps) {
	const router = useRouter();
	const { data: employee, isPending } = trpc.employees.byCode.useQuery(
		{ code },
		{ enabled: !!code },
	);
	const { azure, isLoading: azureLoading } = useAzureStatus(employee?.email ?? null);

	const imageUrl = employee ? employeeImageUrl(employee.picPath) : null;

	const formatDate = (val: string | null) => {
		if (!val) return null;
		try {
			return new Date(val).toLocaleDateString("en-GB", {
				day: "2-digit",
				month: "short",
				year: "numeric",
			});
		} catch {
			return val;
		}
	};

	return (
		<div className="flex h-full min-h-0 flex-col p-4 md:p-6">
			<div className="mx-auto flex w-full max-w-4xl flex-1 min-h-0 flex-col space-y-6">
				{/* Back + Title */}
				<div className="flex items-center gap-3">
					<Button variant="ghost" size="icon-sm" onClick={() => router.back()}>
						<ArrowLeft />
					</Button>
					<div>
						<h1 className="text-xl font-semibold tracking-tight">
							Employee Details
						</h1>
						<p className="text-xs text-muted-foreground">{code}</p>
					</div>
				</div>

				{isPending ? (
					<div className="flex flex-1 items-center justify-center">
						<Loader2 className="size-6 animate-spin text-muted-foreground" />
					</div>
				) : !employee ? (
					<div className="flex flex-1 flex-col items-center justify-center gap-2 border border-dashed py-16 text-center">
						<p className="text-sm text-muted-foreground">Employee not found</p>
						<Button variant="outline" size="sm" onClick={() => router.back()}>
							Go back
						</Button>
					</div>
				) : (
					<div className="space-y-6">
						{/* Gradient banner with name & badges */}
						<div
							className="relative overflow-hidden rounded-none border p-6 text-white shadow-lg"
							style={{
								background:
									"linear-gradient(135deg, var(--primary) 0%, color-mix(in srgb, var(--primary) 70%, #000) 100%)",
							}}
						>
							<div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItSDJ2LTJoMzRtMCA0djJIMnYtMmgyNC0yNHYySDJ2LTJoMjRtMCA0djJIMnYtMmgyNC0yNHYySDJ2LTJoMjRtMCA0djJIMnYtMmgyNC0yNHYySDJ2LTJoMjRtMCA0djJIMnYtMmgyNC0yNHYySDJ2LTJoMjQiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-50" />
							<div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
								<div className="min-w-0 space-y-1">
									<h2 className="text-2xl font-bold tracking-tight">
										{employee.name ?? "Unknown"}
									</h2>
									<p className="font-mono text-sm text-white/80">
										{employee.emplCode}
									</p>
								</div>
								<div className="flex flex-wrap items-center gap-2">
									<span className="inline-flex items-center gap-1 whitespace-nowrap rounded-none bg-white/20 px-2.5 py-1 text-sm font-medium backdrop-blur-sm">
										<BadgeCheck className="size-4" />
										{employeeStaffLabel(employee.staffType)}
									</span>
									<span className="inline-flex whitespace-nowrap rounded-none bg-white/20 px-2.5 py-1 text-sm font-medium backdrop-blur-sm">
										{employee.leftDate ? "Left" : "Active"}
									</span>
									{employee.onPayroll && (
										<span className="inline-flex whitespace-nowrap rounded-none bg-white/20 px-2.5 py-1 text-sm font-medium backdrop-blur-sm">
											On Payroll: {employee.onPayroll === "Y" ? "Yes" : "No"}
										</span>
									)}
								</div>
							</div>
						</div>

						{/* Photo card + Contact grid */}
						<div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
							{/* Photo card */}
							<div className="rounded-none border bg-card p-4 sm:col-span-1">
								{imageUrl ? (
									<div className="mt-4 overflow-hidden rounded-none border">
										<img
											src={imageUrl}
											alt={employee.name ?? ""}
											className="h-auto w-full object-cover"
										/>
									</div>
								) : (
									<div className="mt-4 flex h-48 items-center justify-center rounded-none border border-dashed bg-muted/50">
										<span className="text-sm text-muted-foreground">
											No photo available
										</span>
									</div>
								)}
							</div>

							{/* Contact info */}
							<div className="space-y-3 sm:col-span-2">
								<h3 className="text-sm font-semibold">Contact Information</h3>
								<div className="grid grid-cols-1 gap-3">
									<div className="flex items-start gap-3 rounded-none border p-3">
										<div className="flex size-9 shrink-0 items-center justify-center rounded-none bg-muted">
											<Mail className="size-4 text-muted-foreground" />
										</div>
										<Row label="Email" value={employee.email} />
									</div>
									<div className="flex items-start gap-3 rounded-none border p-3">
										<div className="flex size-9 shrink-0 items-center justify-center rounded-none bg-muted">
											<BadgeCheck className="size-4 text-muted-foreground" />
										</div>
										<Row label="Employee Code" value={employee.emplCode} />
									</div>
								</div>
							</div>
						</div>

						<Separator />

						{/* Employment Details */}
						<div className="space-y-3">
							<h3 className="text-sm font-semibold">Employment Details</h3>
							<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
								<div className="rounded-none border p-3">
									<Row
										label="Staff Type"
										value={employeeStaffLabel(employee.staffType)}
									/>
								</div>
								<div className="rounded-none border p-3">
									<Row
										label="On Payroll"
										value={employee.onPayroll === "Y" ? "Yes" : "No"}
									/>
								</div>
								<div className="rounded-none border p-3">
									<Row
										label="Status"
										value={employee.leftDate ? "Left" : "Active"}
									/>
								</div>
								<div className="rounded-none border p-3">
									<Row
										label="Created On"
										value={formatDate(employee.createdOn)}
									/>
								</div>
								{employee.leftDate && (
									<div className="rounded-none border p-3">
										<Row
											label="Left Date"
											value={formatDate(employee.leftDate)}
										/>
									</div>
								)}
							</div>
						</div>

						<Separator />

						{/* Azure AD Details */}
						<div className="space-y-3">
							<div className="flex items-center gap-2">
								<Building2 className="size-4 text-muted-foreground" />
								<h3 className="text-sm font-semibold">Azure AD Details</h3>
							</div>
							{azureLoading ? (
								<div className="flex items-center gap-2 rounded-none border p-4">
									<Loader2 className="size-4 animate-spin text-muted-foreground" />
									<span className="text-sm text-muted-foreground">
										Checking Azure AD status...
									</span>
								</div>
							) : !azure ? (
								<div className="rounded-none border border-dashed p-4 text-center">
									<p className="text-sm text-muted-foreground">
										Azure AD data not available for this email
									</p>
								</div>
							) : (
								<div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
									<div className="rounded-none border p-3">
										<Row
											label="Account Status"
											value={
												azure.accountEnabled === true
													? "Active"
													: azure.accountEnabled === false
														? "Disabled"
														: "Unknown"
											}
										/>
									</div>
									<div className="rounded-none border p-3">
										<Row label="Display Name" value={azure.displayName} />
									</div>
									<div className="rounded-none border p-3">
										<Row label="Job Title" value={azure.jobTitle} />
									</div>
									<div className="rounded-none border p-3">
										<Row label="Department" value={azure.department} />
									</div>
									<div className="rounded-none border p-3">
										<Row label="Office Location" value={azure.officeLocation} />
									</div>
									<div className="rounded-none border p-3">
										<Row label="City" value={azure.city} />
									</div>
									<div className="rounded-none border p-3">
										<Row label="Country" value={azure.country} />
									</div>
									<div className="rounded-none border p-3">
										<Row label="Mail" value={azure.mail} />
									</div>
									<div className="rounded-none border p-3">
										<Row
											label="User Principal Name"
											value={azure.userPrincipalName}
										/>
									</div>
									<div className="rounded-none border p-3">
										<Row label="Usage Location" value={azure.usageLocation} />
									</div>
									<div className="rounded-none border p-3">
										<Row label="Company Name" value={azure.companyName} />
									</div>
									<div className="rounded-none border p-3">
										<Row label="Employee ID" value={azure.employeeId} />
									</div>
								</div>
							)}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
