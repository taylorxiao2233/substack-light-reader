# 部署 Substack Light 到 Cloudflare Workers

本项目官网使用 Vinext 和 Cloudflare Workers。网站源码在 `website/`，部署名称为 `substacklight`，正式域名为 `substacklight.com`。

`website/wrangler.jsonc` 是 Cloudflare 配置来源。构建会生成 `website/dist/server/wrangler.json`，实际发布使用这个生成的配置，以同时上传服务器代码、页面资源和扩展下载文件。

## 首次在本机发布

在本项目的 `website/` 目录运行：

```sh
npm run cf:login
```

在浏览器中登录拥有 `substacklight.com` 的 Cloudflare 账号，并完成 Wrangler 授权。该命令申请账号信息读取、Workers 发布和域名路由管理权限；不用把令牌写进项目。

确认登录，然后构建和发布：

```sh
npm run cf:whoami
npm run typecheck
npm run deploy
```

如果刚完成构建和模拟部署，且源码没有变化，可直接使用 `npm run deploy:built` 发布当前构建。

仅验证部署包、不上传：

```sh
npm run build
npm run deploy:check
```

## 域名绑定

发布配置已声明 `substacklight.com` 为 Custom Domain。Cloudflare 会为它配置指向 Worker 的 DNS 记录和 HTTPS 证书。域名必须在当前账号下且处于 Active 状态。

若提示已有同名 CNAME 或域名被其他服务占用，先在 Cloudflare 确认现有记录的用途，再处理冲突；不要直接覆盖其他正在运行的网站。

发布后，在 Cloudflare 的 **Workers & Pages → substacklight → Settings → Domains & Routes** 查看域名状态。CLI 返回的 `workers.dev` 地址也可用于检查初次部署。

## 以后从 GitHub 自动部署

先把本次 Cloudflare 配置提交并推送到 GitHub，再在 Cloudflare Workers 中连接仓库 `taylorxiao2233/substack-light-reader`。如果尚未创建 Worker，可从 **Workers & Pages → Create application → Import a repository** 开始。

配置：

| 项目 | 填写内容 |
| --- | --- |
| Worker 名称 | `substacklight` |
| Production branch | `main` |
| Root directory | `website` |
| Build command | `npm run build` |
| Deploy command | `npm run deploy:built` |
| Node.js 版本 | `24`（需要时设置 `NODE_VERSION=24`） |

依赖由锁文件安装。初次连接 GitHub 时，由你在浏览器中确认 Cloudflare 对此仓库的访问。使用 Workers 的 Git 集成，无需把 GitHub PAT 或 Cloudflare 令牌提交到代码中。

这个项目不使用 Pages 的静态“输出目录”部署方式；仅上传 `dist/client/` 会缺少页面服务端代码。

## 发布后检查

- 打开英文首页 `/`、中文首页 `/zh` 和安装页 `/install`。
- 确认语言切换、邮箱和 X 入口可用。
- 确认扩展 ZIP 和 `.user.js` 下载成功。
- 页面规范网址应指向 `https://substacklight.com`。
- 测试不存在的路径，确认返回 404。

部署网站不会开通 `support@substacklight.com` 的邮件转发，邮件需要按 [邮件配置步骤](EMAIL_SETUP.zh-CN.md)另行完成。

## 官方参考

- https://developers.cloudflare.com/workers/vite-plugin/
- https://developers.cloudflare.com/workers/vite-plugin/reference/programmatic-configuration/
- https://developers.cloudflare.com/workers/configuration/routing/custom-domains/
- https://developers.cloudflare.com/workers/ci-cd/builds/configuration/
