# 为你的Claude Code接入第三方大模型API

## 基本信息
- **标题**: 为你的Claude Code接入第三方大模型API
- **来源**: 微信公众号
- **作者**: maemo
- **发布时间**: 2025年09月08日
- **URL**: https://mp.weixin.qq.com/s?__biz=MzAwMDA2NzI0MQ==&mid=2649143082&idx=1&sn=ca1f2fd60bdb050b319055ea89c650d6&chksm=83346359afd949e8d7734e919921e110ddbcee5103f5700170fd1529ade9c4d3eda08286814b&mpshare=1&scene=24&srcid=0920AepqAlx1FNn5S4kM6zV7&sharer_shareinfo=bc6a7b9581fc2fbbb6e572a87e1cb505&sharer_shareinfo_first=bc6a7b9581fc2fbbb6e572a87e1cb505#rd
- **分类**: AI技术
- **标签**: #AI #GitHub #工具推荐 #技术分析 #深度学习 #产品

## 内容摘要
周末刷到一个新闻，说是鼎鼎大名的Claude，公开禁止中国及中国控股企业使用。

搜了一下，美国时间9月5日，Anthropic官网发布公告，标题是《Updating restrictions of sales to unsupported regions》[1]，文章直言不讳：Anthropic禁止敌对国家（如中国）访问其服务……防控受制于敌对国家（如中国）的公司或组织……严防其发展可能危害（美国及其盟国）国家安全的前沿AI技术……

总而言之，无论后续事态将会如何发展，至少我们可以知道：今后中国相关的用户，想要使用Claude模型进行Vibe Coding，将面临重重困难。

好在地球上会...

## 完整内容

周末刷到一个新闻，说是鼎鼎大名的Claude，公开禁止中国及中国控股企业使用。

搜了一下，美国时间9月5日，Anthropic官网发布公告，标题是《Updating restrictions of sales to unsupported regions》[1]，文章直言不讳：Anthropic禁止敌对国家（如中国）访问其服务……防控受制于敌对国家（如中国）的公司或组织……严防其发展可能危害（美国及其盟国）国家安全的前沿AI技术……

总而言之，无论后续事态将会如何发展，至少我们可以知道：今后中国相关的用户，想要使用Claude模型进行Vibe Coding，将面临重重困难。

好在地球上会编程的LLM可不止Claude一个——给大家介绍一个比较方便的小工具，用于快速查看和切换当前Claude Code工具使用的LLM API。

注意，这个工具目前实测能用于macOS系统。Windows、Linux等系统是否可用，我也未曾测试过。

项目地址:Zsh-Claude-Tools[2]

这个工具，是在~/.claude目录下创建了一个env目录，专门用来放API配置。配置文件在你的电脑中本地保存了访问API的必要信息，包括API地址、使用的模型等，并且不会上传到任何地方，包括iCloud或任何服务器。

一个典型的配置文件如下：

# 示例模板：请按需修改
export ANTHROPIC_BASE_URL=""
export ANTHROPIC_AUTH_TOKEN=""
export ANTHROPIC_MODEL=""
export ANTHROPIC_SMALL_FAST_MODEL=""

如何去获取配置里面应当填写的内容——这一步不再赘述。各位同仁可以去智谱、DeepSeek、Moonshot等LLM服务的开发者后台，了解各自的配置内容。

安装，只需要在终端中执行以下指令：

$ curl -fsSL https://raw.githubusercontent.com/iblueer/zsh-claude-tools/main/install.sh | sh

安装完成之后，通过以下指令进行验证：

source ~/.zshrc
claude-use list ——可以查看当前一共有哪些配置

如果正常安装成功，那么这个时候你应该能看到终端中有一个名字叫default的配置，它的内容就是上面所描述的”一个典型的配置文件“的样子。

接下来的使用，也相当简单：

$ claude-use new deepseek ——创建一个新配置名字叫deepseek
$ claude-use edit deepseek ——获取配置路径，方便修改
$ claude-use deepseek ——使用deepseek配置
$ claude-use show ——查看当前使用的是什么配置

想要更详细的安装、卸载、使用指南，请看对应Github项目的Readme文件。

其中的核心指令就是 claude-use <env>，这个指令能够直接将对应env里面写好的配置读取并执行，使Claude Code切换到对应的配置。

比如我们现在，切换到deepseek配置。

切换之后，可以通过下面的指令做验证：

$ claude /status

验证了一下，确实已经切换成功了。

有了这个小工具，就可以轻松的进行配置切换，充分利用国内的LLM服务进行Vibe Coding了。

顺带一提——这个小工具能记住当前选择的配置，在重启电脑或者重启终端的时候，开启默认配置，是不是非常贴心？

最主要的是，上手难度特别低嘿嘿。

References

[1] 《Updating restrictions of sales to unsupported regions》: https://www.anthropic.com/news/updating-restrictions-of-sales-to-unsupported-regions
[2] Zsh-Claude-Tools: https://github.com/iblueer/zsh-claude-tools




---

**处理完成时间**: 2025年10月09日
**文章字数**: 1762字
**内容类型**: 微信文章
**自动分类**: AI技术
**处理状态**: ✅ 完成
