"use server"
// app/api/assets/asset/route.ts
import { iss } from "@/lib/prisma";
import { NextResponse } from "next/server";

export const GET = async (request: Request) => {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  const serialNumber = searchParams.get("serialNumber");

  if (id) {
    const asset = await iss.assets.findUnique({
      where: { id: Number(id) },
    });
    return NextResponse.json(asset);
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
