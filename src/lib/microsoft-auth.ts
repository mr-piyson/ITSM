import { createHash, randomBytes } from "crypto";
import { env } from "./env";

function base64url(data: string | Buffer): string {
	return Buffer.from(data)
		.toString("base64")
		.replace(/\+/g, "-")
		.replace(/\//g, "_")
		.replace(/=/g, "");
}

function generateCodeVerifier(): string {
	return base64url(randomBytes(32));
}

function generateCodeChallenge(verifier: string): string {
	return base64url(createHash("sha256").update(verifier).digest());
}

function getRedirectUri(): string {
	const appUrl = env.APP_URL || "http://localhost:3000";
	return `${appUrl}/api/auth/microsoft/callback`;
}

async function getOidcConfig() {
	const tenantId = env.AZURE_TENANT_ID;
	const configUrl = `https://login.microsoftonline.com/${tenantId}/v2.0/.well-known/openid-configuration`;

	const response = await fetch(configUrl);
	if (!response.ok) {
		throw new Error(`Failed to fetch OIDC config: ${response.statusText}`);
	}

	return response.json() as Promise<{
		authorization_endpoint: string;
		token_endpoint: string;
		userinfo_endpoint: string;
	}>;
}

export async function getAuthorizationUrl(
	state: string,
	codeVerifier: string,
): Promise<string> {
	const config = await getOidcConfig();
	const codeChallenge = generateCodeChallenge(codeVerifier);

	const params = new URLSearchParams({
		client_id: env.AZURE_CLIENT_ID,
		redirect_uri: getRedirectUri(),
		response_type: "code",
		scope: "openid profile email",
		state,
		code_challenge: codeChallenge,
		code_challenge_method: "S256",
	});

	return `${config.authorization_endpoint}?${params.toString()}`;
}

export async function exchangeCodeForUser(
	code: string,
	codeVerifier: string,
): Promise<{
	email: string;
	name: string;
	oid: string;
	firstName?: string;
	lastName?: string;
} | null> {
	try {
		const config = await getOidcConfig();

		// Exchange code for tokens
		const tokenResponse = await fetch(config.token_endpoint, {
			method: "POST",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded",
			},
			body: new URLSearchParams({
				client_id: env.AZURE_CLIENT_ID,
				client_secret: env.AZURE_CLIENT_SECRET,
				code,
				redirect_uri: getRedirectUri(),
				grant_type: "authorization_code",
				code_verifier: codeVerifier,
			}).toString(),
		});

		if (!tokenResponse.ok) {
			const error = await tokenResponse.text();
			console.error("Token exchange failed:", error);
			return null;
		}

		const tokenData = (await tokenResponse.json()) as {
			id_token?: string;
			access_token?: string;
		};

		if (!tokenData.id_token) {
			console.error("No id_token in response");
			return null;
		}

		// Decode JWT (id_token) to get user claims
		// JWT format: header.payload.signature
		const parts = tokenData.id_token.split(".");
		if (parts.length !== 3) {
			console.error("Invalid JWT format");
			return null;
		}

		const payload = JSON.parse(
			Buffer.from(parts[1], "base64").toString("utf-8"),
		) as {
			email?: string;
			name?: string;
			oid?: string;
			given_name?: string;
			family_name?: string;
		};

		return {
			email: payload.email ?? "",
			name: payload.name ?? "",
			oid: payload.oid ?? "",
			firstName: payload.given_name,
			lastName: payload.family_name,
		};
	} catch (error) {
		console.error("Error exchanging code for user:", error);
		return null;
	}
}

export function generatePKCE(): {
	codeVerifier: string;
	codeChallenge: string;
} {
	const codeVerifier = generateCodeVerifier();
	const codeChallenge = generateCodeChallenge(codeVerifier);

	return {
		codeVerifier,
		codeChallenge,
	};
}
