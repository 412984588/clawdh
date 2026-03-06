# Claude Code免费用！超详细薅羊毛教程

## 基本信息
- **标题**: Claude Code免费用！超详细薅羊毛教程
- **来源**: 微信公众号
- **作者**: 爱生活的小哥02
- **发布时间**: 2025年09月06日
- **URL**: https://mp.weixin.qq.com/s/ONDcrlLalur6Euc3GPcneg
- **分类**: AI技术
- **标签**: #AI #GitHub #工具推荐 #技术分析 #效率 #深度学习 #开源 #教程 #产品

## 内容摘要
前言

随着AI大模型应用的不断普及，尤其在AI编码领域，AI开发工具更是层出不穷。从最早的Github Copilot（主要是单句、片段代码补全）到后来的Cursor、Winsurf、Cline、通义灵码等，再到Trae、CodeBuddy，这些工具基本都是VSCode的扩展或基于VSCode开发的独立IDE工具。

Claude Code走了一条不寻常路，是通过开发人员更熟悉的命令行方式使用。更重要的是，基于Anthropic公司能力强大的Claude大模型，Claude code的能力也是得到了广泛的认可。

ps：很多人也叫他是CC。

工具好是好，但是呢，在国内无法直接使用。今天我们...

## 完整内容

前言

随着AI大模型应用的不断普及，尤其在AI编码领域，AI开发工具更是层出不穷。从最早的Github Copilot（主要是单句、片段代码补全）到后来的Cursor、Winsurf、Cline、通义灵码等，再到Trae、CodeBuddy，这些工具基本都是VSCode的扩展或基于VSCode开发的独立IDE工具。

Claude Code走了一条不寻常路，是通过开发人员更熟悉的命令行方式使用。更重要的是，基于Anthropic公司能力强大的Claude大模型，Claude code的能力也是得到了广泛的认可。

ps：很多人也叫他是CC。

工具好是好，但是呢，在国内无法直接使用。今天我们就写下如何在国内可以用，而且是免费使用这个工具的过程，以及如何使用hooks（钩子，可以在某个操作之前之后，进行其他操作）提高我们的效率。

Claude Code
Claude code是什么

在AI代码助手领域，Anthropic公司于2025年推出了命令行形式的编程智能体工具——Claude Code。Claude Code正是基于Anthropic公司强大的Claude模型，最初以研究预览形式发布，在收获积极反馈后于2025年中开始全面开放。它把Claude的大模型能力封装进一个终端代理，允许开发者通过命令行直接与AI协作编程。

Claude Code背后的API还提供了代码执行、文件系统访问、缓存Prompt等新能力，方便开发者构建自定义AI Agent。总的来说，Claude Code的诞生标志着AI编程助手从简单对话辅助进化到具备自主执行、长程推理能力的智能体，为开发流程带来全新范式。

一些让我惊喜的地方

最开始用的时候，当时正好要优化一个问题，就用Claude了，但是突然又想起来其他问题，就先让他帮忙处理其他问题了。结果在处理完其他问题后，我自己都把一开始提的问题给忘了，他突然问我，那我们开始xx问题的优化？

一下子把我惊艳了！！！

我们都知道，单次对话，大模型能力区别其实差距不会很大。但是随着交互次数增加，大模型上下文越来越长，模型的脑子可能就不好使了，很容易出现忘东西或者记忆混乱的情况。

但是在Claude code这里一切感觉良好，究其原因和它的memory、todo机制，我觉得是有很大关系的。

如何安装

步骤一，安装node.js windows用户访问 https://nodejs.org 下载安装包，进行安装。建议选择LTS版本的，官方可以提供稳定支持。

命令行查看node版本，需要版本>18

node --version


步骤二，安装Claude code

命令行

npm install -g @anthropic-ai/claude-code
claude --version


可以正常显示Claude的版本，就安装成功了

如何免费用
Any Router注册

对大模型API略有了解的人都知道，要调用API需要设置apikey，如果走代理方式还需要设置BaseUrl，要使用Claude Code也是类似的。

既然我们要免费用，那么就是找免费的代理去用，这里我们使用Any Router。（注册地址：https://anyrouter.top/register?aff=KqHh），后续每天登录都会赠送$25。

友情提醒：邮箱注册目前应该是限制了只能edu邮箱注册，可以使用github账号直接自动登录注册。

APIKey、BaseUrl获取

注册成功后，点击API令牌，点击添加API令牌，设置下名称、额度、过期时间提交即可。之后在API令牌列表，点击复制，就是我们的APIKEY了。

BaseUrl可以设置为https://anyrouter.top，或者https://pmpjfbhq.cn-nb1.rainapp.top（网络不稳定可以使用这个）

Claude Code设置

设置环境变量

ANTHROPIC_AUTH_TOKEN：<上面的APIKey>

ANTHROPIC_BASE_URL：<上面的BaseUrl>

注意完成上述环境变量配置后，需要重新打开命令行工具。

4.开始使用

命令行输入Claude，就可以愉快的和Claude code互动了。

hooks使用

hooks即钩子，类似编程中的委托事件，就是可以定义在某个事件操作之前之后要做的事情。

比如，通过Claude code完成了代码的编写，在保存代码之前可以设置进行代码格式化、代码审查，在保存代码后，可以设置自动提交代码。

Claude的内置命令通过输入/即可查看，输入/help可以查看相关命令使用说明。

输入/hooks即可进行hooks的设置，首先需要选择事件

这里我选择Stop，我想要实现在每次输出完成后，可以通过windows通知+提示音，提醒我输出完成。因为一次任务可能多次调用大模型，花费时间可能比较多，我一直盯着浪费时间，不盯着可能输出完了，但是我不知道。有了这个功能，就很好的解决了我的这个问题。

选择Stop回车，选择+ Add new hook…

在如上文本框中输入如下命令（这里是windows环境）

powershell -c "[console]::beep(1000,1000); Add-Type -AssemblyName 'System.Windows.Forms'; Add-Type -AssemblyName  'System.Drawing'; $notify = New-Object System.Windows.Forms.NotifyIcon; $notify.Icon =  [System.Drawing.SystemIcons]::Information; $notify.Visible = $true; $notify.ShowBalloonTip(3000, 'Claude Code',  '响应完成', 'Info'); $notify.Dispose()"


回车，需要选择保存到哪里

这里我选择User Settings，即用户全局配置下，这样以后每次都会使用这个配置，也可以选择保存到项目配置下，只有这个项目才会生效。

保存完后，ESC退出hooks配置。

在文本与Claude对话，这个时候就应该有hook效果了。随着一声蜂鸣声，右下角弹出了windows通知。

友情提示：上面hook命令beep(1000,1000)，其中第一个数字是声音高低，第二个数字是声音时长，可以根据自己需要调整，也可以直接是cmd命令中测试；后面的windows通知同样可以类似去测试

我们打开上述hook保存提示的路径，可以看到一个settings.json

这里就是我们刚才配置的hook，我们自己对这个配置熟悉之后，完全可以直接在json文件中配置。上面还有个matcher属性，可以设置什么情况才调用这个hook，比如可以配置使用哪些工具的时候，才会触发这个hook。

结语

本文主要介绍了Claude code如何安装并免费使用的过程，最后讲了下hooks的使用。

后续还会再写写agent、mcp的使用，也欢迎大家互动交流。







欢迎关注交流↓










---

**处理完成时间**: 2025年10月09日
**文章字数**: 3044字
**内容类型**: 微信文章
**自动分类**: AI技术
**处理状态**: ✅ 完成
