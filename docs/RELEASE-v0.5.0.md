# Substack Light Reader v0.5.0

A local-only light reading theme for supported dark Substack publication pages. This release includes Chrome extension **0.5.0** and Tampermonkey userscript **2.1.0**.

## Downloads

- `substack-light-reader-v0.5.0.zip` — Chrome extension. Extract it, open `chrome://extensions`, enable Developer mode, and load the folder containing `manifest.json`.
- `substack-light-reader-v2.1.0.user.js` — Tampermonkey script. Replace a new script's contents with this complete file and save.
- `SHA256SUMS.txt` — SHA-256 checksums for the two downloads.

Choose one version. Both use the same page detection and light-theme source. The userscript keeps its legacy name, **Art & Biz Substack 亮色阅读模式**, so existing users can identify it.

## What is included

- Automatic dark-background detection; already-light pages are unchanged.
- A global enable switch in the Chrome extension.
- Standard Substack publication domains and the custom domains listed in the README.
- Reading-page scope that excludes dashboards, editors, sign-in, payment and account pages.
- English and Chinese product website source, with manual-installation instructions.

## Release status

This is a beta release, distributed for manual installation and manual updates. It is not listed in the Chrome Web Store. Compatibility is not verified for every publication, menu, browser, or future Substack change. The tool does not unlock paid posts or change the Substack mobile app.

Read the README and PRIVACY.md before installing. For compatibility problems, use the repository's Issues section with a public page URL and a description; remove private account details and paid article text from screenshots.

---

本次包含 Chrome 扩展 **0.5.0** 和油猴脚本 **2.1.0**，两者选择一种安装。当前为测试版，需要手动安装和更新，尚未上架 Chrome 商店。完整步骤见仓库的中文 README；不要把整个仓库的源码 ZIP 当成扩展安装包。
