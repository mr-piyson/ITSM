"use server";

import prisma from "@/lib/prisma";
import { IT_Request } from "@prisma/client";

export async function getRequests() {
  const requests = await prisma.iT_Request.findMany({});
  return requests;
}

export async function getSingleRequest(id: number) {
  const request = await prisma.iT_Request.findUnique({
    where: {
      id: id,
    },
  });
  return request;
}

export async function deleteRequest(id: number) {
  const request = await prisma.iT_Request.delete({
    where: {
      id: id,
    },
  });
  return request;
}

export async function updateRequest(id: number, data: any) {
  const request = await prisma.iT_Request.update({
    where: {
      id: id,
    },
    data: data,
  });
  return request;
}

interface newITRequest extends Omit<IT_Request, "id"> {}

export async function createRequest(data: newITRequest) {
  try {
    const request = await prisma.iT_Request.create({
      data: data,
    });
    return {
      status: 200,
      error: "",
    };
  } catch (e) {
    console.log(e);
    return {
      status: 401,
      error: "Failed to create request",
    };
  }
}
