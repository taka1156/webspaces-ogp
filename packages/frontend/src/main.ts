import "./components/OGPCard";

const app = document.querySelector<HTMLDivElement>("#app");

if (app) {
	const params = new URLSearchParams(window.location.search);
	const targetUrl = params.get("url") || "https://vitejs.dev/";
	const card = document.createElement("ogp-card");

	card.setAttribute("backend-url", import.meta.env.VITE_OGP_BACKEND_URL);
	card.setAttribute("url", targetUrl);

	app.appendChild(card);
}
