---
title: "让Claude、Gemini、Codex共用一套大脑（Skills）,5分钟一劳永逸"
source: wechat
url: https://mp.weixin.qq.com/s/-sWsMS_6aGqXAgpRrdrQww
author: 懒猫爱摸鱼
pub_date: 2026年1月15日 19:19
created: 2026-01-17 20:09
tags: [AI, 编程]
---

# 让Claude、Gemini、Codex共用一套大脑（Skills）,5分钟一劳永逸

> 作者: 懒猫爱摸鱼 | 发布日期: 2026年1月15日 19:19
> 原文链接: [点击查看](https://mp.weixin.qq.com/s/-sWsMS_6aGqXAgpRrdrQww)

---

最近我在折腾各种 AI 编程工具，发现了一个特别让人头大的问题。当我切换工具的时候，重要的配置过不来！

你现在的电脑里，是不是也躺着好几套重复的 AI 配置？

Claude Code 认准 .claude/skills 和 CLAUDE.md。
OpenAI Codex 只认 .codex/skills 和 AGENTS.md。
Gemini CLI 又要搞一套 .gemini/skills。

每开一个新项目，就得把这些文件复制粘贴三遍。哪天优化了一个 Skill，还得记得去另外两个地方改。只要漏了一处，AI 就开始跟你装傻：“对不起，我不知道你在说什么技能。”

是不是很头疼?

为了偷懒（效率），我钻进 Windows 底层，找到了一个 “一次配置，全端同步” 的终极方案。

01
别再复制了，用文件影分身吧

先想明白一件事：我们要解决的不是“怎么复制得更快”，而是“如何只存一份”。

虽然你有 Claude、Codex、Gemini 三个工具，看起来需要三份配置文件，但它们都是一个类型的工具，它们其实应该共用同一个“大脑”。







Windows 有两个现成工具：

HardLink（硬链接）：多个文件名指向同一份数据
Junction（目录联接）：多个文件夹指向同一个目录

Note

不是多写几份配置，而是让系统帮你只存一份。

02
这样做有什么好处？
实时同步：你改了 A，B 瞬间就变了。没有任何延迟，不需要任何后台软件。
安全防删：哪怕你不小心删了其中一个文件，本体依然稳如泰山。
降维打击：这是操作系统底层的能力，不管那些 AI 工具怎么更新，都绕不开这个逻辑。

03
5分钟搞定“全自动”同步

原理听不懂没关系，会用就行。我把这套逻辑封装成了一个 PowerShell 脚本，你只需要做一次配置，剩下的交给系统。

第一步：打开你电脑的命令行

按下 Win + X，打开 PowerShell。输入下面这行命令，打开你的配置文件：

notepad $PROFILE


如果系统提示找不到文件，就选“是”新建一个。

第二步：复制粘贴这段命令

重要提醒:

✅ 如果配置文件是空白的 → 直接粘贴全部内容
✅ 如果已有其他配置 → 在文件末尾追加下面的代码
⚠️ 保存后记得关闭记事本,否则可能不生效

现在,把下面这段代码粘贴进去:


```powershell
# --- Claude Code & Codex & Gemini 统一工作流 ---

function Invoke-AISync {
    <#
    .SYNOPSIS
    一键同步多端 AI 技能库与指令文件
    #>
    process {
        $curr = $pwd.Path
        Write-Host ">>> 正在同步 AI 项目配置: $curr" -ForegroundColor Cyan

        # 1. 核心指令文件同步: CLAUDE.md (源) -> AGENTS.md (映射)
        # 采用硬链接，确保磁盘只有一份文件，两处实时同步
        if (Test-Path "CLAUDE.md") {
            if (Test-Path "AGENTS.md") { Remove-Item "AGENTS.md" -Force -ErrorAction SilentlyContinue }
            New-Item -ItemType HardLink -Path "AGENTS.md" -Target "CLAUDE.md" | Out-Null
            Write-Host " [√] AGENTS.md (HardLink) 已建立" -ForegroundColor Green
        }

        # 2. 技能库文件夹同步: .claude/skills (源) -> .codex & .gemini (映射)
        # 采用 Junction，让不同 AI 工具共享同一个技能池
        $srcSkills = ".claude\skills"
        if (Test-Path $srcSkills) {
            $targets = @(".codex\skills", ".gemini\skills")
            foreach ($t in $targets) {
                # 自动补全可能不存在的父目录 (.codex / .gemini)
                $parent = Split-Path $t
                if (!(Test-Path $parent)) { New-Item -ItemType Directory -Path $parent -Force | Out-Null }

                # 清理旧路径并建立 Junction 联接
                if (Test-Path $t) { Remove-Item -Recurse -Force $t -ErrorAction SilentlyContinue }
                New-Item -ItemType Junction -Path $t -Target $srcSkills | Out-Null
                Write-Host " [√] $t (Junction) 已同步" -ForegroundColor Green
            }
        } else {
            Write-Host " [!] 未找到源技能库 .claude\skills，跳过文件夹映射。" -ForegroundColor Yellow
        }
    }
}

# 设置简短别名，命令行输入 aisync 即可触发
Set-Alias aisync Invoke-AISync

如果你用的是其他工具，把这个脚本发给AI让AI帮你改一下即可！
第三步：重启终端，见证奇迹

重启你的 PowerShell，或者输入 . $PROFILE 让配置生效。

以后，每当你开始一个新项目：

写好你的 CLAUDE.md（作为母本）。
放好你的 .claude/skills。
在你的项目文件夹输入 aisync，回车。

瞬间，你的 Codex 和 Gemini 就全部自动配置好了！

Tip

一次配置，全端同步。以后每个新项目只要 1 个指令就能搞定。

04
为什么我推荐你一定要试试？

可能有朋友会问：“我用个同步软件不行吗？比如用git同步？”

我还真不建议。

同步软件有延迟：文件多了容易冲突。
脚本复制太笨重：改了源文件，还得手动再运行一次脚本。

而我们用的这个 HardLink 方案，是 Windows 文件系统自带的功能。它不需要任何额外的软件，不占后台内存，速度快到飞起。

End

工具是为了让你更高效,而不是让你成为工具的奴隶。
搞定了重复配置的问题。接下来，我们就可以把你会用的所有 Prompt、技能、模板，都慢慢搬运到 .claude/skills 这个统一的池子里。维护好你与AI协作的SOP，让你的数字员工更聪明一点点！
毕竟，省下来的时间，才是真正属于你自己的生活。

如果你也在用多个Agent工具,记得试试这个脚本!
当然，如果你有更好的方案，也欢迎告诉我！

---
*导入时间: 2026-01-17 20:09:09*
