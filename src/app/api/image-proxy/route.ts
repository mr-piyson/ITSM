import { NextRequest, NextResponse } from "next/server";

const INTRANET_BASE = process.env.INTRANET_URL || "http://intranet.bfginternational.com:88";

export async function GET(request: NextRequest) {
	const url = request.nextUrl.searchParams.get("url");

	if (!url) {
		return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
	}

	try {
		const parsed = new URL(url);

		const allowedHostnames = ["intranet.bfginternational.com", "iss.bfginternational.com"];
		if (!allowedHostnames.includes(parsed.hostname)) {
			return NextResponse.json({ error: "Forbidden hostname" }, { status: 403 });
		}

		const targetUrl = parsed.hostname === "intranet.bfginternational.com"
			? `${INTRANET_BASE}${parsed.pathname}`
			: parsed.toString();

		const response = await fetch(targetUrl, {
			redirect: "follow",
			headers: {
				"User-Agent": "Mozilla/5.0",
			},
		});

		if (!response.ok) {
			console.error(`Image proxy upstream error: ${response.status} ${targetUrl}`);
			return NextResponse.json(
				{ error: `Upstream returned ${response.status}` },
				{ status: response.status },
			);
		}

		const contentType = response.headers.get("Content-Type") ?? "image/jpeg";
		const body = await response.arrayBuffer();

		return new NextResponse(body, {
			headers: {
				"Content-Type": contentType,
				"Cache-Control": "public, max-age=86400, s-maxage=86400",
			},
		});
	} catch (error) {
		console.error("Image proxy fetch failed:", error);
		return NextResponse.json({ error: "Failed to fetch image" }, { status: 502 });
	}
}
