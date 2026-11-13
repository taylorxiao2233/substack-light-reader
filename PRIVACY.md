# Privacy

Last updated: 2026-11-10

Substack Light Reader runs in your browser to change the appearance of supported publication pages. It has no backend, analytics, advertising, or telemetry.

## Data handling

- The code inspects the current page's URL, DOM structure, and computed colors to determine whether it is a supported reading page with a dark background.
- The extension saves one preference, `enabled`, in `chrome.storage.local`. It applies globally to supported sites and is not synced through this extension.
- The userscript does not create a separate settings store. Tampermonkey controls whether the script is enabled.
- The tool does not collect browsing history, account details, cookies, messages, or article content, and does not send page data to a server.
- The tool does not initiate network requests. The publication and your browser can still make their own requests, independently of this tool.

## Permissions

Site access is declared for `*.substack.com` and the bundled custom-domain allowlist. It allows the tool to inspect the page and apply local styles. Code-level exclusions prevent the theme from activating on the Substack main site and non-reading areas such as dashboards, editors, sign-in, payment, and account pages. These exclusions do not change how Chrome displays a domain-level permission.

The extension's `storage` permission stores the on/off preference. The popup can identify a supported current tab under its declared site permissions to show status or refresh the theme. This release does not request the broader `tabs` permission or the temporary `activeTab` permission.

## Distribution and feedback

This initial release is installed manually from the project website or a trusted project release package and has no custom update server or remote code loader. Unpacked extension updates and userscript updates are manual.

If you submit an issue, the text and attachments you provide will be handled by the issue-hosting platform and may be public. Do not include private account information, private messages, or paid article text. This project does not automatically attach diagnostic data.

Follow the support instructions on the project website or in the release package when reporting a problem. The website's copyable report template does not send a report automatically.

## 中文说明

本工具只在浏览器内识别支持的阅读页面，并修改显示样式；没有服务器、广告或访问统计。扩展只在本机保存全局开关 `enabled`，油猴脚本不额外存储设置。不收集浏览历史、账户资料、Cookie、私信或正文，也不上传页面内容、主动发起网络请求。

站点权限用于读取页面结构和颜色、应用样式；后台、编辑器、登录、支付及账户页由额外规则排除。Chrome 展示的是域名级权限，不会因为这些排除规则而缩小权限提示。本工具当前需要手动更新，不加载远程代码。

提交 Issue 时，请注意内容可能公开，并主动去除私人信息和付费正文。
