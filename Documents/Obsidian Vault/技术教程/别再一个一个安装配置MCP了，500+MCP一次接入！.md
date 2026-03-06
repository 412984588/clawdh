# 别再一个一个安装配置MCP了，500+MCP一次接入！

## 基本信息
- **标题**: 别再一个一个安装配置MCP了，500+MCP一次接入！
- **来源**: 微信公众号
- **作者**: ByteNote
- **发布时间**: 2025年08月23日
- **URL**: https://mp.weixin.qq.com/s?__biz=MzIzMzQyMzUzNw==&mid=2247505410&idx=1&sn=1f8e69e1b1b671704ca7c6c43174d97a&chksm=e9655829b763938d9a949848cfd4215133728eaead1eb530ae64a9c0551aa94425226779eeba&mpshare=1&scene=24&srcid=0917dAgcOu4sQ2YAtFfhcEAF&sharer_shareinfo=2e52a2a3bceead817467303a556463ab&sharer_shareinfo_first=2e52a2a3bceead817467303a556463ab#rd
- **分类**: 技术教程
- **标签**: #AI #GitHub #工具推荐 #技术分析 #深度学习 #开源

## 内容摘要
昨天发的这个大语言模型的网关香！ 0费用多功能的统一AI模型网关：Al Gateway，可以实现配置一次大模型API，在所有的地方调用，而且每个月赠送5刀的费用，可以适用于所有云大模型，而且提供了控制台来监控成本，真的是非常的香。

今天又看到了一个MCP的统一平台，思路一样，也是一处配置，处处可用，将市面上比较优秀的MCP Server一网打尽。

Rube 是一个 Model Context Protocol（MCP）服务器的统一平台，可将你的 AI 工具连接到 500 多款应用，如 Gmail、Slack、GitHub 与 Notion。

只需在 AI 客户端中安装一次，并为所需应用完...

## 完整内容

昨天发的这个大语言模型的网关香！ 0费用多功能的统一AI模型网关：Al Gateway，可以实现配置一次大模型API，在所有的地方调用，而且每个月赠送5刀的费用，可以适用于所有云大模型，而且提供了控制台来监控成本，真的是非常的香。

今天又看到了一个MCP的统一平台，思路一样，也是一处配置，处处可用，将市面上比较优秀的MCP Server一网打尽。

Rube 是一个 Model Context Protocol（MCP）服务器的统一平台，可将你的 AI 工具连接到 500 多款应用，如 Gmail、Slack、GitHub 与 Notion。

只需在 AI 客户端中安装一次，并为所需应用完成一次性授权，即可开始让 AI 执行实际操作，例如“发送邮件”或“创建任务”。

它可以在所有的支持MCP客户端使用，这里以Claude Code为例子来讲解它具体的使用步骤。

简单一句话就行，在命令行输入：

claude mcp add --transport http rube -s user "https://rube.app/mcp"


运行Claude Code的/mcp指令打开MCP的列表查看是否安装成功。

如果安装成功了 就应该在列表上看到rube，选择rube点击回车。

界面上会显示需要进行授权，并且给出了MCP的地址和它对应本地配置路径，点击Authebticate完成授权。

点击完成之后会自动打开浏览器，完成帐号的注册。

再点击右上角的Market，这里基本上分门别类了近500种MCP server，可以点击Eable选择需要安装的Server。

如果本身这个MCP是需要授权的，在控制台里面会有一个授权按钮，授权一次成功之后，那么在其他的地方使用就不需要二次授权了。

我安装了一个官方的Github MCP，复审成功之后Claude Code也不需要重启了，直接可以使用，示范如下：

现在的CLI AI编程工具实在是太多了，每天层出不穷，如果真的是要靠一个个手工配置MCP还是挺麻烦的，这个平台的作用就是简化了操作步骤，只需要在应用商店点击一下加入就可以在所有的地方进行调用。

另外的话因为只需要安装一个MCP，可以极大地节省上下文的Token消耗，我们要做的仅仅就是Call一下rube里面已经安装好了MCP的名称就可以完成MCP Server的定位调用，比在本地安装一大堆的MCP拿去空判断要节省很多。

AI编程高效开发指南


试了一下用Comet AI浏览器自动发小红书图文，可行！


免费用DeepSeek V3.1 / DeepSeek V3.1在Claude Code 中的配置


Agent文档编写有了统一标准！OpenAI开源了AGENTS.md


AI编程的三种思维病毒


---

**处理完成时间**: 2025年10月09日
**文章字数**: 1177字
**内容类型**: 微信文章
**自动分类**: 技术教程
**处理状态**: ✅ 完成
