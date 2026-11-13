# Contributing

Bug reports, small compatibility fixes, and improvements to installation instructions are welcome. This project is a beta focused on light reading themes for Substack publications in Chrome.

## Report a problem

Use the bug-report form in this repository's Issues section. Include:

- A public page URL and a short description of the affected control or text.
- Chrome version, operating system, and extension or userscript version.
- Whether you use the extension or Tampermonkey, and the steps that reproduce the issue.
- A cropped screenshot when it helps. Remove account details, private messages, and paid article text.

Before reporting, update to the latest release, refresh the page, and make sure only one version of this tool is enabled. Mention other color-changing extensions if they are active. To request a custom domain, provide a public reading-page URL; do not assume a domain is Substack solely because it contains `/p/`.

## Make a change

Use Node.js 22 or newer, npm, and a system `zip` command. There are no npm runtime dependencies to install.

1. Edit the shared source in `src/` or the supported-site configuration in `config/sites.json`.
2. Run `npm run build` to regenerate `extension/`, `userscript/`, and release packages in `dist/`.
3. Run `npm test` and `npm run check`.
4. Load the generated extension in Chrome, or update the userscript, and check the behavior you changed.

Generated files should match the source. Commit updates to `extension/` and `userscript/` with the source changes; leave the ignored `dist/` packages out of Git. Do not patch a generated userscript or extension stylesheet independently of `src/light-theme.css`.

For theme changes, check the affected state both before and after the change. Include a dark reading page, an already-light page, the off switch, and relevant hover or open-menu states. Preserve layout and the appearance of images, logos, and filled versus outline icons. Do not broaden a selector to every button or SVG simply to fix one component.

For page-scope changes, verify that publishing tools, editors, login, payment, and account pages remain excluded. New domains belong in the central configuration and need an explanation of why the public page is a Substack publication. Keep the access list explicit.

## Website changes

The English and Chinese product website is in `website/`. See its [development guide](website/README.md) for installation, local preview and production builds.

Keep English text and `website/lib/translations.ts` in sync. Contact details and the public domain are in `website/lib/site-config.ts`. When updating extension downloads, rebuild the root project, then run `npm run sync:downloads` inside `website/`.

Before submitting website changes, run `npm run typecheck` and `npm run build` inside `website/`. Check any changed links and the affected layout. The local `website/.openai/hosting.json` is ignored; keep the portable example in source control and never commit a deployment ID or credentials.

## Pull requests

Explain the user-visible problem, the change, and how you verified it. Add an entry to `CHANGELOG.md` when behavior changes. Avoid adding dependencies for changes that the existing JavaScript, CSS, and build tools can handle.

Do not include browser profiles, cookies, downloaded paid articles, private screenshots, or credentials. Do not add a fake repository URL, store listing, support address, or automatic-update URL. Release links can be configured once the actual public repository exists.

By submitting a contribution, you agree that it may be distributed under this project's [MIT license](LICENSE).
