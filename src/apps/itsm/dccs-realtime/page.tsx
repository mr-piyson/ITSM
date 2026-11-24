"use client";

import { DccRealtimeGrid } from "@/apps/itsm/dccs/dcc-realtime-dashboard";
import { PollingControls, useDccRealtime } from "@/apps/itsm/dccs/use-dcc-realtime";

export function Page() {
	const {
		dccs,
		isPending,
		pollingEnabled,
		setPollingEnabled,
		intervalMs,
		setIntervalMs,
		countdown,
		lastChecked,
		isChecking,
		checkNow,
	} = useDccRealtime();

	return (
		<div className="flex min-h-0 flex-1 flex-col">
			<div className="border-b p-4 md:p-6">
				<div className="flex flex-wrap items-center justify-between gap-3">
					<h1 className="text-lg font-semibold">DCC Realtime</h1>
					<PollingControls
						pollingEnabled={pollingEnabled}
						setPollingEnabled={setPollingEnabled}
						intervalMs={intervalMs}
						setIntervalMs={setIntervalMs}
						countdown={countdown}
						lastChecked={lastChecked}
						isChecking={isChecking}
						checkNow={checkNow}
					/>
				</div>
			</div>
			<div className="min-h-0 flex-1 overflow-y-auto">
				<DccRealtimeGrid dccs={dccs} isPending={isPending} />
			</div>
		</div>
	);
}
