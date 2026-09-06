import type { Fetcher } from "@cloudflare/workers-types";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { ogpParser } from "./services/ogp";
import { SampleOGP } from "./services/sample";

type Bindings = {
	ORIGIN_URL_DEV: string;
	ORIGIN_URL_PROD: string;
	ASSETS: Fetcher;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use(
	"*",
	cors({
		origin: (origin, c) => {
			if (origin.endsWith(".taka1156.site") || origin.startsWith(c.env.ORIGIN_URL_DEV)) {
				return origin;
			}
			return c.env.ORIGIN_URL_PROD;
		},
		allowMethods: ["GET", "OPTIONS"],
	}),
);

app.get("/health", (c) => {
	return c.json({
		status: "server is running",
	});
});

app.get("/sample", (c) => {
	const sample = SampleOGP();
	return c.html(sample);
});

app.get("/api/ogp", async (c) => {
	const targetUrl = c.req.query("url");

	if (!targetUrl) {
		return c.json({ error: "URL parameter is required" }, 400);
	}

	let data: OGP | null = null;

	try {
		data = await ogpParser(targetUrl);
	} catch (e) {
		if (e instanceof Error) {
			console.error("Error fetching OGP data:", e.message);
		}
		// 失敗時はキャッシュさせない
		c.header("Cache-Control", "no-store");
		return c.json({ status: "error", message: "failed to fetch metadata" }, 502);
	}

	if (!data.title) {
		c.header("Cache-Control", "no-store");
		return c.json({ status: "error", message: "incomplete metadata" }, 502);
	}

	c.header("Content-Type", "application/json");
	c.header("Cache-Control", "public, max-age=3600, s-maxage=3600, stale-if-error=86400");
	c.header("Cache-Tag", "ogp-data");
	return c.json(data, 200);
});

app.get("*", async (c) => {
	const res = await c.env.ASSETS.fetch(c.req.url);

	return new Response(await res.arrayBuffer(), {
		status: res.status,
		statusText: res.statusText,
		headers: Object.fromEntries(res.headers),
	});
});

export default app;
