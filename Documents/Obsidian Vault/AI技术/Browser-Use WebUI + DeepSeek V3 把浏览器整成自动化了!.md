# Browser-Use WebUI + DeepSeek V3 把浏览器整成自动化了!

## 基本信息
- **标题**: Browser-Use WebUI + DeepSeek V3 把浏览器整成自动化了!
- **来源**: 微信公众号
- **作者**: AI智见录
- **发布时间**: 2025年01月07日
- **URL**: https://mp.weixin.qq.com/s?__biz=MzU3NTg5MjU1Mw==&mid=2247489068&idx=1&sn=02b186b7336c90cb841179d63bec31b6&chksm=fccbe2b7af98074601e9490fde7079ed698fa6677888fef8ec372afc8dfaff0ff5fb9d3c4bae&mpshare=1&scene=24&srcid=0108O06Ru7X2Tmjm0izzFl01&sharer_shareinfo=522380b675f94a8d0da20bf20325233d&sharer_shareinfo_first=522380b675f94a8d0da20bf20325233d#rd
- **分类**: AI技术
- **标签**: #AI #GitHub #工具推荐 #技术分析 #效率 #深度学习 #开源

## 内容摘要
Github 上有个开源项目 browser-use，这个项目最近老火了，目前拥有 11K Star，它的作用是将 AI Agent 与浏览器链接起来从而实现由 AI 驱动的浏览器自动化。接入也很简单，不过要写一点代码。

这两天有个老哥基于 browser-use，写了个 UI 界面，在体验层面同时也做了一些功能扩展，让它的使用门槛更低了，目前已在 Github 开源 browser-use-webui。

browser-use-webui 主要功能
提供了全新的网页界面，简单好用，方便操作。
支持更多大语言模型，比如 Gemini、OpenAI、Azure 等，哦，还有最近爆火的国产大模...

## 完整内容

Github 上有个开源项目 browser-use，这个项目最近老火了，目前拥有 11K Star，它的作用是将 AI Agent 与浏览器链接起来从而实现由 AI 驱动的浏览器自动化。接入也很简单，不过要写一点代码。

这两天有个老哥基于 browser-use，写了个 UI 界面，在体验层面同时也做了一些功能扩展，让它的使用门槛更低了，目前已在 Github 开源 browser-use-webui。

browser-use-webui 主要功能
提供了全新的网页界面，简单好用，方便操作。
支持更多大语言模型，比如 Gemini、OpenAI、Azure 等，哦，还有最近爆火的国产大模型 DeepSeek，未来还会加更多。
支持用自己的浏览器，不用再反复登录，还能录屏。
定制了更智能的 Agent，通过优化后的提示让浏览器使用更高效。
安装

这个项目已在 Github 开源，想玩的都可以试试，用 Python 写的，版本必须在 3.11 以上。

首先，让我们拉取项目到本地
git clone git@github.com:warmshao/browser-use-webui.git # 拉取项目
cd browser-use-webui # 进到这个项目里

安装依赖项：
pip install browser-use

安装 Playwright
playwright install

安装项目依赖
pip install -r requirements.txt

配置环境变量

基于 .env.example 复制一个 .env 文件，并在 .env 文件中修改以下信息

# 路径 Chrome 浏览器路径（检查下自己的路径），例如
# Mac OS "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
# Windows "C:\Program Files\Google\Chrome\Application\chrome.exe"
CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

# 浏览器的用户数据路径，例如
# Mac OS "/Users/<YourUsername>/Library/Application Support/Google/Chrome"
# Windows "C:\Users\<YourUsername>\AppData\Local\Google\Chrome\User Data"
CHROME_USER_DATA="/Users/<YourUsername>/Library/Application Support/Google/Chrome"

# 还有一些大模型的 API Key 也要改
...

启动运行

执行如下命令启动

python webui.py --ip 127.0.0.1 --port 7788


启动成功如下所示：

浏览器访问 http://127.0.0.1:7788/，看到如下界面就成功了

配置
配置 Agent

注意，这里的 Use Vision，默认是选中状态，如果使用的 DeepSeek 不能勾选，因为 DeepSeek 不支持视觉输入。

配置要用的大模型

例如，下面我用的是 deepseek。

关于浏览器的一些设置
任务设置

输入要执行的任务就可以点击 Run Agent 了

Demo 演示

Demo 演示可以看以下视频

欢迎关注 “AI智见录”，为您分享更多精彩 AI 内容。

期文章推荐

一起来聊聊 Cursor、Copilot、Windsurf、V0...

我把最近爆火的 DeepSeek-V3 接到了 Cursor！

Cursor Yolo 模式太棒了！

Cursor发布0.44版本：全面提升Agent能力！

感受下 Cursor Agent 的强大魅力！

Github Copilot 靠什么反击 Cursor？

刚刚！GitHub Copilot 宣布免费

尤大亲自转发点赞！Github Copilot Edits 有何魔力？

字节最新开源：让 AI 给你写 UI 自动化测试

Cursor 的最佳搭档来了，专治不会写提示词！

- 这是底线 -

扫描以下二维码加小编微信，备注 “ai”，一起交流 AI 技术！

---

**处理完成时间**: 2025年10月09日
**文章字数**: 1888字
**内容类型**: 微信文章
**自动分类**: AI技术
**处理状态**: ✅ 完成
