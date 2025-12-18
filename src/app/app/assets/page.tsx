import db from "@/lib/database";
import AssetsPage from "./AssetsPage";

export type Asset = {
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
export default async function Assets(props: any) {
  await db.iss.execute(`
          UPDATE assets
            SET purchaseDate = NULL
              WHERE purchaseDate IS NOT NULL
            AND (
              MONTH(purchaseDate) = 0
              OR DAY(purchaseDate) = 0
              OR YEAR(purchaseDate) = 0
            );`);

  await db.iss.execute(`
          UPDATE assets
            SET warrantyDate = NULL
              WHERE warrantyDate IS NOT NULL
            AND (
              MONTH(warrantyDate) = 0
              OR DAY(warrantyDate) = 0
              OR YEAR(warrantyDate) = 0
            );`);

  const [resAssets] = await db.iss.query(`
          SELECT 
		  a.id,
		  a.code,
		  a.serialNumber,
		  a.deviceName,
		  a.type,
		  a.location,
		  a.manufacturer,
		  a.model,
		  a.department,
      a.processor,
		  a.os,
		  a.memory,
		  a.hdd,
		  a.ip,
		  a.specification,
		  a.image,
		  e.name as owner,
		  e.image as empImg 
		  FROM assets a
          LEFT JOIN employees e
          ON a.empID = e.empID
        `);

  const assets = resAssets as Asset[];
  return <AssetsPage assets={assets} />;
}
