# 部署 Substack Light 到 Cloudflare Workers

本项目官网使用 Vinext 和 Cloudflare Workers。网站源码在 `website/`，部署名称为 `substacklight`，正式域名为 `substacklight.com`。

`website/wrangler.jsonc` 是 Cloudflare 配置来源。构建会生成 `website/dist/server/wrangler.json`，实际发布使用这个生成的配置，以同时上传服务器代码、页面资源和扩展下载文件。

## 推荐：GitHub 推送后自动部署

日常流程是：修改代码 → 提交到 `main` → `git push` → Cloudflare 自动构建并发布。首次连接仓库在 Cloudflare 网页完成，不需要运行本机的 `npm run cf:login`。

### 1. 先推送已准备的部署配置

在本项目根目录执行：

```sh
git push
```

确认 GitHub 仓库中已经出现 `website/wrangler.jsonc`，并且 `website/package.json` 包含 `deploy:built` 命令。

### 2. 在 Cloudflare 连接 GitHub

1. 登录拥有 `substacklight.com` 的 Cloudflare 账号，进入 **Workers & Pages**。
2. 选择 **Create application → Import a repository**，连接 GitHub。
3. 选择账号 `taylorxiao2233` 和仓库 `substack-light-reader`。
4. 如果已有博客使用 Cloudflare 的 GitHub 集成，可以继续使用现有连接。如果看不到新仓库，进入 GitHub 的 **Settings → Applications → Installed GitHub Apps → Cloudflare Workers and Pages → Configure**，在原有仓库选择中增加 `substack-light-reader`，保留博客原来的选择。
5. 在 Cloudflare 中填写下面的构建设置，然后开始首次部署。

如果同名 Worker 已经存在，直接进入该 Worker 的 **Settings → Build** 连接仓库，不必再次创建。

### 3. 构建设置

| 项目 | 填写内容 |
| --- | --- |
| Worker 名称 | `substacklight` |
| Production branch | `main` |
| Root directory | `website` |
| Build command | `npm run typecheck && npm run build` |
| Deploy command | `npm run deploy:built` |
| Node.js 版本 | 设置构建变量 `NODE_VERSION=24` |

依赖根据 `website/package-lock.json` 安装。部署命令会使用构建生成的 `dist/server/wrangler.json`，同时上传服务器代码与静态文件。使用 Workers 的 Git 集成，无需把 GitHub PAT 或 Cloudflare 令牌提交到代码中。

初期只需要监听生产分支 `main`。GitHub Actions 的 **Check** 工作流仍用于检查代码；Cloudflare 的构建与部署记录会单独显示。这里的构建命令包含类型检查，检查失败会阻止这次部署。

本项目应创建 Workers 应用。仅上传 `dist/client/` 的静态输出会缺少服务端页面代码。

## 域名绑定

发布配置已声明 `substacklight.com` 为 Custom Domain。Cloudflare 会为它配置指向 Worker 的 DNS 记录和 HTTPS 证书。域名必须在当前账号下且处于 Active 状态。

若提示已有同名 CNAME 或域名被其他服务占用，先在 Cloudflare 确认现有记录的用途，再处理冲突；不要直接覆盖其他正在运行的网站。

发布后，在 Cloudflare 的 **Workers & Pages → substacklight → Settings → Domains & Routes** 查看域名状态。CLI 返回的 `workers.dev` 地址也可用于检查初次部署。

## 可选：本机手动发布

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
- https://developers.cloudflare.com/workers/ci-cd/builds/git-integration/github-integration/
