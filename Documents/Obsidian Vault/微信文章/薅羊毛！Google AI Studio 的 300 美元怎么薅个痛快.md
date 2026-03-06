---
title: "薅羊毛！Google AI Studio 的 300 美元怎么薅个痛快"
source: wechat
url: https://mp.weixin.qq.com/s/JrZJY2s5MIZMEZ40s4eTbg
author: 42号星际游民
pub_date: 2025年12月14日 09:33
created: 2026-01-17 20:15
tags: [AI, 产品]
---

# 薅羊毛！Google AI Studio 的 300 美元怎么薅个痛快

> 作者: 42号星际游民 | 发布日期: 2025年12月14日 09:33
> 原文链接: [点击查看](https://mp.weixin.qq.com/s/JrZJY2s5MIZMEZ40s4eTbg)

---

前些日大家玩的Nano Banana Pro不亦乐乎，突然发现 Google 居然在疯狂撒币，新用户直接送 300 美元！这个实在太有诱惑力了，因为Google这波产品实在太赞了。

除了网上已经说得很清楚的基本玩法，我就想对其中一个被大家忽略的点说说自己的感想。

先说说这 300 美元到底是个啥

好多人以为 Google AI Studio 本身要付费，其实不是的。Google AI Studio 本来就是免费的，Gemini 3 Pro 巴拉巴拉那些模型，你打开浏览器就能用，一分钱不花。下面这四个功能，随便拿出来一个都可以秒杀一切了。

那这 300 美元是哪儿来的呢？

这个钱其实是 Google Cloud Platform (GCP) 送的试用额度。新用户注册 GCP 账号，验证一下信用卡（不扣钱，就是验证一下），然后 Google 就给你账户里充 300 美元，有效期 90 天。

这笔钱可以用来干嘛呢？除了 GCP 上的各种云服务，最香的就是 Vertex AI 里的 Gemini 全家桶，还有 Imagen 图片生成。

的确，这才是真正的羊毛所在。

大家都忽略的一个点：Build 功能

现在重点来了。Build这个功能实在是太好用了，要说build app这是现在AI 软件基本功能了，之前一直用的都是Claude，就很好用了，无论是小程序，还是网页，无论前端后端，多是分分钟的事。前段时间蚂蚁也推出了灵光，也是炒了好一阵，不过你在使用了Google AI studio这个之后，你会感觉到，这个是真心好用。5分钟一个app基本不需要怎么调整，加上Gemini和Nano的强大，以后自己想用什么就做什么。

我一会功夫做了三个我一直想做没做的应用，一个是合影神器，现在你想谁合影就和谁合，先在哪里照就在哪里照，想穿什么衣服就穿什么衣服：

这个功能过于强大了，不便于展示。强大支持在于它完全调用的Nano Banna Pro的生图，稳定性，一致性强的让人害怕。

对于牛马来说，没有什么比做一个生成PPT的神器，更让人觉得自己无所不能了的。

比起NotebookLM自由多了，你随便扔给它一篇论文，或者一段文字，甚至一个主题，有Gemini3帮你分析处理，然后你可以随便指定页数，你可以任意修改每一页的文字，你可以随意指定PPT的风格。

很多人知道可以在 Google AI Studio 免费玩 Gemini，但是有个限制——免费版的 Gemini 3 Pro 每天只能调用 100 次，每分钟 5 次。

如果你想拿来做点儿实际的东西，比如写个小工具、做个自动化脚本啥的，这个额度就有点儿捉襟见肘了。

Google AI Studio 这个 Build 的功能，之前很多人都没注意到。这个功能可以让 Gemini 直接帮你 生成 一个应用，生成的应用里会自动带上一个 API key 的占位符。build完了之后一键点击部署就可以部署到网页，也可以一键同步到github库中，简直不能再方便了。

归根结底，这个 Build 功能就是帮你搭个架子，然后你往里填自己的 API key。

而一旦你有了 API key，配合那 300 美元的 GCP 额度，那就完全不一样了。你可以：

调用 Vertex AI 的 Gemini 模型 —— 没有免费版那么严格的限制
用 Imagen 生成图片 —— Imagen 4 大概 0.04 美元一张，Imagen 4 Ultra 是 0.06 美元一张
用 Gemini 的语音模型 —— 那些 native-audio-preview、tts 巴拉巴拉的

你算一算，如果用 Imagen 4 生成图片，300 美元能生成多少张？

300 ÷ 0.04 = 7500 张。

7500 张！你想一想，够你玩多久？

怎么操作？手把手教你

好，现在说说具体怎么薅这个羊毛。

第一步：注册 GCP，拿到 300 美元
打开 Google Cloud
点"免费试用"（Free Trial）
登录你的 Google 账号
填一些基本信息，验证信用卡（不扣钱）
搞定！你的账户里就有 300 美元了，有效期 90 天

有些教程说需要绑卡很麻烦，其实也就那么回事，Google 只是确认一下你是真人，不会扣你钱的。

第二步：在 Google AI Studio 获取 API Key
打开 Google AI Studio
找到左侧菜单的 Get API Key（或者直接访问 https://aistudio.google.com/app/apikey）
点"Create API Key"
选择"Create API key in new project"
复制你的 API key（以"AIza"开头的一长串）

这个 API key 就是你的通行证。有了它，你就可以调用 Gemini API 和其他 Google AI 的服务了。

第三步：用 Build 功能生成应用

现在来到最关键的一步。

在 Google AI Studio 里，点左侧的 Build
用 Gemini 描述你想做的应用，比如"帮我做一个批量生成图片的工具"
Gemini 会帮你生成代码，代码里会有个 process.env.GEMINI_API_KEY 的占位符
把你刚才拿到的 API key 填进去
运行，开始薅羊毛！

这个和直接调 API 不同。直接调 API，你还得自己写代码、配置环境巴拉巴拉的。而 Build 功能是 Gemini 帮你写好整个应用框架，你只需要填 API key 就能用。

从某种意义上看，这完全就是在让 AI 帮 AI 打工...

第四步：配置 Vertex AI（可选）

如果你想用更强大的功能，比如 Imagen 图片生成，那就需要在 GCP 里开通 Vertex AI。

进入 Vertex AI 控制台
启用 Vertex AI API
在代码里把 API 端点改成 Vertex AI 的（文档里都有）
开始用那 300 美元！

Vertex AI 的 Gemini 模型和 AI Studio 里的是一样的，但是额度和限制不同。最重要的是，Vertex AI 的调用会从你的 GCP 余额里扣钱，也就是说，会用掉那 300 美元的额度。

能用来干啥？几个实际场景

我玩了几天，发现这 300 美元可以干的事情还挺多：

1. 批量生成图片

用 Nano Banana Pro 生成产品图、营销素材、社交媒体配图等等。0.04 美元一张，比 Midjourney 便宜多了。而且 Imagen 4 的文字渲染能力相当不错，生成带文字的海报也没问题。

2. 做个私人 AI 助手

用 Gemini 3 Pro 搭个聊天机器人，配合语音模型（TTS）做成语音助手。90 天内随便用，不用担心额度。

3. 视频字幕生成

Gemini 有原生音频处理能力，可以直接喂音频文件进去，让它生成字幕、翻译巴拉巴拉的。对做视频的朋友来说，这个功能简直是神器。

4. 文档批量处理

Gemini 3 Pro 支持 100 万 token 的上下文，可以一次性喂一本书进去，让它提取信息、生成摘要、翻译等等。

你想一想，还有什么比这更香的？

几个注意事项

当然，薅羊毛也得注意几个坑：

1. 90 天期限

这 300 美元只能用 90 天，过期作废。所以不要囤着，赶紧用起来。

2. 免费版 API 和付费版的区别

Google AI Studio 免费获取的 API key 有两种用法：

直接调用 AI Studio 的免费 API（每天 100 次限制）
配合 GCP 账号调用 Vertex AI（用掉 300 美元额度）

你要确保在代码里配置对了端点，不然可能还是在用免费版的限制额度。

3. 不要滥用

虽然有 300 美元，但也不要拿去做一些没意义的事情。Google 会监控异常使用行为，如果发现滥用可能会封号。

4. 监控你的花费

GCP 控制台里有个 Billing（账单）页面，可以实时看到你花了多少钱。建议设置一个预算提醒，比如花到 250 美元的时候提醒你一下，免得不小心超了。

Imagen 的定价细节

既然提到了图片生成，我再详细说说 Imagen 的价格。

根据 Google 的官方定价页面：

Imagen 4：0.04 美元/张（标准质量）
Imagen 4 Ultra：0.06 美元/张（更高质量，更准确理解提示词）
Imagen 4 Fast：速度更快，适合批量生成

所有生成的图片都会带 SynthID 水印，这是 Google 为了标识 AI 生成内容做的。如果你需要商用，记得查一下 Google 的使用条款。

如果你用 Imagen 4 生成 1000 张图，那就是 40 美元。300 美元可以生成 7500 张，够你玩很久了。

和其他平台的对比

有人可能会问：这个和直接用 ChatGPT Plus、Midjourney 比怎么样？

我的理解是这样的（不一定对，欢迎指正）：

ChatGPT Plus：20 美元/月，但只能用 ChatGPT 的模型，而且有使用频率限制。

Midjourney：30 美元/月（标准版），可以生成大约 200 张图（Fast 模式）。

Google 的 300 美元：可以用 90 天，能生成 7500 张图（Imagen 4），或者调用几十万次 Gemini API。

你想一想，哪个更香？

而且 Gemini 3 Pro 的多模态能力非常强，可以直接处理图片、音频、视频，还有 100 万 token 的超长上下文。这些功能在 ChatGPT Plus 里要么没有，要么有额外限制。

难怪越来越多人开始转向 Google 的 AI 生态...

最后说两句

其实这个羊毛的核心，就是 Google 想让更多开发者用上他们的 AI 服务。300 美元的试用额度，本质上是一种"先尝后买"的营销策略。

但对我们这些用户来说，管他什么策略呢，能薅就薅！

90 天，300 美元，足够你把 Google AI 的各种功能都玩个遍了。玩完之后，如果觉得好用，再考虑要不要付费继续用；如果觉得不值，那也没亏，毕竟白嫖了这么久。

至于那个 Build 功能，很多人真的忽略了。用好这个功能，可以让你快速搭建出各种 AI 应用，不用从头写代码，省时省力。

这条羊毛的深度...！

不说了，再说就是摇摇领先。

相关资源：

Google AI Studio: https://aistudio.google.com/
Google Cloud 免费试用: https://cloud.google.com/
Vertex AI 控制台: https://console.cloud.google.com/vertex-ai
Gemini API 文档: https://ai.google.dev/

---
*导入时间: 2026-01-17 20:15:12*
