import { Badge } from "@/components/ui/badge";

export type EmployeeRowData = {
	code: string | number;
	name: string | null;
	email?: string | null;
	type?: string | null;
	onPayroll?: boolean;
	image?: string | null;
};

function getInitials(name: string | null, code: string | number): string {
	return (name ?? String(code))
		.split(" ")
		.map((word) => word[0])
		.join("")
		.slice(0, 2)
		.toUpperCase();
}

export function EmployeeRow({ employee }: { employee: EmployeeRowData }) {
	const initials = getInitials(employee.name, employee.code);

	return (
		<>
			<div className="relative size-9 shrink-0">
				{employee.image ? (
					<img
						src={employee.image}
						alt={employee.name ?? ""}
						className="size-9 rounded-full object-cover ring-2 ring-border"
					/>
				) : (
					<div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary ring-2 ring-border">
						{initials}
					</div>
				)}
				{employee.onPayroll !== undefined && (
					<span
						className={`absolute bottom-0 right-0 size-2.5 rounded-full ring-2 ring-card ${employee.onPayroll ? "bg-emerald-500" : "bg-muted-foreground/40"}`}
					/>
				)}
			</div>
			<div className="flex min-w-0 flex-1 flex-col gap-0.5">
				<div className="flex items-center gap-2">
					<span className="truncate text-sm font-medium leading-none">
						{employee.name ?? employee.code}
					</span>
					{employee.onPayroll && (
						<Badge
							variant="secondary"
							className="shrink-0 px-1.5 py-0 text-[10px] leading-normal"
						>
							Payroll
						</Badge>
					)}
				</div>
				<div className="flex items-center gap-1.5">
					{employee.type && (
						<Badge
							variant="outline"
							className="shrink-0 px-1.5 py-0 text-[10px] leading-normal"
						>
							{employee.type}
						</Badge>
					)}
					<span className="truncate font-mono text-[11px] text-muted-foreground">
						{employee.code}
					</span>
					{employee.email && (
						<span className="truncate text-[11px] text-muted-foreground">
							{employee.email}
						</span>
					)}
				</div>
			</div>
		</>
	);
}
