# 史上最强编程工具 Claude Code 保姆级教程：从安装到上手，一篇搞定（附独家技巧）

## 基本信息
- **标题**: 史上最强编程工具 Claude Code 保姆级教程：从安装到上手，一篇搞定（附独家技巧）
- **来源**: 微信公众号
- **作者**: Francis
- **发布时间**: 2025年08月12日
- **URL**: https://mp.weixin.qq.com/s/fd-GqMd7BQwNGwgydQzd3g
- **分类**: 技术教程
- **标签**: #AI #GitHub #工具推荐 #技术分析 #效率 #深度学习 #教程 #产品

## 内容摘要
特别声明：该文章出于传递知识而非盈利之目的，并不代表赞成其观点或证实其描述，内容仅供参考。

一、系统要求

安装 Node.js（如已安装可跳过）
Ubuntu / Debian系统
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
macOS
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
brew ins...

## 完整内容

特别声明：该文章出于传递知识而非盈利之目的，并不代表赞成其观点或证实其描述，内容仅供参考。

一、系统要求

安装 Node.js（如已安装可跳过）
Ubuntu / Debian系统
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
macOS
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
brew install node
Windows（建议使用 WSL）
# 在 WSL 中执行
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo bash -
sudo apt-get install -y nodejs

💡 检查 Node.js 版本

在开始安装前，请先检查您的 Node.js 版本：

node --version
npm --version
二、Claude code 安装指南


Windows 安装
方法一：使用 npm 安装（推荐）
# 以管理员身份打开 PowerShell 或命令提示符
# 全局安装
npm install -g @anthropic/claude-code
# 验证安装
claude --version


方法二：使用 Chocolatey 安装
# 安装 Chocolatey（如果尚未安装）
Set-ExecutionPolicy Bypass -Scope Process -Force
iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))
# 安装 Claude Code
choco install claude-code
🐧 Linux 安装
方法一：使用 npm 全局安装（推荐）
# 全局安装 Claude Code
sudo npm install -g @anthropic/claude-code
# 验证安装
claude --version
🍎 macOS 安装
方法一：使用 npm 安装（推荐）
# 全局安装
sudo npm install -g @anthropic/claude-code
# 验证安装
claude --version
方法二：使用 Homebrew 安装
# 安装 Homebrew（如果尚未安装）
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
# 添加 Anthropic tap
brew tap anthropic/claude
# 安装 Claude Code
brew install claude-code
三、配置 Anthropic 认证（必须）
🔑API Key 获取
📋 获取步骤

登录 Anthropic 控制台 或国内镜像站（如 aicodemirror.com）

创建 API 令牌，复制以 sk- 开头的 token

配置环境变量（推荐）
Linux / macOS / WSL
echo 'export ANTHROPIC_AUTH_TOKEN=你的API密钥' >> ~/.zshrc
echo 'export ANTHROPIC_BASE_URL=https://api.aicodemirror.com/api/claudecode' >> ~/.zshrc
source ~/.zshrc
Windows 系统环境变量
变量名：ANTHROPIC_BASE_URL，变量值：https://api.aicodemirror.com/api/claudecode
变量名：ANTHROPIC_API_KEY，变量值：你的密钥
变量名：ANTHROPIC_AUTH_TOKEN，变量值：你的密钥
四、启动 Claude Code
进入你的项目目录：
cd your-project-folder
claude

首次启动会提示：

选择主题

确认安全须知

信任工作目录

开始与 AI 对话编程

五、Claude code 常用命令速查表
# CLI 参考
> Claude Code 命令行界面的完整参考，包括命令和标志。
## CLI 命令
| 命令                                 | 描述                  | 示例                                                     |
| :--------------------------------- | :------------------ | :----------------------------------------------------- |
| `claude`                           | 启动交互式 REPL          | `claude`                                               |
| `claude "query"`                   | 使用初始提示启动 REPL       | `claude "explain this project"`                        |
| `claude -p "query"`                | 通过 SDK 查询，然后退出      | `claude -p "explain this function"`                    |
| `cat file \| claude -p "query"`    | 处理管道内容              | `cat logs.txt \| claude -p "explain"`                  |
| `claude -c`                        | 继续最近的对话             | `claude -c`                                            |
| `claude -c -p "query"`             | 通过 SDK 继续           | `claude -c -p "Check for type errors"`                 |
| `claude -r "<session-id>" "query"` | 通过 ID 恢复会话          | `claude -r "abc123" "Finish this PR"`                  |
| `claude update`                    | 更新到最新版本             | `claude update`                                        |
| `claude mcp`                       | 配置模型上下文协议 (MCP) 服务器 | 请参阅 [Claude Code MCP 文档](/zh-CN/docs/claude-code/mcp)。 |
## CLI 标志
使用这些命令行标志自定义 Claude Code 的行为：
| 标志                               | 描述                                                                               | 示例                                                          |
| :------------------------------- | :------------------------------------------------------------------------------- | :---------------------------------------------------------- |
| `--add-dir`                      | 添加额外的工作目录供 Claude 访问（验证每个路径是否作为目录存在）                                             | `claude --add-dir ../apps ../lib`                           |
| `--allowedTools`                 | 除了 [settings.json 文件](/zh-CN/docs/claude-code/settings) 之外，应该在不提示用户许可的情况下允许的工具列表 | `"Bash(git log:*)" "Bash(git diff:*)" "Read"`               |
| `--disallowedTools`              | 除了 [settings.json 文件](/zh-CN/docs/claude-code/settings) 之外，应该在不提示用户许可的情况下禁止的工具列表 | `"Bash(git log:*)" "Bash(git diff:*)" "Edit"`               |
| `--print`, `-p`                  | 打印响应而不使用交互模式（有关编程使用详细信息，请参阅 [SDK 文档](/zh-CN/docs/claude-code/sdk)）               | `claude -p "query"`                                         |
| `--output-format`                | 指定打印模式的输出格式（选项：`text`、`json`、`stream-json`）                                      | `claude -p "query" --output-format json`                    |
| `--input-format`                 | 指定打印模式的输入格式（选项：`text`、`stream-json`）                                             | `claude -p --output-format json --input-format stream-json` |
| `--verbose`                      | 启用详细日志记录，显示完整的逐轮输出（在打印和交互模式下都有助于调试）                                              | `claude --verbose`                                          |
| `--max-turns`                    | 限制非交互模式下的代理轮数                                                                    | `claude -p --max-turns 3 "query"`                           |
| `--model`                        | 使用最新模型的别名（`sonnet` 或 `opus`）或模型的全名为当前会话设置模型                                      | `claude --model claude-sonnet-4-20250514`                   |
| `--permission-mode`              | 在指定的 [权限模式](iam#permission-modes) 下开始                                            | `claude --permission-mode plan`                             |
| `--permission-prompt-tool`       | 指定一个 MCP 工具来处理非交互模式下的权限提示                                                        | `claude -p --permission-prompt-tool mcp_auth_tool "query"`  |
| `--resume`                       | 通过 ID 恢复特定会话，或在交互模式下选择                                                           | `claude --resume abc123 "query"`                            |
| `--continue`                     | 在当前目录中加载最近的对话                                                                    | `claude --continue`                                         |
| `--dangerously-skip-permissions` | 跳过权限提示（谨慎使用）                                                                     | `claude --dangerously-skip-permissions`                     |
<Tip>
  `--output-format json` 标志对于脚本编写和自动化特别有用，允许您以编程方式解析 Claude 的响应。
</Tip>
有关打印模式（`-p`）的详细信息，包括输出格式、流式传输、详细日志记录和编程使用，请参阅 [SDK 文档](/zh-CN/docs/claude-code/sdk)。
## 另请参阅
* [交互模式](/zh-CN/docs/claude-code/interactive-mode) - 快捷键、输入模式和交互功能
* [斜杠命令](/zh-CN/docs/claude-code/slash-commands) - 交互会话命令
* [快速入门指南](/zh-CN/docs/claude-code/quickstart) - Claude Code 入门
* [常见工作流程](/zh-CN/docs/claude-code/common-workflows) - 高级工作流程和模式
* [设置](/zh-CN/docs/claude-code/settings) - 配置选项
* [SDK 文档](/zh-CN/docs/claude-code/sdk) - 编程使用和集成
# 交互模式
> Claude Code 会话中键盘快捷键、输入模式和交互功能的完整参考。
## 键盘快捷键
### 通用控制
| 快捷键           | 描述                | 上下文           |
| :------------ | :---------------- | :------------ |
| `Ctrl+C`      | 取消当前输入或生成         | 标准中断          |
| `Ctrl+D`      | 退出 Claude Code 会话 | EOF 信号        |
| `Ctrl+L`      | 清除终端屏幕            | 保留对话历史        |
| `上/下箭头`       | 导航命令历史            | 回调之前的输入       |
| `Esc` + `Esc` | 编辑上一条消息           | 双击 Escape 键修改 |
### 多行输入
| 方法       | 快捷键            | 上下文                    |
| :------- | :------------- | :--------------------- |
| 快速转义     | `\` + `Enter`  | 在所有终端中工作               |
| macOS 默认 | `Option+Enter` | macOS 上的默认设置           |
| 终端设置     | `Shift+Enter`  | 在 `/terminal-setup` 之后 |
| 粘贴模式     | 直接粘贴           | 用于代码块、日志               |
### 快速命令
| 快捷键     | 描述                    | 注释                                                |
| :------ | :-------------------- | :------------------------------------------------ |
| 开头的 `#` | 内存快捷键 - 添加到 CLAUDE.md | 提示文件选择                                            |
| 开头的 `/` | 斜杠命令                  | 参见 [斜杠命令](/zh-CN/docs/claude-code/slash-commands) |
## Vim 模式
使用 `/vim` 命令启用 vim 风格编辑，或通过 `/config` 永久配置。
### 模式切换
| 命令    | 动作           | 从模式    |
| :---- | :----------- | :----- |
| `Esc` | 进入 NORMAL 模式 | INSERT |
| `i`   | 在光标前插入       | NORMAL |
| `I`   | 在行首插入        | NORMAL |
| `a`   | 在光标后插入       | NORMAL |
| `A`   | 在行尾插入        | NORMAL |
| `o`   | 在下方打开新行      | NORMAL |
| `O`   | 在上方打开新行      | NORMAL |
### 导航（NORMAL 模式）
| 命令              | 动作         |
| :-------------- | :--------- |
| `h`/`j`/`k`/`l` | 向左/下/上/右移动 |
| `w`             | 下一个单词      |
| `e`             | 单词末尾       |
| `b`             | 上一个单词      |
| `0`             | 行首         |
| `$`             | 行尾         |
| `^`             | 第一个非空白字符   |
| `gg`            | 输入开头       |
| `G`             | 输入结尾       |
### 编辑（NORMAL 模式）
| 命令             | 动作          |
| :------------- | :---------- |
| `x`            | 删除字符        |
| `dd`           | 删除行         |
| `D`            | 删除到行尾       |
| `dw`/`de`/`db` | 删除单词/到末尾/向后 |
| `cc`           | 更改行         |
| `C`            | 更改到行尾       |
| `cw`/`ce`/`cb` | 更改单词/到末尾/向后 |
| `.`            | 重复上次更改      |
<Tip>
  在终端设置中配置您首选的换行行为。运行 `/terminal-setup` 为 iTerm2 和 VSCode 终端安装 Shift+Enter 绑定。
</Tip>
## 命令历史
Claude Code 为当前会话维护命令历史：
* 历史按工作目录存储
* 使用 `/clear` 命令清除
* 使用上/下箭头导航（参见上面的键盘快捷键）
* **Ctrl+R**：反向搜索历史（如果终端支持）
* **注意**：历史扩展（`!`）默认禁用
# 斜杠命令
> 在交互式会话中使用斜杠命令控制 Claude 的行为。
## 内置斜杠命令
| 命令                        | 用途                                                             |
| :------------------------ | :------------------------------------------------------------- |
| `/add-dir`                | 添加额外的工作目录                                                      |
| `/agents`                 | 管理用于专门任务的自定义 AI 子代理                                            |
| `/bug`                    | 报告错误（将对话发送给 Anthropic）                                         |
| `/clear`                  | 清除对话历史                                                         |
| `/compact [instructions]` | 压缩对话，可选择性地提供重点指令                                               |
| `/config`                 | 查看/修改配置                                                        |
| `/cost`                   | 显示令牌使用统计                                                       |
| `/doctor`                 | 检查您的 Claude Code 安装的健康状况                                       |
| `/help`                   | 获取使用帮助                                                         |
| `/init`                   | 使用 CLAUDE.md 指南初始化项目                                           |
| `/login`                  | 切换 Anthropic 账户                                                |
| `/logout`                 | 从您的 Anthropic 账户登出                                             |
| `/mcp`                    | 管理 MCP 服务器连接和 OAuth 身份验证                                       |
| `/memory`                 | 编辑 CLAUDE.md 内存文件                                              |
| `/model`                  | 选择或更改 AI 模型                                                    |
| `/permissions`            | 查看或更新[权限](/zh-CN/docs/claude-code/iam#configuring-permissions) |
| `/pr_comments`            | 查看拉取请求评论                                                       |
| `/review`                 | 请求代码审查                                                         |
| `/status`                 | 查看账户和系统状态                                                      |
| `/terminal-setup`         | 安装 Shift+Enter 键绑定用于换行（仅限 iTerm2 和 VSCode）                     |
| `/vim`                    | 进入 vim 模式，在插入模式和命令模式之间切换                                       |
## 自定义斜杠命令
自定义斜杠命令允许您将常用提示定义为 Markdown 文件，Claude Code 可以执行这些文件。命令按作用域（项目特定或个人）组织，并通过目录结构支持命名空间。
### 语法
```
/<command-name> [arguments]
```
#### 参数
| 参数               | 描述                                 |
| :--------------- | :--------------------------------- |
| `<command-name>` | 从 Markdown 文件名派生的名称（不包括 `.md` 扩展名） |
| `[arguments]`    | 传递给命令的可选参数                         |
### 命令类型
#### 项目命令
存储在您的仓库中并与您的团队共享的命令。在 `/help` 中列出时，这些命令在其描述后显示"(project)"。
**位置**：`.claude/commands/`
在以下示例中，我们创建 `/optimize` 命令：
```bash
# 创建项目命令
mkdir -p .claude/commands
echo "分析此代码的性能问题并建议优化：" > .claude/commands/optimize.md
```
#### 个人命令
在您所有项目中可用的命令。在 `/help` 中列出时，这些命令在其描述后显示"(user)"。
**位置**：`~/.claude/commands/`
在以下示例中，我们创建 `/security-review` 命令：
```bash
# 创建个人命令
mkdir -p ~/.claude/commands
echo "审查此代码的安全漏洞：" > ~/.claude/commands/security-review.md
```
### 功能
#### 命名空间
在子目录中组织命令。子目录决定命令的完整名称。描述将显示命令是来自项目目录（`.claude/commands`）还是用户级目录（`~/.claude/commands`）。
不支持用户级和项目级命令之间的冲突。否则，具有相同基本文件名的多个命令可以共存。
例如，`.claude/commands/frontend/component.md` 处的文件创建命令 `/frontend:component`，描述显示"(project)"。
同时，`~/.claude/commands/component.md` 处的文件创建命令 `/component`，描述显示"(user)"。
#### 参数
使用 `$ARGUMENTS` 占位符将动态值传递给命令。
例如：
```bash
# 命令定义
echo '按照我们的编码标准修复问题 #$ARGUMENTS' > .claude/commands/fix-issue.md
# 使用
> /fix-issue 123
```
#### Bash 命令执行
使用 `!` 前缀在斜杠命令运行之前执行 bash 命令。输出包含在命令上下文中。您\_必须\_包含带有 `Bash` 工具的 `allowed-tools`，但您可以选择允许的特定 bash 命令。
例如：
```markdown
---
allowed-tools: Bash(git add:*), Bash(git status:*), Bash(git commit:*)
description: 创建 git 提交
---
## 上下文
- 当前 git 状态：!`git status`
- 当前 git 差异（已暂存和未暂存的更改）：!`git diff HEAD`
- 当前分支：!`git branch --show-current`
- 最近的提交：!`git log --oneline -10`
## 您的任务
基于上述更改，创建一个 git 提交。
```
#### 文件引用
使用 `@` 前缀在命令中包含文件内容以[引用文件](/zh-CN/docs/claude-code/common-workflows#reference-files-and-directories)。
例如：
```markdown
# 引用特定文件
审查 @src/utils/helpers.js 中的实现
# 引用多个文件
比较 @src/old-version.js 与 @src/new-version.js
```
#### 思考模式
斜杠命令可以通过包含[扩展思考关键词](/zh-CN/docs/claude-code/common-workflows#use-extended-thinking)来触发扩展思考。
### 前置元数据
命令文件支持前置元数据，对于指定命令的元数据很有用：
| 前置元数据           | 用途                                                                                        | 默认值      |
| :-------------- | :---------------------------------------------------------------------------------------- | :------- |
| `allowed-tools` | 命令可以使用的工具列表                                                                               | 从对话中继承   |
| `argument-hint` | 斜杠命令预期的参数。示例：`argument-hint: add [tagId] \| remove [tagId] \| list`。此提示在用户自动完成斜杠命令时显示给用户。 | 无        |
| `description`   | 命令的简要描述                                                                                   | 使用提示的第一行 |
| `model`         | 特定模型字符串（参见[模型概述](/zh-CN/docs/about-claude/models/overview)）                               | 从对话中继承   |
例如：
```markdown
---
allowed-tools: Bash(git add:*), Bash(git status:*), Bash(git commit:*)
argument-hint: [message]
description: 创建 git 提交
model: claude-3-5-haiku-20241022
---
示例命令
```
## MCP 斜杠命令
MCP 服务器可以将提示作为斜杠命令公开，这些命令在 Claude Code 中变得可用。这些命令从连接的 MCP 服务器动态发现。
### 命令格式
MCP 命令遵循以下模式：
```
/mcp__<server-name>__<prompt-name> [arguments]
```
### 功能
#### 动态发现
MCP 命令在以下情况下自动可用：
* MCP 服务器已连接并处于活动状态
* 服务器通过 MCP 协议公开提示
* 在连接期间成功检索提示
#### 参数
MCP 提示可以接受服务器定义的参数：
```
# 不带参数
> /mcp__github__list_prs
# 带参数
> /mcp__github__pr_review 456
> /mcp__jira__create_issue "Bug title" high
```
#### 命名约定
* 服务器和提示名称被标准化
* 空格和特殊字符变成下划线
* 名称小写以保持一致性
### 管理 MCP 连接
使用 `/mcp` 命令来：
* 查看所有配置的 MCP 服务器
* 检查连接状态
* 使用启用 OAuth 的服务器进行身份验证
* 清除身份验证令牌
* 查看每个服务器的可用工具和提示
常用命令总结：
🧩 1. 启动 &初始化
🔐 2. 认证 & 配置（一次即可
# 设置 API Key（推荐写入 shell 启动脚本）
export ANTHROPIC_AUTH_TOKEN="sk-xxxxxxxx"
# 国内镜像（可选）
export ANTHROPIC_BASE_URL="https://api.aicodemirror.com/api/claudecode"
💬 3. 会话级命令（进入 claude> 交互后
📁 4. 文件 & 工程操作
🧪 5. 调试 & 诊断
🔄 6. 更新 & 卸载
# 升级
npm update -g @anthropic-ai/claude-code
# 卸载
npm uninstall -g @anthropic-ai/claude-code
欢迎读者朋友互动交流，我们提供专业的AI大模型应用开发和私有化部署，主要产品：DeepSeek私有化部署+RAG知识库+专业领域场景训练模型+AI智能体+AI助手+智能政务、警务解决方案，包含企业级应用开发和其他场景的定制化开发，欢迎咨询。

---

**处理完成时间**: 2025年10月09日
**文章字数**: 15474字
**内容类型**: 微信文章
**自动分类**: 技术教程
**处理状态**: ✅ 完成
