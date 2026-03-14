# AutoMouser：AI Chrome扩展程序，实时跟踪用户的浏览器操作，自动生成自动化操作脚本

## 基本信息
- **标题**: AutoMouser：AI Chrome扩展程序，实时跟踪用户的浏览器操作，自动生成自动化操作脚本
- **来源**: 微信公众号
- **作者**: Airmomo
- **发布时间**: 2025年01月17日
- **URL**: https://mp.weixin.qq.com/s?__biz=MzkyMzc2MDY1OA==&mid=2247491944&idx=1&sn=717c5536f182d7de451368fc15cfd05d&chksm=c0ef6059caec0303e27d5a8ef10a6352bcc76a723bb5a1875a46926c0207179ab65f953d1aea&mpshare=1&scene=24&srcid=0118NPeYKwNUd3rLuo0raIkt&sharer_shareinfo=2266ab0261cb78e376268c291b79c44f&sharer_shareinfo_first=2266ab0261cb78e376268c291b79c44f#rd
- **分类**: AI技术
- **标签**: #AI #GitHub #工具推荐 #技术分析

## 内容摘要
🚀 快速阅读
功能：实时跟踪用户交互行为，自动生成Selenium测试代码。
技术：基于OpenAI的GPT模型，支持多种XPath生成策略。
应用：适用于自动化测试脚本生成和用户交互行为记录。
正文（附运行示例）
AutoMouser 是什么
autotrain-advanced

AutoMouser是一款Chrome扩展程序，能够智能地跟踪用户的浏览器操作，如点击、拖动、悬停等，并将这些操作转化为结构清晰、易于维护的Python Selenium脚本。通过记录用户的交互行为，AutoMouser简化了自动化测试的创建过程，提高了测试效率。

AutoMouser的核心功能是借助OpenA...

## 完整内容

🚀 快速阅读
功能：实时跟踪用户交互行为，自动生成Selenium测试代码。
技术：基于OpenAI的GPT模型，支持多种XPath生成策略。
应用：适用于自动化测试脚本生成和用户交互行为记录。
正文（附运行示例）
AutoMouser 是什么
autotrain-advanced

AutoMouser是一款Chrome扩展程序，能够智能地跟踪用户的浏览器操作，如点击、拖动、悬停等，并将这些操作转化为结构清晰、易于维护的Python Selenium脚本。通过记录用户的交互行为，AutoMouser简化了自动化测试的创建过程，提高了测试效率。

AutoMouser的核心功能是借助OpenAI的GPT模型，将用户的浏览器操作自动转化为Selenium测试代码。这使得开发者和测试工程师能够快速生成自动化测试脚本，减少了手动编写测试脚本的时间和复杂性。

AutoMouser 的主要功能
实时交互跟踪：能实时捕捉用户的浏览器操作，包括点击、输入、滚动等，精准地记录下用户在网页上的各种交互行为。
自动代码生成：借助OpenAI的GPT模型，将记录下来的用户操作自动转化为Selenium测试代码，生成Python Selenium脚本。
智能输入整合：对用户的输入操作进行智能整合，优化代码结构，使生成的测试脚本更加简洁、高效。
窗口大小变化检测：能检测浏览器窗口的大小变化，确保生成的测试代码能够适应不同的窗口尺寸。
JSON动作日志导出：支持将用户的交互数据导出为JSON格式的动作日志文件，方便用户对原始数据进行查看、分析和进一步处理。
多种XPath生成策略：采用多种XPath生成策略，能更准确地定位网页元素，提高测试的准确性和可靠性。
代码结构优化：输出的Selenium测试代码结构清晰、整洁，易于阅读和理解，方便开发人员进行后续的开发和维护工作。
如何运行 AutoMouser
1. 安装扩展程序
访问GitHub仓库，克隆该仓库或下载源代码。
打开Chrome浏览器并导航至chrome://extensions/页面。
在右上角启用“开发者模式”。
点击“加载未打包的”并选择扩展目录。
在background.js中配置你的OpenAI API密钥。
2. 使用扩展程序
点击Chrome工具栏中的AutoMouser图标开始录制。
执行你想要自动化的操作。
再次点击图标停止录制并生成代码。
下载两个文件：tracking_log.json（原始交互数据）和selenium_test.py（生成的Selenium测试脚本）。
在Python环境中检查并运行生成的Selenium代码。
资源
GitHub 仓库：https://github.com/guoriyue/AutoMouser

❤️ 如果你也关注 AI 的发展现状，且对 AI 应用开发非常感兴趣，我会每日分享大模型与 AI 领域的最新开源项目和应用，提供运行实例和实用教程，帮助你快速上手AI技术，欢迎关注我哦！

---

**处理完成时间**: 2025年10月09日
**文章字数**: 1258字
**内容类型**: 微信文章
**自动分类**: AI技术
**处理状态**: ✅ 完成
