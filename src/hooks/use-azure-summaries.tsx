"use client";

import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
	type ReactNode,
} from "react";

import type { AzureAccessSummary } from "@/lib/azure-license-summary";
import { trpc } from "@/trpc/react";

const DEBOUNCE_MS = 250;
const BATCH_SIZE = 100;

type AzureSummariesValue = {
	map: Record<string, AzureAccessSummary>;
	register: (email: string) => void;
};

const AzureSummariesContext = createContext<AzureSummariesValue | null>(null);

function mergeMaps(
	prev: Record<string, AzureAccessSummary>,
	next: Record<string, AzureAccessSummary>,
): Record<string, AzureAccessSummary> {
	const merged: Record<string, AzureAccessSummary> = { ...prev };
	for (const key of Object.keys(next)) {
		merged[key] = next[key];
	}
	return merged;
}

export function AzureSummariesProvider({ children }: { children: ReactNode }) {
	const utils = trpc.useUtils();
	const [map, setMap] = useState<Record<string, AzureAccessSummary>>({});
	const mapRef = useRef(map);
	const requestedRef = useRef<Set<string>>(new Set());
	const pendingRef = useRef<Set<string>>(new Set());
	const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

	const flush = useCallback(async () => {
		const queue = Array.from(pendingRef.current);
		pendingRef.current.clear();
		for (let i = 0; i < queue.length; i += BATCH_SIZE) {
			const chunk = queue.slice(i, i + BATCH_SIZE);
			try {
				const result = await utils.client.employees.azureBatch.query({
					emails: chunk,
				});
				setMap((prev) => mergeMaps(prev, result));
			} catch (err) {
				console.error("[azure-summaries] Batch fetch failed:", err);
			}
		}
	}, [utils]);

	const register = useCallback(
		(email: string) => {
			if (!email) return;
			if (mapRef.current[email] || requestedRef.current.has(email)) return;
			requestedRef.current.add(email);
			pendingRef.current.add(email);
			if (timerRef.current) clearTimeout(timerRef.current);
			timerRef.current = setTimeout(() => {
				void flush();
			}, DEBOUNCE_MS);
		},
		[flush],
	);

	useEffect(() => {
		mapRef.current = map;
	}, [map]);

	useEffect(() => {
		return () => {
			if (timerRef.current) clearTimeout(timerRef.current);
		};
	}, []);

	const value = useMemo(() => ({ map, register }), [map, register]);

	return (
		<AzureSummariesContext.Provider value={value}>
			{children}
		</AzureSummariesContext.Provider>
	);
}

export function useAzureSummariesContext(): AzureSummariesValue {
	const ctx = useContext(AzureSummariesContext);
	if (!ctx) {
		throw new Error(
			"useAzureSummariesContext must be used within AzureSummariesProvider",
		);
	}
	return ctx;
}