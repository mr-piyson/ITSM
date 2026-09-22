import { collect, dryRunData } from "./collect";
import { resolveAppUrl } from "./config";
import { mapFields } from "./map";
import { buildLink } from "./payload";

type Flags = {
	url?: string;
	dryRun: boolean;
	json: boolean;
	noOpen: boolean;
};

function parseFlags(argv: string[]): Flags {
	const flags: Flags = { dryRun: false, json: false, noOpen: false };
	for (let i = 0; i < argv.length; i += 1) {
		const arg = argv[i];
		switch (arg) {
			case "--url":
				flags.url = argv[++i];
				break;
			case "--dry-run":
				flags.dryRun = true;
				break;
			case "--json":
				flags.json = true;
				break;
			case "--no-open":
				flags.noOpen = true;
				break;
			case "--help":
			case "-h":
			case "-?":
				printHelp();
				process.exit(0);
			default:
				if (!arg.startsWith("--")) {
					flags.url = arg;
					break;
				}
				console.error(`Unknown option: ${arg}`);
				printHelp();
				process.exit(1);
		}
	}
	return flags;
}

function printHelp(): void {
	console.log(
		[
			"ITSM Asset Collector",
			"Collects hardware info from this PC and opens the ITSM 'Add New Asset' dialog prefilled.",
			"",
			"Usage:",
			"  ITSM-AssetCollector.exe [options]",
			"",
			"Options:",
			"  --url <url>     Override the ITSM base URL baked into this build",
			"  --json          Print the collected payload as JSON (no browser)",
			"  --dry-run       Use sample data (for testing on non-Windows)",
			"  --no-open       Collect data and print the link without opening the browser",
			"  --help          Show this help",
		].join("\n"),
	);
}

function openInBrowser(url: string): void {
	if (process.platform === "win32") {
		Bun.spawn(["cmd.exe", "/c", "start", "", url]);
	} else if (process.platform === "darwin") {
		Bun.spawn(["open", url]);
	} else {
		Bun.spawn(["xdg-open", url]);
	}
}

async function collectData(dryRun: boolean) {
	return dryRun ? dryRunData() : collect();
}

async function main(): Promise<void> {
	const flags = parseFlags(process.argv.slice(2));
	const appUrl = resolveAppUrl(flags.url);
	if (!appUrl) {
		console.error(
			"No ITSM URL configured. Pass --url <url> or build with APP_URL set in .env.",
		);
		process.exit(1);
	}

	let raw;
	try {
		raw = await collectData(flags.dryRun);
	} catch (error) {
		console.error(`Failed to collect hardware info: ${String(error)}`);
		process.exit(1);
	}

	const fields = mapFields(raw);
	const json = JSON.stringify(fields, null, 2);
	if (flags.json) {
		console.log(json);
		return;
	}
	if (flags.noOpen) {
		console.log("Collected hardware info:");
		console.log(json);
		console.log(`\nAssets URL: ${buildLink(appUrl, fields)}`);
		return;
	}

	console.log("Collected hardware info:");
	for (const [key, value] of Object.entries(fields)) {
		if (value) {
			console.log(`  ${key.padEnd(14)} ${value}`);
		}
	}
	console.log("");

	const link = buildLink(appUrl, fields);
	openInBrowser(link);
	console.log(`Opened the ITSM 'Add New Asset' dialog at:\n  ${link}`);
	await promptClose();
}

function promptClose(): Promise<void> {
	if (!process.stdin.isTTY) {
		return Promise.resolve();
	}
	return new Promise((resolve) => {
		process.stdout.write("\nPress Enter to close...");
		process.stdin.resume();
		process.stdin.once("data", () => {
			process.stdin.pause();
			resolve();
		});
	});
}

main().catch((error) => {
	console.error(`Unexpected error: ${String(error)}`);
	process.exit(1);
});
