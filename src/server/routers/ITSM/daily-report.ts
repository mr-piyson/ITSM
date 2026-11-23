import { z } from "zod";

import {
	getDailyReportSettings,
	runDailyReport,
	saveDailyReportSettings,
} from "@/lib/daily-report-mail";
import { adminProcedure, router } from "@/server/trpc";

const settingsSchema = z.object({
	enabled: z.boolean(),
	recipientUserIds: z.string().max(2000),
	extraEmails: z.string().max(2000),
});

export const dailyReportRouter = router({
	get: adminProcedure.query(() => getDailyReportSettings()),

	save: adminProcedure.input(settingsSchema).mutation(async ({ input }) => {
		await saveDailyReportSettings(input);
		return { success: true };
	}),

	run: adminProcedure.mutation(() => runDailyReport({ ignoreEnabled: true })),
});
