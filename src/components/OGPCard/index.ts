import { css, html, LitElement, nothing, type PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";

export interface OgpData {
	title: string;
	description: string;
	image: string;
	url: string;
	cardType: string;
}

/**
 * <ogp-card> — 指定した URL の OGP/Twitter Card メタデータを
 * backendUrl 経由で取得し、1枚のリンクカードとして表示する。
 *
 * 使い方:
 *   <ogp-card
 *     backend-url="https://api.example.com/ogp"
 *     url="https://example.com/some-article"
 *   ></ogp-card>
 *
 * backendUrl には `?url=<エンコード済みの対象URL>` というクエリで
 * リクエストが飛ぶ。バックエンドは OgpData 形状の JSON を返す想定
 * （前回のスクレイピングコードの戻り値と同じ形）。
 */
@customElement("ogp-card")
export class OgpCard extends LitElement {
	static styles = css`
		:host {
			--ogp-bg: #ffffff;
			--ogp-border: #e3e1dc;
			--ogp-border-hover: #2f6f5e;
			--ogp-text: #1b1b1b;
			--ogp-muted: #6e6b64;
			--ogp-image-bg: #f2f0eb;
			--ogp-error: #b3432f;

			display: block;
			font-family:
				-apple-system, BlinkMacSystemFont, "Segoe UI", "Hiragino Kaku Gothic ProN",
				"Hiragino Sans", Meiryo, sans-serif;
			max-width: 480px;
		}

		a.card {
			display: flex;
			flex-direction: row;
			text-decoration: none;
			color: inherit;
			border: 1px solid var(--ogp-border);
			border-radius: 10px;
			overflow: hidden;
			background: var(--ogp-bg);
			transition: border-color 0.15s ease;
		}

		a.card:hover,
		a.card:focus-visible {
			border-color: var(--ogp-border-hover);
		}

		a.card:focus-visible {
			outline: 2px solid var(--ogp-border-hover);
			outline-offset: 2px;
		}

		a.card.large {
			flex-direction: column;
		}

		.image {
			flex: 0 0 96px;
			overflow: hidden;
		}

		a.card.large .image {
			flex: none;
			width: 100%;
			aspect-ratio: 16 / 9;
		}

		a.card:not(.large) .image {
			flex: 0 0 96px;
			width: 96px;
			height: 96px;
			padding: 10px;
			box-sizing: border-box;
		}

		.image img {
			width: 100%;
			height: 100%;
			object-fit: contain;
			display: block;
		}

		.body {
			display: flex;
			flex-direction: column;
			justify-content: center;
			gap: 4px;
			padding: 12px 14px;
			min-width: 0;
		}

		.title {
			margin: 0;
			font-size: 0.95rem;
			font-weight: 600;
			line-height: 1.35;
			color: var(--ogp-text);
			display: -webkit-box;
			-webkit-line-clamp: 2;
			-webkit-box-orient: vertical;
			overflow: hidden;
		}

		.description {
			margin: 0;
			font-size: 0.82rem;
			line-height: 1.45;
			color: var(--ogp-muted);
			display: -webkit-box;
			-webkit-line-clamp: 2;
			-webkit-box-orient: vertical;
			overflow: hidden;
		}

		.domain {
			margin: 2px 0 0;
			font-size: 0.75rem;
			color: var(--ogp-muted);
		}

		.state {
			border: 1px solid var(--ogp-border);
			border-radius: 10px;
			padding: 14px;
			font-size: 0.85rem;
		}

		.state.loading {
			color: var(--ogp-muted);
			background: linear-gradient(
				90deg,
				var(--ogp-bg) 25%,
				var(--ogp-image-bg) 37%,
				var(--ogp-bg) 63%
			);
			background-size: 400% 100%;
			animation: shimmer 1.4s ease infinite;
		}

		.state.error {
			color: var(--ogp-error);
			border-color: var(--ogp-error);
		}

		@keyframes shimmer {
			0% {
				background-position: 100% 0;
			}
			100% {
				background-position: 0 0;
			}
		}

		@media (prefers-reduced-motion: reduce) {
			a.card {
				transition: none;
			}
			.state.loading {
				animation: none;
			}
		}
	`;

	/** OGP を取得したい対象ページの URL */
	@property({ type: String })
	accessor url = "";

	/** OGP 取得用バックエンドのエンドポイント（?url= にターゲットURLを付けて叩く） */
	@property({ type: String, attribute: "backend-url" })
	accessor backendUrl = "";

	@state()
	accessor ogp: OgpData | null = null;

	@state()
	accessor loading = false;

	@state()
	accessor error: string | null = null;

	@state()
	accessor isImageLarge = false;

	private abortController?: AbortController;

	willUpdate(changed: PropertyValues<this>) {
		if (changed.has("url") || changed.has("backendUrl")) {
			this.fetchOgp();
		}
	}

	disconnectedCallback() {
		super.disconnectedCallback();
		this.abortController?.abort();
	}

	private async fetchOgp() {
		this.abortController?.abort();
		this.ogp = null;
		this.error = null;
		this.isImageLarge = false;

		if (!this.url || !this.backendUrl) {
			this.loading = false;
			return;
		}

		const controller = new AbortController();
		this.abortController = controller;
		this.loading = true;

		try {
			const endpoint = new URL(this.backendUrl, window.location.href);
			endpoint.searchParams.set("url", this.url);

			const res = await fetch(endpoint, { signal: controller.signal });
			if (!res.ok) {
				throw new Error(`OGP取得に失敗しました (${res.status})`);
			}

			const data = (await res.json()) as OgpData;
			if (controller.signal.aborted) return;
			this.ogp = data;
		} catch (err) {
			if (controller.signal.aborted) return;
			this.error = err instanceof Error ? err.message : "OGP取得に失敗しました";
		} finally {
			if (!controller.signal.aborted) this.loading = false;
		}
	}

	private handleImageLoad(e: Event) {
		const img = e.target as HTMLImageElement;
		if (!img) return;

		const width = img.naturalWidth;
		const height = img.naturalHeight;

		// twitter:cardの設定があれば、優先して大きいかどうかを判定する
		if (this.ogp && this.ogp.cardType === "summary_large_image") {
			this.isImageLarge = true;
			return;
		}

		// 例: 横幅が300px以上あり、かつ「横長の比率（アスペクト比 1.2 以上）」なら大きいと判定
		if (width >= 300 && width / height >= 1.2) {
			this.isImageLarge = true;
		}
	}

	private get hostname(): string {
		if (!this.ogp?.url) return "";
		try {
			return new URL(this.ogp.url).hostname.replace(/^www\./, "");
		} catch {
			return this.ogp.url;
		}
	}

	render() {
		if (this.loading) {
			return html`<div class="state loading">読み込み中…</div>`;
		}

		if (this.error) {
			return html`<div class="state error">${this.error}</div>`;
		}

		if (!this.ogp?.url) return nothing;

		const isLarge = this.isImageLarge;

		return html`
			<a
				class="card ${isLarge ? "large" : ""}"
				href=${this.ogp.url}
				target="_blank"
				rel="noopener noreferrer"
			>
				${
					this.ogp.image
						? html`
							<div class="image">
								<img 
									src=${this.ogp.image} 
									alt="" 
									loading="lazy" 
									@load=${this.handleImageLoad}
								/>
							</div>
						`
						: nothing
				}
				<div class="body">
					${this.ogp.title ? html`<p class="title">${this.ogp.title}</p>` : nothing}
					${
						this.ogp.description
							? html`<p class="description">${this.ogp.description}</p>`
							: nothing
					}
					<p class="domain">${this.hostname}</p>
				</div>
			</a>
		`;
	}
}

declare global {
	interface HTMLElementTagNameMap {
		"ogp-card": OgpCard;
	}
}
