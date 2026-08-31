import { issRouter } from "./routers/ITSM/_root";
import { mesRouter } from "./routers/MES/_root";
import { router } from "./trpc";

export const appRouter = router({
	...issRouter,
	mes: mesRouter,
});

export type AppRouter = typeof appRouter;
