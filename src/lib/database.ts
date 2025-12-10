import { PrismaClient } from "../../prisma/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || "file:./db.sqlite",
});

export const prisma = new PrismaClient({ adapter });
// setup my sql

import mysql from "mysql2/promise";

// You can use environment variables for security
export const mes = await mysql.createConnection({
  uri: process.env.MES_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
});

export const iss = await mysql.createConnection({
  uri: process.env.ISS_DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
});

const db = {
  prisma,
  mes,
  iss,
};

export default db;
