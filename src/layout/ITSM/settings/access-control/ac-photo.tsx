"use client";

import { useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { acPhotoVariantSrc } from "@/lib/ac/image";
import type { AcPhotoAsset } from "@/lib/ac/types";

export function acInitials(
	name: string | null | undefined,
	fallback: string | null | undefined,
): string {
	const source = name?.trim() || fallback?.trim();
	if (!source) return "?";
	return source
		.split(/\s+/)
		.map((word) => word[0])
		.join("")
		.slice(0, 2)
		.toUpperCase();
}

/**
 * Face photo for an access control user. The legacy tree lives on the intranet
 * host, so images go through `/api/image-proxy`; a missing upstream file falls
 * back to initials.
 */
export function AcUserPhoto({
	name,
	personId,
	photo,
	variant = "medium",
	className,
	size = "default",
}: {
	name?: string | null;
	personId?: string | null;
	photo?: AcPhotoAsset | null;
	variant?: "full" | "medium";
	className?: string;
	size?: "default" | "sm" | "lg";
}) {
	const [failed, setFailed] = useState(false);
	const src = failed ? null : acPhotoVariantSrc(photo, variant);

	return (
		<Avatar className={className} size={size}>
			{src && (
				<AvatarImage
					src={src}
					alt={name ?? "Access control photo"}
					onError={() => setFailed(true)}
				/>
			)}
			<AvatarFallback>{acInitials(name, personId)}</AvatarFallback>
		</Avatar>
	);
}
