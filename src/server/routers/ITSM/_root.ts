import { router } from "@/server/trpc";
import { assetsRouter } from "./assets";
import { attendanceRouter } from "./attendance";
import { authRouter } from "./auth";
import { bookingsRouter } from "./bookings";
import { contractsRouter } from "./contracts";
import { dashboardRouter } from "./dashboard";
import { employeesRouter } from "./employees";
import { healthRouter } from "./health";
import { mailSettingsRouter } from "./mail";
import { printersRouter } from "./printers";
import { providesRouter } from "./provide";
import { purchasesRouter } from "./purchases";
import { reportsRouter } from "./reports";
import { requestsRouter } from "./requests";
import { serversRouter } from "./servers";
import { stockRouter } from "./stock";
import { syncPhotosRouter } from "./sync-photos";
import { tapesRouter } from "./tapes";
import { usersRouter } from "./users";
import { vendorsRouter } from "./vendors";

export const issRouter = {
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
	users: usersRouter,
};

export type ISSRouter = typeof issRouter;
