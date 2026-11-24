import type { LucideIcon } from "lucide-react";
import type { Route } from "next";

/** Stable identifiers — one per deployable app. Used in folder, URL and tRPC keys. */
export type AppId = "itsm" | "mes";

export type RouteItem = {
	title: string;
	href?: Route;
	icon: LucideIcon;
	description?: string;
	dev?: boolean;
	requiresAc?: boolean;
	children?: RouteItem[];
};

export type RouteGroup = { label?: string; items: RouteItem[] };

export type ModuleSection = "sidebar" | "settings" | "landing";

/**
 * One module = one folder under apps/<app>/<module>/ containing its page,
 * components, schema and router. This is the unit an AI reads and edits.
 */
export type ModuleDefinition = {
	/** Folder name under apps/<app>/ and the default URL segment. */
	id: string;
	title: string;
	/** Key into src/apps/icons.ts — keeps configs serializable and greppable. */
	icon: string;
	/** Override the URL segment (e.g. "settings/mail"). */
	segment?: string;
	/** Sidebar group label. Modules without a group form the first group. */
	group?: string;
	section?: ModuleSection;
	description?: string;
	order?: number;
	dev?: boolean;
	requiresAc?: boolean;
	/** Explicit link for non-route or placeholder links (downloads, "#", "/"). */
	href?: string;
	children?: ModuleDefinition[];
	/** tRPC key when it differs from id. */
	routerKey?: string;
	/** False for containers/placeholder links with no router.ts. Default: true. */
	hasRouter?: boolean;
	/** False for containers/placeholder links with no Next.js page. Default: true. */
	hasPage?: boolean;
};

export type AppDefinition = {
	id: AppId;
	label: string;
	/**
	 * URL namespace metadata only — NOT next.config.ts `basePath`.
	 * Next's basePath is a deployment-wide setting and stays in next.config.ts.
	 * Use "" for single-app deployments so routes have no app prefix.
	 */
	urlPrefix: string;
	modules: ModuleDefinition[];
};
