# iOS SwiftUI Cursor Rules

## 适用场景
iOS/macOS 应用，使用 SwiftUI + SwiftData + Swift Concurrency（async/await）。

## 核心规则摘要
- @Observable 宏（Swift 5.9+）替代 ObservableObject
- .task 修饰符处理异步数据加载
- SwiftData @Query + @Environment(\.modelContext)
- MVVM 架构（View/ViewModel/Service 分层）
- ContentUnavailableView 统一处理空/错误状态

## 使用方法
将 `.cursorrules` 文件复制到你的 iOS Xcode 项目根目录。
