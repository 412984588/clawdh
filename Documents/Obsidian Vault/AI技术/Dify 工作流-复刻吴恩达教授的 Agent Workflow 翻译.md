# Dify 工作流-复刻吴恩达教授的 Agent Workflow 翻译

## 基本信息
- **标题**: Dify 工作流-复刻吴恩达教授的 Agent Workflow 翻译
- **来源**: 微信公众号
- **作者**: 2024年12月07日 10:00
- **发布时间**: 2024年12月07日
- **URL**: https://mp.weixin.qq.com/s?__biz=MzUyODkwNTg3MA==&mid=2247485802&idx=1&sn=8dc67e99d69c68393df3fed9c69cee5c&chksm=fb4069cc368e7424f63707b8fae1aaae7a4c1a0806c6d2ae2f6592606ad463dbdba1bdaa44a5&mpshare=1&scene=24&srcid=0106gpMlgdMG9eDpzuL9svCO&sharer_shareinfo=df854dc5f7aa60f9ecdd15e1e7343292&sharer_shareinfo_first=df854dc5f7aa60f9ecdd15e1e7343292#rd
- **分类**: AI技术
- **标签**: #AI #GitHub #工具推荐 #技术分析 #深度学习 #开源

## 内容摘要
前一段时间吴恩达教授开源了一个专注于翻译的 AI Agent——translation-agent。

这个 translate-agent 主要以 AI 大模型为翻译引擎，再通过在工作流中增加一些针对性的建议和反思，辅以：

提示词设定输出风格
处理习语和特殊术语
指定语言使用或方言等




使之更易于翻译出比较符合当地语言的内容。

https://github.com/andrewyng/translation-agent

我们今天在 Dify 中通过可视化工作流的方式来复刻一下这个 AI Agent～

准备工作
AI 应用——Dify，可以本地部署也可以使用官方提供的地址

本地...

## 完整内容

前一段时间吴恩达教授开源了一个专注于翻译的 AI Agent——translation-agent。

这个 translate-agent 主要以 AI 大模型为翻译引擎，再通过在工作流中增加一些针对性的建议和反思，辅以：

提示词设定输出风格
处理习语和特殊术语
指定语言使用或方言等




使之更易于翻译出比较符合当地语言的内容。

https://github.com/andrewyng/translation-agent

我们今天在 Dify 中通过可视化工作流的方式来复刻一下这个 AI Agent～

准备工作
AI 应用——Dify，可以本地部署也可以使用官方提供的地址

本地部署参考文章：

小道士，公众号：三金得鑫
37.4k 的 Dify，一款小白也可以轻松上手的大模型开发平台（一）：部署及基础使用
AI 大模型：工作流中使用的大模型深度求索家的 deepseek-chat，我们下面会大概介绍一下
注册 deepseek

访问 deepseek 的官网：https://www.deepseek.com/，选择接入 API（新用户会免费获取 500w 的 token 哦～）。

在 API Keys 页面，创建一个名为 dify 的 key:

这里要记得保存下生成的 Key 哦，Key 的值只在创建时展示一次！

绘制工作流

回到 Dify 中，我们先要将 deepseek 接入到模型供应商中：

这里不需要设置代理地址，deepseek 国内直连～

然后新建一个工作流，起名就叫 translate-agent，它需要 7 个步骤，一共 8 个节点：

开始节点：需要用户提供——目标语言、原始内容、原始语言、国家（可选）；
LLM 节点：用来将用户输入的内容翻译为目标语言；
条件分支节点：判断用户是否有输入 country 的变量；
LLM 节点-建议：如果没有 country 的变量，AI 大模型会根据翻译后的结果再给出一次优化建议；
LLM 节点-根据输入的 country 进行建议：译文的最终风格和语气都会与目标语言所在的国家口语风格相符；
变量聚合器：上面两个 LLM 节点的输出最终都会聚合到这个节点上进行输出
LLM 节点：根据建议，优化一次翻译内容
结束：最终输出到用户
测试

我们节选一段《小王子》中的内容来测试一下这个工作流：

原文：

“Just that,” said the fox. “To me, you are still nothing more than a little boy who is just like a hundred thousand other little boys. And I have no need of you. And you, on your part, have no need of me. To you, I am nothing more than a fox like a hundred thousand other foxes....”

看！翻译得多好～和我看过的译文一模一样：

“当然了，”狐狸说道，“对我来说，你与其他成千上万个小男孩没什么区别。我不需要你，你也不需要我。对你来说，我与其他成千上万只狐狸毫无差别。但是，如果你驯服了我，我们就谁也离不开谁了。那时候，对我来说，在这个世界上你就是独一无二的。而对你而言，我也是这个世界上独一无二的……”

但是这样我反而觉得这可能是模型数据中有这些内容，所以试试将诗词翻译成英语看看：

原文：

君不见黄河之水天上来，奔流到海不复回

译文翻译：你没有看到黄河的水从天上降下来，冲向大海，永不返回吗？

😂对不起，难为你了

但是反着把这个英文再让它翻译时，输出的结果倒是有点原诗词那味儿了！




你没看到黄河之水从天倾泻而下，奔流入海不复返，浩浩荡荡，势不可挡？

感兴趣的小伙伴可以后台回复「翻译」获取 DSL 文件～


写作不易，如果小伙伴们都看到了这里，请点个赞和在看，分享给更多的朋友；为确保您能收到每一篇文章，点个关注并在主页右上角设置星标。



往期推荐：

继 Dify 和 FastGPT 之后，我又玩了一下 RAGFlow

使用 Dify 搭一个 gpt-o1（山寨版）

31.1K Star 专注于工作流 的 Flowise AI


Dify 工作流分享-AI 搜索与分析

Dify 工作流分享-JinaSum

AI 搜索前传-13.1k Star 的本地 搜索应用 SearXNG

使用 dify-on-wechat 中的插件搭建私人助理



关注本公众号，了解更多 AI 资讯




为了方便沟通交流，三金也建了一个 AI 交流群，感兴趣的小伙伴可以加助理小姐姐进群哦～，发送「进群」即可。



---

**处理完成时间**: 2025年10月09日
**文章字数**: 2024字
**内容类型**: 微信文章
**自动分类**: AI技术
**处理状态**: ✅ 完成
