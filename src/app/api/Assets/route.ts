"use server";

import { iss } from "@/lib/prisma";
import { NextResponse } from "next/server";

// GET http://localhost:3000/api/Assets

export const GET = async () => {
  try {
    await iss.$queryRaw`
      UPDATE assets
        SET purchaseDate = NULL
          WHERE purchaseDate IS NOT NULL
        AND (
          MONTH(purchaseDate) = 0
          OR DAY(purchaseDate) = 0
          OR YEAR(purchaseDate) = 0
        );`;

    await iss.$queryRaw`
      UPDATE assets
        SET warrantyDate = NULL
          WHERE warrantyDate IS NOT NULL
        AND (
          MONTH(warrantyDate) = 0
          OR DAY(warrantyDate) = 0
          OR YEAR(warrantyDate) = 0
        );`;

    const assets = await iss.$queryRaw`
      SELECT assets.id,assets.code,assets.serialNumber,assets.deviceName,assets.type,assets.location,assets.manufacturer,assets.model,assets.department,
      assets.processor,assets.os,assets.memory,assets.hdd,assets.ip,assets.specification,assets.image,employees.name as owner, employees.image as empImg FROM assets
      LEFT JOIN employees
      ON assets.empID = employees.empID
    `;
    return NextResponse.json(assets, { status: 200 });
  } catch (error) {
    console.log("Error fetching assets:", error);
    return new NextResponse(null, { status: 500 });
  }
};
