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
  const [resAssets] = await db.iss.execute(`SELECT 
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
		  FROM ISS.assets a
          LEFT JOIN ISS.employees e
          ON a.empID = e.empID
        `);

  const assets = resAssets as Asset[];
  return <AssetsPage assets={assets} />;
}
