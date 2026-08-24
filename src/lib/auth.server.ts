import * as bcrypt from "bcrypt";
import type { RowDataPacket } from "mysql2";
import { cookies, headers } from "next/headers";

import db from "@/lib/database";

// Session duration in milliseconds (1 day)
const SESSION_DURATION = 24 * 60 * 60 * 1000;

export const SESSION_COOKIE_NAME = "session_token";

function getSecureFlag(): boolean {
	return process.env.COOKIE_SECURE === "true";
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

/**
 * Get the current user session from the cookies (server-side only)
 */
export async function getUser(): Promise<UserRow | null> {
	const sessionToken = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
	if (!sessionToken) {
		return null;
	}

	const [rows] = await db.iss.query<UserRow[]>(
		"SELECT * FROM ISS.users WHERE token = ?",
		[sessionToken],
	);

	const user = rows[0] ?? null;

	return user;
}

/**
 * Records an authentication attempt into the legacy logins_logs table.
 */
async function logLoginAttempt(userID: number, success: boolean) {
	try {
		const headerList = await headers();
		const forwarded = headerList.get("x-forwarded-for");
		const ip =
			forwarded?.split(",")[0]?.trim() || headerList.get("x-real-ip") || "";
		await db.iss.execute(
			"INSERT INTO ISS.logins_logs (ip, date, userID, login_success) VALUES (?, NOW(), ?, ?)",
			[ip, userID, success],
		);
	} catch {
		// Logging must never block authentication.
	}
}

/**
 * Server-side sign in handler
 */
export async function handleSignIn(identifier: string, password: string) {
	if (!identifier || !password) {
		return {
			error: "Email/username and password are required",
		};
	}

	try {
		const [resAccount] = await db.iss.execute<UserRow[]>(
			"SELECT * FROM ISS.users WHERE email = ? OR username = ? LIMIT 1",
			[identifier, identifier],
		);
		const account = resAccount[0] as UserRow | undefined;

		if (!account) {
			await logLoginAttempt(0, false);
			return {
				data: undefined,
				error: "Invalid email or password",
				status: 401,
			};
		}

		account.password = account.password.replace("$2y$", "$2b$");
		const passwordMatch = await bcrypt.compare(password, account.password);
		if (!passwordMatch) {
			await logLoginAttempt(account.id, false);
			return {
				data: undefined,
				error: "Invalid email or password",
				status: 401,
			};
		}

		await logLoginAttempt(account.id, true);
		(await cookies()).set(getSessionOptions(account.token));
		return {
			data: account,
			error: undefined,
			status: 200,
		};
	} catch (error) {
		console.error("Sign in error:", error);
		return {
			error: "Authentication failed",
		};
	}
}

/**
 * Server-side sign out handler
 */
export async function handleSignOut() {
	(await cookies()).delete(SESSION_COOKIE_NAME);
	return { redirect: "/auth" };
}

/**
 * Protect a route by checking if the user is authenticated
 */
export async function requireAuth() {
	const session = await getUser();
	if (!session) {
		const { redirect } = await import("next/navigation");
		redirect("/auth");
	}
	return session;
}
