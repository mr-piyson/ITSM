"use client";

import { useEffect, useRef, useState } from "react";

import Link from "next/link";
import { useVirtualizer } from "@tanstack/react-virtual";

import { Card } from "@/components/ui/card";
import { EmployeeAvatar } from "@/components/employee-avatar";
import { employeeStaffLabel } from "@/lib/employees-constants";
import { cn } from "@/lib/utils";
import type { EmployeeItem } from "@/server/routers/ITSM/employees";

const CARD_WIDTH = 280;
const CARD_HEIGHT = 260;

type EmployeesGridProps = {
	employees: EmployeeItem[];
};

export function EmployeesGrid({ employees }: EmployeesGridProps) {
	const parentRef = useRef<HTMLDivElement>(null);
	const [columns, setColumns] = useState(1);

	useEffect(() => {
		const el = parentRef.current;
		if (!el) {
			return;
		}
		const update = () => {
			setColumns(Math.max(1, Math.floor(el.clientWidth / CARD_WIDTH)));
		};
		update();
		const observer = new ResizeObserver(update);
		observer.observe(el);
		return () => observer.disconnect();
	}, []);

	const rowCount = Math.ceil(employees.length / columns);
	const rowVirtualizer = useVirtualizer({
		count: rowCount,
		getScrollElement: () => parentRef.current,
		estimateSize: () => CARD_HEIGHT,
		overscan: 4,
	});

	return (
		<div
			ref={parentRef}
			className="flex-1 min-h-0 overflow-auto rounded-none border p-3"
		>
			<div
				style={{
					height: `${rowVirtualizer.getTotalSize()}px`,
					position: "relative",
				}}
			>
				{rowVirtualizer.getVirtualItems().map((virtualRow) => {
					const start = virtualRow.index * columns;
					const rowItems = employees.slice(start, start + columns);
					return (
						<div
							key={virtualRow.key}
							style={{
								position: "absolute",
								top: 0,
								left: 0,
								width: "100%",
								transform: `translateY(${virtualRow.start}px)`,
							}}
						>
							<div
								className="grid gap-3"
								style={{
									gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
								}}
							>
								{rowItems.map((employee) => (
									<EmployeeCard key={employee.emplCode} employee={employee} />
								))}
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}

function EmployeeCard({ employee }: { employee: EmployeeItem }) {
	const label = employeeStaffLabel(employee.staffType);
	const isLeft = !!employee.leftDate;

	return (
		<Link
			href={`/app/employees/${encodeURIComponent(employee.emplCode)}`}
			className="block h-full rounded-none outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
		>
			<Card className="h-full items-center px-4 pt-4 pb-3 transition-all hover:shadow-md hover:-translate-y-0.5">
				<EmployeeAvatar
					image={employee.picPath}
					name={employee.name}
					code={employee.emplCode}
					className="size-24 ring-2 ring-offset-2 ring-primary/20"
					fallbackClassName="text-2xl"
					fallback={employee.name?.[0]?.toUpperCase() ?? "?"}
				/>
				<div className="flex w-full min-w-0 flex-col items-center gap-0.5 text-center">
					<p className="w-full truncate text-sm font-medium">
						{employee.name ?? "-"}
					</p>
					<p className="w-full truncate font-mono text-xs text-muted-foreground">
						{employee.emplCode}
					</p>
					{employee.email && (
						<p className="w-full truncate text-xs text-muted-foreground">
							{employee.email}
						</p>
					)}
				</div>
				<div className="mt-auto flex flex-wrap items-center justify-center gap-1.5 pt-1">
					<span
						className={cn(
							"shrink-0 whitespace-nowrap px-1.5 py-0.5 text-xs",
							employee.staffType === "S"
								? "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-100"
								: "bg-muted text-muted-foreground",
						)}
					>
						{label}
					</span>
					<span
						className={cn(
							"shrink-0 whitespace-nowrap px-1.5 py-0.5 text-xs",
							isLeft
								? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100"
								: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
						)}
					>
						{isLeft ? "Left" : "Active"}
					</span>
				</div>
			</Card>
		</Link>
	);
}
