---
title: "Claude Code上线插件系统，AI编程模式再次升级"
source: wechat
url: https://mp.weixin.qq.com/s/9GrYLOnjQ5YmPZTAvQbEsA
author: 程序员小溪
pub_date: 2025年10月24日 01:50
created: 2026-01-17 21:28
tags: [AI, 编程]
---

# Claude Code上线插件系统，AI编程模式再次升级

> 作者: 程序员小溪 | 发布日期: 2025年10月24日 01:50
> 原文链接: [点击查看](https://mp.weixin.qq.com/s/9GrYLOnjQ5YmPZTAvQbEsA)

---

前言

大家好，我是小溪，见字如面。2025年10月10日，Anthropic正式为Claude Code上线了插件系统

这次更新并不是简简单单的功能更新，而是一次革命性的更新，这意味着我们之前需要手动配置、安装的 自定义斜杠命令、代理、MCP服务、Hooks 不再是本地吃灰的配置，而是真正可以共享、工程化的配置。对往期内容感兴趣的小伙伴也可以看往期内容：

深入了解Claude Code CLI自定义命令

深入了解Claude Code CLI子代理Subagent

Hooks才是Claude Code CLI 的革命性更新

Claude Code颠覆编程风格的Output Styles

分享一个Claude Code宝藏网站Claude Code Templates

什么插件系统？

Claude Code插件系统简而言之可以使用以下公式概括：

插件 = 自定义命令 + Sub Agents + Hooks + MCPS

为什么称之为革命性更新？

为什么说Claude Code插件系统功能是革命性更新呢？因为这次更新并不是简单的新增一个扩展功能实现配置的共享，而是将 斜杠命令、智能体、MCP 和 Hooks 四大核心能力打包成工具包极大简化了以往需要逐个配置扩展的繁琐流程，让Claude Code像VS Code一样通过可扩展插件拥有无限的“外挂”能力。试想安装一个插件，自定义命令、Agents、Hoos、脚本等配置一步到位，轻松拥有别人不断迭代的AI工作流能力是不是很值得期待。

当前使用版本

2.0.15 (Claude Code)

优势

一键式安装插件市场插件

灵活的插件市场配置，支持自定义插件

对本地项目无侵入性

安装配置

使用Claude Code CLI的插件系统需要升级到最新的Claude Code CLI版本，升级方式也很简单，只需在命令行终端输入一行命令：

$ claude update

更新完成后，输入命令查看CLI版本

$ claude -v

确保CLI版本在 v2.0.14及以上版本

重启Claude Code CLI，在交互式命令中输入 /plugin，看到以下信息表示更新完成功能可用

基本使用

Plugins CLI命令

Claude Code CLI支持Plugins CLI命令形式添加插件市场和安装插件

添加插件市场

Plugins CLI形式添加插件市场命令格式如下：

$ /plugin marketplace add <组织名>/<仓库名称>

以Github项目 https://github.com/wshobson/agents 为例，在交互式命令下输入：

$ /plugin marketplace add wshobson/agents

安装完成后提示如下：

在插件市场列表可以查看到刚刚安装的插件市场配置

以添加本地插件市场为例，在交互式命令下输入：

$ /plugin marketplace add ./dev-marketplace

添加插件

Plugins CLI形式添加插件命令格式如下：

/plugin install <插件名称>@<插件市场名称>

以Github项目 https://github.com/wshobson/agents 提供的 python-development 插件为例，在交互式命令输入：

/plugin install python-development@claude-code-workflows

不过经本人尝试发现，加不加 @<插件市场名称> 都可以查到插件信息，暂时不知是什么原因

选择【Install now】进行安装，安装完成后提示如下：

重启Claude Code CLI即可查看已安装插件信息

在交互式命令中输入关键词看到刚刚安装插件同步安装的自定义指令信息

管理插件

Claude Code CLI同样提供了插件管理的CLI命令

// 启用插件                  
$ /plugin enable <插件名称>@<插件市场名称>

// 禁用插件                  
$ /plugin disable <插件名称>@<插件市场名称>

// 卸载插件                  
$ /plugin uninstall <插件名称>@<插件市场名称>

经本人尝试发现，enable、disable和uninstall都不会直接执行而是会进入插件管理交互手动选择操作，暂时不知是什么原因

Plugins交互式命令

Claude Code CLI提供了 4种 Plugins交互式命令：

Browse and install plugins：搜索并安装插件

Manage and uninstall plugins：管理已安装的插件

Add marketplace：添加插件市场

Manage marketplaces：管理插件市场

首次使用Plugins命令需要先添加插件市场，没有添加插件市场将无法查看和进行任何操作

添加插件市场

插件市场相当于Claude Code插件的“应用商店”，添加插件市场后可以从插件市场安装托管到插件市场的所有插件。在Claude Code CLI中插件市场的配置是一个JSON配置文件，配置文件内容结构如下，里面罗列了所有可用插件的 名称、描述、分类 及其 来源。

在 /plugin 交互式命令中选择【Add marketplace】

可以看到Claude Code CLI插件市场目前支持 4种类型的配置：

owner/repo(GitHub)：浏览器中访问的Github仓库地址

git@github.com:owner/repo.git (SSH)：Github SSH仓库地址

远程配置：可访问的远程插件JSON配置

本地配置：本地JSON配置

这里以Claude Code官方的插件市场为例，直接输入官方插件市场Github repo回车

https://github.com/anthropics/claude-code

加载成功后会罗列出所有插件列表，通过上下键可以进行切换

同时在 ～/.claude 配置目录下会多一个 plugins 目录，这里存放了所有插件市场配置

管理插件市场

插件市场配置完成后，在 /plugin 交互式命令中选择【Manage marketplaces】可以看到添加的插件市场列表

选择插件市场进入插件市场详情，在这里可以对插件市场进行 更新 和 删除 操作

添加插件

在 /plugin 交互式命令中选择【Browse and install plugins】，在插件市场随便选择一个插件可以进入插件详情

选择【Install now】安装插件，提示如下信息表示插件安装成功

重启Claude Code CLI，在交互式命令中输入 /agent-sdk 可以查看到刚刚安装插件提供的自定义命令

在交互式命令中输入 /agents 可以查看到刚刚安装插件提供的Agents

管理插件

在 /plugin 交互式命令中选择【Manage and uninstall plugins】，选择插件市场

在插件市场找到刚刚安装的插件

进入插件详情可以查看已安装插件的详细信息，【Installed components】列举了插件已安装的组件能力

也可以对插件进行 启用、禁用、标记、更新、卸载 等操作

Enable plugin：启用插件

Disable plugin：禁用插件

Mark for update：标记为更新

Mark for uninstallation：标记为卸载

Update now：立即更新

Uninstall now：立即卸载

Back to plugin list：返回插件列表

经本人尝试发现，插件卸载不会直接删除插件而是标记为不可用，暂时不知是什么原因

其他插件市场

Claude Code插件系统可以配置多个插件市场，配置方式和添加插件市场一致，这里以社区插件市场为例：

https://github.com/davila7/claude-code-templates

添加完成后，在 /plugin 交互式命令中选择【Manage marketplaces】可以看到已添加的所有插件市场列表

自定义插件参考

Claude Code插件系统支持自定义开发，官方贴心的提供了自定义插件系统的文档，这里做了简单汇总：

插件开发指南：https://docs.claude.com/en/docs/claude-code/plugins

高级插件开发：https://docs.claude.com/en/docs/claude-code/plugins#develop-more-complex-plugins

插件市场管理：https://docs.claude.com/en/docs/claude-code/plugin-marketplaces

技术参考文档：https://docs.claude.com/en/docs/claude-code/plugins-reference

友情推荐

Anthropic Marketplaces

涵盖了Agent SDK开发、Git工作流自动化、全面的功能开发工作流程等官方插件，稳定性值得信赖。

Github地址：https://github.com/anthropics/claude-code/tree/main/plugins

Claude Code Templates

涵盖了 DevOps自动化、文档生成、项目管理、测试套件等。实用性强，收录的都是开发日常高频使用场景插件。

官网地址：https://www.aitmpl.com/plugins

Github地址：https://github.com/davila7/claude-code-templates

Claude Code Marketplaces

社区聚合站点，把各个插件市场进行了聚合展示

官网地址：https://claudemarketplaces.com/

Github地址：https://github.com/mertbuilds/claudemarketplaces.com

Seth Hobson

收录了很多 自定义命令、MCP、专业化Agent工作流 以及 开发工具。

官网地址：https://sethhobson.com/

Github地址：https://github.com/wshobson/agents

 




点击关注，及时接收最新消息

---
*导入时间: 2026-01-17 21:28:43*
