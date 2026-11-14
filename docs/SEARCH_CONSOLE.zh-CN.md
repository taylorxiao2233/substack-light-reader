# 接入 Google Search Console

Search Console 用于查看 Google 是否发现和收录网页、用户通过哪些搜索词看到网站，以及曝光和点击情况。提交不保证收录或排名。它与 Google Analytics 是不同的工具；采用下面的 DNS 验证方式，不需要安装访客统计脚本。

## 1. 先部署网站地图

本项目提供：

- `website/public/robots.txt`：允许抓取，并声明网站地图地址。
- `website/public/sitemap.xml`：列出当前 12 个中英文正式页面。

中英文页面的语言对应关系已经在页面 HTML 的 `hreflang` 中声明。网站地图只列出规范网址，不包含下载包、预览域名或不存在的页面，也不填写没有可靠依据的更新时间。

提交并推送这些文件后，等待 Cloudflare 自动部署成功，再打开：

- https://substacklight.com/robots.txt
- https://substacklight.com/sitemap.xml

确认能直接看到文本和 XML，而不是登录页面、验证挑战或 404。以后新增或删除页面时，同步更新网站地图。

## 2. 添加网域资源

打开 https://search.google.com/search-console/ ，登录你准备长期管理网站的 Google 账号。

选择“添加资源”中的 **网域（Domain）**，输入：

```text
substacklight.com
```

这里不要填写 `https://`，也不要加 `/zh`。网域资源覆盖根域名、子域名及 HTTP/HTTPS 版本，英语与中文页面可以在同一个资源中查看。

## 3. 在 Cloudflare 添加 TXT 验证记录

复制 Search Console 为你生成的完整 TXT 值，格式为 `google-site-verification=...`。省略号只是格式示意，必须使用页面实际给出的完整内容。

进入 Cloudflare → `substacklight.com` → DNS → Records → Add record：

| 字段 | 填写内容 |
| --- | --- |
| Type | `TXT` |
| Name | `@` |
| Content | Google 提供的完整验证值 |
| TTL | `Auto` |

新增一条记录，不覆盖已有的邮件 SPF 或其他验证记录。保存后返回 Search Console 点击“验证”。如 Google 暂时没有读到记录，等待 DNS 更新后再试。验证成功后保留这条 TXT 记录，Google 会定期再次检查。

## 4. 提交网站地图

在 Search Console 左侧打开 **站点地图（Sitemaps）**，提交完整地址：

```text
https://substacklight.com/sitemap.xml
```

确认抓取状态成功。网站地图只帮助 Google 发现页面，不代表其中每一页已经收录。

## 5. 检查首页并请求收录

在顶部“网址检查”中输入 `https://substacklight.com/`，选择“测试实际网址”。确认 Google 能访问页面，且没有禁止索引或登录限制，再选择“请求编入索引”。

可以同样检查 `/install`、`/guide` 和 `/zh`。其他页面可通过网站地图和站内链接发现，不需要每天重复请求。Google 不承诺固定的抓取或收录时间。

## 6. 上线后看什么

- **网页索引 / Page indexing**：是否收录，未收录原因是什么。
- **效果 / Performance**：搜索词、曝光、点击、点击率及平均排名。
- **站点地图 / Sitemaps**：Google 能否读取地图。

先确认能被抓取和索引，再等数据积累。对这个项目，可关注实际出现的 `substack light mode`、白底阅读及刊物主题相关查询，不把候选关键词当成已经有流量的数据。

## 官方说明

- https://developers.google.com/search/docs/monitor-debug/search-console-start
- https://support.google.com/webmasters/answer/9008080?hl=zh-Hans
- https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
- https://developers.google.com/search/docs/crawling-indexing/ask-google-to-recrawl
