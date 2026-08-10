import { NextResponse } from "next/server";

import { getUser } from "@/app/auth/auth.server";

export async function GET() {
	try {
		const user = await getUser();
		if (!user) {
			return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
		}
		return NextResponse.json({ user });
	} catch {
		return NextResponse.json({ error: "Authentication check failed" }, { status: 500 });
	}
}
