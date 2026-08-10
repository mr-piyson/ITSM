import { type NextRequest, NextResponse } from "next/server";

import { handleSignIn } from "@/app/auth/auth.server";

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		const { email, password } = body;

		if (!email || !password) {
			return NextResponse.json(
				{ error: "Email and password are required" },
				{ status: 400 },
			);
		}

		const result = await handleSignIn(email, password);

		if (result.error) {
			return NextResponse.json(
				{ error: result.error },
				{ status: result.status || 401 },
			);
		}

		return NextResponse.json({ user: result.data });
	} catch (error) {
		console.error("Sign in error:", error);
		return NextResponse.json(
			{ error: "Authentication failed" },
			{ status: 500 },
		);
	}
}
