---
title: "十分钟实用教程 | git-cc: 规范化 Git Commit 的利器"
source: wechat
url: https://mp.weixin.qq.com/s/-lHpvRpdN5tlq1SRFg3OfA
author: 敢敢AUTOHUB
pub_date: 2025年12月6日 19:31
created: 2026-01-17 20:42
tags: [编程, 产品]
---

# 十分钟实用教程 | git-cc: 规范化 Git Commit 的利器

> 作者: 敢敢AUTOHUB | 发布日期: 2025年12月6日 19:31
> 原文链接: [点击查看](https://mp.weixin.qq.com/s/-lHpvRpdN5tlq1SRFg3OfA)

---

十分钟实用教程 | git-cc: 规范化 Git Commit 的利器
1. 什么是 git-cc？

git-cc 是一个强大的 Git 扩展工具，旨在帮助开发者轻松创建符合Conventional Commits 规范(https://www.conventionalcommits.org/en/v1.0.0/) 的提交信息。通过交互式命令行界面，它引导用户一步步完成规范化的提交信息，确保团队代码库的提交历史清晰、一致且易于理解。




下面的动画展示了 git-cc 的基本使用流程：

git-cc 演示
2. 安装指南
2.1 使用 Homebrew (macOS/Linux)
brew tap skalt/git-cc
brew install git-cc

2.2 使用安装脚本 (Linux/Mac)
repo=skalt/git-cc
branch=master
curl -sL <https://raw.githubusercontent.com/$repo/$branch/scripts/install.sh> > /tmp/install.sh
chmod +x /tmp/install.sh
/tmp/install.sh

2.3 从源码编译
# 需要 Go 1.19 或更高版本
git clone <https://github.com/SKalt/git-cc.git>
cd git-cc
make install

3. 基本使用方法

git-cc 提供了直观的交互式界面，以下是常见的使用方式：

# 启动交互式提交创建向导
git cc

# 从指定的提交类型开始
git cc feat

# 从指定的提交类型和作用域开始
git cc 'feat(scope)'

# 验证完整的提交信息
git cc 'feat(cli): 添加了规范化提交功能'

# 使用 -m 参数直接提交（会验证格式）
git cc -m "feat(core): 实现新特性"

4. 交互式提交过程详解

当您运行 git cc 时，它会引导您完成以下步骤：

4.1 选择提交类型



git-cc 会列出常见的提交类型供您选择，界面如下所示：

feat     adds a new feature
 > fix      fixes a bug
   docs     changes only the documentation
   style    changes the style but not the meaning of the code (such as
            formatting)
   perf     improves performance
   test     adds or corrects tests
   build    changes the build system or external dependencies
   chore    changes outside the code, docs, or tests
   ci       changes to the Continuous Integration (CI) system
   refactor changes the code without changing behavior
   revert   reverts prior changes


各提交类型的含义：

• feat: 新功能
• fix: 错误修复
• docs: 文档更改
• style: 不影响代码含义的更改（空格、格式等）
• refactor: 既不修复错误也不添加功能的代码更改
• perf: 提高性能的代码更改
• test: 添加或修正测试
• build: 影响构建系统或外部依赖的更改
• ci: 对CI配置文件和脚本的更改
• chore: 其他不修改src或测试文件的更改
• revert: 撤销先前的提交

使用方向键选择适合的类型（如示例中的 fix），然后按 Enter 键确认。

4.2 输入作用域（可选）



当选择作用域时，git-cc 会显示类似以下界面：

select a scope:
 > new scope edit a new scope into your configuration file
             unscoped; affects the entire project


在这一步，您可以：

• 选择 new scope 来添加一个新的作用域到配置文件
• 选择空白选项（无作用域），表示该提交影响整个项目

常见的作用域例子：

• core: 核心功能
• ui: 用户界面
• api: API相关
• auth: 认证相关

如果不需要指定作用域，选择无作用域选项或直接按 Enter 键跳过。

4.3 输入简短描述



输入一句简短的描述来说明本次提交的内容。这是必填项，应该简明扼要地描述变更。

4.4 输入破坏性变更说明（可选）



如果本次提交包含破坏性变更（不向后兼容），应在此处说明详情。

4.5 输入关联的问题（可选）



在此处可以引用相关的问题编号，例如 "#123" 或 "fix #456"。然后Ctrl + X完成保存

5. 配置说明

git-cc 支持自定义配置，以适应不同团队的提交规范。配置文件采用 YAML、YML 或 TOML 格式，名为 commit_convention.{yaml,yml,toml}。

5.1 配置文件查找路径

git-cc 按以下顺序查找配置文件：

${PWD}/                # 当前工作目录
${REPO_ROOT}/          # Git 仓库根目录
${REPO_ROOT}/.config/  # Git 仓库配置目录
${XDG_CONFIG_HOME}/    # 用户配置目录

5.2 自定义配置示例
# commit_convention.yaml
scopes:
  # Array<{[key: string]: string}> 定义作用域的顺序
  # 便于将最常用的作用域/类型保持在顶部，并要求
  # 对每个commit_type/scope进行解释。
  - parser: 解析常规提交
  - cli: 命令行调用的用户界面
  - dist: 发布版本；分发方式
  - devtools: 开发工具
  - core: 核心模块功能
  - ui: 用户界面组件
  - api: API相关功能
  - auth: 认证及授权系统


配置文件可以根据您的团队需求进行定制，以上示例提供了丰富的选项，您可以根据实际需要取舍。关键配置说明：

1. types: 定义可用的提交类型，包括显示名称、emoji和描述
2. scopes: 定义可选的作用域范围
3. defaults: 设置默认值和长度限制
4. format: 控制提交信息的格式
5. validation: 设置验证规则
6. interactive: 自定义交互式提交体验
7. hooks: 配置提交前后的钩子脚本
8. integrations: 与其他工具的集成配置

可以参考 官方示例配置 获取更多信息。

6. 总结

git-cc 是一个强大而实用的工具，它让规范化的 Git 提交变得简单而高效。无论是个人开发者还是大型团队，都能从中受益，提升代码质量和开发效率。开始使用 git-cc，让您的提交信息更加专业、一致且有意义！

更多ROS、具身智能相关内容，请关注古月居

👉关注我们，发现更多有深度的自动驾驶/具身智能/GitHub内容！

🚀往期内容回顾👀

🔥十分钟读论文 | 视觉-语言-导航（VLN）技术综述：从理论到实践的深度解析
🔥GitHub项目推荐 | Next AI Draw.io：对话就能画流程图，直接抛弃Visio
🔥具身智能 | 灵巧手通用操作指南：开启具身智能新纪元

---
*导入时间: 2026-01-17 20:42:52*
