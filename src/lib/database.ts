import mssql from "mssql";
import mysql from "mysql2/promise";
import type { Pool } from "mysql2/promise";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const oracledb = require("oracledb") as {
	initOracleClient: (opts?: { libDir?: string }) => void;
	createPool: (attrs: {
		user?: string;
		password?: string;
		connectString?: string;
		poolMin?: number;
		poolMax?: number;
		poolIncrement?: number;
		edition?: string;
		events?: boolean;
	}) => Promise<{
		getConnection: () => Promise<{
			execute: (sql: string, binds?: any[], opts?: any) => Promise<any>;
			release: () => Promise<void>;
		}>;
		close: () => Promise<void>;
	}>;
};

if (process.env.ORACLE_CLIENT_DIR) {
	try {
		oracledb.initOracleClient({ libDir: process.env.ORACLE_CLIENT_DIR });
	} catch (e) {
		console.warn("Oracle Thick mode init failed:", e);
	}
}

function ensureDatabaseName(uri: string | undefined, database: string): string {
	const url = new URL(uri ?? "");
	if (!url.pathname || url.pathname === "/") {
		url.pathname = `/${database}`;
	}
	return url.toString();
}

let mesPool: Pool | null = null;
let issPool: Pool | null = null;
let erpPool: mssql.ConnectionPool | null = null;
let odbPool: Awaited<ReturnType<typeof oracledb.createPool>> | null = null;

function getMesPool(): Pool {
	if (!mesPool) {
		mesPool = mysql.createPool({
			uri: process.env.MES_DATABASE,
			waitForConnections: true,
			connectionLimit: 10,
			queueLimit: 0,
			enableKeepAlive: true,
		});
	}
	return mesPool;
}

function getIssPool(): Pool {
	if (!issPool) {
		issPool = mysql.createPool({
			uri: ensureDatabaseName(process.env.ISS_DATABASE, "ISS"),
			waitForConnections: true,
			connectionLimit: 10,
			queueLimit: 0,
			enableKeepAlive: true,
		});
	}
	return issPool;
}

async function getERPPool(): Promise<mssql.ConnectionPool> {
	if (!erpPool?.connected) {
		const config: mssql.config = {
			user: process.env.ERP_USER,
			password: process.env.ERP_PASSWORD,
			database: process.env.ERP_DATABASE,
			server: process.env.ERP_SERVER,
			port: 1433,
			pool: {
				max: 10,
				min: 0,
				idleTimeoutMillis: 30000,
			},
			options: {
				encrypt: false,
				trustServerCertificate: true,
			},
		};
		erpPool = await new mssql.ConnectionPool(config).connect();
	}
	return erpPool;
}

async function getOdbPool() {
	if (!odbPool) {
		odbPool = await oracledb.createPool({
			user: process.env.ORACLE_USER,
			password: process.env.ORACLE_PASSWORD,
			connectString: `${process.env.ORACLE_HOST}:${process.env.ORACLE_PORT}/${process.env.ORACLE_SERVICE_NAME}`,
			poolMin: 1,
			poolMax: 10,
			poolIncrement: 1,
		});
	}
	return odbPool;
}

const db = {
	get mes() {
		return getMesPool();
	},
	get iss() {
		return getIssPool();
	},
	get erp() {
		return getERPPool();
	},
	get odb() {
		return getOdbPool();
	},
};
export default db;
