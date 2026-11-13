# Substack Light website

The English/Chinese product website for Substack Light Reader. It includes a reading-theme demonstration, detailed Chrome and Tampermonkey installation guides, supported publications, help, release information, and privacy disclosures.

- Default language: English at `/`.
- Chinese: `/zh`, with corresponding translated pages.
- Framework: React + Vinext, using a Cloudflare Worker build.
- Product domain and contact links: `lib/site-config.ts`.
- No product analytics, account system, database, or feedback submission endpoint is used. The feedback form prepares copyable text locally.

## Requirements

Use Node.js 22.13 or newer (Node.js 24 is used for website CI), npm, and the committed `package-lock.json`. The extension and userscript live one directory above this website and have a separate build process.

## Run locally

From this directory:

```sh
npm run install:ci
npm run dev
```

Open the local URL printed by the server, normally `http://127.0.0.1:5173/`.

The `predev`, `pretypecheck` and `prebuild` scripts create `.openai/hosting.json` from the committed `.openai/hosting.example.json` when it is missing. An existing local configuration is never overwritten. The local file is ignored by Git; it can hold a maintainer-specific hosting project ID. The example contains no account or deployment identifiers.

## Check and build

```sh
npm run typecheck
npm run build
npm run start -- --port 5173
```

`build` produces `dist/client/` and a Worker at `dist/server/index.js`. `start` previews that build locally; it does not publish it. The website is not a buildless GitHub Pages site.

The CI workflow at `../.github/workflows/check.yml` separately checks the extension/userscript and the website. CI does not publish a site or create a GitHub Release.

## Update downloadable files

From the repository root:

```sh
npm run build
cd website
npm run sync:downloads
```

This copies the real extension ZIP, userscript, checksums, license, privacy policy and changelog to `public/downloads/`, and refreshes `lib/product.ts` and `public/downloads/release.json`. Commit those website assets along with the related source changes. Do not edit generated files by hand.

## Edit content

| Location | Purpose |
| --- | --- |
| `app/page.tsx` | Home page |
| `app/install/` and `components/install-guide.tsx` | Manual installation instructions |
| `app/guide/`, `app/help/`, `app/privacy/` | Reading guide, troubleshooting and privacy |
| `app/zh/` and `lib/translations.ts` | Chinese pages and copy |
| `components/site.tsx` | Shared navigation, footer and controls |
| `components/feedback-report.tsx` | Local-only feedback template |
| `lib/site-config.ts` | Public domain, support email and creator links |
| `scripts/sync-product-assets.mjs` | Copy extension/script release assets |

Internal links use the page language. Native page links are intentional: they work in both local and production builds. Keep wording, limitations and installation details consistent in both languages.

## Hosting

Cloudflare Workers deployment is configured in `wrangler.jsonc` with the Worker name `substacklight` and custom domain `substacklight.com`. See the [deployment guide (中文)](../docs/CLOUDFLARE_DEPLOY.zh-CN.md).

From this directory, use `npm run cf:login` to authorize your Cloudflare account, then `npm run deploy` to build and publish. `npm run deploy:check` validates an existing build without publishing.

Publishing the repository to GitHub does not publish the website or change DNS. Configure hosting separately. The configured public origin is `https://substacklight.com`; a fork should update `lib/site-config.ts` before deploying.

For an existing Sites deployment, keep its project binding in your ignored `.openai/hosting.json`. A new Sites project must receive its own binding from that service. The public example is sufficient for local development and builds, and does not give anyone access to the maintainer's deployment.

Email routing is configured at the domain provider. Adding `support@substacklight.com` to the page does not enable email delivery. See [Cloudflare email routing setup (中文)](../docs/EMAIL_SETUP.zh-CN.md).

## License

The project's [MIT license](../LICENSE) applies to original project code. Preserve the separate notices in `vendor/` and `scripts/vite/sites-vite-plugin.LICENSE`, and the licenses of installed dependencies.
