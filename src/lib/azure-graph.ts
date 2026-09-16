import { env } from "./env";

const GRAPH_BASE = "https://graph.microsoft.com/v1.0";

let tokenCache: { token: string; expiresAt: number } | null = null;

export type AzureUserDetails = {
	accountEnabled: boolean | null;
	displayName: string | null;
	jobTitle: string | null;
	department: string | null;
	officeLocation: string | null;
	city: string | null;
	country: string | null;
	mail: string | null;
	userPrincipalName: string | null;
	usageLocation: string | null;
	companyName: string | null;
	employeeId: string | null;
};

export async function getGraphAccessToken(): Promise<string> {
	const now = Date.now();

	if (tokenCache && tokenCache.expiresAt > now + 60_000) {
		return tokenCache.token;
	}

	const tokenEndpoint = `https://login.microsoftonline.com/${env.AZURE_TENANT_ID}/oauth2/v2.0/token`;

	const response = await fetch(tokenEndpoint, {
		method: "POST",
		headers: { "Content-Type": "application/x-www-form-urlencoded" },
		body: new URLSearchParams({
			client_id: env.AZURE_CLIENT_ID,
			client_secret: env.AZURE_CLIENT_SECRET,
			scope: "https://graph.microsoft.com/.default",
			grant_type: "client_credentials",
		}).toString(),
	});

	if (!response.ok) {
		const text = await response.text();
		throw new Error(`Failed to get Graph access token: ${response.status} ${text}`);
	}

	const data = (await response.json()) as {
		access_token: string;
		expires_in: number;
	};

	tokenCache = {
		token: data.access_token,
		expiresAt: now + data.expires_in * 1000,
	};

	return data.access_token;
}

const SELECT_FIELDS = [
	"accountEnabled",
	"displayName",
	"jobTitle",
	"department",
	"officeLocation",
	"city",
	"country",
	"mail",
	"userPrincipalName",
	"usageLocation",
	"companyName",
	"employeeId",
].join(",");

export async function getAzureUserDetails(email: string): Promise<AzureUserDetails | null> {
	if (!email) return null;

	try {
		const token = await getGraphAccessToken();

		const response = await fetch(
			`${GRAPH_BASE}/users/${encodeURIComponent(email)}?$select=${SELECT_FIELDS}`,
			{
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
			},
		);

		if (!response.ok) {
			console.error(`[azure-graph] ${response.status} for ${email}: ${await response.text()}`);
			return null;
		}

		const data = (await response.json()) as Record<string, unknown>;
		return {
			accountEnabled: (data.accountEnabled as boolean) ?? null,
			displayName: (data.displayName as string) ?? null,
			jobTitle: (data.jobTitle as string) ?? null,
			department: (data.department as string) ?? null,
			officeLocation: (data.officeLocation as string) ?? null,
			city: (data.city as string) ?? null,
			country: (data.country as string) ?? null,
			mail: (data.mail as string) ?? null,
			userPrincipalName: (data.userPrincipalName as string) ?? null,
			usageLocation: (data.usageLocation as string) ?? null,
			companyName: (data.companyName as string) ?? null,
			employeeId: (data.employeeId as string) ?? null,
		};
	} catch (err) {
		console.error(`[azure-graph] Error checking ${email}:`, err);
		return null;
	}
}
