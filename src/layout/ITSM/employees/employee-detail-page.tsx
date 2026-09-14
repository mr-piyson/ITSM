"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Mail, Calendar, BadgeCheck } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { employeeImageUrl, employeeStaffLabel } from "@/lib/employees-constants";
import { cn } from "@/lib/utils";
import { trpc } from "@/trpc/react";

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
		<div className="flex h-full min-h-0 flex-col space-y-6 p-4 md:p-6">
			<div className="flex items-center gap-3">
				<Button
					variant="ghost"
					size="icon-sm"
					onClick={() => router.back()}
				>
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
					{/* Header card */}
					<div className="flex items-start gap-5 rounded-none border bg-card p-5">
						<Avatar className="size-20 border-2 border-border">
							{imageUrl && (
								<AvatarImage
									src={imageUrl}
									alt={employee.name ?? ""}
									className="object-cover"
								/>
							)}
							<AvatarFallback className="text-2xl font-semibold">
								{employee.name?.[0]?.toUpperCase() ?? "?"}
							</AvatarFallback>
						</Avatar>
						<div className="min-w-0 flex-1 space-y-2">
							<div className="flex flex-wrap items-center gap-2">
								<span
									className={cn(
										"inline-flex items-center gap-1 whitespace-nowrap px-2 py-0.5 text-xs font-medium",
										employee.staffType === "S"
											? "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-100"
											: "bg-muted text-muted-foreground",
									)}
								>
									<BadgeCheck className="size-3" />
									{employeeStaffLabel(employee.staffType)}
								</span>
								<span
									className={cn(
										"inline-flex whitespace-nowrap px-2 py-0.5 text-xs",
										employee.leftDate
											? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
											: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
									)}
								>
									{employee.leftDate ? "Left" : "Active"}
								</span>
								{employee.onPayroll && (
									<span
										className={cn(
											"inline-flex whitespace-nowrap px-2 py-0.5 text-xs",
											employee.onPayroll === "Y"
												? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
												: "bg-muted text-muted-foreground",
										)}
									>
										On Payroll: {employee.onPayroll === "Y" ? "Yes" : "No"}
									</span>
								)}
							</div>
							<h2 className="text-lg font-bold tracking-tight">
								{employee.name ?? "Unknown"}
							</h2>
							<p className="font-mono text-sm text-muted-foreground">
								{employee.emplCode}
							</p>
						</div>
					</div>

					{/* Contact & Info */}
					<div className="space-y-4">
						<h3 className="text-sm font-semibold">Contact Information</h3>
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<div className="flex items-start gap-3 rounded-none border p-3">
								<div className="flex size-8 shrink-0 items-center justify-center rounded-none bg-muted">
									<Mail className="size-4 text-muted-foreground" />
								</div>
								<Row label="Email" value={employee.email} />
							</div>
							<div className="flex items-start gap-3 rounded-none border p-3">
								<div className="flex size-8 shrink-0 items-center justify-center rounded-none bg-muted">
									<BadgeCheck className="size-4 text-muted-foreground" />
								</div>
								<Row label="Employee Code" value={employee.emplCode} />
							</div>
						</div>
					</div>

					<Separator />

					{/* Employment Details */}
					<div className="space-y-4">
						<h3 className="text-sm font-semibold">Employment Details</h3>
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
				</div>
			)}
		</div>
	);
}
