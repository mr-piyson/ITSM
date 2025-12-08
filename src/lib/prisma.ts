import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();
export default db;

// setup my sql

import mysql from "mysql2/promise";

// You can use environment variables for security
export const mes = await mysql.createConnection({
  uri: process.env.MES_DATABASE,
});
