// Backwards-compatible re-export. The app manifest is the source of truth:
// src/apps/<app>/app.config.ts → src/apps/registry.ts
export { routes } from "@/apps/registry";
export type { RouteItem, RouteGroup } from "@/apps/types";
