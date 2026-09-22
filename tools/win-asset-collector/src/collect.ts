import { readFile } from "node:fs/promises";
import { hostname, networkInterfaces } from "node:os";

export type RawDisk = {
	model: string;
	size: string;
};

export type RawWmi = {
	serial: string;
	manufacturer: string;
	model: string;
	processor: string;
	os: string;
	memory: string;
	chassis: number[];
	pcType: number;
	disks: RawDisk[];
	ipv4: string[];
	hostname: string;
};

async function run(cmd: string, args: string[]): Promise<string> {
	const proc = Bun.spawn([cmd, ...args], { stdout: "pipe", stderr: "pipe" });
	const [stdout, stderr] = await Promise.all([
		new Response(proc.stdout).text(),
		new Response(proc.stderr).text(),
	]);
	const exitCode = await proc.exited;
	if (exitCode !== 0) {
		throw new Error(
			`${cmd} failed (exit ${exitCode}): ${stderr.trim() || "no output"}`,
		);
	}
	return stdout.trim();
}

function firstIpv4(): string[] {
	const ips: string[] = [];
	for (const addresses of Object.values(networkInterfaces())) {
		for (const address of addresses ?? []) {
			if (address.family === "IPv4" && !address.internal) {
				ips.push(address.address);
			}
		}
	}
	return ips;
}

async function readSysfs(path: string): Promise<string> {
	try {
		const value = (await readFile(path, "utf8")).trim();
		if (!value || value === "To be filled by O.E.M.") {
			return "";
		}
		return value;
	} catch {
		return "";
	}
}

// --- Windows (PowerShell + WMI, in-box) ---

const WMI_SCRIPT = `
$ErrorActionPreference = 'SilentlyContinue'
$b = Get-CimInstance Win32_BIOS
$c = Get-CimInstance Win32_ComputerSystem
$o = Get-CimInstance Win32_OperatingSystem
$p = Get-CimInstance Win32_Processor | Select-Object -First 1
$e = Get-CimInstance Win32_SystemEnclosure
$d = Get-CimInstance Win32_DiskDrive
$n = Get-CimInstance Win32_NetworkAdapterConfiguration -Filter 'IPEnabled=True'
[PSCustomObject]@{
  serial = [string]$b.SerialNumber
  manufacturer = [string]$c.Manufacturer
  model = [string]$c.Model
  processor = [string]$p.Name
  os = [string]$o.Caption
  memory = [string]$c.TotalPhysicalMemory
  chassis = @($e.ChassisTypes | ForEach-Object { [int]$_ })
  pcType = [int]$c.PCSystemType
  disks = @($d | ForEach-Object { [PSCustomObject]@{ model = [string]$_.Model; size = [string]$_.Size } })
  ipv4 = @($n | ForEach-Object { $_.IPAddress } | Where-Object { $_ -match '^\\d{1,3}(\\.\\d{1,3}){3}$' })
  hostname = [string]$env:COMPUTERNAME
} | ConvertTo-Json -Compress -Depth 4
`.trim();

async function collectWindows(): Promise<RawWmi> {
	const stdout = await run("powershell.exe", [
		"-NoProfile",
		"-NonInteractive",
		"-ExecutionPolicy",
		"Bypass",
		"-Command",
		WMI_SCRIPT,
	]);
	if (!stdout) {
		throw new Error("PowerShell returned no output");
	}
	return JSON.parse(stdout) as RawWmi;
}

// --- Linux (DMI sysfs + /proc + lsblk, no external deps) ---

async function collectLinux(): Promise<RawWmi> {
	const processor = await readSysfs("/proc/cpuinfo").then(
		(cpuinfo) =>
			/(?:model name|Hardware)\s*:\s*(.+)/i.exec(cpuinfo)?.[1]?.trim() ?? "",
	);
	const osRelease = (await readSysfs("/etc/os-release")) || "";
	const os =
		/^PRETTY_NAME\s*=\s*"?([^"\n]+)"?/m.exec(osRelease)?.[1]?.trim() ?? "";
	const memTotalKb = await readSysfs("/proc/meminfo").then(
		(meminfo) => /^MemTotal:\s*(\d+)\s*kB/im.exec(meminfo)?.[1] ?? "0",
	);
	const chassisType = await readSysfs("/sys/class/dmi/id/chassis_type");
	let disks: RawDisk[] = [];
	try {
		const lsblk = await run("lsblk", [
			"-b",
			"-d",
			"-J",
			"-o",
			"NAME,MODEL,SIZE,TYPE",
		]);
		const parsed = JSON.parse(lsblk) as {
			blockdevices: {
				name: string;
				model: string | null;
				size: string;
				type: string;
			}[];
		};
		disks = (parsed.blockdevices ?? [])
			.filter((device) => device.type === "disk" && Number(device.size) > 0)
			.map((device) => ({ model: device.model ?? "", size: device.size }));
	} catch {
		disks = await readSysfsDisks();
	}
	if (disks.length === 0) {
		disks = await readSysfsDisks();
	}

	return {
		serial: await readSysfs("/sys/class/dmi/id/product_serial"),
		manufacturer: await readSysfs("/sys/class/dmi/id/sys_vendor"),
		model: await readSysfs("/sys/class/dmi/id/product_name"),
		processor,
		os,
		memory: `${BigInt(memTotalKb || 0) * 1024n}`,
		chassis: chassisType ? [Number(chassisType)] : [],
		pcType: 0,
		disks,
		ipv4: firstIpv4(),
		hostname: hostname(),
	};
}

async function readSysfsDisks(): Promise<RawDisk[]> {
	const disks: RawDisk[] = [];
	const root = "/sys/block";
	try {
		const { readdir } = await import("node:fs/promises");
		for (const name of await readdir("/sys/block")) {
			if (name.startsWith("loop") || name.startsWith("ram")) {
				continue;
			}
			const model = await readSysfs(`${root}/${name}/device/model`);
			const size = await readSysfs(`${root}/${name}/size`);
			if (size) {
				// /sys/block/*/size is in 512-byte sectors.
				disks.push({ model, size: `${BigInt(size) * 512n}` });
			}
		}
	} catch {
		// no readable block devices
	}
	return disks;
}

// --- macOS (sysctl + system_profiler + sw_vers, in-box) ---

type HardwareDataType = {
	SPHardwareDataType?: {
		serial_number?: string;
		machine_model?: string;
		model_identifier?: string;
		model_name?: string;
	}[];
};

type StorageDataType = {
	SPStorageDataType?: {
		_name?: string;
		_size?: string;
		size_in_bytes?: number;
		physical_drive?: {
			device_name?: string;
		};
	}[];
};

async function collectMacos(): Promise<RawWmi> {
	let hardware: Partial<RawWmi> = {};
	try {
		const stdout = await run("system_profiler", [
			"SPHardwareDataType",
			"-json",
		]);
		const parsed = JSON.parse(stdout) as HardwareDataType;
		const item = parsed.SPHardwareDataType?.[0];
		const modelName = item?.machine_model ?? item?.model_name ?? "";
		hardware = {
			serial: item?.serial_number ?? "",
			manufacturer: "Apple Inc.",
			model: item?.model_identifier ?? item?.machine_model ?? modelName,
		};
		hardware.pcType = /mini|book/i.test(modelName) ? 2 : 1;
	} catch {
		hardware = { pcType: 1 };
	}

	let memory = "";
	try {
		const stdout = await run("sysctl", ["-n", "hw.memsize"]);
		memory = stdout.trim();
	} catch {
		// unknown memory
	}

	let processor = "";
	try {
		const stdout = await run("sysctl", ["-n", "machdep.cpu.brand_string"]);
		processor = stdout.trim();
	} catch {
		// Apple Silicon Macs expose brand string via hw.* elsewhere; leave empty
	}

	let os = "";
	try {
		const [productName, productVersion] = await Promise.all([
			run("sw_vers", ["-productName"]),
			run("sw_vers", ["-productVersion"]),
		]);
		os = `${productName.trim()} ${productVersion.trim()}`;
	} catch {
		// unknown OS
	}

	let disks: RawDisk[] = [];
	try {
		const stdout = await run("system_profiler", ["SPStorageDataType", "-json"]);
		const parsed = JSON.parse(stdout) as StorageDataType;
		const seen = new Set<string>();
		disks = (parsed.SPStorageDataType ?? [])
			.map((item) => ({
				model: item.physical_drive?.device_name ?? item._name ?? "",
				size:
					item.size_in_bytes !== undefined
						? `${item.size_in_bytes}`
						: parseMacSize(item._size),
			}))
			.filter((disk) => {
				if (Number(disk.size) <= 0) {
					return false;
				}
				const key = `${disk.model}:${disk.size}`;
				if (seen.has(key)) {
					return false;
				}
				seen.add(key);
				return true;
			});
	} catch {
		// unknown disks
	}

	return {
		serial: hardware.serial ?? "",
		manufacturer: hardware.manufacturer ?? "",
		model: hardware.model ?? "",
		processor,
		os,
		memory,
		chassis: [],
		pcType: hardware.pcType ?? 1,
		disks,
		ipv4: firstIpv4(),
		hostname: hostname(),
	};
}

function parseMacSize(size: string | undefined): string {
	// system_profiler sizes look like "1 TB" or "512.1 GB".
	if (!size) {
		return "0";
	}
	const match = /^([\d.]+)\s*(B|KB|MB|GB|TB)$/i.exec(size.trim());
	if (!match) {
		return "0";
	}
	const value = Number(match[1]);
	const unit = match[2].toUpperCase();
	const multipliers: Record<string, number> = {
		B: 1,
		KB: 1e3,
		MB: 1e6,
		GB: 1e9,
		TB: 1e12,
	};
	const multiplier = multipliers[unit];
	if (!Number.isFinite(value) || value <= 0 || multiplier === undefined) {
		return "0";
	}
	return `${Math.round(value * multiplier)}`;
}

export function dryRunData(): RawWmi {
	return {
		serial: "CN-X1234-5678-9A0B",
		manufacturer: "Dell Inc.",
		model: "Precision 5480",
		processor: "Intel(R) Core(TM) Ultra 7 155H",
		os: "Microsoft Windows 11 Pro",
		memory: "34610982912",
		chassis: [30],
		pcType: 2,
		disks: [
			{ model: "Samsung SSD 990 PRO 1TB", size: "1000204886016" },
			{ model: "WDC WDS500G2B0A-00SM50", size: "500107862016" },
		],
		ipv4: ["192.168.10.15"],
		hostname: "NEWPC-001",
	};
}

export function collect(): Promise<RawWmi> {
	switch (process.platform) {
		case "win32":
			return collectWindows();
		case "linux":
			return collectLinux();
		case "darwin":
			return collectMacos();
		default:
			return Promise.reject(
				new Error(
					`Unsupported platform "${process.platform}". Use --dry-run to test with sample data.`,
				),
			);
	}
}
