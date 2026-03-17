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
- [x] Phase 7: 真实云函数后端适配与联调
- [ ] Phase 8: 适老化优化、回归测试与交付

## Status

**Phase 7 Complete** - 已完成云函数后端适配，所有 mock 数据已替换为真实 API 调用

## Phase 7 完成内容

1. **创建 api_providers.dart**
   - 真实 API 数据提供者
   - 网络错误处理和友好提示
   - ApiException 异常类

2. **更新页面使用真实 API**
   - home_page.dart - 使用 orgProvider, eventsProvider, announcementsProvider
   - event_page.dart - 使用 eventsProvider
   - event_detail_page.dart - 使用 eventDetailProvider
   - announcement_page.dart - 使用 announcementsProvider
   - announcement_detail_page.dart - 使用 announcementDetailProvider

3. **删除 mock_data_providers.dart**
   - 文件已删除 (2026-03-17)
   - 所有页面已迁移到真实 API

4. **Repository 增强**
   - announcement_repository.dart - 添加 getAnnouncementDetail 方法

## 验证结果 (2026-03-17)

- `flutter analyze`: No issues found!
- `flutter build web`: ✓ Built build/web
- 所有 mock 相关代码已清理

## Decisions Made

- TTS: 使用 `flutter_tts` 支持粤语和普通话，详情页顶部直达。
- 适老化设置: 提供「小/中/大/特大」四档字号，通过 Riverpod 实时重绘所有页面。
- 管理后台: 在 Profile 页面根据权限动态展示入口。
- 错误处理: 统一使用 getErrorMessage() 提供友好错误提示。

## Errors Encountered

- 无
