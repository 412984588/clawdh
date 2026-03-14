---
title: "多模型共享 GPU 内存，Berkeley 开源新工具"
source: wechat
url: https://mp.weixin.qq.com/s/tg_EStlENO9BtEK1jH0XcQ
author: AI工程化
pub_date: 2025年10月22日 00:04
created: 2026-01-17 22:09
tags: [AI, 创业]
---

# 多模型共享 GPU 内存，Berkeley 开源新工具

> 作者: AI工程化 | 发布日期: 2025年10月22日 00:04
> 原文链接: [点击查看](https://mp.weixin.qq.com/s/tg_EStlENO9BtEK1jH0XcQ)

---

GPU 内存利用率低，一直是大模型部署的痛点。多个模型各占一张卡，实际使用率却不高，钱烧得心疼。

伯克利Sky Computing Lab团队最近开源的kvcached就是在解决这个痛点。它本质上是个KV缓存守护进程，通过虚拟化技术让多个模型共享同一张GPU的显存。

核心思路

传统做法是每个模型启动时就预分配大块 GPU 内存，不管用不用。

团队负责人Joey Gonzalez就打了个很形象的比方：我们现在管理GPU的方式还像上世纪的大型机时代，每个应用独占硬件资源。是时候引入现代操作系统的资源共享理念了。

kvcached 引入了虚拟内存概念，让 KV cache 按需分配。简单说就是：需要多少，给多少。不用的内存可以给其他模型。

技术上，它把 GPU 虚拟地址和物理内存分离。模型启动时只预留虚拟地址，真正使用时才分配物理内存。这样多个模型可以动态共享同一张卡的内存。

实际效果

测试数据挺有说服力：

在 A100-80G 上跑三个 Llama-3.1-8B 模型
Time-to-first-token 提升 1.2-28 倍
内存利用率显著提升
使用体验

安装简单：

pip install kvcached --no-build-isolation


同时还提供其他方式安装，如docker等。

兼容性不错，支持 vLLM 和 SGLang，不需要改代码。设置几个环境变量就能用：


export ENABLE_KVCACHED=true
export KVCACHED_AUTOPATCH=1

适用场景

几个明显的应用场景：

多模型服务 - 一张卡跑多个模型，根据流量动态分配内存
Serverless 部署 - 模型按需启动，内存按需分配
复合 AI 系统 - 检索、推理、总结等专门模型共享硬件
混合负载 - 推理和训练任务共存
小结

随着模型越来越大，硬件成本压力只会增加，提升利用率是绕不开的问题。像kvcached这样从系统层面优化资源利用的技术，可能会成为未来AI基础设施的标准配置。

国内也有类似提升GPU利用率的项目，比如GPU虚拟化的项目HAMi（https://github.com/Project-HAMi/HAMi）等。

对于该项目感兴趣的，不妨可以试试。

项目地址：https://github.com/ovg-project/kvcached

关注公众号回复“进群”入群讨论。

---
*导入时间: 2026-01-17 22:09:59*
