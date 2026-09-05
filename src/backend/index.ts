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

app.use("*", async (c, next) => {
	const corsMiddleware = cors({
		origin: [c.env.ORIGIN_URL_DEV, c.env.ORIGIN_URL_PROD, "http://localhost:8000"],
		allowMethods: ["GET"],
	});

	return corsMiddleware(c, next);
});

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

	const data = await ogpParser(targetUrl);

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
