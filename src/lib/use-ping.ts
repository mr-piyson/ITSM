"use client";

import { useRef, useState } from "react";

import { trpc } from "@/trpc/react";

export type PingStatus = "active" | "inactive";

export type PingState = {
	status: PingStatus;
	latencyMs: number | null;
	loading: boolean;
};

export type PingTarget = {
	id: string;
	host: string;
};

export function usePing(router: "servers" | "assets" = "servers") {
	const pingMutation = trpc[router].ping.useMutation();
	const [states, setStates] = useState<Record<string, PingState>>({});
	const pending = useRef<Set<string>>(new Set());

	const pingMany = async (targets: PingTarget[]) => {
		const fresh: PingTarget[] = [];
		for (const target of targets) {
			const host = target.host.trim();
			if (!host || pending.current.has(target.id)) {
				continue;
			}
			fresh.push({ id: target.id, host });
		}
		if (fresh.length === 0) {
			return;
		}
		for (const target of fresh) {
			pending.current.add(target.id);
		}
		setStates((prev) => {
			const next = { ...prev };
			for (const target of fresh) {
				next[target.id] = {
					status: prev[target.id]?.status ?? "inactive",
					latencyMs: null,
					loading: true,
				};
			}
			return next;
		});
		try {
			const results = await pingMutation.mutateAsync({ targets: fresh });
			setStates((prev) => {
				const next = { ...prev };
				for (const result of results) {
					next[result.id] = {
						status: result.reachable ? "active" : "inactive",
						latencyMs: result.latencyMs,
						loading: false,
					};
				}
				return next;
			});
		} catch {
			setStates((prev) => {
				const next = { ...prev };
				for (const target of fresh) {
					const prior = prev[target.id];
					next[target.id] = {
						status: prior?.status ?? "inactive",
						latencyMs: prior ? prior.latencyMs : null,
						loading: false,
					};
				}
				return next;
			});
		} finally {
			for (const target of fresh) {
				pending.current.delete(target.id);
			}
		}
	};

	const ping = async (target: PingTarget) => {
		await pingMany([target]);
	};

	const get = (id: string): PingState | undefined => states[id];

	return { get, ping, pingMany };
}
