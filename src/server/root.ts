import { assetsRouter } from "./routers/assets";
import { attendanceRouter } from "./routers/attendance";
import { authRouter } from "./routers/auth";
import { bookingsRouter } from "./routers/bookings";
import { contractsRouter } from "./routers/contracts";
import { dashboardRouter } from "./routers/dashboard";
import { employeesRouter } from "./routers/employees";
import { healthRouter } from "./routers/health";
import { mailSettingsRouter } from "./routers/mail";
import { printersRouter } from "./routers/printers";
import { providesRouter } from "./routers/provide";
import { purchasesRouter } from "./routers/purchases";
import { serversRouter } from "./routers/servers";
import { stockRouter } from "./routers/stock";
import { vendorsRouter } from "./routers/vendors";
import { workbenchRouter } from "./routers/workbench";
import { router } from "./trpc";

export const appRouter = router({
	health: healthRouter,
	auth: authRouter,
	assets: assetsRouter,
	attendance: attendanceRouter,
	employees: employeesRouter,
	bookings: bookingsRouter,
	provides: providesRouter,
	purchases: purchasesRouter,
	printers: printersRouter,
	servers: serversRouter,
	stock: stockRouter,
	vendors: vendorsRouter,
	contracts: contractsRouter,
	mail: mailSettingsRouter,
	dashboard: dashboardRouter,
	workbench: workbenchRouter,
});

export type AppRouter = typeof appRouter;
