---
title: "AI编程进阶篇：AI 驱动开发的“敏捷突破” 之 BMAD 开发指南"
source: wechat
url: https://mp.weixin.qq.com/s/nirzs1XBQyMyQczcQGjXHA
author: 前端AI行走
pub_date: 2025年12月18日 21:03
created: 2026-01-17 20:27
tags: [AI, 编程, 产品]
---

# AI编程进阶篇：AI 驱动开发的“敏捷突破” 之 BMAD 开发指南

> 作者: 前端AI行走 | 发布日期: 2025年12月18日 21:03
> 原文链接: [点击查看](https://mp.weixin.qq.com/s/nirzs1XBQyMyQczcQGjXHA)

---

前言：



大家好，之前的文章中，我给大家介绍了 

AI编程进阶篇：OpenSpec 保姆级开发指南

前端AI行走，公众号：前端AI行走
AI编程进阶篇：OpenSpec 保姆级开发指南

如果说 OpenSpec 是给 AI 的“施工图纸”，那么 BMAD 就是指挥整个 AI 施工队的“包工头手册”。

BMAD 全称 Breakthrough Method for Agile AI-Driven Development（敏捷 AI 驱动开发突破法）。它不是一个简单的工具，而是一套方法论，教你如何像管理一个人类团队一样，管理你的 AI Agent 团队。

请看下面的这篇基础使用教程，我们将带你深入了解BMAD，并教你如何在 Cursor 和 Antigravity 中落地这套方法。



1. 什么是 BMAD（多智能体开发框架）？


‌BMAD是一种创新的软件开发方法，通过多智能体协同和模板化任务，覆盖从需求到交付的全生命周期，旨在提升开发效率和质量。其核心框架BMAD-METHOD内置了多个专业化AI代理（如产品经理、架构师等），支持敏捷开发。

以前我们用AI写代码，通常是“单打独斗”：你发指令，AI写代码。BMAD 认为，复杂的软件不能靠一个 AI 搞定，而需要一个分工明确的 AI 团队。

BMAD 的核心思想：

把开发过程拆解，交给不同的“虚拟角色”：

产品经理 (PM)：
负责想清楚要做什么（写 PRD）。
架构师 (Architect)：
负责设计怎么做（写技术方案）。
开发 (Developer)：
负责写代码。
测试 (QA)：
负责找 Bug。



为什么需要 BMAD？

拒绝“Vibe Coding”：
不要凭感觉乱提示，要有章法。
上下文不丢失：
PM 产出的文档就是 Developer 的上下文，环环相扣。
质量可控：
架构师设计完了再写代码，比边写边想靠谱得多。


2. 核心流程 (The Workflow) 



BMAD 将开发分为两个主要阶段：

第一阶段：Agentic Planning (Agent 规划)

在这个阶段，不写一行代码。

PM Agent：
根据你的模糊想法，生成详细的 PRD (产品需求文档)。
Architect Agent：
根据 PRD，生成 Tech Spec (技术规格书) 和 Implementation Plan (实施计划)。


第二阶段：Core Development (核心开发)

在这个阶段，AI 才开始干活。

Developer Agent：
拿着 Tech Spec 和 Implementation Plan，开始写代码。
QA Agent：
代码写完后，根据 PRD 进行验收。




3. 实战演练：在 Cursor 中应用 BMAD



虽然 Cursor 主要是单人辅助工具，但我们可以通过扮演法来模拟 BMAD 流程。

场景：开发一个“番茄钟”应用


第一步：扮演 PM (规划)

打开 Cursor Chat，输入：

你现在是我的产品经理。我想做一个简单的番茄钟网页版。   请帮我输出一份 PRD，包含功能列表、用户流程。不要写代码。

# 产品需求文档（PRD）
## 番茄钟网页版
**版本**: v1.0  
**创建日期**: 2024年12月  
**产品经理**: [产品经理]  
**目标用户**: 需要专注工作和学习的个人用户
---
## 1. 产品概述
### 1.1 产品定位
番茄钟网页版是一个基于番茄工作法（Pomodoro Technique）的时间管理工具，帮助用户通过专注工作25分钟、休息5分钟的循环，提高工作效率和专注力。
### 1.2 核心价值
- **提升专注力**：通过定时器强制用户在一段时间内专注单一任务
- **科学休息**：定时提醒用户休息，避免过度疲劳
- **数据可视化**：记录完成情况，帮助用户了解自己的工作效率
### 1.3 目标用户
- **主要用户**：需要长时间专注工作的知识工作者（程序员、设计师、学生等）
- **使用场景**：办公室、图书馆、家中等需要专注的环境
- **设备要求**：支持现代浏览器的桌面端和移动端
---
## 2. 功能列表
### 2.1 核心功能
#### 2.1.1 番茄钟计时器
**优先级**: P0（必须）
**功能描述**：
- 默认25分钟工作倒计时
- 5分钟短休息倒计时
- 15分钟长休息倒计时（每4个番茄后）
- 倒计时显示（分钟:秒格式）
- 开始/暂停/重置功能
- 计时结束时自动播放提示音
**详细需求**：
- 倒计时精度：秒级
- 支持键盘快捷键操作（空格键暂停/继续）
- 计时过程中显示进度条或圆形进度指示
- 支持自定义时长（工作/短休息/长休息）
#### 2.1.2 任务管理
**优先级**: P0（必须）
**功能描述**：
- 添加任务名称
- 标记任务完成
- 查看当前任务
- 任务列表展示
**详细需求**：
- 任务名称最多50个字符
- 支持删除任务
- 任务与番茄钟关联（一个番茄对应一个任务）
- 显示任务完成的番茄数
#### 2.1.3 番茄统计
**优先级**: P1（重要）
**功能描述**：
- 今日完成番茄数统计
- 本周完成番茄数统计
- 历史完成记录查看
- 简单的数据可视化（柱状图或折线图）
**详细需求**：
- 数据本地存储（LocalStorage）
- 按日期分组统计
- 显示最佳专注时段
- 显示平均每日完成数
### 2.2 增强功能
#### 2.2.1 设置功能
**优先级**: P1（重要）
**功能描述**：
- 自定义工作时长（默认25分钟）
- 自定义短休息时长（默认5分钟）
- 自定义长休息时长（默认15分钟）
- 自定义长休息间隔（默认每4个番茄）
- 提示音开关
- 浏览器通知开关
**详细需求**：
- 时长范围：工作5-60分钟，休息1-30分钟
- 设置保存到本地
- 支持恢复默认设置
#### 2.2.2 白噪音/背景音
**优先级**: P2（可选）
**功能描述**：
- 提供多种背景音选择（雨声、咖啡厅、森林等）
- 播放/暂停控制
- 音量调节
#### 2.2.3 主题切换
**优先级**: P2（可选）
**功能描述**：
- 浅色/深色主题切换
- 多种配色方案选择
### 2.3 未来规划功能
- 多设备同步（需要账号系统）
- 团队协作功能
- 番茄钟历史导出
- 成就系统
- 专注力分析报告
---
## 3. 用户流程
### 3.1 首次使用流程
```
用户打开网页
    ↓
看到欢迎界面/引导（可选）
    ↓
进入主界面
    ↓
【主界面显示】
- 25:00 倒计时显示
- "开始"按钮
- 任务输入框
- 空的任务列表
    ↓
用户输入任务名称（可选）
    ↓
点击"开始"按钮
    ↓
开始第一个番茄钟
```
### 3.2 标准使用流程
#### 流程1：完成一个番茄钟
```
用户在主界面
    ↓
输入任务名称（可选）
    ↓
点击"开始"按钮
    ↓
【工作阶段】
- 倒计时从25:00开始
- 显示当前任务名称
- "暂停"按钮可用
- 进度条/圆形进度显示
    ↓
25分钟倒计时结束
    ↓
【自动提示】
- 播放提示音
- 显示浏览器通知（如开启）
- 弹出休息提示
    ↓
用户点击"开始休息"
    ↓
【短休息阶段】
- 倒计时从5:00开始
- 显示"休息中"状态
    ↓
5分钟倒计时结束
    ↓
【自动提示】
- 播放提示音
- 显示浏览器通知
- 弹出"准备开始下一个番茄"提示
    ↓
用户点击"开始工作"
    ↓
回到工作阶段（循环）
```
#### 流程2：长休息流程
```
完成第4个番茄钟
    ↓
【自动提示】
- 显示"恭喜完成4个番茄！开始长休息"
    ↓
用户点击"开始长休息"
    ↓
【长休息阶段】
- 倒计时从15:00开始
- 显示"长休息中"状态
    ↓
15分钟倒计时结束
    ↓
【自动提示】
- 播放提示音
- 显示浏览器通知
- 弹出"准备开始新的番茄周期"提示
    ↓
用户点击"开始工作"
    ↓
开始新的番茄周期（计数重置）
```
#### 流程3：暂停和继续
```
工作/休息进行中
    ↓
用户点击"暂停"按钮
    ↓
【暂停状态】
- 倒计时停止
- 按钮变为"继续"
- 显示暂停图标/提示
    ↓
用户点击"继续"按钮
    ↓
【恢复状态】
- 从暂停的时间点继续倒计时
- 按钮变为"暂停"
```
#### 流程4：重置计时器
```
工作/休息进行中或暂停中
    ↓
用户点击"重置"按钮
    ↓
【确认提示】
- 弹出确认对话框："确定要重置吗？当前进度将丢失"
    ↓
用户确认
    ↓
【重置完成】
- 倒计时恢复到初始值（25:00或5:00等）
- 清除当前任务关联
- 统计不记录本次番茄
```
#### 流程5：任务管理
```
用户在主界面
    ↓
在任务输入框输入任务名称
    ↓
按回车或点击"添加"按钮
    ↓
【任务添加成功】
- 任务显示在任务列表中
- 任务标记为"待完成"
- 输入框清空
    ↓
开始番茄钟并完成
    ↓
【任务完成】
- 任务标记为"已完成"
- 显示完成时间
- 番茄数+1
    ↓
用户点击任务删除按钮
    ↓
【任务删除】
- 从列表中移除
- 不影响已完成统计
```
#### 流程6：查看统计
```
用户在主界面
    ↓
点击"统计"按钮/标签
    ↓
【统计页面】
- 显示今日完成番茄数
- 显示本周完成番茄数
- 显示历史记录（最近7天/30天）
- 显示简单的图表
    ↓
用户点击"返回"按钮
    ↓
回到主界面
```
### 3.3 异常流程
#### 异常1：页面刷新/关闭
```
用户正在使用番茄钟
    ↓
用户刷新页面或关闭标签页
    ↓
【数据保存】
- 当前倒计时时间保存到LocalStorage
- 当前任务保存
- 已完成番茄数保存
    ↓
用户重新打开页面
    ↓
【数据恢复】
- 检测是否有未完成的番茄钟
- 提示用户："检测到未完成的番茄钟，是否继续？"
    ↓
用户选择"继续"或"放弃"
```
#### 异常2：浏览器通知权限
```
用户首次使用
    ↓
系统尝试显示浏览器通知
    ↓
浏览器请求通知权限
    ↓
用户允许
    ↓
【功能正常】
- 计时结束时显示通知
    ↓
用户拒绝
    ↓
【功能降级】
- 仅使用提示音
- 在设置中提示用户开启通知权限
```
#### 异常3：标签页切换（后台运行）
```
用户开始番茄钟
    ↓
用户切换到其他标签页
    ↓
【后台运行】
- 倒计时在后台继续
- 使用Web Worker或setInterval保持计时
    ↓
计时结束时
    ↓
【尝试通知】
- 如果允许通知，显示浏览器通知
- 如果标签页可见，显示页面内提示
```
---
## 4. 界面设计要求
### 4.1 主界面布局
**核心元素**：
- **顶部**：今日完成番茄数（大号数字显示）
- **中央**：倒计时显示（超大号数字，分钟:秒格式）
- **进度指示**：圆形进度条或线性进度条
- **控制按钮**：开始/暂停、重置（工作状态时显示）
- **任务输入区**：输入框 + 添加按钮
- **任务列表**：当前任务和已完成任务
- **底部导航**：主页、统计、设置
### 4.2 视觉设计原则
- **简洁明了**：减少干扰元素，突出倒计时
- **视觉反馈**：清晰的按钮状态、进度指示
- **色彩区分**：工作状态（如蓝色）、休息状态（如绿色）
- **响应式设计**：适配桌面端和移动端
### 4.3 交互设计原则
- **一键操作**：核心功能（开始/暂停）易于点击
- **键盘支持**：空格键暂停/继续，回车添加任务
- **即时反馈**：按钮点击、状态变化有明确反馈
- **容错设计**：重要操作（如重置）需要确认
---
## 5. 技术约束
### 5.1 浏览器兼容性
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
### 5.2 性能要求
- 倒计时精度：误差不超过1秒
- 页面加载时间：< 2秒
- 内存占用：< 50MB
### 5.3 数据存储
- 使用 LocalStorage 存储用户数据
- 数据包括：设置、任务列表、完成记录
- 数据格式：JSON
---
## 6. 验收标准
### 6.1 功能验收
- [ ] 倒计时功能正常，精度准确
- [ ] 开始/暂停/重置功能正常
- [ ] 任务添加、完成、删除功能正常
- [ ] 统计功能正常，数据准确
- [ ] 设置功能正常，数据持久化
- [ ] 提示音和通知功能正常
### 6.2 用户体验验收
- [ ] 界面简洁，操作直观
- [ ] 响应式设计，移动端体验良好
- [ ] 交互流畅，无明显卡顿
- [ ] 错误提示清晰，异常处理完善
### 6.3 兼容性验收
- [ ] 主流浏览器正常运行
- [ ] 不同屏幕尺寸正常显示
- [ ] 数据持久化正常
---
## 7. 开发优先级
### Phase 1（MVP - 最小可行产品）
1. 番茄钟计时器（25分钟工作，5分钟休息）
2. 开始/暂停/重置功能
3. 任务添加和显示
4. 提示音功能
5. 基础统计（今日完成数）
### Phase 2（增强功能）
1. 长休息功能
2. 设置功能（自定义时长）
3. 浏览器通知
4. 历史统计和图表
### Phase 3（优化和扩展）
1. 主题切换
2. 白噪音功能
3. 数据导出
4. 性能优化
---
## 8. 风险评估
### 8.1 技术风险
- **风险**：浏览器标签页后台运行可能被限制
- **应对**：使用 Web Worker 或 Service Worker 保持计时
### 8.2 用户体验风险
- **风险**：用户可能忘记正在运行的番茄钟
- **应对**：提供浏览器通知，页面标题显示倒计时
### 8.3 数据风险
- **风险**：LocalStorage 可能被清除
- **应对**：提示用户数据重要性，未来考虑云端同步
---
## 9. 后续迭代方向
1. **账号系统**：多设备同步、云端存储
2. **社交功能**：好友排行榜、分享成就
3. **数据分析**：专注力报告、效率分析
4. **个性化**：更多主题、自定义音效
5. **移动端APP**：原生应用体验
---
**文档结束**

Cursor 会生成一份文档，你可以保存为 docs/PRD.md。

第二步：扮演架构师 (设计)

新建一个 Chat (Cmd+L)，输入：

你现在是技术架构师。   请阅读 @docs/PRD.md。   请帮我设计技术方案：使用 Vue 3 + Tailwind。   输出一份 docs/TechSpec.md，包含组件结构、状态管理设计。

# 技术方案文档（TechSpec）
## 番茄钟网页版
**版本**: v1.0  
**创建日期**: 2024年12月  
**技术架构师**: [技术架构师]  
**技术栈**: Vue 3 + Tailwind CSS + Pinia + Vite
---
## 1. 技术栈选型
### 1.1 核心技术
| 技术 | 版本 | 用途 | 说明 |
|------|------|------|------|
| Vue 3 | 3.3.4+ | 前端框架 | 使用 Composition API，支持 `<script setup>` 语法 |
| Tailwind CSS | 3.4+ | 样式框架 | 原子化 CSS，快速构建响应式界面 |
| Pinia | 2.3.1+ | 状态管理 | Vue 3 官方推荐的状态管理库 |
| Vite | 4.4.9+ | 构建工具 | 快速开发服务器和构建工具 |
| Vue Router | 4.2.4+ | 路由管理 | 单页面应用路由管理 |
| @vueuse/core | 13.9.0+ | 工具库 | Vue Composition API 工具集 |
### 1.2 辅助工具
| 工具 | 用途 |
|------|------|
| dayjs | 日期时间处理 |
| echarts | 数据可视化（统计图表） |
| Web Audio API | 提示音播放 |
| Notification API | 浏览器通知 |
| LocalStorage | 数据持久化 |
### 1.3 开发工具
- **ESLint**: 代码质量检查
- **PostCSS**: CSS 处理
- **Autoprefixer**: CSS 兼容性处理
---
## 2. 项目结构
```
pomodoro-timer/
├── public/                      # 静态资源
│   ├── sounds/                  # 提示音文件
│   │   ├── work-end.mp3
│   │   ├── break-end.mp3
│   │   └── notification.mp3
│   └── favicon.ico
├── src/
│   ├── assets/                  # 资源文件
│   │   ├── images/
│   │   └── icons/
│   ├── components/              # 公共组件
│   │   ├── Timer/
│   │   │   ├── TimerDisplay.vue        # 倒计时显示组件
│   │   │   ├── CircularProgress.vue    # 圆形进度条
│   │   │   └── TimerControls.vue       # 控制按钮组
│   │   ├── Task/
│   │   │   ├── TaskInput.vue           # 任务输入框
│   │   │   ├── TaskList.vue            # 任务列表
│   │   │   └── TaskItem.vue            # 任务项
│   │   ├── Statistics/
│   │   │   ├── StatsCard.vue           # 统计卡片
│   │   │   ├── StatsChart.vue          # 统计图表
│   │   │   └── DailyStats.vue          # 每日统计
│   │   ├── Settings/
│   │   │   ├── SettingsPanel.vue       # 设置面板
│   │   │   └── TimeInput.vue           # 时长输入组件
│   │   └── common/
│   │       ├── Modal.vue               # 模态框
│   │       ├── ConfirmDialog.vue       # 确认对话框
│   │       └── Notification.vue        # 通知组件
│   ├── stores/                  # Pinia 状态管理
│   │   ├── timer.js             # 计时器状态
│   │   ├── task.js               # 任务管理状态
│   │   ├── statistics.js         # 统计数据状态
│   │   ├── settings.js           # 设置状态
│   │   └── index.js              # Store 入口
│   ├── composables/             # 组合式函数
│   │   ├── useTimer.js           # 计时器逻辑
│   │   ├── useNotification.js    # 通知功能
│   │   ├── useSound.js           # 提示音功能
│   │   ├── useLocalStorage.js    # 本地存储
│   │   └── useKeyboard.js        # 键盘快捷键
│   ├── utils/                    # 工具函数
│   │   ├── time.js               # 时间格式化
│   │   ├── storage.js            # 存储工具
│   │   ├── notification.js       # 通知工具
│   │   └── constants.js           # 常量定义
│   ├── views/                    # 页面组件
│   │   ├── Home.vue              # 主页（计时器）
│   │   ├── Statistics.vue        # 统计页面
│   │   └── Settings.vue          # 设置页面
│   ├── router/                   # 路由配置
│   │   └── index.js
│   ├── App.vue                   # 根组件
│   ├── main.js                   # 入口文件
│   └── style.css                 # 全局样式
├── tailwind.config.js            # Tailwind 配置
├── postcss.config.js             # PostCSS 配置
├── vite.config.js                # Vite 配置
├── package.json
└── README.md
```
---
## 3. 组件结构设计
### 3.1 页面组件（Views）
#### 3.1.1 Home.vue - 主页面
**职责**: 番茄钟主界面，整合所有核心功能
**子组件**:
- `TimerDisplay` - 倒计时显示
- `CircularProgress` - 圆形进度条
- `TimerControls` - 控制按钮（开始/暂停/重置）
- `TaskInput` - 任务输入
- `TaskList` - 任务列表
- `StatsCard` - 今日完成数卡片
**布局结构**:
```vue
<template>
  <div class="home-container">
    <!-- 顶部统计 -->
    <StatsCard />


    <!-- 中央计时器区域 -->
    <div class="timer-section">
      <CircularProgress />
      <TimerDisplay />
      <TimerControls />
    </div>


    <!-- 任务区域 -->
    <div class="task-section">
      <TaskInput />
      <TaskList />
    </div>
  </div>
</template>
```
#### 3.1.2 Statistics.vue - 统计页面
**职责**: 展示番茄钟完成统计和历史数据
**子组件**:
- `DailyStats` - 每日统计
- `StatsChart` - 图表展示（柱状图/折线图）
- `StatsCard` - 统计卡片（今日/本周/平均）
#### 3.1.3 Settings.vue - 设置页面
**职责**: 用户设置管理
**子组件**:
- `SettingsPanel` - 设置面板
- `TimeInput` - 时长输入组件
### 3.2 功能组件（Components）
#### 3.2.1 Timer 组件组
**TimerDisplay.vue**
- **Props**: `time` (剩余秒数), `mode` (工作/休息)
- **功能**: 显示格式化的倒计时（MM:SS）
- **样式**: 超大号数字，根据模式切换颜色
**CircularProgress.vue**
- **Props**: `progress` (0-100), `mode` (工作/休息)
- **功能**: 圆形进度条，显示倒计时进度
- **样式**: SVG 圆形进度，支持动画
**TimerControls.vue**
- **Props**: `isRunning`, `isPaused`, `canReset`
- **Events**: `start`, `pause`, `resume`, `reset`
- **功能**: 开始/暂停/重置按钮组
- **样式**: 大号按钮，响应式布局
#### 3.2.2 Task 组件组
**TaskInput.vue**
- **功能**: 任务输入框，支持回车添加
- **样式**: Tailwind 输入框样式
- **验证**: 最大50字符限制
**TaskList.vue**
- **Props**: `tasks` (任务列表)
- **功能**: 任务列表容器，区分待完成/已完成
- **样式**: 卡片列表，响应式网格
**TaskItem.vue**
- **Props**: `task` (任务对象)
- **Events**: `complete`, `delete`
- **功能**: 单个任务项，显示任务信息和操作按钮
- **样式**: 卡片样式，悬停效果
#### 3.2.3 Statistics 组件组
**StatsCard.vue**
- **Props**: `title`, `value`, `subtitle`
- **功能**: 统计卡片，显示数字和描述
- **样式**: 卡片样式，大号数字
**StatsChart.vue**
- **Props**: `data` (统计数据), `type` (chart类型)
- **功能**: 使用 ECharts 渲染图表
- **样式**: 响应式图表容器
**DailyStats.vue**
- **Props**: `dateRange` (日期范围)
- **功能**: 按日期展示统计数据
- **样式**: 表格或列表展示
#### 3.2.4 Settings 组件组
**SettingsPanel.vue**
- **功能**: 设置项列表，分组展示
- **样式**: 表单样式，分组布局
**TimeInput.vue**
- **Props**: `label`, `value`, `min`, `max`
- **Events**: `update:value`
- **功能**: 时长输入组件（分钟）
- **样式**: 数字输入框，带标签和范围提示
#### 3.2.5 Common 组件组
**Modal.vue**
- **Props**: `visible`, `title`
- **Slots**: `default`, `footer`
- **功能**: 通用模态框
- **样式**: 居中遮罩，动画效果
**ConfirmDialog.vue**
- **Props**: `visible`, `title`, `message`
- **Events**: `confirm`, `cancel`
- **功能**: 确认对话框
- **样式**: 对话框样式
**Notification.vue**
- **Props**: `type`, `message`, `duration`
- **功能**: 页面内通知提示
- **样式**: Toast 样式，自动消失
### 3.3 组件通信设计
#### 3.3.1 Props 向下传递
- 父组件通过 Props 向子组件传递数据
- 使用 `defineProps` 定义 Props 类型
#### 3.3.2 Events 向上传递
- 子组件通过 `emit` 向父组件发送事件
- 使用 `defineEmits` 定义事件类型
#### 3.3.3 Store 跨组件通信
- 使用 Pinia Store 管理全局状态
- 组件通过 `useStore()` 访问和修改状态
#### 3.3.4 Provide/Inject
- 用于深层组件通信（如主题、配置等）
- 在根组件 Provide，在子组件 Inject
---
## 4. 状态管理设计（Pinia）
### 4.1 Store 模块划分
#### 4.1.1 timer.js - 计时器状态
**State 定义**:
```javascript
{
  // 计时器状态
  status: 'idle' | 'running' | 'paused' | 'finished',


  // 当前模式
  mode: 'work' | 'shortBreak' | 'longBreak',


  // 倒计时（秒）
  remainingSeconds: number,


  // 初始时长（秒）
  initialSeconds: number,


  // 当前番茄计数
  currentPomodoroCount: number,


  // 暂停时间戳（用于恢复）
  pausedAt: number | null,


  // 开始时间戳
  startedAt: number | null,


  // 是否已完成（用于统计）
  isCompleted: boolean
}
```
**Getters**:
```javascript
{
  // 格式化的倒计时显示（MM:SS）
  formattedTime: (state) => string,


  // 进度百分比（0-100）
  progress: (state) => number,


  // 是否正在运行
  isRunning: (state) => boolean,


  // 是否已暂停
  isPaused: (state) => boolean,


  // 是否可以重置
  canReset: (state) => boolean,


  // 当前模式显示文本
  modeText: (state) => string
}
```
**Actions**:
```javascript
{
  // 开始计时
  start(): void,


  // 暂停计时
  pause(): void,


  // 继续计时
  resume(): void,


  // 重置计时器
  reset(): void,


  // 切换模式（工作/短休息/长休息）
  switchMode(mode: 'work' | 'shortBreak' | 'longBreak'): void,


  // 更新倒计时（每秒调用）
  tick(): void,


  // 完成当前番茄
  complete(): void,


  // 从 LocalStorage 恢复状态
  restoreFromStorage(): void,


  // 保存状态到 LocalStorage
  saveToStorage(): void
}
```
#### 4.1.2 task.js - 任务管理状态
**State 定义**:
```javascript
{
  // 任务列表
  tasks: Array<{
    id: string,
    name: string,
    status: 'pending' | 'completed',
    pomodoroCount: number,
    createdAt: number,
    completedAt: number | null,
    currentPomodoroId: string | null
  }>,


  // 当前选中的任务ID
  currentTaskId: string | null,


  // 任务ID生成器
  nextTaskId: number
}
```
**Getters**:
```javascript
{
  // 待完成任务列表
  pendingTasks: (state) => Task[],


  // 已完成任务列表
  completedTasks: (state) => Task[],


  // 当前任务
  currentTask: (state) => Task | null,


  // 任务总数
  totalTasks: (state) => number,


  // 已完成任务数
  completedTasksCount: (state) => number
}
```
**Actions**:
```javascript
{
  // 添加任务
  addTask(name: string): string,  // 返回任务ID


  // 删除任务
  deleteTask(taskId: string): void,


  // 完成任务
  completeTask(taskId: string): void,


  // 设置当前任务
  setCurrentTask(taskId: string | null): void,


  // 增加任务的番茄数
  incrementTaskPomodoro(taskId: string): void,


  // 从 LocalStorage 恢复
  restoreFromStorage(): void,


  // 保存到 LocalStorage
  saveToStorage(): void
}
```
#### 4.1.3 statistics.js - 统计数据状态
**State 定义**:
```javascript
{
  // 每日完成记录
  dailyRecords: Array<{
    date: string,  // YYYY-MM-DD
    count: number,
    tasks: string[],  // 完成的任务ID列表
    startTime: number,
    endTime: number
  }>,


  // 番茄完成记录
  pomodoroRecords: Array<{
    id: string,
    date: string,
    mode: 'work' | 'shortBreak' | 'longBreak',
    duration: number,
    taskId: string | null,
    completedAt: number
  }>
}
```
**Getters**:
```javascript
{
  // 今日完成数
  todayCount: (state) => number,


  // 本周完成数
  weekCount: (state) => number,


  // 本月完成数
  monthCount: (state) => number,


  // 最近7天数据（用于图表）
  last7DaysData: (state) => Array<{date: string, count: number}>,


  // 最近30天数据
  last30DaysData: (state) => Array<{date: string, count: number}>,


  // 平均每日完成数
  averageDailyCount: (state) => number,


  // 最佳专注时段
  bestFocusTime: (state) => string | null,


  // 总完成数
  totalCount: (state) => number
}
```
**Actions**:
```javascript
{
  // 记录完成的番茄
  recordPomodoro(pomodoroData: {
    mode: string,
    duration: number,
    taskId: string | null
  }): void,


  // 获取指定日期的完成数
  getCountByDate(date: string): number,


  // 获取日期范围的数据
  getDataByDateRange(startDate: string, endDate: string): Array,


  // 清除所有统计数据
  clearAll(): void,


  // 从 LocalStorage 恢复
  restoreFromStorage(): void,


  // 保存到 LocalStorage
  saveToStorage(): void
}
```
#### 4.1.4 settings.js - 设置状态
**State 定义**:
```javascript
{
  // 工作时长（分钟）
  workDuration: number,  // 默认 25


  // 短休息时长（分钟）
  shortBreakDuration: number,  // 默认 5


  // 长休息时长（分钟）
  longBreakDuration: number,  // 默认 15


  // 长休息间隔（每N个番茄）
  longBreakInterval: number,  // 默认 4


  // 提示音开关
  soundEnabled: boolean,  // 默认 true


  // 浏览器通知开关
  notificationEnabled: boolean,  // 默认 true


  // 主题模式
  theme: 'light' | 'dark',  // 默认 'light'


  // 通知权限状态
  notificationPermission: 'default' | 'granted' | 'denied'
}
```
**Getters**:
```javascript
{
  // 工作时长（秒）
  workDurationSeconds: (state) => number,


  // 短休息时长（秒）
  shortBreakDurationSeconds: (state) => number,


  // 长休息时长（秒）
  longBreakDurationSeconds: (state) => number,


  // 是否可以使用通知
  canUseNotification: (state) => boolean
}
```
**Actions**:
```javascript
{
  // 更新设置
  updateSettings(settings: Partial<Settings>): void,


  // 恢复默认设置
  resetToDefaults(): void,


  // 请求通知权限
  requestNotificationPermission(): Promise<boolean>,


  // 从 LocalStorage 恢复
  restoreFromStorage(): void,


  // 保存到 LocalStorage
  saveToStorage(): void
}
```
### 4.2 Store 交互流程
#### 4.2.1 开始番茄钟流程
```
用户点击"开始"按钮
    ↓
TimerStore.start()
    ↓
检查是否有当前任务（TaskStore.currentTaskId）
    ↓
设置状态为 'running'
    ↓
记录开始时间戳
    ↓
启动定时器（setInterval）
    ↓
每秒调用 TimerStore.tick()
    ↓
更新 remainingSeconds
    ↓
检查是否倒计时结束
    ↓
如果结束 → TimerStore.complete()
    ↓
播放提示音（useSound）
    ↓
显示通知（useNotification）
    ↓
根据模式决定下一步（工作→休息，休息→工作）
```
#### 4.2.2 完成任务流程
```
番茄钟倒计时结束
    ↓
TimerStore.complete()
    ↓
检查是否完成工作模式
    ↓
如果是工作模式：
    ↓
StatisticsStore.recordPomodoro()
    ↓
如果有当前任务：
    ↓
TaskStore.incrementTaskPomodoro()
    ↓
TaskStore.completeTask()（如果任务完成）
    ↓
更新每日统计
    ↓
保存到 LocalStorage
```
#### 4.2.3 数据持久化流程
```
应用启动
    ↓
各 Store 的 restoreFromStorage()
    ↓
从 LocalStorage 读取数据
    ↓
恢复 State
    ↓
检查是否有未完成的番茄钟
    ↓
如果有，提示用户是否继续
    ↓
用户操作时
    ↓
自动调用 saveToStorage()
    ↓
保存到 LocalStorage
```
### 4.3 Store 依赖关系
```
SettingsStore (独立)
    ↓
    ├─→ TimerStore (使用设置中的时长)
    │
    └─→ StatisticsStore (使用设置中的通知开关)
TimerStore
    ↓
    ├─→ TaskStore (关联当前任务)
    │
    └─→ StatisticsStore (记录完成)
TaskStore (独立，但被 TimerStore 使用)
StatisticsStore (独立，但接收 TimerStore 的数据)
```
---
## 5. Composables 设计
### 5.1 useTimer.js
**功能**: 封装计时器核心逻辑
**返回值**:
```javascript
{
  // 计时器状态（从 Store）
  status: ComputedRef,
  remainingSeconds: ComputedRef,
  mode: ComputedRef,


  // 控制方法
  start: () => void,
  pause: () => void,
  resume: () => void,
  reset: () => void,


  // 格式化时间
  formattedTime: ComputedRef,


  // 进度
  progress: ComputedRef
}
```
**实现要点**:
- 使用 `setInterval` 实现倒计时
- 处理页面可见性变化（Page Visibility API）
- 处理页面卸载前的数据保存
### 5.2 useNotification.js
**功能**: 封装浏览器通知功能
**返回值**:
```javascript
{
  // 权限状态
  permission: ComputedRef,


  // 请求权限
  requestPermission: () => Promise<boolean>,


  // 显示通知
  show: (title: string, options?: NotificationOptions) => void,


  // 检查是否可用
  isAvailable: ComputedRef
}
```
**实现要点**:
- 检查浏览器支持
- 处理权限请求
- 创建通知实例
- 自动关闭通知
### 5.3 useSound.js
**功能**: 封装提示音播放
**返回值**:
```javascript
{
  // 播放提示音
  play: (type: 'workEnd' | 'breakEnd' | 'notification') => void,


  // 停止播放
  stop: () => void,


  // 音量控制
  volume: Ref<number>,


  // 是否启用
  enabled: ComputedRef
}
```
**实现要点**:
- 使用 Web Audio API 或 HTML5 Audio
- 预加载音频文件
- 音量控制
- 根据设置决定是否播放
### 5.4 useLocalStorage.js
**功能**: 封装 LocalStorage 操作
**返回值**:
```javascript
{
  // 读取数据
  get: <T>(key: string, defaultValue?: T) => T,


  // 保存数据
  set: <T>(key: string, value: T) => void,


  // 删除数据
  remove: (key: string) => void,


  // 清空所有
  clear: () => void
}
```
**实现要点**:
- JSON 序列化/反序列化
- 错误处理（存储空间不足等）
- 类型安全
### 5.5 useKeyboard.js
**功能**: 封装键盘快捷键
**返回值**:
```javascript
{
  // 注册快捷键
  onKeyPress: (key: string, handler: () => void) => void,


  // 移除快捷键
  offKeyPress: (key: string) => void
}
```
**实现要点**:
- 使用 `@vueuse/core` 的 `useKeyboardShortcut`
- 处理组合键
- 避免与浏览器快捷键冲突
---
## 6. 数据持久化设计
### 6.1 LocalStorage Key 设计
```javascript
const STORAGE_KEYS = {
  TIMER_STATE: 'pomodoro_timer_state',
  TASKS: 'pomodoro_tasks',
  STATISTICS: 'pomodoro_statistics',
  SETTINGS: 'pomodoro_settings'
};
```
### 6.2 数据格式
**Timer State**:
```json
{
  "status": "paused",
  "mode": "work",
  "remainingSeconds": 1200,
  "initialSeconds": 1500,
  "currentPomodoroCount": 2,
  "pausedAt": 1234567890,
  "startedAt": 1234567890,
  "isCompleted": false
}
```
**Tasks**:
```json
[
  {
    "id": "task-1",
    "name": "完成项目文档",
    "status": "pending",
    "pomodoroCount": 1,
    "createdAt": 1234567890,
    "completedAt": null,
    "currentPomodoroId": null
  }
]
```
**Statistics**:
```json
{
  "dailyRecords": [
    {
      "date": "2024-12-10",
      "count": 4,
      "tasks": ["task-1", "task-2"],
      "startTime": 1234567890,
      "endTime": 1234567890
    }
  ],
  "pomodoroRecords": [
    {
      "id": "pomo-1",
      "date": "2024-12-10",
      "mode": "work",
      "duration": 1500,
      "taskId": "task-1",
      "completedAt": 1234567890
    }
  ]
}
```
**Settings**:
```json
{
  "workDuration": 25,
  "shortBreakDuration": 5,
  "longBreakDuration": 15,
  "longBreakInterval": 4,
  "soundEnabled": true,
  "notificationEnabled": true,
  "theme": "light",
  "notificationPermission": "granted"
}
```
### 6.3 数据同步策略
- **实时保存**: 状态变化时立即保存
- **批量保存**: 使用防抖（debounce）减少写入频率
- **错误处理**: 存储失败时提示用户
- **数据迁移**: 版本升级时处理数据格式变化
---
## 7. 路由设计
### 7.1 路由配置
```javascript
const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/Home.vue'),
    meta: {
      title: '番茄钟'
    }
  },
  {
    path: '/statistics',
    name: 'Statistics',
    component: () => import('@/views/Statistics.vue'),
    meta: {
      title: '统计'
    }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('@/views/Settings.vue'),
    meta: {
      title: '设置'
    }
  }
];
```
### 7.2 路由守卫
- **数据恢复**: 路由切换前检查并恢复未完成的番茄钟
- **页面标题**: 自动设置页面标题
- **滚动位置**: 记录和恢复滚动位置
---
## 8. 样式设计（Tailwind CSS）
### 8.1 Tailwind 配置
```javascript
// tailwind.config.js
module.exports = {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // 工作模式颜色
        work: {
          primary: '#3b82f6',    // 蓝色
          secondary: '#60a5fa',
          light: '#dbeafe'
        },
        // 休息模式颜色
        break: {
          primary: '#10b981',    // 绿色
          secondary: '#34d399',
          light: '#d1fae5'
        }
      },
      fontSize: {
        'timer': ['6rem', { lineHeight: '1' }],  // 倒计时超大字体
      }
    }
  },
  plugins: []
};
```
### 8.2 响应式设计
- **移动端优先**: 使用 Tailwind 的移动端优先策略
- **断点**: sm (640px), md (768px), lg (1024px), xl (1280px)
- **布局**: 使用 Flexbox 和 Grid 实现响应式布局
### 8.3 主题支持
- **浅色主题**: 默认主题
- **深色主题**: 使用 `dark:` 前缀
- **动态切换**: 通过 Store 管理主题状态
---
## 9. 性能优化
### 9.1 代码分割
- **路由懒加载**: 使用动态 import
- **组件懒加载**: 大型组件使用 `defineAsyncComponent`
- **第三方库**: 按需导入（如 ECharts）
### 9.2 状态优化
- **计算属性缓存**: 使用 `computed` 而非方法
- **响应式优化**: 避免不必要的响应式转换
- **批量更新**: 使用 `nextTick` 批量更新 DOM
### 9.3 渲染优化
- **虚拟滚动**: 任务列表过长时使用虚拟滚动
- **条件渲染**: 使用 `v-show` 而非 `v-if`（频繁切换）
- **列表 key**: 正确使用 `key` 属性
### 9.4 资源优化
- **图片优化**: 使用 WebP 格式，懒加载
- **音频预加载**: 提示音文件预加载
- **字体优化**: 使用系统字体或 Web 字体优化
---
## 10. 错误处理
### 10.1 错误类型
- **存储错误**: LocalStorage 空间不足或不可用
- **通知错误**: 浏览器不支持或权限被拒绝
- **音频错误**: 音频文件加载失败
- **网络错误**: 未来可能的数据同步失败
### 10.2 错误处理策略
- **优雅降级**: 功能不可用时提供替代方案
- **用户提示**: 清晰的错误提示信息
- **错误日志**: 开发环境记录详细错误信息
- **重试机制**: 可恢复的错误提供重试功能
---
## 11. 测试策略
### 11.1 单元测试
- **组件测试**: 使用 Vue Test Utils
- **Store 测试**: 测试 Actions 和 Getters
- **工具函数测试**: 测试工具函数的正确性
### 11.2 集成测试
- **用户流程测试**: 测试完整的用户操作流程
- **数据持久化测试**: 测试 LocalStorage 读写
- **跨浏览器测试**: 测试不同浏览器的兼容性
### 11.3 E2E 测试（可选）
- **关键流程**: 使用 Playwright 或 Cypress
- **自动化测试**: CI/CD 集成
---
## 12. 开发规范
### 12.1 代码规范
- **ESLint**: 使用项目配置的 ESLint 规则
- **Prettier**: 代码格式化（如配置）
- **命名规范**: 
  - 组件: PascalCase
  - 文件: kebab-case
  - 变量/函数: camelCase
  - 常量: UPPER_SNAKE_CASE
### 12.2 组件规范
- **单文件组件**: 使用 `<script setup>` 语法
- **Props 定义**: 使用 TypeScript 类型或 PropType
- **事件命名**: 使用 kebab-case
- **样式作用域**: 使用 `scoped` 或 CSS Modules
### 12.3 Git 规范
- **分支命名**: feature/xxx, bugfix/xxx, hotfix/xxx
- **提交信息**: 使用 Conventional Commits
- **代码审查**: PR 必须经过审查
---
## 13. 部署方案
### 13.1 构建配置
- **生产构建**: `vite build`
- **环境变量**: 使用 `.env` 文件
- **资源优化**: 自动压缩和优化
### 13.2 部署目标
- **静态托管**: Netlify, Vercel, GitHub Pages
- **CDN**: 使用 CDN 加速资源加载
- **PWA**: 未来可考虑 PWA 支持
---
## 14. 技术风险与应对
### 14.1 浏览器兼容性
- **风险**: 某些 API 不支持（Notification, LocalStorage）
- **应对**: 功能检测，提供降级方案
### 14.2 性能问题
- **风险**: 长时间运行导致内存泄漏
- **应对**: 定期清理定时器，使用 WeakMap
### 14.3 数据丢失
- **风险**: LocalStorage 被清除
- **应对**: 提示用户，未来考虑云端备份
---
## 15. 开发计划
### Phase 1: 核心功能（MVP）
1. **项目初始化**
   - 搭建 Vite + Vue 3 项目
   - 配置 Tailwind CSS
   - 配置 Pinia
   - 配置路由
2. **计时器功能**
   - 实现 TimerStore
   - 实现 useTimer composable
   - 实现 TimerDisplay 组件
   - 实现 CircularProgress 组件
   - 实现 TimerControls 组件
3. **任务管理**
   - 实现 TaskStore
   - 实现 TaskInput 组件
   - 实现 TaskList 组件
   - 实现 TaskItem 组件
4. **基础统计**
   - 实现 StatisticsStore
   - 实现 StatsCard 组件
   - 实现今日完成数统计
5. **数据持久化**
   - 实现 useLocalStorage
   - 实现各 Store 的持久化
### Phase 2: 增强功能
1. **设置功能**
   - 实现 SettingsStore
   - 实现 Settings 页面
   - 实现自定义时长
2. **通知功能**
   - 实现 useNotification
   - 集成浏览器通知
   - 实现 useSound
3. **长休息功能**
   - 扩展 TimerStore
   - 实现长休息逻辑
4. **统计增强**
   - 实现图表展示
   - 实现历史记录
### Phase 3: 优化和扩展
1. **主题切换**
   - 实现深色模式
   - 实现主题切换
2. **性能优化**
   - 代码分割
   - 懒加载
   - 渲染优化
3. **用户体验优化**
   - 动画效果
   - 交互优化
   - 错误处理
---
**文档结束**

Cursor 会生成技术文档。

第三步：扮演开发者 (执行)

再新建一个 Chat，输入：

你现在是高级前端开发。   请严格按照 @docs/TechSpec.md 的设计，开始编写代码。   先创建项目结构...

Cursor 会根据要求，一步步地生成你所需要的代码。

因为我只做演示用就不做代码的编写了。

核心技巧：在 Cursor 中，利用 @ 引用上一步的产物，就是 BMAD 的精髓——上下文传递。

我随意的写了一个功能需求，因为描述的非常的简单，发现AI还是根据经验给了我一大串的东西。

所以前期的需求要求应该更加的详细一些，因为毕竟我没有想要这么复杂全面的功能，我只是想做个简单案例而已。

而这一整套的流程，就非常适合零代码基本的非专业开发人员，直接写文档就能够做出自己想要的网页,APP等相关功能。






4. 实战演练：在 Antigravity 中应用 BMAD 



现对于Cursor来讲，Antigravity 天生就是为 BMAD 设计的，因为它支持多 Agent 协作。这个其实是Antigravity的强项。相对来说，BMAD 流程操作上其实没什么区别，基本上没啥区别。

场景：重构用户中心


第一步：分配 Agent 任务 (Planning)

在 Antigravity 的任务栏中，你可以明确指定 Agent 的角色（如果系统支持角色预设，或者在 Prompt 中强调）。

Task 1: 分析与规划

@Agent_PM 请分析当前 src/user 模块的代码。   我们的目标是重构为 TypeScript。   请输出一份 refactor-plan.md，列出所有需要修改的文件和接口定义。

第二步：并行开发 (Execution)

拿到计划后，你可以同时指派多个 Agent 干活。

Task 2: 执行重构

@AgentDev1 参考 refactor-plan.md，请重构 src/user/api.js。   @AgentDev2 参考 refactor-plan.md，请重构 src/user/components/Profile.vue。

Antigravity 优势：

你可以同时看着 PM 规划和 Dev 写代码。
不同的 Agent 专注不同的领域，互不干扰但共享上下文。
能够制定详细的计划，按步骤一一执行。


5. BMAD 与 OpenSpec 的关系 



你可能会问：OpenSpec 和 BMAD 啥关系？

BMAD 是战略：
它告诉你“要分角色、要先规划后开发”。
OpenSpec 是战术:
它是实现“规划”的具体工具。



最佳实践： 在 BMAD 的 Agentic Planning 阶段，让架构师 Agent 生成 OpenSpec 格式 的文档（即 Requirement 和 Scenario）。 然后，在 Core Development 阶段，把这个 OpenSpec 喂给 Developer Agent。

公式：

BMAD 流程 = PM (PRD) ➡️ Architect (OpenSpec) ➡️ Developer (Code)





6. 总结 





BMAD不是什么高深莫测的黑科技，也不是什么新潮流的技术知识，它其实就是软件工程的最佳实践 + AI Agent而已。

核心:
先思考，然后角色分工，先想后做。
口诀:
PM 定需求
AI (PRD) + 人为参与
架构定方案
 AI (Spec)+ 人为参与
开发写代码
 AI (Code)+ 人为参与
工具:
用 Cursor 串联上下文，用 Antigravity 并行协作，其实工具直接是可以相互互补的。



我们需要转变思维，没思考清楚前代码并不重要，各位开发人员，在每一次写代码前，应该需要试着先让 AI 当一会儿 PM，你会发现写出来的代码质量会有质的飞跃！而且幻觉几乎见了，且高效率速度快，符合预期。

---
*导入时间: 2026-01-17 20:27:12*
