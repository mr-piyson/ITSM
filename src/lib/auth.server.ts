import * as bcrypt from "bcrypt";
import type { RowDataPacket } from "mysql2";
import { cookies } from "next/headers";

import db from "@/lib/database";

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

/**
 * Get the current user session from the cookies (server-side only)
 */
export async function getUser(): Promise<UserRow | null> {
	const sessionToken = (await cookies()).get("session_token")?.value;
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
 * Server-side sign in handler
 */
export async function handleSignIn(email: string, password: string) {
	if (!email || !password) {
		return {
			error: "Email and password are required",
		};
	}

	try {
		const [resAccount] = await db.iss.execute<UserRow[]>(
			`select * from ISS.users where email = '${email}' limit 1;`,
		);
		const account = resAccount[0] as UserRow | undefined;

		if (!account) {
			return {
				data: undefined,
				error: "Invalid email or password",
				status: 401,
			};
		} else {
			account.password = account.password.replace("$2y$", "$2b$");
			const passwordMatch = await bcrypt.compare(password, account.password);
			if (!passwordMatch) {
				return {
					data: undefined,
					error: "Invalid email or password",
					status: 401,
				};
			}

			const expiresAt = new Date(Date.now() + SESSION_DURATION);

			(await cookies()).set({
				name: "session_token",
				value: account.token,
				httpOnly: true,
				secure: process.env.NODE_ENV === "production",
				sameSite: "lax",
				expires: expiresAt,
				path: "/",
			});
			return {
				data: account,
				error: undefined,
				status: 200,
			};
		}
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
	(await cookies()).delete("session_token");
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
