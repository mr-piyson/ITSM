"use server";
// app/api/assets/asset/route.ts
import { iss } from "@/lib/prisma";
import { NextResponse } from "next/server";

type ResponseAsset = {
  id: string;
  code: string;
  serialNumber: string;
  deviceName: string;
  type: string;
  location: string;
  manufacturer: string;
  model: string;
  department: string;
  processor: string;
  os: string;
  memory: string;
  hdd: string;
  ip: string;
  specification: string;
  image: string;
  firmwareVer: string;
  owner: string;
  empImg: string;
  macAddress: string;
  deviceStatus: string;
  purchaseDate: string;
  purchasePrice: string;
  warrantyDate: string;
  warrantyStatus: string;
  verified: string;
};

export const GET = async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const serialNumber = searchParams.get("serialNumber");

  if (id) {
    const asset: ResponseAsset[] = await iss.$queryRaw`
    SELECT assets.id,
    assets.code,
    assets.serialNumber,
    assets.deviceName,
    assets.type,
    assets.location,
    assets.manufacturer,
    assets.model,
    assets.department,
    assets.processor,
    assets.os,
    assets.memory,
    assets.hdd,
    assets.ip,
    assets.specification,
    assets.image,
    assets.firmwareVer,
    employees.name as owner,
    employees.image as empImg,
    assets.macAddress,
    assets.deviceStatus,
    assets.purchaseDate,
    assets.purchasePrice,
    assets.warrantyDate,
    assets.warrantyStatus,
    assets.verified
    FROM assets
    LEFT JOIN employees
    ON assets.empID = employees.empID
    WHERE assets.id = ${id}
    `;
    const logs = await iss.$queryRaw`
    SELECT a.oldOwnerEmpID,a.newOwnerID,a.date,e1.name as old,e2.name as new
    FROM assestOwnerUpdateLogs a
    LEFT JOIN employees e1
    ON e1.empID = a.oldOwnerEmpID
    LEFT JOIN employees e2
    ON e2.empID = a.newOwnerID
    WHERE a.assetID= ${id}
    `;
    // const asset = await iss.assets.findUnique({
    //   where: { id: Number(id) },
    // });
    // if (asset) {
    //   const ownerChangelog = await iss.assestOwnerUpdateLogs.findMany({
    //     where: {
    //       assetID: asset.id,
    //     },
    //   });
    //   return NextResponse.json({ ...asset, ownerChangeLogs: ownerChangelog });
    // }
    //
    return NextResponse.json({ ...asset[0], ownerChangeLogs: logs });
  }

  if (serialNumber) {
    const asset = await iss.assets.findUnique({
      where: { serialNumber: serialNumber },
    });
    return NextResponse.json(asset);
  }

  return NextResponse.json(
    { error: "Please provide either id or serialNumber" },
    { status: 400 }
  );
};
