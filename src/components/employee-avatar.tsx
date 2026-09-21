import type React from "react";

import { employeeImageUrl } from "@/lib/employees-constants";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function getEmployeeInitials(
	name: string | null,
	code: string | number | null,
): string {
	return (name ?? String(code ?? "?"))
		.split(" ")
		.map((word) => word[0])
		.join("")
		.slice(0, 2)
		.toUpperCase();
}

export function EmployeeAvatar({
	image,
	name,
	code,
	className,
	fallbackClassName,
	fallback,
}: {
	image?: string | null;
	name?: string | null;
	code?: string | number | null;
	className?: string;
	fallbackClassName?: string;
	fallback?: React.ReactNode;
}) {
	const src = employeeImageUrl(image);
	const initials = getEmployeeInitials(name ?? null, code ?? null);

	return (
		<Avatar className={className}>
			{src && <AvatarImage src={src} alt={name ?? ""} />}
			<AvatarFallback className={fallbackClassName}>
				{fallback ?? initials}
			</AvatarFallback>
		</Avatar>
	);
}
