import type { AzureUserDetails } from "@/lib/azure-graph";

export const LICENSE_SKU_LABELS: Record<string, string> = {
	ENTERPRISEPACK: "Microsoft 365 E3",
	ENTERPRISEPREMIUM: "Microsoft 365 E5",
	SPE_E5: "Microsoft 365 E5",
	ENTERPRISEPACKGOV: "Microsoft 365 GCC E3",
	ENTERPRISEPREMIUMGOV: "Microsoft 365 GCC E5",
	O365_BUSINESS_PREMIUM: "Microsoft 365 Business Premium",
	M365BUSINESSSTANDARD: "Microsoft 365 Business Standard",
	M365BUSINESSBASIC: "Microsoft 365 Business Basic",
	O365_BUSINESS_ESSENTIALS: "Microsoft 365 Business Essentials",
	ENTERPRISEWITHSCAL: "Office 365 E3",
	ENTERPRISEWITHSCAL_SPEC: "Office 365 E3",
	EXCHANGEENTERPRISE: "Exchange Online (Plan 2)",
	EXCHANGESTANDARD: "Exchange Online (Plan 1)",
	POWER_BI_PRO: "Power BI Pro",
	FLOW_FREE: "Power Automate Free",
	INTUNE_O365: "Entra ID / Intune",
	ATP_ENTERPRISE: "Defender for Office 365 (add-on)",
};

const EXCHANGE_PLAN_NAMES = new Set([
	"EXCHANGE_S_ENTERPRISE",
	"EXCHANGEENTERPRISE",
	"EXCHANGE_S_STANDARD",
	"EXCHANGESTANDARD",
]);

const ARCHIVE_PLAN_NAMES = new Set(["EXCHANGE_S_ARCHIVE", "EXCHANGE_ARCHIVE"]);

function provisioningSucceeded(status: string): boolean {
	return status === "Success";
}

export type AzureAccessSummary = {
	licenseTypes: string[];
	hasArchive: boolean;
	emailActive: boolean | null;
};

export function summarizeAzureAccess(azure: AzureUserDetails): AzureAccessSummary {
	const skus = new Set<string>();
	let hasArchive = false;
	let hasProvisionedExchange = false;

	for (const license of azure.licenses) {
		if (license.skuPartNumber) {
			skus.add(license.skuPartNumber);
		}
		for (const sp of license.servicePlans) {
			if (ARCHIVE_PLAN_NAMES.has(sp.servicePlanName) && provisioningSucceeded(sp.provisioningStatus)) {
				hasArchive = true;
			}
			if (EXCHANGE_PLAN_NAMES.has(sp.servicePlanName) && provisioningSucceeded(sp.provisioningStatus)) {
				hasProvisionedExchange = true;
			}
		}
	}

	const fromMailboxSettings =
		azure.mailboxSettings?.archiveStatus != null && azure.mailboxSettings.archiveStatus !== "none";
	hasArchive = hasArchive || fromMailboxSettings;

	const emailActive =
		azure.accountEnabled == null && !hasProvisionedExchange
			? null
			: azure.accountEnabled === true && hasProvisionedExchange;

	return {
		licenseTypes: Array.from(skus).map((sku) => LICENSE_SKU_LABELS[sku] ?? sku),
		hasArchive,
		emailActive,
	};
}