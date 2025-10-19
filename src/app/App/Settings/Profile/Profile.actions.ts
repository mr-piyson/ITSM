"use server";

export const getSettings = async () => {
	return {
		success: false,
		data: null,
		error: "Failed to fetch settings",
	};
};

export const updateSettings = async (data: any[]) => {
	return {
		success: false,
		data: null,
		error: "Failed to update settings",
	};
};
