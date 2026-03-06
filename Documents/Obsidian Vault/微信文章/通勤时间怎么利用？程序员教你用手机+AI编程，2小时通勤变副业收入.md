---
title: "通勤时间怎么利用？程序员教你用手机+AI编程，2小时通勤变副业收入"
source: wechat
url: https://mp.weixin.qq.com/s/lDRhFMwdChcCq5Cvje4SxA
author: 编程挺好玩
pub_date: 2025年11月13日 05:00
created: 2026-01-17 21:15
tags: [AI, 编程]
---

# 通勤时间怎么利用？程序员教你用手机+AI编程，2小时通勤变副业收入

> 作者: 编程挺好玩 | 发布日期: 2025年11月13日 05:00
> 原文链接: [点击查看](https://mp.weixin.qq.com/s/lDRhFMwdChcCq5Cvje4SxA)

---

记得标⭐️哦~ 点击蓝字 关注我

小胖，一个爱折腾的开发者，专注于agent、rag开发，熟练dify、coze工作流搭建。




大家好，我是小胖，今天要和大家分享一个充分利用AI编程服务的好办法！

说实话，我对各种AI编程服务都很感兴趣。GLM、昨天刚发布的豆包coding plan、Claude...我手上现在有好几个coding plan，每个都是5小时周期刷新额度。

但平时主要在电脑上写代码，很多时间都没机会用上这些AI编程服务，感觉这些优质资源闲置了，挺可惜的。

更郁闷的是，经常遇到这种场景：

地铁上突然有个灵感想写个小程序，但手边只有手机
出差在酒店里想改个紧急bug，但没带电脑
通勤路上有大把碎片时间，却只能刷短视频

这些问题，相信很多程序员朋友都遇到过吧！

后来我就琢磨，能不能在手机上也折腾一下？毕竟现在手机性能也不差，而且通勤、出差的时候，有大把碎片时间可以利用。

经过几天的折腾（踩了不少坑），我终于搞定了一套完整的手机编程环境，今天就来给大家保姆级分享！（内容很长，可以收藏一下慢慢看~）

Part 1: Termux安装（2025年最新避坑指南）

首先说重点：千万不要从Google Play下载Termux！

我一开始就在这里踩了大坑，Play Store的版本早就过时了，好多功能都不能用。我当时折腾了半天，各种报错查原因，最后才发现问题出在这里。

正确的安装方式有两种：

方法一：GitHub直接下载

访问：https://github.com/termux/termux-app/releases
下载最新的APK文件安装

方法二：后台获取

后台回复"termux"，我给你发安装包

（推荐方法二，更简单方便！）

安装完成后，打开Termux，你会看到一个很熟悉的终端界面。到这一步，恭喜你，你的手机已经是一个迷你Linux系统了！

Part 2: 环境配置（zsh美化+必备工具）

默认的bash shell确实有点丑，而且功能比较基础。咱们来换上更好用的zsh，顺便美化一下终端：

# 先更新一下包管理器（老规矩）
pkg update && pkg upgrade

# 安装zsh（这个必装）
pkg install zsh

# 安装git（等下要用到的工具）
pkg install git

# 安装curl（下载东西用）
pkg install curl

# 安装vim（编辑配置文件）
pkg install vim

# 安装tmux（多窗口管理神器）
pkg install tmux


接下来安装oh-my-zsh，这个神器可以让终端瞬间变得超级好看：

# 安装oh-my-zsh
sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"


安装完成后，重启一下Termux，你就会看到全新的界面了！

如果想更酷一点，可以安装Powerlevel10k主题：

# 克隆主题
git clone --depth=1 https://github.com/romkatv/powerlevel10k.git ${ZSH_CUSTOM:-$HOME/.oh-my-zsh/custom}/themes/powerlevel10k

# 配置主题
sed -i 's/ZSH_THEME="robbyrussell"/ZSH_THEME="powerlevel10k\/powerlevel10k"/' ~/.zshrc

# 重新加载配置
source ~/.zshrc


第一次运行会让你做一些配置，按照提示一步步来就行，配置出来的终端效果绝对让你惊艳！

Part 3: Claude Code配置（多coding plan快速切换）

这一步是整个配置的核心，我们要搞定Claude Code的安装，并且支持多个AI服务的快速切换。

首先安装Node.js，Claude Code依赖它：

# 安装Node.js
pkg install nodejs

# 验证安装
node --version
npm --version


然后安装Claude Code：

# 安装Claude Code CLI
npm install -g @anthropic-ai/claude-code


接下来是配置AI服务。我发现了一个更优雅的多模型切换方案！

性价比推荐：

GLM 4.6：最便宜的一档20￥/月，120次prompt/5小时，日常使用效果也不差（可以点击原文查看链接）
豆包coding plan：刚发布，性价比也不错，首月只要9.9！豆包编程模型9.9元杀入，cursor 和 Claude Code还香吗？
其他国产模型：价格更便宜，适合大量使用

配置步骤： 直接在zsh配置文件中添加函数，一个命令就能切换模型：

# 编辑zsh配置
vim ~/.zshrc


在文件末尾添加以下函数：

# GLM模型配置
cc-glm() {
    echo "🚀 启动Claude Code环境，GLM模型..."
  export ANTHROPIC_BASE_URL="https://open.bigmodel.cn/api/anthropic"
    export ANTHROPIC_AUTH_TOKEN="你的GLM_API_KEY"
    export API_TIMEOUT_MS="3000000"
    export CLAUDE_CODE_DISABLE_NONESSENTIAL_TRAFFIC="1"
    claude "$@"
}

# 豆包模型配置
cc-doubao() {
    echo "🚀 启动Claude Code环境，豆包模型..."
    export ANTHROPIC_BASE_URL=""
    export ANTHROPIC_AUTH_TOKEN="你的豆包_API_KEY"
    export ANTHROPIC_MODEL="doubao-code-model"
    claude "$@"
}

# Kimi模型配置
cc-kimi() {
    echo "🚀 启动Claude Code环境，Kimi模型..."
    export ANTHROPIC_BASE_URL="https://api.kimi.com/coding/"
    export ANTHROPIC_AUTH_TOKEN="你的Kimi_API_KEY"
    export ANTHROPIC_MODEL=kimi-for-coding
    claude "$@"
}


重新加载配置：

source ~/.zshrc


使用方法：

cc-glm        # 使用GLM模型
cc-doubao     # 使用豆包模型
cc-kimi       # 使用Kimi模型

	

这种方式比写配置文件更简单，而且切换速度快，一个命令搞定！

Part 4: 快捷键优化（shift键等实用配置）

手机上编程最烦人的就是键盘操作，特别是shift键的问题。这里有几个解决方案：

方法一：外接蓝牙键盘这是最直接的方案，买个便携的蓝牙键盘，编程体验立马提升90%。

方法二：Termux快捷键配置在Termux里可以自定义一些快捷键：

# 修改快捷键配置
vim ~/.termux/termux.properties


添加以下配置：

# 自定义快捷键
extra-keys = [['ESC','/','-','HOME','UP','END','PGUP','TAB'],['CTRL','ALT','LEFT','DOWN','RIGHT','PGDN','BKSP']]

# 启用额外的键
use-fullscreen-workspace = true


重启Termux后，你就会看到多了一排快捷键，编程效率大幅提升！

Part 5: 配置完成！开始你的手机编程之旅

到这里，你的手机开发环境就基本搭建完成了！

你可以开始：

用Claude Code、GitHub Copilot、Codex等AI编程工具写代码
用tmux进行多窗口编程
随时随地提交代码到Git
充分利用那些AI编程额度

（这里可以放几张实际使用效果图，展示手机编程的界面）

建议的第一个项目：可以从简单的Python脚本开始，比如写个自动化小工具，或者处理一些数据文件。

我一周的使用体验

说真的，现在想想，我怎么像牛马一样，居然想着用手机来写代码...😂

但抱着试试看的心态用了一周后，发现还真解决了我不少痛点：

通勤时间利用：每天地铁上1小时，现在我都能用来写代码、调试程序，一周下来就是5个小时的额外开发时间！

应急编程：前几天晚上朋友找我要改个紧急bug，当时我在外面吃饭，直接在手机上就搞定了，避免了一场尴尬。

额度充分利用：以前那些AI编程额度经常浪费掉，现在手机+电脑双线作战，5小时额度基本都能用完。

灵感不丢失：现在有什么想法，随时随地都能立刻实现，不用等回到家再折腾。

当然，手机编程还是有一些小限制：

屏幕确实小了点，长时间看眼睛会有点累（有钱了直接买三折叠，屏幕直接翻倍😂） 键盘操作不如电脑方便，复杂项目还是更适合电脑（不过配个蓝牙键盘就解决大半问题了）

至于多窗口问题，有个神器叫tmux：

# 安装tmux
pkg install tmux


简单说下常用操作：

tmux              # 启动
Ctrl+b c          # 新窗口
Ctrl+b |          # 左右分屏（需要配置）
Ctrl+b "          # 上下分屏
Ctrl+b 方向键     # 切换窗口
Ctrl+b d          # 分离会话（后台运行）


有了tmux，你可以一边编辑代码一边运行测试，体验瞬间提升80%！

	

补充一个实用技巧：Git同步既然已经安装了git，你可以随时随地提交代码，回家电脑上pull一下就能继续开发。这样手机和电脑就能无缝衔接了！

但总的来说，这些限制完全不影响它作为一个"应急开发环境"的价值！

总结

经过这一周的折腾，我觉得手机编程真的不是噱头，而是解决了实实在在的痛点：

成本效益超高：把那些浪费掉的AI编程额度充分利用起来，每一分钱都花得值
场景完美适配：通勤、出差、排队等候，这些碎片时间都能用来写代码
技术门槛很低：跟着这个教程一步步来，30分钟就能搞定
实用性超出预期：虽然不如电脑方便，但应急开发、小项目写写完全够用，甚至可以用来写写小说，写写文章~

特别是对于像我这样买了好几个AI编程plan的朋友来说，这简直是打开了新世界的大门——花小钱享受大功能，而且随时随地都能Coding！（什么牛马！）

说实话，作为一个有经验的开发者，第一次在地铁上用手机成功调试完一段代码时，那种感觉还是挺新鲜的！发现自己随时随地把想法变成现实，这种自由度确实很爽。

⚠️ 最后说个严肃的事（就这一段！）

玩归玩，但千万别手滑！Termux在手机上开文件权限要注意，下面这些坑千万别踩：

千万别rm -rf / - 除非你想体验"一键变砖"的刺激（开玩笑的！）
操作前先pwd一下 - 确认自己在哪，别在系统目录里乱搞

想试试的朋友，这里有几点小建议：

新手建议先在电脑上熟悉一下命令，再在手机上操作，这样会更顺利一些。

如果在配置过程中遇到问题，可以在下面留言，我会尽量帮大家解答~

也欢迎有经验的朋友们分享你们有趣的玩法和技巧，我们一起交流学习！

（题外话：觉得这篇文章对你有用的话，别忘了点赞支持一下，你的互动是我继续分享的动力~）

后台回复"termux"，我可以分享一些常用的配置文件和脚本给大家！

感谢您的阅读，我们下次见~

---
*导入时间: 2026-01-17 21:15:00*
