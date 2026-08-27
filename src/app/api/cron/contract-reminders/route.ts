import { NextResponse } from "next/server";

import { env } from "@/lib/env";
import { runContractReminderScan } from "@/lib/contract-mail";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
	const secret = env.CRON_SECRET;
	if (secret) {
		const url = new URL(request.url);
		const provided =
			request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ??
			url.searchParams.get("secret") ??
			"";
		if (provided !== secret) {
			return NextResponse.json(
				{ ok: false, error: "Unauthorized" },
				{ status: 401 },
			);
		}
	}

	const result = await runContractReminderScan();
	return NextResponse.json(result, { status: result.ok ? 200 : 500 });
}
