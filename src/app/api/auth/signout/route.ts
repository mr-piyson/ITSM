import { type NextRequest, NextResponse } from "next/server";

import { handleSignOut } from "@/app/auth/auth.server";

export async function POST(request: NextRequest) {
	try {
		const result = await handleSignOut();
		return NextResponse.json(result);
	} catch (error) {
		console.error("Sign out error:", error);
		return NextResponse.json(
			{ error: "Sign out failed" },
			{ status: 500 },
		);
	}
}
