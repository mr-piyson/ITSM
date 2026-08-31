import dotenv from "dotenv";
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

dotenv.config({ override: true });

export const env = createEnv({
	server: {
		MES_DATABASE: z.url(),
		ISS_DATABASE: z.url(),
		ERP_USER: z.string().min(1),
		ERP_PASSWORD: z.string().min(1),
		ERP_SERVER: z.string().min(1),
		ERP_DATABASE: z.string().min(1),
		COOKIE_SECURE: z.enum(["true", "false"]).transform((v) => v === "true"),
		CRON_SECRET: z.string().min(1).optional(),
		APP_URL: z.url().optional(),
		AZURE_CLIENT_ID: z.string().min(1),
		AZURE_CLIENT_SECRET: z.string().min(1),
		AZURE_TENANT_ID: z.string().min(1),
		ORACLE_HOST: z.string().min(1),
		ORACLE_PORT: z.string().min(1),
		ORACLE_SERVICE_NAME: z.string().min(1),
		ORACLE_USER: z.string().min(1),
		ORACLE_PASSWORD: z.string().min(1),
		ORACLE_CLIENT_DIR: z.string().min(1),
		TNS_ADMIN: z.string().min(1),
	},
	client: {},
	runtimeEnv: {
		MES_DATABASE: process.env.MES_DATABASE,
		ISS_DATABASE: process.env.ISS_DATABASE,
		ERP_USER: process.env.ERP_USER,
		ERP_PASSWORD: process.env.ERP_PASSWORD,
		ERP_SERVER: process.env.ERP_SERVER,
		ERP_DATABASE: process.env.ERP_DATABASE,
		COOKIE_SECURE: process.env.COOKIE_SECURE,
		CRON_SECRET: process.env.CRON_SECRET,
		APP_URL: process.env.APP_URL,
		AZURE_CLIENT_ID: process.env.AZURE_CLIENT_ID,
		AZURE_CLIENT_SECRET: process.env.AZURE_CLIENT_SECRET,
		AZURE_TENANT_ID: process.env.AZURE_TENANT_ID,
		ORACLE_HOST: process.env.ORACLE_HOST,
		ORACLE_PORT: process.env.ORACLE_PORT,
		ORACLE_SERVICE_NAME: process.env.ORACLE_SERVICE_NAME,
		ORACLE_USER: process.env.ORACLE_USER,
		ORACLE_PASSWORD: process.env.ORACLE_PASSWORD,
		ORACLE_CLIENT_DIR: process.env.ORACLE_CLIENT_DIR,
		TNS_ADMIN: process.env.TNS_ADMIN,
	},
});
