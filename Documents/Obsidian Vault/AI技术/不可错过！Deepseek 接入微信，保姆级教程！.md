# 不可错过！Deepseek 接入微信，保姆级教程！

## 基本信息
- **标题**: 不可错过！Deepseek 接入微信，保姆级教程！
- **来源**: 微信公众号
- **作者**: 关注科技资讯
- **发布时间**: 2025年02月08日
- **URL**: https://mp.weixin.qq.com/s/Agh82qM1E3r0jaZzFz5u-Q
- **分类**: AI技术
- **标签**: #AI #GitHub #工具推荐 #行业观察

## 内容摘要
大家好，我是老金。最近很多朋友反馈，错过了不少 AI 最新动态，没能第一时间掌握行业风向。 建议星标+置顶本公众号，每天劲爆推送不错过，随时站在人工智能的最前沿 🚀

Deepseek 完美接入微信，人人可学，打造自己的 “微信 AI Agent” ！

这篇文章，将手把手教你利用 Docker 将 Deepseek 接入微信。简单几步，让你的微信尽享 Deepseek 带来的智能体验与无限乐趣！

硬件要求：


🔹 一台电脑或者服务器


软件要求：

🔹 有效的 API Key。我推荐全模型 API Key，不仅支持 Deepseek，还支持 gpt-4o、o3-mini 等众多顶级模型...

## 完整内容

大家好，我是老金。最近很多朋友反馈，错过了不少 AI 最新动态，没能第一时间掌握行业风向。 建议星标+置顶本公众号，每天劲爆推送不错过，随时站在人工智能的最前沿 🚀

Deepseek 完美接入微信，人人可学，打造自己的 “微信 AI Agent” ！

这篇文章，将手把手教你利用 Docker 将 Deepseek 接入微信。简单几步，让你的微信尽享 Deepseek 带来的智能体验与无限乐趣！

硬件要求：


🔹 一台电脑或者服务器


软件要求：

🔹 有效的 API Key。我推荐全模型 API Key，不仅支持 Deepseek，还支持 gpt-4o、o3-mini 等众多顶级模型，获取地址：https://dev.hkgpt.top/shop/46

🔹 Docker 和 Docker Compose


以 Linux 为例，接下来跟随教程操作

步骤一、安装 Docker

打开终端，输入以下命令检查：

bashdocker -vdocker-compose version

如果看到版本号输出，说明已安装；否则，请安装：


sudo apt update && sudo apt install -y ca-certificates curl gnupg && \
sudo install -m 0755 -d /etc/apt/keyrings && \
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo tee /etc/apt/keyrings/docker.asc > /dev/null && \
sudo chmod a+r /etc/apt/keyrings/docker.asc && \
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null && \
sudo apt update && sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin && \
sudo systemctl enable --now docker && \
sudo usermod -aG docker $USER && newgrp docker && \
docker --version

步骤二、下载并配置 compose 文件

下载本次项目的 docker-compose.yml 文件：

git clone https://github.com/zhayujie/chatgpt-on-wechatcd chatgpt-on-wechat/

打开 chatgpt-on-wechat 目录，找到并打开 docker-compose.yml 文件，按照以下设置填入你的 API Key，并调整端口设置。


yaml
version: '3'
services:
  chatgpt-on-wechat:
    image: zhayujie/chatgpt-on-wechat:latest
    environment:
      - OPEN_AI_API_BASE=https://cn.gptapi.asia/v1
      - OPEN_AI_API_KEY=XXX # 这里替换为你的 API Key，也就是令牌
      - MODEL=deepseek-chat # 这里是接入的模型
      - GROUP_NAME_WHITE_LIST=ALL_GROUP
    ports:
      - "8080:80"

步骤三、启动 Docker 容器

在 `docker-compose.yml` 文件所在目录下，执行以下命令启动容器：

sudo docker-compose up -d

执行以下命令查看容器日志，找到二维码进行扫描登录微信，登录成功后，您的微信账号将作为机器人账号，可以接收和回复消息。

sudo docker logs -f chatgpt-on-wechat

成功案例：YutoGPT 微信机器人

老金的微信社群太多了，自己忙不过来，于是增加了 Deepseek 机器人助手，帮助老金处理日常信息回复、处理职场问题、查询天气、讲笑话等等。



Deepseek 接入微信，更多有趣配置

为了让机器人更具个性，可以加入一些自定义插件配置，让机器人能够处理更多复杂的任务。


# config.json文件内容示例
{
  "model": "deepseek-chat",                                   # 模型名称, 支持 gpt-3.5-turbo, gpt-4, gpt-4-turbo, wenxin, xunfei, glm-4, claude-3-haiku, moonshot
  "open_ai_api_key": "YOUR API KEY",                          # 如果使用openAI模型则填入上面创建的 OpenAI API KEY
  "open_ai_api_base": "https://cn.gptapi.asia/v1",            # OpenAI接口代理地址
  "proxy": "",                                                # 代理客户端的ip和端口，国内环境开启代理的需要填写该项，如 "127.0.0.1:7890"
  "single_chat_prefix": ["bot", "@bot"],                      # 私聊时文本需要包含该前缀才能触发机器人回复
  "single_chat_reply_prefix": "[bot] ",                       # 私聊时自动回复的前缀，用于区分真人
  "group_chat_prefix": ["@bot"],                              # 群聊时包含该前缀则会触发机器人回复
  "group_name_white_list": ["ChatGPT测试群", "ChatGPT测试群2"], # 开启自动回复的群名称列表
  "group_chat_in_one_session": ["ChatGPT测试群"],              # 支持会话上下文共享的群名称  
  "image_create_prefix": ["画", "看", "找"],                   # 开启图片回复的前缀
  "conversation_max_tokens": 1000,                            # 支持上下文记忆的最多字符数
  "speech_recognition": false,                                # 是否开启语音识别
  "group_speech_recognition": false,                          # 是否开启群组语音识别
  "voice_reply_voice": false,                                 # 是否使用语音回复语音
  "character_desc": "你是基于大语言模型的AI智能助手，旨在回答并解决人们的任何问题，并且可以使用多种语言与人交流。",  # 人格描述
  # 订阅消息，公众号和企业微信channel中请填写，当被订阅时会自动回复，可使用特殊占位符。目前支持的占位符有{trigger_prefix}，在程序中它会自动替换成bot的触发词。
  "subscribe_msg": "感谢您的关注！\n这里是ChatGPT，可以自由对话。\n支持语音对话。\n支持图片输出，画字开头的消息将按要求创作图片。\n支持角色扮演和文字冒险等丰富插件。\n输入{trigger_prefix}#help 查看详细指令。",
  "use_linkai": false,                                        # 是否使用LinkAI接口，默认关闭，开启后可国内访问，使用知识库和MJ
  "linkai_api_key": "",                                       # LinkAI Api Key
  "linkai_app_code": ""                                       # LinkAI 应用或工作流code
}

加入老金的星球，获得更多 AI 信息差，更多 AI 资源



评论时刻：你有什么更好的建议嘛？

希望能帮助您成功配置和使用 Deepseek 在微信的功能，欢迎你在文章底部评论，共同交流。

我们即将推出 Deep Research 免费试用，一款强大的深度研究搜索工具！ 三日内正式开放，敬请期待！⏳

---

**处理完成时间**: 2025年10月09日
**文章字数**: 4065字
**内容类型**: 微信文章
**自动分类**: AI技术
**处理状态**: ✅ 完成
