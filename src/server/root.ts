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
import { reportsRouter } from "./routers/reports";
import { requestsRouter } from "./routers/requests";
import { serversRouter } from "./routers/servers";
import { stockRouter } from "./routers/stock";
import { syncPhotosRouter } from "./routers/sync-photos";
import { tapesRouter } from "./routers/tapes";
import { vendorsRouter } from "./routers/vendors";
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
	tapes: tapesRouter,
	vendors: vendorsRouter,
	contracts: contractsRouter,
	mail: mailSettingsRouter,
	dashboard: dashboardRouter,
	requests: requestsRouter,
	reports: reportsRouter,
	syncPhotos: syncPhotosRouter,
});

export type AppRouter = typeof appRouter;
