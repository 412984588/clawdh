---
title: "推荐 GitHub 上 3 个 牛牛牛 Nano Banana Pro 开源项目。"
source: wechat
url: https://mp.weixin.qq.com/s/hsEG6Eqi4uT_OSIbCGX5ww
author: 逛逛GitHub
pub_date: 2025年12月4日 02:03
created: 2026-01-17 20:09
tags: [AI, 编程, 跨境电商]
---

# 推荐 GitHub 上 3 个 牛牛牛 Nano Banana Pro 开源项目。

> 作者: 逛逛GitHub | 发布日期: 2025年12月4日 02:03
> 原文链接: [点击查看](https://mp.weixin.qq.com/s/hsEG6Eqi4uT_OSIbCGX5ww)

---

01

Awesome Nano Banana Pro

Awesome Nano Banana Pro 是一个精选资源列表。

一般某个模型或者方向火了后，GitHub 上会立马出现一个该方向的 Awesome 合集。

这个开源项目目前拥有 2800 颗 Star，精心收集了大量高质量的提示词、图像生成案例以及相关教程。

内容涵盖了从照片级写实风格、创意实验、电商虚拟摄影，到室内设计、社交媒体营销素材等多个领域。

每一个案例通常都附带了原始图片、生成结果以及详细的提示词参数，方便你直接复制使用或进行微调。




对于 AI 绘画爱好者、提示词工程师以及希望挖掘 Nano Banana Pro 模型潜力的开发者来说，这是一个必看的知识库。

挑几个好玩的 Case，分享给大家。

白板艺术画

提示词：Create a photo of vagabonds musashi praying drawn on a glass whiteboard in a slightly faded green marker

加个眼睛和手手

提示词：Add illustrated googly eyes and stick hands on the (object/animal/ your bff) in an exaggerated comedic pose

天气卡片

年龄变化

提示词："Generate the holiday photo of this person through the ages up to 80 years old"

递归图片

提示词：recursive image of an orange cat sitting in an office chair holding up an iPad. On the iPad is the same cat in the same scene holding up the same iPad. Repeated on each iPad.

地理坐标图片

提示词：35.6586° N, 139.7454° E at 19:00

工程师眼中的建筑

提示词：How engineers see the San Francisco Bridge

图解应用漫画

提示词：Create a detailed {{pet store}} scene with English vocabulary labels for all objects. The format for labeling is: Line 1: English word, Line 2: IPA pronunciation, Line 3: Chinese translation

开源地址：https://github.com/ZeroLu/awesome-nanobanana-pro

02

小红书创作工具

RedInk 是一个专为小红书创作者打造的 AI 图文生成工具，现在已经拥有 1900+ 的 Star。


它非常适合自媒体博主、营销人员以及希望快速制作精美图文内容的用户。这个开源项目的核心卖点是：一句话、一张图生成小红书图文。

比如使用这个 GitHub 开源项目，输入：秋季显白美甲，图片是我的小红书主页，符合我的风格生成。

然后等待 10-20 秒后，就会有每一页的大纲，大家可以根据的自己的需求去调整页面顺序，自定义每一个页面的内容。

首先生成的是封面图：

然后稍等一会儿后，会生成后面的所有页面：

你只需输入一个主题或一句话，系统就能自动生成包含封面、大纲和正文页面的完整图文内容。

它支持并发生成，最高 25 页，你可以上传参考图片以保持个人风格，并且支持对生成的大纲和每一页的内容进行自定义编辑，生成的图片风格统一且文字准确。


在技术实现上，RedInk 后端使用 Python 3.11+ 和 Flask 框架，利用 Google Gemini 3 模型生成文案，并调用 Nano Banana Pro 模型生成图片。

前端则基于 Vue 3、TypeScript 和 Vite 构建，使用 Pinia 进行状态管理。

项目还支持 Docker 部署，方便用户在本地或服务器上快速搭建自己的 AI 创作助手。

开源地址：https://github.com/HisMax/RedInk

03

自拍传送门

SelfieAt 是一个基于 Nano Banana Pro 的自拍传送门应用。

你只需上传一张自拍照片，并输入世界上的任意地点，应用就会利用 Nano Banana Pro AI 模型将用户自然地融合到新的场景中。

视频加载失败，请刷新页面再试

 刷新

它支持摄像头实时拍摄或图片上传，并且能够同时生成多个地点的变体图片，生成的图像还带有精美的动效展示和水印处理。


项目采用了非常前沿的前端技术栈，包括 React 19、TypeScript、Vite 7 和 Tailwind CSS 4（线性风格设计）。

在后端，它使用 Express 作为 API 代理来安全地处理密钥。

核心的 AI 能力通过 @fal-ai/client 调用 Nano Banana Pro 模型实现。整个项目结构清晰，涵盖了从前端 UI 组件到后端服务代理的完整流程。

开源地址：https://github.com/amrrs/selfieat-nanobanana-pro

04

点击下方卡片，关注逛逛 GitHub

这个公众号历史发布过很多有趣的开源项目，如果你懒得翻文章一个个找，你直接关注微信公众号：逛逛 GitHub ，后台对话聊天就行了：

---
*导入时间: 2026-01-17 20:09:33*
