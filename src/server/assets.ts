"use server";

import db from "@/lib/database";

export const getAllAssets = async () => {
  const assets = await db.assets.findMany({});
  return assets;
};

export const getAssetById = async (id: number) => {
  const asset = await db.assets.findUnique({
    where: { id },
  });
  return asset;
};
