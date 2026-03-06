# 花了5小时，整理这3个月从0-1快速学习ClaudeCode保姆级教程

## 基本信息
- **标题**: 花了5小时，整理这3个月从0-1快速学习ClaudeCode保姆级教程
- **来源**: 微信公众号
- **作者**: 吴哥
- **发布时间**: 2025年09月20日
- **URL**: https://mp.weixin.qq.com/s/FPNNym4cobxvHfmBPH6VDg
- **分类**: 技术教程
- **标签**: #AI #GitHub #技术分析 #效率 #深度学习 #教程

## 内容摘要
   大家好，我是吴哥，专注AI编程、AI智能体。立志持续输出、帮助小白轻松上手AI编程和AI智能体。

写这篇文章目的是让新手快速上手ClaudeCode（以下：简称cc），并且能够快速切换自己钟意的大模型，基于一句详细的提示词就能够满足当下需求的实操案例。

本人核心内容

1.带你从0-1快速安装cc

2.切换CC模型几种常用方式

3.cc常用命令以及流量监控

4.快速上手cc实操案例

如果你使用cc很熟练且稳定，那么本文不适合你，为了节省时间你可以不往下看。

（一）ClaudeCode 安装
第一步，安装Node.js

官网地址：https://nodejs.cn/

如果...

## 完整内容

   大家好，我是吴哥，专注AI编程、AI智能体。立志持续输出、帮助小白轻松上手AI编程和AI智能体。

写这篇文章目的是让新手快速上手ClaudeCode（以下：简称cc），并且能够快速切换自己钟意的大模型，基于一句详细的提示词就能够满足当下需求的实操案例。

本人核心内容

1.带你从0-1快速安装cc

2.切换CC模型几种常用方式

3.cc常用命令以及流量监控

4.快速上手cc实操案例

如果你使用cc很熟练且稳定，那么本文不适合你，为了节省时间你可以不往下看。

（一）ClaudeCode 安装
第一步，安装Node.js

官网地址：https://nodejs.cn/

如果你安装过，可以忽略，如果你的版本不支持官方要求版本，可以卸载重装。

如何验证自己是否安装过？win + R 打开cmd命令行

C:\Users\44919>node -v

v20.19.2

C:\Users\44919>npm -v

11.4.2

吴哥下载地址：注意！我的系统是 win11 + 64位

https://registry.npmmirror.com/-/binary/node/v20.19.2/node-v20.19.2-x64.msi

第二步，安装ClaudeCode
 npm install -g @anthropic-ai/claude-code

第三步，配置环境变量

大部分模型切换只需要设置以下两个变量即可：

ANTHROPIC_BASE_URL

ANTHROPIC_AUTH_TOKEN

往下内容我会详细介绍使用DeepSeek3.1、GLM-4.5、千问和K2模型

如果你中意某个模型，优选第一、二种方式；反之，频繁切换选第三种；

敲黑板！win和mac命令不同

第一种方式：设置环境变量（win为例）

本质是：让操作系统全局固定这两个变量，后续进入命令窗口系统会自动读取到。

第一步：打开控制面板->环境变量

第二种方式：系统用户默认目录安装方式

本质是：Claudecode会到默认目录下找配置文件，后续进入命令窗口系统会自动读取配置文件。

windows 用户在C:\Users\你的用户名 目录下。

比如我的是：C:\Users\44919\.claude

mac 用户在 ~ 目录下。

进入.claude（安装时自动生成）在新建一个settings.json文件，之前如果添加过，直接修改即可。

.claude/settings.json文件 格式

{
        "env": {
                "ANTHROPIC_BASE_URL": "https://open.bigmodel.cn/api/anthropic",
                "ANTHROPIC_AUTH_TOKEN": "${YOUR_API_KEY}"
        }
}

第三种方式：直接命令会话添加
# mac命令
export ANTHROPIC_BASE_URL=https://open.bigmodel.cn/api/anthropic
export ANTHROPIC_AUTH_TOKEN=${YOUR_API_KEY}

## win命令
set ANTHROPIC_BASE_URL=https://open.bigmodel.cn/api/anthropic
set ANTHROPIC_AUTH_TOKEN=${YOUR_API_KEY}


注意！ 命令会话方式只对该窗口有效，关闭了得重新设置。

第四步，让Claudecode切换不同模型

如何快速切换不同模型？

1. 使用Deepseek

官方地址：https://api-docs.deepseek.com/zh-cn/guides/anthropic_api

api key 官方获取路径：https://platform.deepseek.com/api_keys

# 请求地址替换为DeepSeek API地址
export ANTHROPIC_BASE_URL=https://api.deepseek.com/anthropic
# 认证Token替换为你的API密钥
export ANTHROPIC_AUTH_TOKEN=${YOUR_API_KEY}

# 指定DeepSeek模型
export ANTHROPIC_MODEL=deepseek-chat
# 指定DeepSeek模型
export ANTHROPIC_SMALL_FAST_MODEL=deepseek-chat

2. 使用GLM-4.5

官方地址：https://docs.z.ai/guides/llm/glm-4.5

api key 官方获取路径：https://z.ai/manage-apikey/apikey-list


# 请求地址替换为模型 API地址
export ANTHROPIC_BASE_URL=https://open.bigmodel.cn/api/anthropic
# 认证Token替换为你的API密钥
export ANTHROPIC_AUTH_TOKEN=${YOUR_API_KEY}


3. 使用千问

官方注册：https://code.wenwen-ai.com/register?aff=TURW

api key 官方获取路径：https://code.wenwen-ai.com/console/token


# 请求地址替换为模型 API地址
ANTHROPIC_BASE_URL=https://code.wenwen-ai.com
# 认证Token替换为你的API密钥
export ANTHROPIC_AUTH_TOKEN=${YOUR_API_KEY}

4. 使用K2模型

api key 官方获取路径：https://platform.moonshot.cn/console/api-keys


# mac命令
export ANTHROPIC_BASE_URL=https://api.moonshot.cn/anthropic/
export ANTHROPIC_AUTH_TOKEN=${YOUR_API_KEY}

## win命令
set ANTHROPIC_BASE_URL=https://api.moonshot.cn/anthropic/
set ANTHROPIC_AUTH_TOKEN=${YOUR_API_KEY}

最终模型验证

命令行：claude正常进入，并且正常展示对应模式URL，说明切换成功。

（二）命令说明表格汇总
/init 

对真个项目的初始化，让AI快速理解你的项目

/clear 

清理上下会话的干扰，新建新的会话

/compact 

压缩上下文的聊天记录

/resume 

恢复你的某个会话，结合clear使用

/agents 

批量代理任务

/mcp 

管理你的mcp服务

/hooks

钩子配置

常用命令

一个让Claude进入狂飙模式，自动通过的命令

claude --dangerously-skip-permissions

监控使用量的命令：

npm install -g ccusage

看9月1号以后的用量

ccusage --daily--since 20250901

# 看实时  配合着狂飙模式，实时监控

ccusage blocks --live

（三）ClaudeCode 实战案例
第一个案例：黄金挖矿
# 角色（System）
你是一名资深前端游戏工程师与技术作家。你的任务是**一次性**产出一款“黄金挖矿”主题的**纯前端 HTML 小游戏**的全部可运行代码与说明文档。必须满足：清晰具体、上下文充足、按步骤结构化交付、可直接复制运行、移动端与桌面端自适配、无外部依赖（除字体与音效可选）。

# 目标（Clarity · 明确性）
- 交付一个“黄金挖矿（Gold Miner）”玩法的 HTML5 游戏：**抓钩摆动—按键/触控发射—抓取金块/石头/炸弹—计时/计分—关卡与商店**。
- 使用 **原生 HTML/CSS/JavaScript**（允许 `<canvas>` 或原生 SVG；不使用任何第三方框架/引擎）。
- 代码必须可在现代浏览器（Chrome/Edge/Safari/Firefox 最新两个大版本）**直接运行**。
- **输出格式固定且唯一**（见“输出格式规范”），**严禁**输出多余文字说明或与格式无关的内容。

# 背景与使用场景（Context · 上下文）
- 使用场景：在公众号文章或静态网站中嵌入小游戏，读者点击即可直接游玩。
- 目标受众：普通玩家/编程新人；希望“上手快、反馈爽、节奏紧凑”。
- 参考玩法关键点：
  1) 抓钩左右等角速度摆动；玩家**点击/按键**发射，抓到物体后回收至角色位置。
  2) 物体类型：**金块**（价值高、重量中）、**小金块**（价值中、重量轻）、**石头**（价值低/0，重量重）、**钻石**（高价值、很轻）、**炸弹**（命中则扣分或直接失败，可在商店购买用于丢弃重物）。
  3) 回收速度与物体重量相关（越重越慢）。
  4) 限时模式：每关 **{60} 秒**；达到目标金币即可进入下一关，否则失败。
  5) 关间商店：可用金币购买**炸弹、伸缩速度、摆动加速、时间加成**等。
  6) 分数/关卡/升级数据使用 **localStorage** 持久化（仅本地）。
- 资源限制：默认生成**无外链**版本（用 CSS 绘制或内联 SVG 表示金块与石头形状；音效使用 Web Audio 生成占位“哔/叮”）。

# 结构化交付（Structure · 结构化）
- 采用**分步骤**与**模板化**输出；**严格遵循**下面“输出格式规范”的**文件顺序与代码块标签**。
- 同时给出**README**与**测试清单**，确保一键复制后即可跑通与自测。

# 技术与设计规格（Clarity+Context）
1. 代码组织
   - 文件结构：`index.html`、`styles.css`、`game.js`、`assets/`（可空）、`README.md`
   - 模块化：`game.js` 内按模块组织（GameLoop、Input、Physics、Entities、UI、Store、Persistence）。
2. 画面与自适配
   - 画布尺寸自适配（`fit-contain`）：保持 16:9 基准，最小可用分辨率 320×180。
   - DPR 适配：考虑 devicePixelRatio，Canvas 按 DPR 放大后缩放绘制。
3. 控制方式
   - 桌面：`Space` 发射，`B` 投掷炸弹，`Esc` 暂停，`Enter` 确认。
   - 移动：屏幕**单击**发射，**双击**投炸弹，**长按**暂停/继续（或提供屏幕按钮 UI）。
4. 游戏循环
   - 使用 `requestAnimationFrame`，目标 60 FPS；提供帧时间平滑处理（delta clamping）。
5. 碰撞与回收
   - 抓钩为线段+末端圆头；与物体圆/矩形形状做**最简几何相交**；命中后，抓钩回收速度 = `baseSpeed / (1 + weightFactor)`.
6. UI/场景
   - HUD：计时、金币、当前关卡、背包（炸弹数）、目标金币。
   - 菜单：开始、失败、过关、商店界面（购买项不可负数，价格递增）。
7. 声音（可选）
   - 命中、收回、过关、失败，4 组短音效（Web Audio API 合成，占位）。
8. 可维护性
   - 常量集中在 `CONFIG`；关卡配置在 `LEVELS`；物体表 `OBJECT_TYPES`。
9. 访问性
   - 提供屏幕文字提示与按钮标签；按键能被提示；颜色对比度 ≥ 4.5:1。
10. 兼容性与安全
    - 不使用 `eval`，不访问网络，不收集隐私数据。

# 输出格式规范（务必严格遵循 · 不得增删标题）
按以下**顺序**输出 5 个代码块，每个代码块的开头一行必须是**文件名注释**（例如 `<!-- index.html -->`）：
1) `index.html`
2) `styles.css`
3) `game.js`
4) `README.md`
5) `assets/placeholder.svg`（最简示例，可内联一个金块或炸弹的 SVG）

# 验收标准（Definition of Done）
- 打开 `index.html` 即可游玩；**无控制台错误**。
- 在 {60} 秒内可体验到**至少 2 种物体**与**至少 1 次商店购买**。
- 成功通关至少 1 关，失败条件可被触发；`localStorage` 记录最高分/最高关。
- 自适配正常（桌面与手机）；帧率稳定（普通 PC/手机不会卡顿）。
- README 提供：玩法说明、控制方式、配置项、二次开发指引、自测方法。

# 质量门禁（质量与测试清单）
- 代码风格：注释说明关键模块与核心常量；函数名语义明确。
- 自测用例（在 README 中给出具体步骤与期望）：
  - 物体命中 → 回收 → 计分增长；
  - 购买炸弹 → 投掷 → 销毁屏幕上**最近/最重**的目标；
  - 倒计时结束 → 若未达目标金币 → 失败弹窗出现；
  - 达到目标金币 → 结算 → 商店 UI 可购买（金币扣减、属性生效）；
  - 刷新页面 → 最高分与最高关仍保留。
- 性能：每帧对象更新与绘制 O(n)；n 在默认配置下 ≤ 40。
- 可回滚：`CONFIG` 修改后不破坏基础玩法（采用默认值保护）。

# 示例配置（供实现时参考 · 需写入代码）
- 关卡 1：目标金币 500；物体：小金块(50,轻,多)、金块(150,中,少)、石头(0,重,若干)
- 关卡 2：目标金币 900；新增：钻石(300,极轻,稀有)、炸弹(命中-200 或直接失败/由设计自定)
- 商店：炸弹(100)、抓钩回收加速(+15%)、摆动速度(+10%)、时间加成(+10s)

# 模板与注释要求（Structure）
- 在 `game.js` 中提供以下**模块化结构**与函数签名（必须实现）：
  - `init()`、`startGame()`、`update(dt)`、`render(ctx)`、`resetLevel(levelIndex)`、`spawnObjects(levelConfig)`、`handleInput()`、`openShop()`、`applyPurchase(item)`、`saveProgress()`、`loadProgress()`
- 提供 `CONFIG`、`LEVELS`、`OBJECT_TYPES` 常量对象，**中文注释**解释关键字段（如重量、价值、半径/宽高、颜色、概率）。
- 在 `README.md` 中提供“二次开发”章节，说明如何新增物体与关卡。

# 禁止事项
- 禁止使用任何第三方库/框架（含 jQuery、Pixi、Phaser 等）。
- 禁止输出与上述“输出格式规范”无关的额外文字。
- 禁止只给伪代码或不完整实现。

# 开始生成
请**严格**按“输出格式规范”的顺序，输出 5 个代码块（index.html → styles.css → game.js → README.md → assets/placeholder.svg）。


第二个案例：打造个人专属任务管理器
帮我生成一个个人每日待办事项网页，要求能在HTML格式能直接在浏览器上运行的。


视频加载失败，请刷新页面再试

 刷新

我让CC生成到一个index.html网页中，这时候我随时在微信打开这个网页随时维护我自己需求的个性化任务处理，很方便！

如果你也需要打造个人专属任务管理器的详细提示词，欢迎找吴哥领取，链接交流。

这是今天分享知识点，感谢阅读。




  如果你对AI编程感兴趣，欢迎交流，进群领取福利。要是觉得今天这碗饭喂得够香，随手点个赞、在看、转发三连吧！

---

**处理完成时间**: 2025年10月09日
**文章字数**: 6876字
**内容类型**: 微信文章
**自动分类**: 技术教程
**处理状态**: ✅ 完成
