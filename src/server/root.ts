import { mesRouter, itsmRouters } from "@/apps/server-registry";
import { router } from "./trpc";

// ITSM procedures stay flat (trpc.assets.*), MES stays namespaced (trpc.mes.*).
// Wiring is generated from the app manifests by `npm run gen:routes`.
export const appRouter = router({
	...itsmRouters,
	mes: mesRouter,
});

export type AppRouter = typeof appRouter;
