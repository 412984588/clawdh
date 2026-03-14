---
title: "弃用 uni-app！Vue3 的原生 App 开发框架来了！"
source: wechat
url: https://mp.weixin.qq.com/s/65I57q4fsSBrsNRUQH7R8w
author: 前端开发爱好者
pub_date: 2025年10月12日 20:33
created: 2026-01-17 21:04
tags: [编程]
---

# 弃用 uni-app！Vue3 的原生 App 开发框架来了！

> 作者: 前端开发爱好者 | 发布日期: 2025年10月12日 20:33
> 原文链接: [点击查看](https://mp.weixin.qq.com/s/65I57q4fsSBrsNRUQH7R8w)

---

长久以来，"用 Vue 3 写真正的原生 App" 一直是块短板。

uni-app 虽然"一套代码多端运行"，但性能瓶颈、厂商锁仓、原生能力羸弱的问题常被开发者诟病。

整个 Vue 生态始终缺少一个能与 React Native 并肩的"真·原生"跨平台方案

直到 NativeScript-Vue 3 的横空出世，并被 尤雨溪 亲自点赞。

为什么是时候说 goodbye 了？
uni-app 现状
	
开发者痛点


渲染层基于 WebView 或弱原生混合
	
启动慢、掉帧、长列表卡顿


自定义原生 SDK 需写大量 renderjs / plus 桥接
	
维护成本高，升级易断裂


锁定 DCloud 生态
	
工程化、Vite、Pinia 等新工具跟进慢

Vue 3
 支持姗姗来迟，Composition API 兼容碎裂
	
类型推断、生态插件处处踩坑

"我们只是想要一个 Vue 语法 + 真原生渲染 + 社区插件开箱即用 的解决方案。"
—— 这，正是 NativeScript-Vue 给出的答案。

尤雨溪推特背书

2025-10-08，Evan You 转发 NativeScript 官方推文：

"Try Vite + NativeScript-Vue today — HMR, native APIs, live reload."

配图是一段 <script setup> + TypeScript 的实战 Demo，意味着：

真正的 Vue 3 语法（Composition API）
Vite 秒级热重载
直接调用 iOS / Android 原生 API

获创始人的公开推荐，无疑给社区打了一剂强心针。

NativeScript-Vue 是什么？

一句话：Vue 的自定义渲染器 + NativeScript 原生引擎

运行时 没有 WebView，JS 在 V8 / JavaScriptCore 中执行
<template> 标签 → 原生 UILabel / android.widget.TextView
支持 NPM、CocoaPods、Maven/Gradle 全部原生依赖
与 React Native 同级别的性能，却拥有 Vue 完整开发体验
5 分钟极速上手
1. 环境配置（一次过）
# Node ≥ 18
npm i -g nativescript
ns doctor                # 按提示安装 JDK / Android Studio / Xcode
# 全部绿灯即可

2. 创建项目
ns create myApp \
  --template @nativescript-vue/template-blank-vue3@latest
cd myApp


模板已集成 Vite + Vue3 + TS + ESLint

3. 运行 & 调试
# 真机 / 模拟器随你选
ns run ios
ns run android


保存文件 → 毫秒级 HMR，console.log 直接输出到终端。

4. 目录速览
myApp/
├─ app/
│  ├─ components/          // 单文件 .vue
│  ├─ app.ts               // createApp()
│  └─ stores/              // Pinia 状态库
├─ App_Resources/
└─ vite.config.ts          // 已配置 nativescript-vue-vite-plugin

5. 打包上线
ns build android --release   # 生成 .aab / .apk
ns build ios --release       # 生成 .ipa


签名、渠道、自动版本号——标准原生流程，CI 友好。

Vue 3 生态插件兼容性一览
插件
	
是否可用
	
说明

Pinia	
✅
	
零改动，app.use(createPinia())

VueUse	
⚠️
	
仅无 DOM 的 Utilities 可用

vue-i18n
 9.x
	
✅
	
实测正常

Vue Router	
❌
	
官方推荐用 NativeScript 帧导航 → $navigateTo(Page)

Vuetify / Element Plus	
❌
	
依赖 CSS & DOM，无法渲染

检测小技巧：

npm i xxx
grep -r "document\|window\|HTMLElement" node_modules/xxx || echo "大概率安全"

调试神器：Vue DevTools 支持

NativeScript-Vue 3 已提供 官方 DevTools 插件

组件树、Props、Events、Pinia 状态 实时查看
沿用桌面端调试习惯，无需额外学习成本

👉 配置指南：https://nativescript-vue.org/docs/essentials/vue-devtools

插件生态 & 原生能力

700+NativeScript 官方插件
ns plugin add @nativescript/camera | bluetooth | sqlite...

iOS/Android SDK 直接引入
CocoaPods / Maven 一行配置即可：

 // 调用原生 CoreBluetooth
 import { CBCentralManager } from '@nativescript/core'

自定义 View & 动画
注册即可在 <template> 使用，与 React Native 造组件体验一致。
结语：这一次，Vue 开发者不再低人一等

React Native 有 Facebook 撑腰，Flutter 有 Google 背书，

现在 Vue 3 也有了自己的 真·原生跨平台答案 —— NativeScript-Vue。

它让 Vue 语法第一次 完整、无损、高性能 地跑在 iOS & Android 上，
并获得 尤雨溪 公开点赞与 Vite 官方生态加持。

弃用 uni-app，拥抱 NativeScript-Vue，
让 性能、原生能力、工程化 三者兼得，
用你最爱的 .vue 文件，写最硬核的移动应用！

🔖 一键直达资源
官网 & 文档：https://nativescript-vue.org
插件兼容列表：https://nativescript-vue.org/docs/essentials/vue-plugins
DevTools 配置：https://nativescript-vue.org/docs/essentials/vue-devtools
环境安装指南：https://docs.nativescript.org/setup/

---
*导入时间: 2026-01-17 21:04:14*
