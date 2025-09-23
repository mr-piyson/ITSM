import { PrismaClient } from "@prisma/client";
import { PrismaClient as ISSPrismaClient } from "@prisma/iss";
import { PrismaClient as MESPrismaClient } from "@prisma/mes";

const mes = new MESPrismaClient();
const iss = new ISSPrismaClient();
const prisma = new PrismaClient();
export default prisma;
export { iss, mes };

// init default settings
