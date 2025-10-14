"use server";

import type { IT_Request } from "@prisma/client";
import db from "@/lib/prisma";

export async function getRequests() {
	const requests = await db.iT_Request.findMany({});
	return requests;
}

export async function getSingleRequest(id: number) {
	const request = await db.iT_Request.findUnique({
		where: {
			id: id,
		},
	});
	return request;
}

export async function deleteRequest(id: number) {
	const request = await db.iT_Request.delete({
		where: {
			id: id,
		},
	});
	return request;
}

export async function updateRequest(id: number, data: any) {
	const request = await db.iT_Request.update({
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
		const request = await db.iT_Request.create({
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
