import type { RawDisk, RawWmi } from "./collect";

const MAX = 50;

const LAPTOP_CHASSIS = new Set([8, 9, 10, 11, 12, 14, 31]);
const TABLET_CHASSIS = new Set([30, 32]);

export type MappedFields = {
	type: string;
	serialNumber: string;
	manufacturer: string;
	model: string;
	processor: string;
	os: string;
	memory: string;
	hdd: string;
	deviceName: string;
	ip: string;
};

function truncate(value: string, max: number): string {
	return value.trim().slice(0, max);
}

export function detectType(raw: RawWmi): string {
	if (raw.chassis.some((c) => LAPTOP_CHASSIS.has(c))) {
		return "Laptop";
	}
	if (raw.chassis.some((c) => TABLET_CHASSIS.has(c))) {
		return "Tablet";
	}
	if (raw.pcType === 2) {
		return "Laptop";
	}
	return "Desktop";
}

function formatMemory(bytes: string): string {
	const value = Number(bytes);
	if (!Number.isFinite(value) || value <= 0) {
		return "";
	}
	return `${Math.round(value / 1024 ** 3)} GB`;
}

function formatDisks(disks: RawDisk[]): string {
	return disks
		.slice(0, 2)
		.map((disk) => {
			const size = formatBytes(disk.size);
			const name = truncate(disk.model, 24);
			return [name, size].filter(Boolean).join(" ");
		})
		.join(" + ");
}

function formatBytes(value: string): string {
	const bytes = Number(value);
	if (!Number.isFinite(bytes) || bytes <= 0) {
		return "";
	}
	const units = ["GB", "TB"];
	let size = bytes / 1024 ** 3;
	let unit = units[0];
	if (size >= 1024) {
		size /= 1024;
		unit = units[1];
	}
	return `${size >= 100 ? Math.round(size) : size.toFixed(1)} ${unit}`;
}

function firstIp(ips: string[]): string {
	for (const ip of ips) {
		if (/^(\d{1,3}\.){3}\d{1,3}$/.test(ip)) {
			return ip;
		}
	}
	return "";
}

export function mapFields(raw: RawWmi): MappedFields {
	return {
		type: detectType(raw),
		serialNumber: truncate(raw.serial, MAX),
		manufacturer: truncate(raw.manufacturer, MAX),
		model: truncate(raw.model, MAX),
		processor: truncate(raw.processor, MAX),
		os: truncate(raw.os, MAX),
		memory: truncate(formatMemory(raw.memory), MAX),
		hdd: truncate(formatDisks(raw.disks), MAX),
		deviceName: truncate(raw.hostname, MAX),
		ip: truncate(firstIp(raw.ipv4), MAX),
	};
}
