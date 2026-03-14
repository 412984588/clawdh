# 一个Claude Code的远程遥控器

## 基本信息
- **标题**: 一个Claude Code的远程遥控器
- **来源**: 微信公众号
- **作者**: ByteNote
- **发布时间**: 2025年07月27日
- **URL**: https://mp.weixin.qq.com/s?__biz=MzIzMzQyMzUzNw==&mid=2247503948&idx=1&sn=7dcf2e0e9cba2df34f947d837aa49604&chksm=e986b648eea1d42650494552a4fa88a042d3de2da6b9a943e87ee9e660df79e1b5b40a8f0ddc&mpshare=1&scene=24&srcid=0921QmhwVwtfNG2wvo0nivza&sharer_shareinfo=596d13d7415b13f799a89bcd2a3c5fd8&sharer_shareinfo_first=596d13d7415b13f799a89bcd2a3c5fd8#rd
- **分类**: AI技术
- **标签**: #AI #GitHub #工具推荐 #技术分析

## 内容摘要
在公司启动了一个需要跑几小时的数据分析任务，人又想溜，但又怕任务出错或跑完后无法及时进行下一步怎么办？

JessyTsui开发了一款远程的Claude Code遥控器，通过收发邮件，远程控制本地的Claude Code。

也就是说，你可以在办公室启动Claude Code，然后潇洒地回家，等任务一完成，你的邮箱立刻会收到通知。

还支持连续对话，只需直接回复这封邮件，写下新的指令，比如“继续重构下一个模块”或者“把刚才的结果生成图表”，这些命令就会在你公司的电脑上自动执行。

人在家中坐，码从邮件来，邮件，成了沟通人与AI的信使，所以也就不需要什么网络穿透了。

看了一下源码和说明，也足够...

## 完整内容

在公司启动了一个需要跑几小时的数据分析任务，人又想溜，但又怕任务出错或跑完后无法及时进行下一步怎么办？

JessyTsui开发了一款远程的Claude Code遥控器，通过收发邮件，远程控制本地的Claude Code。

也就是说，你可以在办公室启动Claude Code，然后潇洒地回家，等任务一完成，你的邮箱立刻会收到通知。

还支持连续对话，只需直接回复这封邮件，写下新的指令，比如“继续重构下一个模块”或者“把刚才的结果生成图表”，这些命令就会在你公司的电脑上自动执行。

人在家中坐，码从邮件来，邮件，成了沟通人与AI的信使，所以也就不需要什么网络穿透了。

看了一下源码和说明，也足够安全，不是任何人的邮件都能控制你的 Claude，系统基于白名单验证发件人，只有你授权的邮箱地址才能发送指令，确保安全。

整个工作流就是：

在公司的电脑上，命令行界面中正常启动并使用 Claude Code。任务一结束，你的手机就会“叮”一声收到邮件，告诉你“活干完了”。

打开邮件，看到结果，思考片刻，直接回复：“干得不错，现在请把代码打包成 Docker 镜像。”

远在公司的 Claude 接收到你的指令，立刻开始执行新的任务。整个过程，你甚至不需要魔法。只要有邮箱的地方，就有你的远程开发基地。

上手指南，基本上有手就行。

第一步：下载和安装

git clone https://github.com/JessyTsui/Claude-Code-Remote.git
cd Claude-Code-Remote
npm install


第二步：配置你的邮箱

你需要创建一个 .env 文件，填入你的邮箱账号信息。这里需要注意的是，如果你使用 Gmail，需要使用专用的“应用密码（App Passwords）”，而不是你的登录密码。

同时，配置好接收通知的邮箱和允许发送指令的邮箱白名单。

第三步：配置 Claude Code 钩子

这一步是关键，通过在 Claude Code 的配置文件 ~/.claude/settings.json 中添加 hooks，让 Claude 在任务完成（Stop）或等待（SubagentStop）时，自动执行一个脚本来发送邮件。

配置完成后，只需两行命令即可启动：

# 启动邮件监控服务
npm run relay:pty

# 在另一个终端的比如 tmux 中启动 Claude
claude


后面在回家路上就能收到分析报告，通过邮件指示它进行修改和测试。

其实也可以参照里面的邮件内容再做一个TG Bot，TG支持流式输出，可以看到实时的具体的执行过程，那就是真聊天会话编程了。

怎么样把Claude Code 20刀的订阅用成200刀？


Claude Code Sub Agents的正确打开方式和案例演示


这应该是新手使用Claude Code最方便的方式了吧


把Claude Code打造成一个开发团队！


感兴趣的可以亲自上手试试。

传送门：

GitHub项目地址：
https://github.com/JessyTsui/Claude-Code-Remote




---

**处理完成时间**: 2025年10月09日
**文章字数**: 1341字
**内容类型**: 微信文章
**自动分类**: AI技术
**处理状态**: ✅ 完成
