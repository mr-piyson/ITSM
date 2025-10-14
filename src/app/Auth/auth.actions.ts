"use server";

import type { users } from "@prisma/client";
import * as bcrypt from "bcrypt";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { z } from "zod";
import db from "@/lib/prisma";
import type { SignInSchema } from "./SignIn";

// Session duration in milliseconds (1 days)
const SESSION_DURATION = 24 * 60 * 60 * 1000;

// Interface for user session

/**
 * Get the current user session from the cookies
 */
export async function getUser(): Promise<users | undefined | null> {
	const sessionToken = (await cookies()).get("session_token")?.value;
	if (!sessionToken) {
		return null;
	}

	const user = await db.users.findFirst({
		where: {
			token: sessionToken,
		},
	});

	if (!user) {
		return null;
	}

	return user;
}

export async function signIn(formData: z.infer<typeof SignInSchema>) {
	const email = formData.email as string;
	const password = formData.password as string;

	if (!email || !password) {
		return {
			error: "Email and password are required",
		};
	}

	try {
		const account = await db.users.findFirst({
			where: {
				email: email.toLowerCase(),
			},
		});

		// Verify password (in a real app, use hashed passwords and a library like bcrypt)
		// Here we assume the password is stored in plain text for simplicity (not recommended)
		if (!account) {
			return {
				data: undefined,
				error: "Invalid email or password",
				status: 401,
			};
		} else {
			// change $2y$ to $2b$
			account.password = account.password.replace("$2y$", "$2b$");
			const passwordMatch = await bcrypt.compare(password, account.password);
			if (!passwordMatch) {
				return {
					data: undefined,
					error: "Invalid email or password",
					status: 401,
				};
			}

			// Generate session token
			const expiresAt = new Date(Date.now() + SESSION_DURATION);

			// Set the session token in cookies
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
 * Sign out the current user by removing the session
 */
export async function signOut() {
	const sessionToken = (await cookies()).get("session_token")?.value;

	// if (sessionToken) {
	//   try {
	//     // Delete the session from the database
	//     await prisma.session.delete({
	//       where: {
	//         token: sessionToken,
	//       },
	//     });
	//   } catch (error) {
	//     console.error("Error deleting session:", error);
	//   }
	// }

	// Delete the session cookie
	(await cookies()).delete("session_token");

	// Redirect to the home page
	redirect("/Auth");
}

/**
 * Protect a route by checking if the user is authenticated
 */
export async function requireAuth() {
	const session = await getUser();

	if (!session) redirect("/Auth");

	return session;
}
