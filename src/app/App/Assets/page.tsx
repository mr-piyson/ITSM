import db from "@/lib/prisma";
import AssetsPage from "./AssetsPage";

type Asset = {
	id: string;
	code: string;
	type: string;
	deviceName: string;
	serialNumber: string;
	manufacturer: string;
	model: string;
	location: string;
	department: string;
	deviceStatus: "In Use" | "Available" | "Defective";
	warrantyStatus: "Valid" | "Expired" | "NA";
	verified: boolean;
	verifiedDate?: string;
	owner?: string;
	name: string;
	image?: string;
	empId: string;
	purchaseDate: string;
	purchasePrice: string;
	warrantyDate: string;
	processor?: string;
	os?: string;
	memory?: string;
	hdd?: string;
	ip?: string;
	specification?: string;
	empImg?: string;
};
export default async function Assets(props: AssetsProps) {
	await db.$queryRaw`
          UPDATE assets
            SET purchaseDate = NULL
              WHERE purchaseDate IS NOT NULL
            AND (
              MONTH(purchaseDate) = 0
              OR DAY(purchaseDate) = 0
              OR YEAR(purchaseDate) = 0
            );`;

	await db.$queryRaw`
          UPDATE assets
            SET warrantyDate = NULL
              WHERE warrantyDate IS NOT NULL
            AND (
              MONTH(warrantyDate) = 0
              OR DAY(warrantyDate) = 0
              OR YEAR(warrantyDate) = 0
            );`;

	const assets = (await db.$queryRaw`
          SELECT assets.id,assets.code,assets.serialNumber,assets.deviceName,assets.type,assets.location,assets.manufacturer,assets.model,assets.department,
          assets.processor,assets.os,assets.memory,assets.hdd,assets.ip,assets.specification,assets.image,employees.name as owner, employees.image as empImg FROM assets
          LEFT JOIN employees
          ON assets.empID = employees.empID
        `) as Asset[];
	await db.$disconnect();
	return <AssetsPage assets={assets} />;
}
