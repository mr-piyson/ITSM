import { z } from "zod";

import { protectedProcedure, router } from "@/server/trpc";

export interface WorkbenchTaskRow {
	GroupID: string;
	Description: string;
	TaskID: string;
	Name: string;
	CompleteDate: Date | null;
	taskStartDate: Date | null;
}

export interface GroupedEco {
	GroupID: string;
	tasks: Record<string, WorkbenchTaskRow>;
}

export const workbenchRouter = router({
	getGroupedData: protectedProcedure
		.input(
			z.object({
				fromDate: z.string(),
				groupName: z.string().optional().default(""),
			}),
		)
		.query(async (): Promise<{ groupedData: GroupedEco[] }> => {
			const groupedData: GroupedEco[] = [];
			return { groupedData };
		}),
});
