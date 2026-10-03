"use client";

import { trpc } from "@/trpc/react";

/**
 * Access control permission for the signed-in user. Shared by the settings
 * sidebar, the settings overview and the access control page so they all gate
 * on a single cached query.
 *
 * Returns `undefined` while loading so callers can avoid flashing an entry they
 * are not allowed to see.
 */
export function useAcAccess(): boolean | undefined {
	return trpc.ac.access.useQuery().data?.allowed;
}
