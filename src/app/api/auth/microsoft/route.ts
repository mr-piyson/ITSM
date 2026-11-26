import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
	MICROSOFT_NEXT_COOKIE,
	resolveLoginDestination,
} from "@/lib/auth-destinations";
import { env } from "@/lib/env";
import { getAuthorizationUrl, generatePKCE } from "@/lib/microsoft-auth";

export async function GET(request: NextRequest) {
	try {
		// Generate PKCE values
		const { codeVerifier } = generatePKCE();

		// Generate a random state for CSRF protection
		const state = crypto.getRandomValues(new Uint8Array(32)).toString();

		// Remember only a whitelisted post-login destination.
		const next = resolveLoginDestination(
			request.nextUrl.searchParams.get("next"),
		);

		// Create the authorization URL
		const authUrl = await getAuthorizationUrl(state, codeVerifier);

		// Create response and set cookies for state and code verifier
		const response = NextResponse.redirect(authUrl.toString());

		// Store state and codeVerifier in secure httpOnly cookies
		response.cookies.set("microsoft_auth_state", state, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			maxAge: 10 * 60, // 10 minutes
		});

		response.cookies.set("microsoft_code_verifier", codeVerifier, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			maxAge: 10 * 60, // 10 minutes
		});

		response.cookies.set(MICROSOFT_NEXT_COOKIE, next, {
			httpOnly: true,
			secure: process.env.NODE_ENV === "production",
			sameSite: "lax",
			maxAge: 10 * 60, // 10 minutes
		});

		return response;
	} catch (error) {
		console.error("Error initiating Microsoft auth:", error);
		return NextResponse.redirect(
			new URL("/auth?error=auth_failed", env.APP_URL),
		);
	}
}
