
.PHONY: backend-dev, frontend-dev, frontend-run


backend-dev:
	pnpm --filter @repo/backend dev

frontend-dev:
	pnpm --filter @repo/ogp-preview-element dev

frontend-build:
	pnpm --filter @repo/ogp-preview-element build
