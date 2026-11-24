import { cn } from "@/lib/utils";
import { employeeStaffLabel } from "@/lib/employees-constants";

const base =
	"inline-flex items-center whitespace-nowrap rounded-none px-2 py-0.5 text-sm font-medium";

const TONES = {
	green: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
	red: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
	teal: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-100",
	warning:
		"bg-warning/20 text-warning dark:bg-warning/90 dark:text-warning-foreground",
	blue: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100",
	muted: "bg-muted text-muted-foreground",
} as const;

export type PillTone = keyof typeof TONES;

export function Pill({
	tone,
	children,
	className,
}: {
	tone: PillTone;
	children: React.ReactNode;
	className?: string;
}) {
	return <span className={cn(base, TONES[tone], className)}>{children}</span>;
}

export function StaffTypePill({ type }: { type: string | null | undefined }) {
	if (!type) return null;
	return (
		<Pill tone={type === "S" ? "teal" : "warning"}>
			{employeeStaffLabel(type)}
		</Pill>
	);
}

export function EmploymentStatusPill({
	leftDate,
}: {
	leftDate: string | Date | null | undefined;
}) {
	return leftDate ? (
		<Pill tone="red">Left</Pill>
	) : (
		<Pill tone="green">Active</Pill>
	);
}

export function formatDate(value: unknown): string {
	if (!value) return "-";
	const d = new Date(value as string);
	if (Number.isNaN(d.getTime())) return String(value);
	return d.toLocaleDateString("en-GB", {
		day: "2-digit",
		month: "short",
		year: "numeric",
	});
}
