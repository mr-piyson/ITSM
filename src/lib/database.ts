import mssql from "mssql";
import mysql from "mysql2/promise";
import type { Pool } from "mysql2/promise";

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
	if (!erpPool || !erpPool.connected) {
		const config: mssql.config = {
			user: "MES",
			password: "M3$Ep!2X",
			database: "ERP10Live",
			server: "172.18.1.31",
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
};
export default db;
