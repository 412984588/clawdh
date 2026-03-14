---
title: "深夜整理：iOS 开发者都在偷偷用的 7 个宝藏项目，建议收藏"
source: wechat
url: https://mp.weixin.qq.com/s/J_c2qgMp0-Afb0n5jHUefA
author: iOS新知
pub_date: 2025年11月21日 02:11
created: 2026-01-17 20:57
tags: [编程, 创业]
---

# 深夜整理：iOS 开发者都在偷偷用的 7 个宝藏项目，建议收藏

> 作者: iOS新知 | 发布日期: 2025年11月21日 02:11
> 原文链接: [点击查看](https://mp.weixin.qq.com/s/J_c2qgMp0-Afb0n5jHUefA)

---

这里每天分享一个 iOS 的新知识，快来关注我吧

前言

这周又淘了几个不错的 iOS 库和工具，想着分享给大家。一共收集了 7 个项目，5 个开发库 + 2 个实用工具。质量都还可以，Star 数基本万级起步，值得看看。

开发库这块儿，主要覆盖架构、网络、图片、数据库这几个核心方向，基本上做 iOS 开发都会用到。工具类比较杂，有项目文件生成、窗口切换这种效率工具。下面一个个说。 

开发库推荐
Composable Architecture - 架构新思路

GitHub：pointfreeco/swift-composable-architecture[1]

TCA 算是这几年最值得关注的架构框架了。传统的 MVC、MVVM 写多了总觉得哪儿不太对劲，状态到处飞、测试不好写、副作用管理也头疼。TCA 就是专门解决这些问题的，把状态、行为、副作用都拆得很清楚，写的时候会感觉很安心。我自己在项目里用过一段时间，确实比传统的架构清晰不少。

这框架的核心理念是组合式设计，每个功能模块都是独立的 Reducer，可以像搭积木一样组合起来。最爽的是对 SwiftUI 的支持特别到位，配合 @ObservedObject 用起来很流畅。而且测试也友好，所有逻辑都是纯函数，这点特别重要：

// 定义 State 和 Action
struct CounterState: Equatable {
    varcount = 0
}

enum CounterAction {
    case increment
    case decrement
}

// 实现 Reducer
let counterReducer = Reducer<CounterState, CounterAction, Void> { state, action, _in
    switch action {
    case .increment:
        state.count += 1// 状态变更很清晰
        return .none
    case .decrement:
        state.count -= 1
        return .none
    }
}

// SwiftUI 里用起来就是这样
struct CounterView: View {
    let store: Store<CounterState, CounterAction>
    
    var body: some View {
        WithViewStore(self.store) { viewStore in
            HStack {
                Button("-") { viewStore.send(.decrement) }
                Text("\(viewStore.count)")
                Button("+") { viewStore.send(.increment) }
            }
        }
    }
}


比较适合那种对代码质量有要求、需要高测试覆盖的项目，尤其是 SwiftUI 项目用起来更顺手。这库现在已经 1.2 万+ Star 了，社区也很活跃，文档和例子都挺全的。项目要是还在用 MVC 或者 MVVM，可以试试这个，用起来确实更清晰。

Swift Collections - 官方出品必属精品

GitHub：apple/swift-collections[2]

Apple 官方的东西用着就是放心。标准库里的 Array、Dictionary、Set 确实挺好用，但有时候就是差点意思。比如需要个有序字典、双端队列啥的，或者需要性能更好的集合操作，这时候 Swift Collections 就派上用场了。

这库提供了几个很实用的数据结构：Deque（双端队列）、OrderedSet（有序集合）、OrderedDictionary（有序字典）。性能都优化得挺好，代码质量也是 Apple 标准。我个人最常用 OrderedDictionary，需要保持插入顺序的时候特别好用，之前做排行榜功能就用过这个：

import Collections

// 有序字典，会保持插入顺序
var scores = OrderedDictionary<String, Int>()
scores["Alice"] = 95
scores["Bob"] = 87
scores["Charlie"] = 92

for (name, score) in scores {
    print("\(name): \(score)")  // 按插入顺序输出
}

// 双端队列，头尾操作都是 O(1)
var queue = Deque<String>()
queue.append("first")
queue.prepend("zero")  // 头部插入很快
queue.popFirst()  // 头部删除也快


基本上任何需要高性能数据结构的场景都能用，尤其是涉及大量数据操作的时候，性能提升挺明显的。这库现在有 3.7K+ Star，而且是官方维护的，说不定以后就直接集成到标准库里了。项目要是还在用标准库的数据结构，可以看看这个。

Alamofire - 网络请求王者

GitHub：Alamofire/Alamofire[3]

说到 iOS 网络请求，Alamofire 绝对算是老大哥了。虽然现在原生的 URLSession 和 async/await 已经挺强的了，但 Alamofire 提供的便利性和那些高级特性，真的用过就回不去。链式调用写起来很爽，各种拦截器、重试机制、证书固定都是开箱即用的。

最喜欢的就是它的 API 设计真的很优雅，不管是简单的 GET 请求还是复杂的上传下载，代码都能保持清晰。而且错误处理、参数编码这些细节都处理得很到位。我之前做文件上传功能的时候，用 Alamofire 几行代码就搞定了，比原生 URLSession 省事多了：

import Alamofire

// 简单的 GET 请求
AF.request("https://api.example.com/users")
    .validate()  // 自动验证状态码
    .responseDecodable(of: [User].self) { response in
        switch response.result {
        case .success(let users):
            print("获取到 \(users.count) 个用户")
        case .failure(let error):
            print("请求失败: \(error)")
        }
    }

// 带参数的 POST 请求
let parameters: [String: Any] = [
    "name": "张三",
    "age": 25
]

AF.request("https://api.example.com/users",
           method: .post,
           parameters: parameters,
           encoding: JSONEncoding.default)
    .validate()
    .responseJSON { response in
        // 处理响应
    }


几乎所有需要网络请求的 iOS 项目都能用，从简单的数据获取到复杂的文件上传下载，Alamofire 基本都能搞定。这库现在 4.2 万+ Star 了，是 GitHub 上最受欢迎的 Swift 项目之一，社区生态也很完善，遇到问题基本都能找到解决方案。项目要是还在用原生 URLSession，可以试试 Alamofire，用起来确实方便。

Kingfisher - 图片加载神器

GitHub：onevcat/Kingfisher[4]

喵神出品，质量保证。Kingfisher 应该是我用过最顺手的图片加载库了，纯 Swift 写的，支持 iOS、macOS、tvOS、watchOS 全平台。图片下载、缓存、处理一套流程都有，而且性能不错、内存控制得也挺好，用起来省心。

这库最爽的地方就是 API 设计特别简洁，基本上一行代码就能搞定大部分需求。缓存策略也挺智能，内存缓存和磁盘缓存都自动管理，还支持各种图片处理，圆角、滤镜、缩放这些都内置了。做列表滚动的时候，它的性能优化做得特别好，我之前做过一个图片列表，用 Kingfisher 加载几千张图片都没问题：

import Kingfisher

// 最简单的用法
imageView.kf.setImage(with: URL(string: "https://example.com/image.jpg"))

// 带占位图和渐变动画
imageView.kf.setImage(
    with: URL(string: "https://example.com/image.jpg"),
    placeholder: UIImage(named: "placeholder"),
    options: [
        .transition(.fade(0.3)),  // 渐变效果
        .cacheOriginalImage  // 缓存原图
    ]
)

// 图片处理
let processor = RoundCornerImageProcessor(cornerRadius: 20)
imageView.kf.setImage(
    with: URL(string: "https://example.com/image.jpg"),
    options: [.processor(processor)]
)


只要项目里需要加载网络图片，Kingfisher 就是首选了，特别是列表滚动的场景，它的性能优化做得挺好。这库有 2.4 万+ Star，喵神也一直在维护更新，代码质量和文档都是顶级的。项目要是还在用 SDWebImage 或者自己写图片加载，可以试试这个，用起来确实顺手。

GRDB - SQLite 的最佳选择

GitHub：groue/GRDB.swift[5]

本地数据库方案里，GRDB 绝对算是 Swift 开发者的最佳选择。相比 Core Data 的复杂和 Realm 的重量级，GRDB 找到了个不错的平衡点。它直接基于 SQLite，性能强，API 设计又很 Swift 化，用起来挺舒服。

最让我觉得厉害的是它的数据库观察机制，可以监听查询结果的变化，配合 Combine 或者 SwiftUI 用真的很爽。而且它的 SQL 构建器设计得挺优雅，既保留了 SQL 的灵活性，又有类型安全。之前做离线缓存功能的时候，用 GRDB 配合 SwiftUI 的 @Query 用起来特别方便，数据变化了 UI 自动更新，这点特别省事：

import GRDB

// 定义模型
struct User: Codable, FetchableRecord, PersistableRecord {
    var id: Int64?
    var name: String
    var age: Int
}

// 数据库操作
let dbQueue = tryDatabaseQueue(path: "/path/to/database.sqlite")

try dbQueue.write { db in
    // 创建表
    try db.create(table: "users") { t in
        t.autoIncrementedPrimaryKey("id")
        t.column("name", .text).notNull()
        t.column("age", .integer).notNull()
    }
    
    // 插入数据
    var user = User(id: nil, name: "张三", age: 25)
    try user.insert(db)
}

// 查询数据
let users = try dbQueue.read { db in
    tryUser
        .filter(Column("age") >= 18)
        .order(Column("name"))
        .fetchAll(db)  // 类型安全的查询
}


适合那些需要本地持久化存储、对性能有要求的项目，尤其数据量比较大或者查询比较复杂的场景。这库有 6.8K+ Star，文档很详细，作者也挺活跃，算是 SQLite 封装库里的精品了。项目要是还在用 Core Data 或者 Realm，可以看看这个，用起来确实更轻量，性能也不错。

开发工具推荐
XcodeGen - 项目文件生成利器

GitHub：yonaskolb/XcodeGen[6]

用了 XcodeGen 之后，真的不想再手动维护 xcodeproj 文件了。说实话 Xcode 项目文件真是让人头疼，团队协作的时候动不动就冲突，合并起来简直噩梦。XcodeGen 就是来救命的，用一个简单的 YAML 文件就能生成完整的 Xcode 项目。

这工具最爽的就是配置文件特别直观，项目结构、依赖关系、编译设置全都看得很清楚。而且因为项目文件是自动生成的，可以直接把 .xcodeproj 加到 .gitignore 里，从此告别项目文件冲突。我之前在团队项目里用过，确实省了不少事，再也不用担心合并冲突了：

# project.yml 配置文件
name:MyApp
options:
bundleIdPrefix:com.example
targets:
MyApp:
    type:application
    platform:iOS
    deploymentTarget:"14.0"
    sources:
      -Sources# 自动扫描源文件
    dependencies:
      -package:Alamofire# SPM 依赖
      -framework:Carthage/Build/iOS/Kingfisher.framework# Carthage 依赖
    settings:
      PRODUCT_BUNDLE_IDENTIFIER:com.example.myapp

# 生成项目文件
xcodegen generate

# 集成到 CI/CD 流程
xcodegen && xcodebuild build


特别适合多人协作的项目和 CI/CD 流程，能减少不少项目配置相关的麻烦。这工具有 7K+ Star，在 iOS 圈已经算是标配了，配合 SwiftPM 或 Carthage 用效果更好。项目要是还在手动维护 xcodeproj 文件，可以试试这个，用起来确实方便，特别是团队协作的时候。

AltTab - macOS 窗口切换神器

GitHub：lwouis/alt-tab-macos[7]

虽然这个不算开发库，但绝对是 macOS 开发者必装的效率工具。macOS 自带的 Command+Tab 只能切应用，不能切窗口，用起来确实不够灵活。AltTab 就是把 Windows 那套 Alt+Tab 体验搬到 Mac 上了，而且做得更好。

这工具最实用的就是能直接看到所有窗口的预览，多开 Xcode、多个模拟器窗口、各种浏览器标签页，全都一目了然。而且支持各种自定义，快捷键、显示样式、排序规则都能调：

窗口预览：每个窗口都有缩略图，找起来特别快
多种主题：可以调成 Windows 风格或者 macOS 风格
快捷键自定义：不喜欢默认的可以自己改
多显示器支持：外接显示器也能很好地工作

用过之后效率真的提升不少，特别是同时开好几个项目的时候。这工具有 1万+ Star，而且是免费开源的。macOS 开发者要是还没用过，真的值得试试，用习惯了就回不去了。

总结

你用过这些库或工具吗？或者有啥其他好用的 iOS 开发资源？欢迎评论区聊聊。

参考资料
[1] 

Swift Composable Architecture: https://github.com/pointfreeco/swift-composable-architecture

[2] 

Swift Collections: https://github.com/apple/swift-collections

[3] 

Alamofire: https://github.com/Alamofire/Alamofire

[4] 

Kingfisher: https://github.com/onevcat/Kingfisher

[5] 

GRDB.swift: https://github.com/groue/GRDB.swift

[6] 

XcodeGen: https://github.com/yonaskolb/XcodeGen

[7] 

AltTab: https://github.com/lwouis/alt-tab-macos

这里每天分享一个 iOS 的新知识，快来关注我吧

---
*导入时间: 2026-01-17 20:57:56*
