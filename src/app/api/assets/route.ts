import { NextRequest, NextResponse } from "next/server"

import db from "@/lib/database"

export type Asset = {
  id: string
  code: string
  type: string
  deviceName: string
  serialNumber: string
  manufacturer: string
  model: string
  location: string
  department: string
  deviceStatus: "In Use" | "Available" | "Defective"
  warrantyStatus: "Valid" | "Expired" | "NA"
  verified: boolean
  verifiedDate?: string
  owner?: string
  image?: string
  empId: string
  purchaseDate?: string
  purchasePrice?: string
  warrantyDate?: string
  processor?: string
  os?: string
  memory?: string
  hdd?: string
  ip?: string
  specification?: string
  empImg?: string
}

export async function GET(req: NextRequest, ctx: RouteContext<"/api/assets">) {
  try {
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
          -- a.processor,
		  -- a.os,
		  -- a.memory,
		  -- a.hdd,
		  a.ip,
		  -- a.specification,
		  a.image,
		  e.name as owner,
		  e.image as empImg 
		  FROM ISS.assets a
          LEFT JOIN ISS.employees e
          ON a.empID = e.empID
        `)

    const assets = resAssets as Asset[]
    return NextResponse.json(assets)
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}
