import { Hono } from "hono";
import { cors } from "hono/cors";
import { ogpParser } from "./services/ogp";
import { SampleOGP } from "./services/sample";

type Bindings = {
	ORIGIN_URL_DEV: string;
	ORIGIN_URL_PROD: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// /api/* のアクセスに対してミドルウェアを設定
app.use("*", async (c, next) => {
	const corsMiddleware = cors({
		origin: [c.env.ORIGIN_URL_DEV, c.env.ORIGIN_URL_PROD],
		allowMethods: ["GET"], // 必要に応じて追加
	});

	return corsMiddleware(c, next);
});

app.get("*", async (c) => {
	return c.env.ASSETS.fetch(c.req.raw);
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

export default app;
