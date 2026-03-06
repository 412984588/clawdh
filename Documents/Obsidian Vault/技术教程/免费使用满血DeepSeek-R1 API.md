# 免费使用满血DeepSeek-R1 API

## 基本信息
- **标题**: 免费使用满血DeepSeek-R1 API
- **来源**: 微信公众号
- **作者**: 李孟lm
- **发布时间**: 2025年02月06日
- **URL**: https://mp.weixin.qq.com/s?__biz=Mzg4ODUxMzE5NQ==&mid=2247486666&idx=1&sn=8012d4bb7fa0b0f45d52516e8b387e3f&chksm=cef2f500edcfcc1524ab3fb21197a8ddc45ca61d10057aab9e0743be691adf56598d8cabd91c&mpshare=1&scene=24&srcid=0207EcpF4ptWYN6g8ZA9xCkO&sharer_shareinfo=a3fb5768664bbb429be93c47499611d1&sharer_shareinfo_first=a3fb5768664bbb429be93c47499611d1#rd
- **分类**: 技术教程
- **标签**: #AI #GitHub #技术分析 #行业观察

## 内容摘要
如果你上个月还在地球上，那么你一定已经听说过 DeepSeek —— 就在上周，这个人工智能模型在美国股市引发了巨大动荡。

虽然该模型是开源的，可以在本地部署，但对于我们很多人来说，这并不是一个现实的选择！

为什么我们无法使用 DeepSeek？

主要有两个原因：

自从它火起来之后，deepseek.com 平台就一直没有响应。

它吸引了巨大的流量！

对于那些说可以在本地部署的人来说，这对普通用户来说也不现实，因为该模型非常庞大——拥有 6710 亿个参数。

如果要测试本地部署，可以参考这篇文章。

李孟lm，公众号：李孟聊AI
如何在本地计算机上安装和使用 DeepSeek R...

## 完整内容

如果你上个月还在地球上，那么你一定已经听说过 DeepSeek —— 就在上周，这个人工智能模型在美国股市引发了巨大动荡。

虽然该模型是开源的，可以在本地部署，但对于我们很多人来说，这并不是一个现实的选择！

为什么我们无法使用 DeepSeek？

主要有两个原因：

自从它火起来之后，deepseek.com 平台就一直没有响应。

它吸引了巨大的流量！

对于那些说可以在本地部署的人来说，这对普通用户来说也不现实，因为该模型非常庞大——拥有 6710 亿个参数。

如果要测试本地部署，可以参考这篇文章。

李孟lm，公众号：李孟聊AI
如何在本地计算机上安装和使用 DeepSeek R1

在本地使用 DeepSeek 所需的 GPU 资源也是巨大的。

那么，如何免费使用 DeepSeek-R1 呢？

使用免费 API

OpenRouter 提供了一个免费的 API 来使用 DeepSeek-R1。你可以按照下面的步骤操作，或者参照上面的教程开始使用。

访问 OpenRouter（https://openrouter.ai/）。

搜索 “DeepSeek-R1 (free)” 并点击进入。

生成一个免费的 API 密钥。

然后使用下面的代码，并添加你的 API 密钥：

from openai import OpenAI


client = OpenAI(
  base_url="https://openrouter.ai/api/v1",
  api_key="<OPENROUTER_API_KEY>",
)


completion = client.chat.completions.create(
  extra_headers={
    "HTTP-Referer": "<YOUR_SITE_URL>", # 可选项。在 openrouter.ai 上用于排名的站点 URL。
    "X-Title": "<YOUR_SITE_NAME>",      # 可选项。在 openrouter.ai 上用于排名的站点名称。
  },
  model="deepseek/deepseek-r1:free",
  messages=[
    {
      "role": "user",
      "content": "What is the meaning of life?"
    }
  ]
)
print(completion.choices[0].message.content)


完成后，你现在应该可以免费且无忧地使用 DeepSeek-R1 了！

注意： 目前可能会有一些速率限制，但暂时没有公开说明。

本文同步自知识星球《AI Disruption》

我是Substack和Medium顶级编辑。还是独立开发。

星球里面分享AI趋势和国外数字营销。

星球非免费。定价99元/年，0.27元/天。

一是运行有成本，我希望它能自我闭环，这样才能长期稳定运转；

二是对人的挑选，鱼龙混杂不是我想要的，希望找到关注和热爱 AI 的人。

欢迎你的加入！




---

**处理完成时间**: 2025年10月09日
**文章字数**: 1327字
**内容类型**: 微信文章
**自动分类**: 技术教程
**处理状态**: ✅ 完成
