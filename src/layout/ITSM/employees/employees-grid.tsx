"use client";

import { useEffect, useRef, useState } from "react";

import { useVirtualizer } from "@tanstack/react-virtual";
import { ExternalLink, Pencil, Power } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { employeeCategory, employeeImageUrl } from "@/lib/employees-constants";
import { cn } from "@/lib/utils";
import type { EmployeeItem } from "@/server/routers/ITSM/employees";

const CARD_WIDTH = 280;
const CARD_HEIGHT = 140;

type EmployeesGridProps = {
	employees: EmployeeItem[];
	onDetails: (employee: EmployeeItem) => void;
	onEdit: (employee: EmployeeItem) => void;
	onDeactivate: (employee: EmployeeItem) => void;
};

export function EmployeesGrid({
	employees,
	onDetails,
	onEdit,
	onDeactivate,
}: EmployeesGridProps) {
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
									<EmployeeCard
										key={employee.empID}
										employee={employee}
										onDetails={onDetails}
										onEdit={onEdit}
										onDeactivate={onDeactivate}
									/>
								))}
							</div>
						</div>
					);
				})}
			</div>
		</div>
	);
}

function EmployeeCard({
	employee,
	onDetails,
	onEdit,
	onDeactivate,
}: {
	employee: EmployeeItem;
	onDetails: (employee: EmployeeItem) => void;
	onEdit: (employee: EmployeeItem) => void;
	onDeactivate: (employee: EmployeeItem) => void;
}) {
	const imageUrl = employeeImageUrl(employee.image);
	const category = employeeCategory(employee.empID);

	return (
		<div className="flex h-[120px] flex-col rounded-none border bg-card p-3">
			<div className="flex items-center gap-3">
				<Avatar className="size-10">
					{imageUrl && <AvatarImage src={imageUrl} alt={employee.name} />}
					<AvatarFallback className="text-base">
						{employee.name[0]?.toUpperCase()}
					</AvatarFallback>
				</Avatar>
				<div className="min-w-0 flex-1">
					<p className="truncate text-sm font-medium">{employee.name}</p>
					<p className="truncate font-mono text-xs text-muted-foreground">
						{employee.empID}
					</p>
					{employee.email && (
						<p className="truncate text-xs text-muted-foreground">
							{employee.email}
						</p>
					)}
				</div>
				<span
					className={cn(
						"shrink-0 whitespace-nowrap px-1.5 py-0.5 text-xs",
						category === "Staff"
							? "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-100"
							: "bg-muted text-muted-foreground",
					)}
				>
					{category}
				</span>
			</div>

			<div className="mt-auto flex justify-end gap-1 border-t pt-1.5">
				<Button
					variant="ghost"
					size="icon-sm"
					title="Details"
					onClick={() => onDetails(employee)}
				>
					<ExternalLink />
				</Button>
				<Button
					variant="ghost"
					size="icon-sm"
					title="Edit"
					onClick={() => onEdit(employee)}
				>
					<Pencil />
				</Button>
				<Button
					variant="ghost"
					size="icon-sm"
					title="Deactivate"
					className="text-destructive hover:text-destructive"
					onClick={() => onDeactivate(employee)}
				>
					<Power />
				</Button>
			</div>
		</div>
	);
}
