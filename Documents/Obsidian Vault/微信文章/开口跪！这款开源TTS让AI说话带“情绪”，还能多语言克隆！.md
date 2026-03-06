---
title: "开口跪！这款开源TTS让AI说话带“情绪”，还能多语言克隆！"
source: wechat
url: https://mp.weixin.qq.com/s/5IOaEUsP-9-2GDHcvTKlpA
author: 猫说AI
pub_date: 2025年12月19日 20:41
created: 2026-01-17 20:26
tags: [AI]
---

# 开口跪！这款开源TTS让AI说话带“情绪”，还能多语言克隆！

> 作者: 猫说AI | 发布日期: 2025年12月19日 20:41
> 原文链接: [点击查看](https://mp.weixin.qq.com/s/5IOaEUsP-9-2GDHcvTKlpA)

---

经常使用语音助手、听有声小说或者和AI对话的朋友们，有没有觉得那些合成出来的声音，虽然清晰，但总少了那么一点“人情味”？有时候听起来会觉得有点机械、僵硬，少了人类说话时那种自然的起伏和情绪。

但今天，我们要聊的这个开源项目，可能会彻底改变你对AI语音的看法。它就是由Resemble AI公司带来的最先进的文本转语音（Text-to-Speech，简称TTS）模型家族——Chatterbox。

Chatterbox：让AI语音告别“机械音”

Chatterbox 不只是一个模型，而是一个由三个SOTA（State-of-the-Art，业界最先进）模型组成的家族。而在这个家族中，最耀眼的新星非 Chatterbox-Turbo 莫属。

Chatterbox Turbo Image

想象一下，一个AI不仅能说出你输入的文字，还能在适当的时候“笑一笑”、“咳一声”甚至“轻声低语”，是不是瞬间感觉它更像一个活生生的人了？

Chatterbox-Turbo 做到了。它不仅架构更精简（只有3.5亿参数），运行效率更高，占用更少的计算资源和显存，更重要的是，它原生支持“副语言标签”（Paralinguistic Tags）。这意味着，你可以在文本中加入 [cough]（咳嗽）、[laugh]（笑声）、[chuckle]（轻笑）等标签，让AI在合成语音时自然地带入这些情绪和动作。

以往需要复杂的步骤才能生成高质量语音，Turbo模型通过技术优化，将“语音-token-到-mel解码”这个瓶颈环节从10步缩短到惊人的1步，同时依然保持了高保真度的音频输出。这让它在需要低延迟的语音交互场景（比如语音助手、客服机器人）中表现出色，同时在叙事和创意工作流中也能大放异彩。

模型家族，总有一款适合你

Chatterbox 家族的魅力远不止此，它提供了多款模型，以满足不同场景的需求：

• Chatterbox-Turbo (350M参数，英文):
特色：副语言标签（[laugh]等），低计算和显存占用。
最适合：零样本语音代理、生产环境。
• Chatterbox-Multilingual (500M参数，23+种语言):
特色：零样本语音克隆，多语言支持。
最适合：全球化应用、本地化内容。
这才是真正的“开口跪”！它能支持多达23种语言，包括我们熟悉的中文、英语、法语、日语、韩语、西班牙语等。想象一下，你只需要一段参考语音，它就能用这个声音，流利地说出不同语言的文字，简直是跨文化交流和内容创作的利器。
• Chatterbox (500M参数，英文):
特色：CFG & 夸张度调优。
最适合：通用零样本TTS，具备创意控制。
Podonos Turbo Eval
更逼真的秘密：如何控制声音表现？

Chatterbox不仅能听懂你的文字，还能理解你对“语气”的期待。对于追求更具表现力或戏剧性语音的用户，Chatterbox还提供了CFG（Classifier-Free Guidance）权重和**夸张度（Exaggeration）**等参数进行细致调节。比如，降低CFG权重并提高夸张度，可以获得更富有情感和活力的语音，让你的AI角色说话更生动。

负责任的AI：内置水印技术

在AI生成内容日益普及的今天，识别内容来源变得尤为重要。Chatterbox 家族生成的所有音频文件都内置了Resemble AI的 PerTh（感知阈值）水印技术。这种水印是不可察觉的，即使经过MP3压缩、音频编辑等常见操作，也能保持近乎100%的检测准确率。这无疑为AI生成语音的负责任使用提供了一层重要的保障。

如何上手体验？

体验 Chatterbox 非常简单。如果你是开发者，只需几行代码就能搞定：

安装：

pip install chatterbox-tts

Chatterbox-Turbo 示例：

import torchaudio as ta
import torch
from chatterbox.tts_turbo import ChatterboxTurboTTS

# 加载Turbo模型 (需要CUDA设备)
model = ChatterboxTurboTTS.from_pretrained(device="cuda")

# 带有副语言标签的文本
text = "您好，这里是Sarah，MochaFone打给您回电 [chuckle]，您有一分钟时间聊聊账单问题吗？"

# 生成音频 (需要一个10秒的参考音频片段进行声音克隆)
wav = model.generate(text, audio_prompt_path="your_10s_ref_clip.wav")

ta.save("test-turbo.wav", wav, model.sr)

多语言示例 (以中文为例)：

import torchaudio as ta
from chatterbox.mtl_tts import ChatterboxMultilingualTTS

# 加载多语言模型 (需要CUDA设备)
multilingual_model = ChatterboxMultilingualTTS.from_pretrained(device="cuda")

# 中文文本
chinese_text = "你好，今天天气真不错，希望你有一个愉快的周末。"
wav_chinese = multilingual_model.generate(chinese_text, language_id="zh")
ta.save("test-chinese.wav", wav_chinese, multilingual_model.sr)

更多详细的示例代码和用法，可以在项目的GitHub仓库中找到。

写在最后

Chatterbox TTS 系列的推出，无疑是文本转语音技术领域的一次重大突破。它不再仅仅是将文字转化为声音，而是赋予了AI语音更丰富的表现力和情感色彩，甚至能进行多语言的零样本克隆。无论是为游戏角色配音，制作有声读物，还是开发智能语音助手，Chatterbox 都能提供超乎想象的真实感和灵活性。

AI 的声音，不再冰冷，而是充满温度。

项目地址：https://github.com/resemble-ai/chatterbox

推荐阅读
• 50K Star！OCR神器，PDF秒变结构化数据！
• 告别SQL！这AI神器，让你像聊天一样查数据，并生成可视化图表
• 30秒克隆任意声音？这个AI实时变声器太逆天！

---
*导入时间: 2026-01-17 20:26:05*
