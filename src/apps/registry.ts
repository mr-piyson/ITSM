import type { Route } from "next";

import { icon } from "./icons";
import { itsmApp } from "./itsm/app.config";
import { mesApp } from "./mes/app.config";
import type {
	AppDefinition,
	AppId,
	ModuleDefinition,
	RouteGroup,
	RouteItem,
} from "./types";

/** The single source of truth for apps, URL namespaces and navigation. */
export const apps: readonly AppDefinition[] = [itsmApp, mesApp];

export const appIds = apps.map((app) => app.id);

export function getApp(id: AppId): AppDefinition {
	const found = apps.find((app) => app.id === id);
	if (!found) throw new Error(`Unknown app "${id}" — add it to src/apps/registry.ts`);
	return found;
}

/** Builds a URL from the app's urlPrefix + the module's segment. */
export function moduleHref(app: AppDefinition, mod: ModuleDefinition): string {
	if (mod.href !== undefined) return mod.href;
	const segment = mod.segment ?? mod.id;
	return `${app.urlPrefix}/${segment}`.replace(/\/+$/, "") || "/";
}

function toRouteItem(app: AppDefinition, mod: ModuleDefinition): RouteItem {
	return {
		title: mod.title,
		href: moduleHref(app, mod) as Route,
		icon: icon(mod.icon),
		description: mod.description,
		dev: mod.dev,
		requiresAc: mod.requiresAc,
		children: mod.children?.map((child) => toRouteItem(app, child)),
	};
}

function groupsFor(app: AppDefinition, section: "sidebar" | "settings" | "landing") {
	const groups = new Map<string, RouteItem[]>();
	for (const mod of app.modules) {
		if (mod.section !== section) continue;
		const label = section === "sidebar" ? (mod.group ?? "") : "";
		const items = groups.get(label) ?? [];
		items.push(toRouteItem(app, mod));
		groups.set(label, items);
	}
	return groups;
}

function sidebarGroups(app: AppDefinition): RouteGroup[] {
	return [...groupsFor(app, "sidebar")].map(([label, items]) => ({
		label: label || undefined,
		items,
	}));
}

function flatItems(app: AppDefinition, section: "settings" | "landing"): RouteItem[] {
	return [...groupsFor(app, section).values()].flat();
}

/** Drop-in replacement for the old hand-maintained src/lib/routes.tsx. */
export const routes: {
	appSidebar: RouteGroup[];
	settings: RouteItem[];
	landingPage: RouteItem[];
} = {
	appSidebar: apps.flatMap(sidebarGroups),
	settings: apps.flatMap((app) => flatItems(app, "settings")),
	landingPage: apps.flatMap((app) => flatItems(app, "landing")),
};

/** Root portal links — one per registered app. */
export const appLinks = apps.map((app) => ({
	id: app.id,
	label: app.label,
	href: `${app.urlPrefix || "/"}`,
}));
