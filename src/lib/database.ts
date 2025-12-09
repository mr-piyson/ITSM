import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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
