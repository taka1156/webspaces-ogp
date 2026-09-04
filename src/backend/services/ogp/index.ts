import * as cheerio from "cheerio";

export const ogpParser = async (targetUrl: string) => {
	try {
		const url = decodeURIComponent(targetUrl);
		const res = await fetch(url, {
			method: "GET",
			headers: {
				"Content-Type": "text/html; charset=utf-8",
			},
		});

		const html = await res.text();

		const $ = cheerio.load(html);

		const ogp = {
			title:
				$('meta[property="og:title"]').attr("content") ||
				$('meta[name="twitter:title"]').attr("content") ||
				$("title").text() ||
				"",

			description:
				$('meta[property="og:description"]').attr("content") ||
				$('meta[name="twitter:description"]').attr("content") ||
				$('meta[name="description"]').attr("content") ||
				"",

			image:
				$('meta[property="og:image"]').attr("content") ||
				$('meta[name="twitter:image"]').attr("content") ||
				"",

			url:
				$('meta[property="og:url"]').attr("content") ||
				$('meta[name="twitter:url"]').attr("content") ||
				targetUrl,

			cardType: $('meta[name="twitter:card"]').attr("content") || "summary",
		};

		return ogp;
	} catch (_) {
		return { error: "Failed to retrieve OGP" };
	}
};
