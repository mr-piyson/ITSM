import { env } from "./env";
import {
	summarizeAzureAccess,
	type AzureAccessSummary,
} from "./azure-license-summary";

const GRAPH_BASE = "https://graph.microsoft.com/v1.0";

const BATCH_CONCURRENCY = 10;

let tokenCache: { token: string; expiresAt: number } | null = null;

export type AzureLicenseDetail = {
	skuId: string;
	skuPartNumber: string;
	servicePlans: {
		servicePlanName: string;
		provisioningStatus: string;
	}[];
};

export type AzureMailboxSettings = {
	archiveStatus: string | null;
};

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
	userType: string | null;
	isResourceAccount: boolean | null;
	licenses: AzureLicenseDetail[];
	mailboxSettings: AzureMailboxSettings | null;
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
	"userType",
	"isResourceAccount",
].join(",");

async function fetchUserDetails(email: string, token: string): Promise<Record<string, unknown> | null> {
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
		console.error(`[azure-graph] User ${response.status} for ${email}: ${await response.text()}`);
		return null;
	}

	return (await response.json()) as Record<string, unknown>;
}

async function fetchUserAccountEnabled(email: string, token: string): Promise<boolean | null> {
	try {
		const response = await fetch(
			`${GRAPH_BASE}/users/${encodeURIComponent(email)}?$select=accountEnabled`,
			{
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
			},
		);

		if (!response.ok) {
			console.error(`[azure-graph] Account status ${response.status} for ${email}`);
			return null;
		}

		const data = (await response.json()) as { accountEnabled?: boolean };
		return data.accountEnabled ?? null;
	} catch {
		return null;
	}
}

async function mapWithConcurrency<T, R>(
	items: T[],
	limit: number,
	fn: (item: T) => Promise<R>,
): Promise<R[]> {
	const results = new Array<R>(items.length);
	let index = 0;
	const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
		while (index < items.length) {
			const i = index;
			index += 1;
			results[i] = await fn(items[i]);
		}
	});
	await Promise.all(workers);
	return results;
}

async function fetchLicenseDetails(email: string, token: string): Promise<AzureLicenseDetail[]> {
	try {
		const response = await fetch(
			`${GRAPH_BASE}/users/${encodeURIComponent(email)}/licenseDetails`,
			{
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
			},
		);

		if (!response.ok) {
			console.error(`[azure-graph] Licenses ${response.status} for ${email}`);
			return [];
		}

		const data = (await response.json()) as {
			value: {
				skuId: string;
				skuPartNumber: string;
				servicePlans: {
					servicePlanName: string;
					provisioningStatus: string;
				}[];
			}[];
		};

		return (data.value ?? []).map((l) => ({
			skuId: l.skuId ?? "",
			skuPartNumber: l.skuPartNumber ?? "",
			servicePlans: (l.servicePlans ?? []).map((sp) => ({
				servicePlanName: sp.servicePlanName ?? "",
				provisioningStatus: sp.provisioningStatus ?? "",
			})),
		}));
	} catch (err) {
		console.error(`[azure-graph] Error fetching licenses for ${email}:`, err);
		return [];
	}
}

async function fetchMailboxSettings(email: string, token: string): Promise<AzureMailboxSettings | null> {
	try {
		const response = await fetch(
			`${GRAPH_BASE}/users/${encodeURIComponent(email)}/mailboxSettings`,
			{
				headers: {
					Authorization: `Bearer ${token}`,
					"Content-Type": "application/json",
				},
			},
		);

		if (!response.ok) {
			return null;
		}

		const data = (await response.json()) as Record<string, unknown>;
		return {
			archiveStatus: (data.archiveStatus as string) ?? null,
		};
	} catch {
		return null;
	}
}

export async function getAzureUserDetails(email: string): Promise<AzureUserDetails | null> {
	if (!email) return null;

	try {
		const token = await getGraphAccessToken();

		const [userData, licenses, mailboxSettings] = await Promise.all([
			fetchUserDetails(email, token),
			fetchLicenseDetails(email, token),
			fetchMailboxSettings(email, token),
		]);

		if (!userData) return null;

		return {
			accountEnabled: (userData.accountEnabled as boolean) ?? null,
			displayName: (userData.displayName as string) ?? null,
			jobTitle: (userData.jobTitle as string) ?? null,
			department: (userData.department as string) ?? null,
			officeLocation: (userData.officeLocation as string) ?? null,
			city: (userData.city as string) ?? null,
			country: (userData.country as string) ?? null,
			mail: (userData.mail as string) ?? null,
			userPrincipalName: (userData.userPrincipalName as string) ?? null,
			usageLocation: (userData.usageLocation as string) ?? null,
			companyName: (userData.companyName as string) ?? null,
			employeeId: (userData.employeeId as string) ?? null,
			userType: (userData.userType as string) ?? null,
			isResourceAccount: (userData.isResourceAccount as boolean) ?? null,
			licenses,
			mailboxSettings,
		};
	} catch (err) {
		console.error(`[azure-graph] Error fetching details for ${email}:`, err);
		return null;
	}
}

export async function getAzureAccessSummaries(
	emails: string[],
): Promise<Record<string, AzureAccessSummary>> {
	const unique = Array.from(new Set(emails.filter(Boolean)));
	if (unique.length === 0) return {};

	try {
		const token = await getGraphAccessToken();

		const results = await mapWithConcurrency(unique, BATCH_CONCURRENCY, async (email) => {
			const [accountEnabled, licenses] = await Promise.all([
				fetchUserAccountEnabled(email, token),
				fetchLicenseDetails(email, token),
			]);

			if (accountEnabled == null) return null;

			const summary = summarizeAzureAccess({
				accountEnabled,
				licenses,
				mailboxSettings: null,
			});
			return { email, summary };
		});

		const out: Record<string, AzureAccessSummary> = {};
		for (const result of results) {
			if (result) out[result.email] = result.summary;
		}
		return out;
	} catch (err) {
		console.error(`[azure-graph] Error fetching summaries for ${emails.length} emails:`, err);
		return {};
	}
}
