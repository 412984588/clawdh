# Task Plan: 纽约唐人街同乡会 App 迁移 (Flutter)

## Goal

将现有的微信小程序功能完整迁移至 Flutter 原生 App (iOS + Android)，保持后端云函数复用。

## Phases

- [x] Phase 1: 调研与项目初始化
- [x] Phase 2: 基础架构搭建 (Dio, Riverpod, GoRouter)
- [x] Phase 3: 首页与 TabBar 框架实现
- [x] Phase 4: 数据层开发 (API, Models, Repositories)
- [x] Phase 5: 核心页面 UI 实现 (首页、活动、公告、我的)
- [x] Phase 6: TTS 语音功能与适老化调节集成
- [ ] Phase 7: 真实云函数后端适配与联调
- [ ] Phase 8: 适老化优化、回归测试与交付

## Status

**Currently in Phase 7** - 核心 UI 与逻辑已闭环，准备进行后端接口联调

## Decisions Made

- TTS: 使用 `flutter_tts` 支持粤语和普通话，详情页顶部直达。
- 适老化设置: 提供「小/中/大/特大」四档字号，通过 Riverpod 实时重绘所有页面。
- 管理后台: 在 Profile 页面根据权限动态展示入口。

## Errors Encountered

- 无
