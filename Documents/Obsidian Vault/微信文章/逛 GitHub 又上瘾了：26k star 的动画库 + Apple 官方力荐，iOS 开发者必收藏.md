---
title: "逛 GitHub 又上瘾了：26k star 的动画库 + Apple 官方力荐，iOS 开发者必收藏"
source: wechat
url: https://mp.weixin.qq.com/s/--LtOPtvO3x3Y-eaGfPm-Q
author: iOS新知
pub_date: 2025年12月12日 00:52
created: 2026-01-17 20:32
tags: [AI, 编程]
---

# 逛 GitHub 又上瘾了：26k star 的动画库 + Apple 官方力荐，iOS 开发者必收藏

> 作者: iOS新知 | 发布日期: 2025年12月12日 00:52
> 原文链接: [点击查看](https://mp.weixin.qq.com/s/--LtOPtvO3x3Y-eaGfPm-Q)

---

这里每天分享一个 iOS 的新知识，快来关注我吧

前言

这周逛 GitHub 又发现了几个不错的 iOS 项目，整理了一下分享给你。一共 8 个，5 个开发库，3 个工具。

直接开始吧。

开发库推荐
RevenueCat - 内购订阅神器

GitHub：RevenueCat/purchases-ios[1]

做过内购的都知道，StoreKit 那套 API 用起来太繁琐了。订阅状态、收据验证、跨平台同步，各种麻烦事儿。RevenueCat 把这些都解决了，而且支持 iOS、watchOS、tvOS、macOS、visionOS 全平台。

说白了就是把 StoreKit 封装了一层，API 简单多了。原生购买要写一堆代码处理队列和验证，用 RevenueCat 几行就搞定：

// 获取可用商品
Purchases.shared.getOfferings { offerings, error in
    iflet packages = offerings?.current?.availablePackages {
        // 展示商品列表
    }
}

// 购买
Purchases.shared.purchase(package: package) { transaction, customerInfo, error, userCancelled in
    if customerInfo?.entitlements["pro"]?.isActive == true {
        // 解锁 Pro 功能
    }
}

// 检查订阅状态
Purchases.shared.getCustomerInfo { customerInfo, error in
    if customerInfo?.entitlements.all["pro"]?.isActive == true {
        // 用户是 Pro 会员
    }
}


如果你的 App 要做订阅或内购，特别是多平台项目，这个库能省不少事。后台还有数据分析、A/B 测试这些功能。

不少公司都在用这个，对 StoreKit 2 和 visionOS 的支持也都跟上了。如果要做内购的话，可以考虑一下。我自己项目里用过，确实省心。

Swift Protobuf - Apple 官方出品

GitHub：apple/swift-protobuf[2]

Protocol Buffers 后端用得多，移动端其实也挺合适的，特别是需要高性能序列化的时候。这个是 Apple 官方维护的，质量应该没什么问题。不过说实话，JSON 用习惯了，换 Protobuf 需要跟后端配合，有点麻烦。

最主要的优势就是类型安全，proto 文件定义好结构后，直接生成 Swift 代码，编译的时候就能发现问题。性能比 JSON 要好一些，数据量大的时候区别比较明显。用法也不复杂：

// 定义 proto 文件后生成的 Swift 代码
var person = Person()
person.name = "张三"
person.id = 123
person.email = "zhangsan@example.com"

// 序列化
let data = try person.serializedData()

// 反序列化
let decodedPerson = try Person(serializedData: data)
print(decodedPerson.name) // "张三"


比较适合跟后端约定用 Protobuf 的项目，或者本地需要高效序列化的场景。4.8k+ stars，Apple 官方背书，跨平台支持也挺全的。

虽然现在 JSON 用得更普遍，但数据量上来之后 Protobuf 优势就出来了。网络传输省流量，解析快，而且强类型不容易出错。如果你的后端支持，建议试试。

Apollo iOS - GraphQL 客户端

GitHub：apollographql/apollo-ios[3]

GraphQL 这两年用得越来越多了，比 RESTful API 灵活不少。Apollo iOS 是官方的 Swift 客户端，功能挺完善的，4k+ stars。不过学习曲线有点陡，刚开始用可能不太习惯。

主要特点是强类型查询，写完 GraphQL 查询语句后会自动生成 Swift 代码，类型安全。还有缓存机制，网络请求的数据会自动缓存，离线也能用。代码写起来还行：

// 定义查询
apollo.fetch(query: UserQuery(id: "123")) { result in
    switch result {
    case .success(let graphQLResult):
        iflet user = graphQLResult.data?.user {
            print(user.name)
            print(user.email)
        }
    case .failure(let error):
        print("Error: \(error)")
    }
}

// 带缓存策略
apollo.fetch(
    query: UserQuery(id: "123"),
    cachePolicy: .returnCacheDataAndFetch
) { result in
    // 先返回缓存，再拉取新数据
}


如果后端用 GraphQL 的话，这个库基本够用了。缓存、订阅、批量请求这些都支持。

用过的都说还不错，特别是复杂查询的场景，一个请求就能拿到需要的数据，不用像 REST 那样请求好几次。对网络性能提升挺明显的。不过前提是你后端得支持 GraphQL，不然也用不上。

Lottie - 动画库

GitHub：airbnb/lottie-ios[4]

Lottie 应该不用多介绍了吧，26k+ stars，做 iOS 的基本都知道。Airbnb 出品，最大的好处是设计师直接在 After Effects 里做动画，导出 JSON 就能用。

以前做复杂动画要么用图片序列（太占地方），要么用 Core Animation 写代码（太费时间）。Lottie 把这个问题解决了，设计师和开发协作方便很多。用法很简单：

import Lottie

// 加载动画
let animationView = LottieAnimationView(name: "loading")
animationView.frame = CGRect(x: 0, y: 0, width: 200, height: 200)
animationView.contentMode = .scaleAspectFit
animationView.loopMode = .loop
view.addSubview(animationView)

// 播放
animationView.play()

// 控制进度
animationView.play(fromProgress: 0, toProgress: 0.5) { finished in
    print("动画播放到一半")
}


引导页、空状态、加载动画这些场景都能用。性能也还行，矢量动画不失真，还支持动态修改颜色、文字这些。

用了好几年了，确实是很好用的一个动画库。LottieFiles 上还有很多免费资源，下载就能用。

Swift Dependencies - 依赖注入

GitHub：pointfreeco/swift-dependencies[5]

依赖注入在 iOS 开发里确实有点麻烦，Point-Free 团队做了这个库，灵感来自 SwiftUI 的 Environment，API 设计得还挺优雅的。写测试的时候方便很多。不过如果你项目不大，可能用不上，有点杀鸡用牛刀的感觉。

核心思路是把依赖声明成全局可访问的，但每个模块可以注入自己的实现。写起来是这样：

// 定义依赖
struct APIClient {
    var fetchUser: (String) async throws -> User
}

extension APIClient: DependencyKey {
    staticlet liveValue = APIClient(
        fetchUser: { id in
            // 真实网络请求
        }
    )
    
    staticlet testValue = APIClient(
        fetchUser: { _in
            User(id: "123", name: "测试用户")
        }
    )
}

// 使用依赖
@Dependency(\.apiClient) var apiClient

func loadUser() async throws {
    let user = try await apiClient.fetchUser("123")
}


想优化架构的项目可以试试，特别是测试覆盖率要求高的。Point-Free 出品，质量应该有保证，跟 SwiftUI 和 TCA 配合挺好。

用了之后测试代码确实干净了不少，不用写一堆 protocol 和 mock 了。依赖关系也清晰，每个模块依赖啥一眼能看出来。

开发工具推荐
SwiftLint - 代码规范检查

GitHub：realm/SwiftLint[6]

代码规范这个事儿光靠人不太行，SwiftLint 基本算是 Swift 项目标配了，19k+ stars。Realm 团队维护，规则挺全的，也可以自定义。

集成到 Xcode 后会自动检查，写代码的时候直接提示，不符合规范的地方会有警告或者错误。团队协作的时候特别有用，代码风格能保持一致，Review 的时候省事。

安装很简单，用 Homebrew：

brew install swiftlint


然后在 Xcode 的 Build Phases 加个 Run Script：

if which swiftlint >/dev/null; then
  swiftlint
else
  echo "warning: SwiftLint not installed"
fi


配置文件 .swiftlint.yml 放项目根目录，想开哪些规则自己配：

disabled_rules:
  - trailing_whitespace
opt_in_rules:
  - force_unwrapping
  - empty_count
line_length: 120


基本所有 Swift 项目都适用，特别是多人协作的。代码质量有保障，长期维护轻松一些。还能自动修复简单问题，swiftlint --fix 一键格式化。

正规点的项目基本都在用，不用的话代码风格容易乱。集成成本低，效果明显，推荐用上。

Swift Package Manager - 官方包管理

GitHub：swiftlang/swift-package-manager[7]

SPM 现在基本成标配了，Swift 官方工具，10k+ stars，Xcode 深度集成。比 CocoaPods 和 Carthage 最大的好处是原生支持，不用装第三方工具。

用起来很简单，Xcode 里 File → Add Packages 直接搜就行，或者在 Package.swift 配置：

// Package.swift
let package = Package(
    name: "MyApp",
    dependencies: [
        .package(url: "https://github.com/Alamofire/Alamofire.git", from: "5.8.0"),
        .package(url: "https://github.com/onevcat/Kingfisher.git", from: "7.0.0")
    ],
    targets: [
        .target(
            name: "MyApp",
            dependencies: [
                "Alamofire",
                "Kingfisher"
            ]
        )
    ]
)


所有 Swift 项目都适用，现在大部分主流库都支持 SPM 了。依赖解析快，版本管理清晰，跟 Xcode 配合也顺。

CocoaPods 用了很多年，但 SPM 出来后确实方便。不用维护 Podfile 和 workspace，项目结构干净。唯一问题是有些老库还没支持，不过趋势很明显了。

CodeEdit - 原生编辑器

GitHub：CodeEditApp/CodeEdit[8]

用 SwiftUI 写的原生 macOS 代码编辑器，22k+ stars，目标是做开源的 Xcode 替代品。现在功能还不如 Xcode 全，但进步挺快的，而且完全免费开源。

界面做得还不错，原生 macOS 体验，启动速度比 Xcode 快。语法高亮、代码补全、Git 集成这些基本功能都有，写小项目或者脚本挺方便。

功能还在开发中，LSP 支持、调试、项目管理这些都在做。喜欢折腾的话可以关注一下。

适合写轻量级代码，或者想看看 SwiftUI 能做到什么程度。用来看开源项目源码也行，比 Xcode 轻，比 VS Code 更原生。

现在还不能完全替代 Xcode，但作为辅助工具挺好。而且开源，想要什么功能可以自己加，这点比 Xcode 强。

总结

本周推荐的几个项目都是些实用的东西，根据自己项目需要选择吧。有用过的欢迎在评论区交流。

参考资料
[1] 

RevenueCat/purchases-ios: https://github.com/RevenueCat/purchases-ios

[2] 

apple/swift-protobuf: https://github.com/apple/swift-protobuf

[3] 

apollographql/apollo-ios: https://github.com/apollographql/apollo-ios

[4] 

airbnb/lottie-ios: https://github.com/airbnb/lottie-ios

[5] 

pointfreeco/swift-dependencies: https://github.com/pointfreeco/swift-dependencies

[6] 

realm/SwiftLint: https://github.com/realm/SwiftLint

[7] 

swiftlang/swift-package-manager: https://github.com/swiftlang/swift-package-manager

[8] 

CodeEditApp/CodeEdit: https://github.com/CodeEditApp/CodeEdit

这里每天分享一个 iOS 的新知识，快来关注我吧

---
*导入时间: 2026-01-17 20:32:40*
