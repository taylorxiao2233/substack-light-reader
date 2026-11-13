# Cloudflare 免费邮件转发

目标：把发送给 `support@substacklight.com` 的邮件转发到你已经在使用的收件邮箱。官网已配置这个地址，但是否能收到邮件取决于下面的设置。

核对日期：2026 年 11 月 13 日。

## 免费范围

Cloudflare Email Routing 的收件转发可以在免费计划中使用。它不自动提供完整收件箱，也不会自动让你的原邮箱以 `support@substacklight.com` 回复。Cloudflare 另有 Email Sending，向普通用户发信需要 Workers 付费计划。

这次只配置免费的转发，不开通付费发信服务。

## 操作步骤

1. 登录 Cloudflare，在菜单找到 **Compute → Email Service → Email Routing**。若界面布局不同，可搜索 `Email Routing`。
2. 点击 **Onboard Domain**，选择 `substacklight.com`。这个域名需要使用 Cloudflare DNS。
3. 查看 Cloudflare 将添加的 MX、SPF 和 DKIM 记录，按提示确认并完成域名接入。若提示已有其他邮件服务的 MX 记录，先确认来源，不要直接删除仍在使用的邮件配置。
4. 打开 **Destination Addresses**，填写你日常收信的邮箱。
5. 打开 Cloudflare 发给该邮箱的验证邮件，点击 **Verify email address**。
6. 回到 `substacklight.com` 的 **Routing Rules**，点击 **Create routing rule**：
   - Email pattern：`support`
   - Domain：`substacklight.com`
   - Action：`Send to an email`
   - Destination：刚刚验证的收件邮箱
7. 点击 **Save**，确认规则启用。
8. 用另一个邮箱给 `support@substacklight.com` 发测试邮件。不要用作为转发终点的同一个邮箱发测试，以免邮件提供商把它当作重复邮件丢弃。
9. 检查目标收件箱和垃圾邮件。如果未立即收到，查看 Cloudflare 的路由状态及日志，再等待 DNS 生效。

目前只需要这一条 `support` 规则，不必开启接收所有地址的 Catch-all。

## 回复邮件

直接在原邮箱里点击回复，发件人一般仍是原邮箱地址。若以后要统一以 `support@substacklight.com` 回复，再配置支持该发件地址的发信服务或完整域名邮箱。

## 官方资料

- 配置步骤：https://developers.cloudflare.com/email-service/get-started/route-emails/
- 价格与免费范围：https://developers.cloudflare.com/email-service/platform/pricing/
- 发信功能：https://developers.cloudflare.com/email-service/
