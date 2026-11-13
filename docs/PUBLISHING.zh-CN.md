# GitHub 配置与发布步骤

本项目使用一个 Git 仓库管理官网、Chrome 扩展和油猴脚本。GitHub 仓库创建、推送、Release 发布和网站部署都是不同的步骤。以下操作由维护者执行；本地检查流程不会自动发布。

## 1. 创建空的公开仓库

打开 https://github.com/new ，登录 `taylorxiao2233`，填写：

- Owner：`taylorxiao2233`
- Repository name：`substack-light-reader`
- Description：`A local-only light mode for Substack publications, with a Chrome extension, userscript, and bilingual website.`
- Visibility：`Public`
- 不添加 README、.gitignore 或 License：本地已经准备好了这些文件。

点击 **Create repository**。保持远程仓库为空，便于推送本地已有提交。

## 2. 推送已有本地仓库

在本项目根目录的终端运行：

```sh
git remote add origin https://github.com/taylorxiao2233/substack-light-reader.git
git push -u origin main
```

这两条命令会把已经提交的官网、扩展和脚本发送到公开仓库。不要把账号令牌写进地址或粘贴到聊天中。

如果提示 `origin already exists`，先运行 `git remote -v` 核对地址，正确时直接执行第二条命令。不要为了重试而覆盖不相关的远程地址。

如果终端需要登录，可使用已配置的 GitHub 身份验证，或在 GitHub Desktop 中选择 **File → Add local repository**，添加本项目目录，登录 GitHub 后执行推送。GitHub 的 HTTPS Git 操作不接受普通账号密码。

## 3. 检查上传结果

打开仓库，确认下面的目录都能正常浏览：

- `website/`：官网源码，里面应能直接看到 `app/` 和 `components/`。
- `src/`：扩展和脚本共享的源码。
- `extension/`：可直接加载的 Chrome 扩展。
- `userscript/`：可直接安装的油猴脚本。
- `docs/`、`tests/`、`.github/`：文档、测试与自动检查。

`website/` 是普通目录，不是指向另一个仓库的链接。`work/`、`node_modules/`、`dist/`、本机密钥以及 `website/.openai/hosting.json` 不应出现在远程仓库中。

进入 **Actions**，等待扩展检查和官网检查完成。本地验证通过不代表远程 Actions 已经运行；首次推送后在这里确认结果。

在仓库 **About** 的设置中可以加入：

- Website：网站公开上线后填写 `https://substacklight.com`
- Topics：`substack`、`chrome-extension`、`userscript`、`light-mode`

## 4. 发布安装包

本地 `dist/` 已用于存放发布包。需要重新生成时，从项目根目录运行：

```sh
npm run build
npm test
npm run check
```

然后在 GitHub 仓库进入 **Releases → Draft a new release**：

1. 创建标签 `v0.5.0`，目标分支选择 `main`。
2. 标题填写 `Substack Light Reader v0.5.0`。
3. 说明可复制 `docs/RELEASE-v0.5.0.md`。
4. 上传这三个文件：
   - `dist/substack-light-reader-v0.5.0.zip`
   - `dist/substack-light-reader-v2.1.0.user.js`
   - `dist/SHA256SUMS.txt`
5. 当前产品状态仍是 beta，勾选 **Set as a pre-release**，再发布。

官网的主要下载按钮不必反复写“测试版”，发布记录仍保留真实版本状态。解压扩展 ZIP 后应直接看到 `manifest.json`；不要误把 GitHub 自动生成的整个源码 ZIP 当成扩展安装包。

## 5. 以后更新

修改 `src/` 和 `config/` 后重新构建扩展和脚本。更新官网的下载文件时：

```sh
npm run build
cd website
npm run sync:downloads
npm run typecheck
npm run build
cd ..
git add .
git commit -m "Describe the change"
git push
```

修改网站文案时同步维护英文和 `website/lib/translations.ts`。不同版本使用不同标签和安装包文件名，不要覆盖已发布版本的内容。

## 网站部署另行配置

GitHub 开源只负责代码和 Release，不会自动把 `substacklight.com` 指向网站。当前官网需要构建为 Worker，不能直接把源码目录交给 GitHub Pages。网站部署与域名绑定见 [Cloudflare 部署步骤](CLOUDFLARE_DEPLOY.zh-CN.md)。浏览器商店上架另行配置。

参考：
- https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-new-repository
- https://docs.github.com/en/migrations/importing-source-code/using-the-command-line-to-import-source-code/adding-locally-hosted-code-to-github
- https://docs.github.com/en/repositories/releasing-projects-on-github/managing-releases-in-a-repository
