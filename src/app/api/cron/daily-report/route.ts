import { NextResponse } from "next/server";

import { checkCronSecret } from "@/lib/cron";
import { runDailyReport } from "@/lib/daily-report-mail";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
	const unauthorized = checkCronSecret(request);
	if (unauthorized) {
		return unauthorized;
	}

	const result = await runDailyReport();
	return NextResponse.json(result, { status: result.ok ? 200 : 500 });
}
