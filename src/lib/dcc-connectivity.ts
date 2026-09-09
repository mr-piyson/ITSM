import { execFile } from "node:child_process";
import net from "node:net";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const IPV4_REGEX = /^(\d{1,3}\.){3}\d{1,3}$/;

export type PingResult = {
	reachable: boolean;
	latencyMs: number | null;
};

export async function runPing(host: string): Promise<PingResult> {
	if (!IPV4_REGEX.test(host)) {
		return { reachable: false, latencyMs: null };
	}
	const isWindows = process.platform === "win32";
	const args = isWindows
		? ["-n", "1", "-w", "2000", host]
		: ["-c", "1", "-W", "2", host];

	try {
		const { stdout } = await execFileAsync("ping", args, {
			timeout: 5000,
			windowsHide: true,
		});
		const match = /time[=<>]+\s*([\d.]+)/.exec(stdout);
		return {
			reachable: true,
			latencyMs: match ? Number(match[1]) : null,
		};
	} catch {
		return { reachable: false, latencyMs: null };
	}
}

export type WsResult = {
	reachable: boolean;
};

/**
 * Performs a TCP connect to the given host/port. This is used as a WebSocket
 * liveness check (a successful TCP handshake means the WS endpoint is accepting
 * connections).
 */
export function checkWebSocket(
	host: string,
	port: number,
	timeoutMs = 3000,
): Promise<WsResult> {
	return new Promise((resolve) => {
		if (!IPV4_REGEX.test(host)) {
			resolve({ reachable: false });
			return;
		}
		const socket = new net.Socket();
		const done = (reachable: boolean) => {
			socket.removeAllListeners();
			socket.destroy();
			resolve({ reachable });
		};
		socket.setTimeout(timeoutMs);
		socket.once("connect", () => done(true));
		socket.once("timeout", () => done(false));
		socket.once("error", () => done(false));
		socket.connect(port, host);
	});
}

export type DccConnectivity = {
	dccId: number;
	status: "connected" | "disconnected";
	dccReachable: boolean;
	dccLatencyMs: number | null;
	readerReachable: boolean;
	readerLatencyMs: number | null;
};
