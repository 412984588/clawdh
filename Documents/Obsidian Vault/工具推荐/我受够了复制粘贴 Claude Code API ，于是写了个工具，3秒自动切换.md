# 我受够了复制粘贴 Claude Code API ，于是写了个工具，3秒自动切换

## 基本信息
- **标题**: 我受够了复制粘贴 Claude Code API ，于是写了个工具，3秒自动切换
- **来源**: 微信公众号
- **作者**: 硅基咖啡馆
- **发布时间**: 2025年09月21日
- **URL**: https://mp.weixin.qq.com/s/5A5eFc-l6GHBu_qxuLdtIQ
- **分类**: 工具推荐
- **标签**: #AI #GitHub #工具推荐 #技术分析 #效率 #深度学习 #开源

## 内容摘要
好久不见~

Claude Code，相信程序员们没有不在用的吧？可以称之为编码之神！

但是，在国内爽用Claude模型，有亿点难：

Claude Code Max 一个月要 200 美元，快 1500 块钱了，真的用不起！

好不容易开通了官方账号，用了没几天就被限流，额度越来越少，而且降智，甚至封号！

国内注册 Claude 账号太难了。。

再加上Anthropic的创始人当年被百度虐的有点心理变态（传闻哈）。。

只能退而求其次，使用第三方中转或接入国内的K2或GLM4.5模型，

国内这些模型，实测来说没有比得上claude sonnet 4的，更别说opus了。。

好在，L...

## 完整内容

好久不见~

Claude Code，相信程序员们没有不在用的吧？可以称之为编码之神！

但是，在国内爽用Claude模型，有亿点难：

Claude Code Max 一个月要 200 美元，快 1500 块钱了，真的用不起！

好不容易开通了官方账号，用了没几天就被限流，额度越来越少，而且降智，甚至封号！

国内注册 Claude 账号太难了。。

再加上Anthropic的创始人当年被百度虐的有点心理变态（传闻哈）。。

只能退而求其次，使用第三方中转或接入国内的K2或GLM4.5模型，

国内这些模型，实测来说没有比得上claude sonnet 4的，更别说opus了。。

好在，L站的佬友们，免费分享了很多的公益站，基本可以日常爽用了（再次感谢佬友们的无私奉献🙏）

👆上面是平时收集到的或领到的部分公益站点
但是，这些站点最大问题，就是不稳定。

你有没有过这种体验？

打开终端，准备写点代码，顺手想让 Claude 帮忙修改下bug —— 结果终端卡住，十几秒后蹦出一行：

Error: connect ETIMEDOUT

你叹了口气，心里默念：“又挂了。”

然后又默默打开飞书文档，找到记录的那些站点API的URL和KEY：

服务A: BASE_URL: https://api.a.com, KEY：sk-aaa...

服务B: BASE_URL: https://api.b.org,  KEY：cr-bbb...

服务C: BASE_URL:  https://api.c.cn,  KEY：sk-ccc...

复制服务B的URL → 粘贴到终端 → 设置环境变量

复制服务B的Key → 粘贴到终端 → 再敲回车

运行 claude —— 好的，这次终于连上了。

你以为这就完了？不，这只是今天第一次。下午你再用，服务B也挂了，你又得重复一遍。

那一刻我对自己说：

“我是程序员啊！这种重复劳动，不应该由我来干！”

于是，借着周末值班的空隙，窝在电脑前吭哧吭哧写了个把钟头 —— switch-claude-cli 诞生了。

一、它是干啥的？

简单说：用node写的一个cli工具，一个命令，自动帮你选一个能用的 Claude API，然后一键切换。

你不用再打开飞书或备忘录。

不用再复制粘贴。

不用再祈祷哪个服务今天没崩。

你只需要：

switch-claude

然后 —— 工具会自动 ping 你配置的所有 API 服务商，把“活着的”列出来，你按个回车选一个，环境变量自动配好。全程不超过10秒。

如果默认的那个挂了？它会直接跳过，给你推荐下一个能用的。

二、怎么用？

打开终端，全局安装（你有 Node.js 就行）：

npm install -g switch-claude-cli

基本的命令如下：

🎉 欢迎使用 Switch Claude CLI！


📚 Switch Claude CLI - Claude API Provider 切换工具


用法:
  switch-claude [选项] [编号]


选项:
  -h, --help          显示帮助信息
  -r, --refresh       强制刷新缓存，重新检测所有 provider
  -v, --verbose       显示详细的调试信息
  -l, --list          只列出 providers 不启动 claude
  -e, --env-only      只设置环境变量，不启动 claude
  --add               添加新的 provider
  --remove <编号>     删除指定编号的 provider
  --set-default <编号> 设置指定编号的 provider 为默认
  --clear-default     清除默认 provider（每次都需要手动选择）


参数:
  编号                直接选择指定编号的 provider（跳过交互选择）


示例:
  switch-claude           # 交互式选择
  switch-claude 1         # 直接选择编号为 1 的 provider
  switch-claude --refresh # 强制刷新缓存后选择
  switch-claude -v 2      # 详细模式选择编号为 2 的 provider
  switch-claude --list    # 只列出所有 providers
  switch-claude --add     # 添加新的 provider
  switch-claude --remove 2 # 删除编号为 2 的 provider
  switch-claude --set-default 1 # 设置编号为 1 的 provider 为默认
  switch-claude --clear-default  # 清除默认设置
  switch-claude -e 1      # 只设置环境变量，不启动 claude

第一次运行，它会帮你生成配置文件：

switch-claude

你可以选择交互式的配置向导，根据提示增加第三方的API，也可以自己去手动编辑.swith-claude下的配置文件。

如果自己手动添加，你只需要在生成的 providers.json 里，把你攒的那些 API 填进去，像这样：

[
  {
    "name": "Veloera",
    "baseUrl": "https://zone.veloera.org",
    "key": "sk-your-key-here",
    "default": true
  },
  {
    "name": "NonoCode",
    "baseUrl": "https://claude.nonocode.cn/api",
    "key": "cr_your-key-here",
    "default": false
  }
]

以后每次想换 API，就敲：

switch-claude

选一个，回车，搞定。

坦白说，做这个，就是想让自己少生点气。

Claude 官方 API 很稳，但价格确实肉疼。作为开发者，我们总喜欢找点“性价比方案” —— 于是攒了一堆第三方 API，便宜、能用，就是不太稳定。

这本来是好事，直到你每天要手动切换三遍。

这个小工具，解决的就是我自己的“真痛点”。写完之后，我自己的开发效率直接起飞 —— 再也不用在备忘录和终端之间来回切屏，也不用担心服务突然挂掉打断思路。

三、🌱 开源了，欢迎来玩

我觉得，这种“小而美”的工具，就应该开源。说不定你的痛点，也是别人的痛点。

项目已经发布到 npm，代码托管在 GitHub：

📦 npm: https://www.npmjs.com/package/switch-claude-cli

🐙 GitHub: https://github.com/yak33/switch-claude-cli

欢迎来 star、提 issue、PR —— 比如你想加个“自动轮询”功能，或者支持更多环境变量格式，都可以一起搞。

🔚 最后说两句

我们每天都在用各种炫酷的 AI 工具，但别忘了 —— 程序员最擅长的，其实是“偷懒”。

不是真的懒，而是把重复、机械、低价值的事情，交给机器去做，把时间省下来，去写更有意思的代码，去解决更复杂的问题，或者……去多睡半小时。

（完）

如果觉得写的不错，请随手点个赞、在看、转发三连。
谢谢你看我的文章。

---

**处理完成时间**: 2025年10月09日
**文章字数**: 3252字
**内容类型**: 微信文章
**自动分类**: 工具推荐
**处理状态**: ✅ 完成
