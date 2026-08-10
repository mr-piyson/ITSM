import { assetsRouter } from "./routers/assets";
import { authRouter } from "./routers/auth";
import { healthRouter } from "./routers/health";
import { workbenchRouter } from "./routers/workbench";
import { router } from "./trpc";

export const appRouter = router({
	health: healthRouter,
	auth: authRouter,
	assets: assetsRouter,
	workbench: workbenchRouter,
});

export type AppRouter = typeof appRouter;
