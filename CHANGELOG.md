# Changelog

The extension and userscript keep separate version numbers. The project release version follows the extension version.

## 0.5.0 beta — 2026-09-11

Extension `0.5.0` · userscript `2.1.0`

- Organize the project into shared source, site configuration, generated installable files, and release packages.
- Share reading-page scope checks and dark-background detection between the extension and userscript.
- Restore and re-evaluate the theme when navigation reuses a reading container or the native page theme changes.
- Exclude the Substack main site, publishing dashboards, editors, sign-in, payment, and account pages from theme activation.
- Retain standard publication-domain support and the 13 bundled custom domains.
- Add build and check commands, project documentation, privacy information, an MIT license, and a bug-report form for the initial public beta.
- Preserve the userscript's original name and namespace for existing installations. The public project name is Substack Light Reader.

This release is prepared for manual distribution. There is no Chrome Web Store listing or configured automatic-update endpoint.

## 0.4.1 — 2026-09-10

Extension `0.4.1` · userscript `2.0.1` · local prerelease

- Correct visible tooltip colors while preserving the layout of hidden accessibility text.
- Adjust elevated menu backgrounds, text, borders, and hover states.
- Avoid treating ordinary menu entries as primary action buttons.
- Preserve the rendering of filled and outline icons.

## 0.4.0 — 2026-09-08

Extension `0.4.0` · userscript `2.0.0` · local prerelease

- Expand support from the original two publications to standard Substack publication domains and 13 custom domains.
- Add automatic dark-background detection so already-light pages are left unchanged.

Earlier local versions established the light reading theme and refined icons, tabs, tooltips, subscription controls, and menus on the original Art & Biz and Dan Koe pages.
