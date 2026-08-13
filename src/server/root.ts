import { assetsRouter } from "./routers/assets";
import { authRouter } from "./routers/auth";
import { bookingsRouter } from "./routers/bookings";
import { dashboardRouter } from "./routers/dashboard";
import { employeesRouter } from "./routers/employees";
import { healthRouter } from "./routers/health";
import { mailSettingsRouter } from "./routers/mail";
import { workbenchRouter } from "./routers/workbench";
import { router } from "./trpc";

export const appRouter = router({
	health: healthRouter,
	auth: authRouter,
	assets: assetsRouter,
	employees: employeesRouter,
	bookings: bookingsRouter,
	mail: mailSettingsRouter,
	dashboard: dashboardRouter,
	workbench: workbenchRouter,
});

export type AppRouter = typeof appRouter;
