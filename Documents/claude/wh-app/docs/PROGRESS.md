# 项目进度记录本 (wh-app)

**项目名称**: 纽约唐人街同乡会原生 App
**最后更新**: 2026-01-24
**当前状态**: UI/UX 闭环，Mock 数据运行，准备联调

---

## 阶段性成果汇报

### [2026-01-24] - Flutter 适老化 App 开发完成 (Mock 版)

- [x] **核心架构**: Riverpod + GoRouter + Dio + Flutter Secure Storage ✅
- [x] **UI/UX 实现**:
  - 首页、活动列表/详情、公告列表/详情、个人中心全页面完成
  - 登录流程（手机号/用户名双模）UI 逻辑实现
- [x] **适老化顶配**:
  - 全局 4 档字号动态缩放
  - 粤语/普通话双语 TTS 公告朗读
  - Material 3 高对比度中国红配色
- [x] **系统服务**:
  - 集成 Firebase Messaging 推送框架
  - 编写了《鄉親版用戶手冊》 (docs/user-guide.md)
- [x] **质量保障**:
  - 深度代码审计，修复所有路径、安全、性能隐患
  - `flutter analyze` 结果：0 errors, 0 warnings
  - APK 打包闭环验证通过

---

## 下一步计划

1. **环境准备**: 获取微信云开发环境 ID (Env ID)
2. **真联调**: 替换 `api_endpoints.dart` 占位符，实现真实 AccessToken 握手
3. **数据切换**: 铲除 Mock 逻辑，接通 `UserRepository`, `EventRepository` 等真实调用
