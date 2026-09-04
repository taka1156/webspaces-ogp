const urls = [
	"https://hono-ja.pages.dev/",
	"https://vitejs.dev/",
	"https://www.youtube.com/watch?v=bfQvsLIPElI",
	"https://blog.taka1156.site/tag/go/",
	"https://zenn.dev/taka1156",
	"https://zenn.dev",
];

export const SampleOGP = () => {
	return (
		<html lang="ja">
			<head>
				<meta charset="UTF-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<script type="module" src="./lib/ogp-card.es.js"></script>
				<title>OGP Card Demo</title>
			</head>

			<body>
				<main style="max-width: 600px; margin: 40px auto; font-family: sans-serif;">
					<h1>OGP Card</h1>

					{urls.map((url) => (
						<div style="padding: 10px;" key={url}>
							<ogp-card backend-url="/api/ogp" url={url} />
						</div>
					))}
				</main>
			</body>
		</html>
	);
};
