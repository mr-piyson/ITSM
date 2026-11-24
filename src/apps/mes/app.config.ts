import type { AppDefinition } from "../types";

/** MES app manifest. Keeps the existing `trpc.mes.*` API namespace. */
export const mesApp: AppDefinition = {
	id: "mes",
	label: "Manufacturing Execution System",
	/** URL metadata only — Next's deployment-wide basePath stays in next.config.ts. */
	urlPrefix: "/mes",
	modules: [
		{ id: "home", title: "Command Center", icon: "BarChart3", segment: "", hasRouter: false },
		{ id: "panels", title: "Panel Report", icon: "LayoutPanelLeft" },
		{ id: "time-out", title: "Time-outs", icon: "Clock", routerKey: "timeOut" },
		{ id: "shipments", title: "Shipments", icon: "Truck", routerKey: "shipping" },
		{ id: "packages", title: "Packages", icon: "Package", routerKey: "packages" },
		{ id: "jobs", title: "Jobs", icon: "Briefcase" },
		{
			id: "inspection-results", title: "Inspection", icon: "ClipboardCheck",
			routerKey: "inspections",
		},
		{ id: "inspection-routes", title: "Panel routes", icon: "RouteIcon", routerKey: "route" },
		{ id: "charts", title: "Charts", icon: "BarChart3", hasPage: false },
		/** Not registered in the root router — kept for reference. */
		{ id: "quality", title: "Quality", icon: "ClipboardCheck", hasPage: false, hasRouter: false },
	],
};
