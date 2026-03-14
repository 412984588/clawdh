---
title: "Claude Code官方开源，一个插件，终结屎山代码！（附完整提示词）"
source: wechat
url: https://mp.weixin.qq.com/s/cSHnSZifQezzUM-klrxiog
author: 羊仔AI探索
pub_date: 2026年1月9日 08:38
created: 2026-01-17 20:07
tags: [AI, 编程]
---

# Claude Code官方开源，一个插件，终结屎山代码！（附完整提示词）

> 作者: 羊仔AI探索 | 发布日期: 2026年1月9日 08:38
> 原文链接: [点击查看](https://mp.weixin.qq.com/s/cSHnSZifQezzUM-klrxiog)

---

大家好，我是羊仔，专注AI编程、智能体、AI工具。



在这个AI编程工具满天飞的时代，咱们心里其实都有个不敢说的秘密。

用Cursor也好，用Claude Code也好，刚上手的头一个小时，那种感觉简直像开了挂——你说什么，它做什么，功能一个个被点亮。

但这种蜜月期，通常很短。

等到项目稍微复杂一点，事情就开始不对劲了。

这时候它生成的代码，功能虽然能跑，但打开文件一看，好家伙，逻辑缠绕得一团乱麻，变量名风格迥异，冗余代码到处都是。




就在昨天半夜，羊仔发现Claude Code的核心大佬Boris Cherny终于看不下去了。

他直接把他们内部团队用来清洗代码的code-simplifier插件，开源了！

我看了一眼这个插件的介绍和背后的Prompt，当时就精神了。

它不生产新功能，它的唯一任务，就是把你那些被AI写乱的代码，重新梳理得井井有条。




(⬆️Claude Code官方下场，治理AI代码乱象)

1. 深度拆解，4个代码心法




很多人拿到这个工具，第一反应是：“哦，不就是让AI自动帮我重构一下嘛，我也能写Prompt让它重构。”

千万别这么想，太天真了。

羊仔连夜扒完了它的源码，发现这个插件最值钱的，根本不是代码本身，而是它背后那一长串精心设计的提示词。

它里面藏着好几个反直觉的逻辑，正好击中了我们平时用 AI 写代码最容易犯的错。

羊仔特意把其中的关键英文指令摘录出来，给大家做个深度拆解，如果你能看懂这四层逻辑，哪怕你不用这个插件，你的代码水平也能上一个台阶。




1. 整容而非换头：外科手术式的边界感




原文Prompt: "Preserve Functionality: Never change what the code does - only how it does it. All original features, outputs, and behaviors must remain intact."

羊仔解读：

我们以前用 AI 重构代码，最大的恐惧是什么？是它杀红了眼。

你让它优化一个函数，它顺手把你整个类的逻辑都重写了，结果逻辑变了，功能直接跑不通。

Boris 团队在提示词里埋下的第一层心法，我称之为外科手术式的边界感。

它用极其严厉的措辞限定了 AI 的权限：任何涉及业务逻辑流转的改动，都被画上了红线。


这其实是在教我们如何管理 AI，你不能给 AI 无限的自由度。

这给我们一个巨大的启示：在 AI 编程时代，最值钱的不是写代码的能力，而是划定「不可触碰区」的能力。




2. 禁止炫技，以人为本




原文Prompt: "Choose clarity over brevity - explicit code is often better than overly compact code... Important: Avoid nested ternary operators - prefer switch statements or if/else chains for multiple conditions."

羊仔解读：

这一条简直说到了羊仔的心坎里，也是最反直觉的一点。

在程序员圈子里，长期存在一种鄙视链：谁的代码行数越少、写得越晦涩难懂，似乎技术就越牛，很多 AI 模型为了省 token，也倾向于生成极其精简的代码。

但 Code Simplifier 直接明确提出了一种反内卷的审美。

为什么官方要特意把“禁止嵌套三元运算符”写进 Prompt？因为那不是代码，那是给维护者挖的坑！写的时候很爽，修 Bug 的时候想死。

官方这个设定是在告诉我们：代码的第一受众是人，其次才是机器。好代码的标准不是短，而是无歧义。

如果你为了省两行代码，让同事多花十分钟去理解，那你就是在这个项目的“屎山”上又添了一把土。




3. 统一代码风格




原文Prompt: "Apply Project Standards: Follow the established coding standards from CLAUDE.md... including: Use explicit return type annotations... Follow proper React component patterns..."

羊仔解读：

很多时候我们的代码之所以乱，是因为千人千面。

你习惯用箭头函数，我习惯用 function；你喜欢 try-catch，我喜欢直接抛错。当这些风格混在一起，代码就不可避免地走向无序。

这个插件最高明的地方，在于它引入了代码标准。

它不跟你扯皮什么风格更好，而是直接读取你项目里的 CLAUDE.md 文件，这其实是一种代码法治的思维。

这给羊仔的启示是：不要试图每次都跟 AI 强调你的习惯，而是要把你的习惯固化成一份规则文档，让 AI 照章办事。


这才是规模化工程的解决之道。




4. 活在当下




原文Prompt: "Focus Scope: Only refine code that has been recently modified or touched in the current session, unless explicitly instructed to review a broader scope."

羊仔解读：

最后这层逻辑，非常务实，甚至有点功利。

很多完美主义者重构代码，恨不得把八百年前的祖传代码都翻出来洗一遍。

但 Code Simplifier 的 Prompt 里有一个极其克制的指令：聚焦当下——除非我让你查，否则别动老代码。

官方在这个 Prompt 里其实在传递一种价值观：承认系统的不完美，我们只为当下的增量负责。


这一条，直接把重构的风险降到了最低，也把这个工具的实用性拉到了最高。

2. 安装实操指南




说了这么多，怎么用呢？安装方法非常简单，羊仔亲测有效。

官方提供了两种方式，大家按需取用：




1. 终端安装




直接在你的终端里输入：

claude plugin install code-simplifier



2. 对话框安装





如果你已经进入Claude Code对话里了，先刷新官方插件列表：

/plugin marketplace update claude-plugins-official

然后执行：

/plugin install code-simplifier

安装完后，记得用 /plugin list 检查一下是不是安装成功了。




(⬆️几秒钟就能装好的神器)

3. 最后的福利：完整版Prompt




羊仔知道，很多朋友不一定用 Claude Code，可能在用 Cursor，或者自己搭建的 AI 工作流。

没关系！这套 Prompt 的价值是通用的，羊仔已经把它从源码里完整提取出来了，并翻译成了中文版。

你可以把它直接复制到 Cursor 的 Rules 里，或者作为用户提示词给 ChatGPT/Claude 网页版使用，效果一样炸裂！

获取方式：

在公众号后台回复关键词 【清洗代码】，即可免费获取这份官方原版 Prompt 及其中文版。

Claude Code 这次开源 code-simplifier，其实传递了一个很重要的信号：AI 编程正在从单纯的代码生成，向代码治理转变。

不管你是刚入门的小白，还是写了多年代码的老鸟，羊仔都强烈建议你试一试这个插件，或者至少读一读这份 Prompt。

当你看着整洁的代码，你会更有信心去开启下一个里程碑。

共勉！

欢迎关注羊仔，一起探索AI，成为超级个体！

如果你喜欢这篇文章，不妨点赞，在看，转发。

你的每一次互动，对羊仔来说都是莫大的鼓励。

扫描下方二维码，添加微信好友获取羊仔精心准备的资料～

---
*导入时间: 2026-01-17 20:07:36*
