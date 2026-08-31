import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { RowDataPacket } from "mysql2";

import { exchangeCodeForUser } from "@/lib/microsoft-auth";
import db from "@/lib/database";
import { SESSION_COOKIE_NAME } from "@/lib/auth.server";
import { env } from "@/lib/env";

// Session duration in milliseconds (1 day)
const SESSION_DURATION = 24 * 60 * 60 * 1000;

type UserRow = RowDataPacket & {
	name: string;
	id: number;
	username: string;
	password: string;
	empCode: number;
	type: string;
	token: string;
	email: string;
};

function getSecureFlag(): boolean {
	return env.COOKIE_SECURE;
}

function getSessionOptions(token: string) {
	return {
		name: SESSION_COOKIE_NAME,
		value: token,
		httpOnly: true,
		secure: getSecureFlag(),
		sameSite: "lax" as const,
		expires: new Date(Date.now() + SESSION_DURATION),
		path: "/",
	};
}

/**
 * Records an authentication attempt into the legacy logins_logs table.
 */
async function logLoginAttempt(userID: number, success: boolean) {
	try {
		const headerList = await import("next/headers").then((m) => m.headers());
		const forwarded = (await headerList).get("x-forwarded-for");
		const ip =
			forwarded?.split(",")[0]?.trim() ||
			(await headerList).get("x-real-ip") ||
			"";
		await db.iss.execute(
			"INSERT INTO ISS.logins_logs (ip, date, userID, login_success) VALUES (?, NOW(), ?, ?)",
			[ip, userID, success],
		);
	} catch (error) {
		console.error("Error logging login attempt:", error);
		// Logging must never block authentication
	}
}

export async function GET(request: NextRequest) {
	try {
		// Extract authorization code and state from query parameters
		const searchParams = request.nextUrl.searchParams;
		const code = searchParams.get("code");
		const state = searchParams.get("state");

		// Get stored state and codeVerifier from cookies
		const storedState = request.cookies.get("microsoft_auth_state")?.value;
		const codeVerifier = request.cookies.get("microsoft_code_verifier")?.value;

		// Validate state for CSRF protection
		if (!state || state !== storedState) {
			console.error("State mismatch - possible CSRF attack");
			return NextResponse.redirect(
				new URL("/auth?error=csrf_validation_failed", request.url),
			);
		}

		if (!code || !codeVerifier) {
			return NextResponse.redirect(
				new URL("/auth?error=missing_auth_code", request.url),
			);
		}

		// Exchange code for user info
		const userInfo = await exchangeCodeForUser(code, codeVerifier);

		if (!userInfo?.email) {
			await logLoginAttempt(0, false);
			return NextResponse.redirect(
				new URL("/auth?error=failed_to_get_user_info", request.url),
			);
		}

		// Look up user in ISS.users by email
		const [rows] = await db.iss.execute<UserRow[]>(
			"SELECT * FROM ISS.users WHERE email = ? LIMIT 1",
			[userInfo.email],
		);

		const user = rows[0] as UserRow | undefined;

		if (!user) {
			// User not found in system - redirect to auth with error
			// In a production system, you might auto-provision users here
			await logLoginAttempt(0, false);
			return NextResponse.redirect(
				new URL("/auth?error=user_not_found_contact_admin", request.url),
			);
		}

		// Log successful login
		await logLoginAttempt(user.id, true);

		// Create response that redirects to /app
		const response = NextResponse.redirect(new URL("/app", request.url));

		// Set session cookie
		const sessionOptions = getSessionOptions(user.token);
		response.cookies.set(sessionOptions.name, sessionOptions.value, {
			httpOnly: sessionOptions.httpOnly,
			secure: sessionOptions.secure,
			sameSite: sessionOptions.sameSite,
			expires: sessionOptions.expires,
			path: sessionOptions.path,
		});

		// Clear auth cookies
		response.cookies.delete("microsoft_auth_state");
		response.cookies.delete("microsoft_code_verifier");

		return response;
	} catch (error) {
		console.error("Error in Microsoft auth callback:", error);
		return NextResponse.redirect(
			new URL("/auth?error=authentication_failed", request.url),
		);
	}
}
