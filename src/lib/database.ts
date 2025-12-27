// import { PrismaClient } from "../../prisma/generated/prisma/client";
// import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
// const adapter = new PrismaBetterSqlite3({
//   url: process.env.DATABASE_URL || "file:./db.sqlite",
// });

// export const prisma = new PrismaClient({ adapter });
// setup my sql

import mysql from "mysql2/promise";
import { exit } from "process";

// Create connection POOLS instead of single connections
export const mes = await mysql.createPool({
  uri: process.env.MES_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

export const iss = await mysql.createPool({
  uri: process.env.ISS_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

(async () => {
  try {
    await mes.query("SELECT 1");
    console.log("\x1b[32m%s\x1b[0m", "✓ Connected to MES Database");
  } catch (e) {
    console.error("\x1b[31m%s\x1b[0m", "✗ Failed to connect to MES Database");
    console.error(e);
    exit(1);
  }

  try {
    await iss.query("SELECT 1");
    console.log("\x1b[32m%s\x1b[0m", "✓ Connected to ISS Database");
  } catch (e) {
    console.error("\x1b[31m%s\x1b[0m", "✗ Failed to connect to ISS Database");
    console.error(e);
    exit(1);
  }
})();

const db = {
  mes,
  iss,
};

export default db;
