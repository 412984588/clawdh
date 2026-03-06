# 劲爆！DeepSeek接入微信【喂饭级教程】

## 基本信息
- **标题**: 劲爆！DeepSeek接入微信【喂饭级教程】
- **来源**: 微信公众号
- **作者**: 袋鼠帝
- **发布时间**: 2025年01月31日
- **URL**: https://mp.weixin.qq.com/s?__biz=MzkwMzE4NjU5NA==&mid=2247505633&idx=1&sn=e8689f2b63a3304c9420cbe3d2b5312e&chksm=c16350c8e339e3357e4f81165f03ed49e70ab08fa905e3290c335a064e2dfd07729c068d6b1a&mpshare=1&scene=24&srcid=02015MUsQwZs1OApepuWpypb&sharer_shareinfo=a75b2599b4eb2de03f55c26557a6851e&sharer_shareinfo_first=a75b2599b4eb2de03f55c26557a6851e#rd
- **分类**: 技术教程
- **标签**: #AI #GitHub #工具推荐 #技术分析

## 内容摘要
点击上方蓝字关注我们

兄弟们，最近DeepSeek火爆全世界，不仅是因为它便宜，还因为它非常好用、实用。除去逻辑思维、编码之外，它的写作、和角色扮演能力也是超强！

如果把它接入个人微信又会产生什么化学反应呢？





所以今天给大家带来DeepSeek V3，DeepSeek R1接入个人微信的喂饭级教程~

群友对用DeepSeek做人工客服的评价特别高~

小破站用户觉得DeepSeek特别像真人，拟人化超强！

这真的是符合咱们中国人使用习惯的大模型。


我已经把DeepSeek接入了我的微信小号，并赋予了它一些人设（比如猫娘，董宇辉）

回复效果如下：











我...

## 完整内容

点击上方蓝字关注我们

兄弟们，最近DeepSeek火爆全世界，不仅是因为它便宜，还因为它非常好用、实用。除去逻辑思维、编码之外，它的写作、和角色扮演能力也是超强！

如果把它接入个人微信又会产生什么化学反应呢？





所以今天给大家带来DeepSeek V3，DeepSeek R1接入个人微信的喂饭级教程~

群友对用DeepSeek做人工客服的评价特别高~

小破站用户觉得DeepSeek特别像真人，拟人化超强！

这真的是符合咱们中国人使用习惯的大模型。


我已经把DeepSeek接入了我的微信小号，并赋予了它一些人设（比如猫娘，董宇辉）

回复效果如下：











我认为目前角色扮演能力最强的模型就是DeepSeek！

话不多说，开始喂饭！




DeepSeek接入个人微信

本次教程叒又会用到我们的老朋友，开源项目chatgpt-on-wechat

https://github.com/zhayujie/chatgpt-on-wechat

PS：cow所用的itchat，三周前被官方封了，但是最近经网友测试，itchat又可用了，所以我们又可以愉快的用cow将AI大模型对接到微信个人号玩耍啦！有一定封号风险，用无关紧要的小号来对接！

不清楚chatgpt-on-wechat（简称cow）的朋友可以先看这篇（但不要跟着部署，这篇介绍了更简单一些的方法）：

cow

袋鼠帝，公众号：袋鼠帝AI客栈
独家！Kimi接入个人微信（三）部署篇

还需要提前安装docker-desktop（本教程win和mac都适用）

项目一键部署神器：docker

袋鼠帝，公众号：袋鼠帝AI客栈
Ollama一键部署！开源部署神器：docker-desktop，小白也能轻松上手~

整个过程简单来说分三步：

1.获取DeepSeek ApiKey；
2.创建、并配置cow的docker-compose.yml文件；
3.使用docker一键启动cow，扫码登录微信小号；






 1.获取DeepSeek ApiKey 

我们需要获取 DeepSeek的官方API

DeepSeek地址：https://www.deepseek.com/

点击右上角的 API开放平台，进入DeepSeek的官方API开放平台，充值几块钱即可，然后新建一个apikey，并复制下来。

不过我这会儿无法访问DeepSeek的开放平台，点击显示如下页面，DeepSeek被攻击的太惨了吧，，，

如果DeepSeek官网无法访问，可以用这个AI_API高速中转站：

kg高速AI_API中转站：https://kg-api.cloud/

中转站里有DeepSeek的API

不管使用DeepSeek官方API，还是kg中转站的API，都能调用到DeepSeek。但都不是免费的

不过后续配置有一定差异：




当使用官方API：

apikey：复制官方的apikey

API地址：https://api.deepseek.com/v1




当使用kg中转站API时：

apikey：复制中转站创建的apikey

API地址：https://kg-api.cloud/v1



 2.创建、配置docker-compose.yml文件 

咱们不需要去下载cow的源码，直接创建一个cow的docker-compose.yml配置文件即可。

先随便新建一个文件夹，在文件夹下新建一个.txt文件，把如下内容复制到.txt文件中（格式一定不能乱）

version: '2.0'
services:
  chatgpt-on-wechat:
    image: registry.cn-guangzhou.aliyuncs.com/kangarooking/chatgpt-on-wechat:250131
    container_name: chatgpt-on-wechat
    security_opt:
      - seccomp:unconfined
    environment:
      # DeepSeek的ApiKey（也可以用中转ApiKey）
      OPEN_AI_API_KEY: 'sk-xxxxxx'
      # DeepSeek的API地址（也可用中转API地址）
      OPEN_AI_API_BASE: 'https://api.deepseek.com/v1'
      # DeepSeek模型，deepseek-chat代表V3，deepseek-reasoner代表R1
      MODEL: 'deepseek-chat'
      SINGLE_CHAT_PREFIX: '[""]'
      SINGLE_CHAT_REPLY_PREFIX: '" "'
      # 群聊前缀，请替换成：@你的微信名
      GROUP_CHAT_PREFIX: '["@汐汐不嘻嘻"]'
      # 群聊白名单，直接配置ALL_GROUP即可支持所有群聊
      GROUP_NAME_WHITE_LIST: '["测试1群", "测试2群"]'
      IMAGE_CREATE_PREFIX: '["画", "看", "找"]'
      CONVERSATION_MAX_TOKENS: 3000
      SPEECH_RECOGNITION: 'False'
      # 预设提示词（system prompt）
      CHARACTER_DESC: '用猫娘的语气跟我说话'
      EXPIRES_IN_SECONDS: 3600
      USE_GLOBAL_PLUGIN_CONFIG: 'True'
      HOT_RELOAD: 'True'

ps：本次镜像特别帮大家上传到了阿里云，这样不需要科学上网就能快速下载cow镜像啦

.txt文件保存之后，将文件名连着后缀一起修改为docker-compose.yml

1.将DeepSeek的apikey填入OPEN_AI_API_KEY

2.DeepSeekAPI官方地址：https://api.deepseek.com/v1 填入OPEN_AI_API_BASE




3.MODEL填deepseek-chat（代表V3）或者 deepseek-reasoner（代表R1）

4.CHARACTER_DESC 中可配置预设提示词（system prompt）

DeepSeek的system prompt简单述说需求即可，不需要复杂提示词，非常简单~



 3.docker一键启动cow，并扫码登录 

在docker-compose.yml文件所在目录的地址栏输入cmd 回车，进入控制台。

控制台输入指令docker-compose up -d ，然后 回车（就自动下载、部署cow了）

当出现如下红框这条日志，就代表部署完成了

这时候打开docker-desktop，找到Containers->cow->view details查看cow的日志

最后用微信小号扫码登录就OK啦！


后续如果修改了配置（注意保存），需重新执行docker-compose up -d，重置服务让配置生效，并重新扫码登录。


到这里DeepSeek接入个人微信就配置完毕了~

微信接入AI 我们是专业的，下篇教大家如何把本地部署的DeepSeek接入微信~

还没有本地部署DeepSeek的朋友先补补课，看下面这篇：

本地部署DeepSeek R1

袋鼠帝，公众号：袋鼠帝AI客栈
DeepSeek R1，本地部署才是王道！支持WebUI

感兴趣的朋友可以点手关注。

我们这边开发了更稳定的对接微信的渠道(比itchat稳定很多)，也有更加全面、适配AI客服的功能，支持Windows和Linux安装。

感兴趣的朋友欢迎来撩~ VX：ai-kangarooking

以上就是本期所有啦，能看到这里的都是凤毛麟角的存在！

如果觉得不错，随手点个赞、在看、转发三连吧~


如果想第一时间收到推送，也可以给我个星标⭐

谢谢你耐心看完我的文章~




星球有AI、bot接入微信的详细教程（包含软件）







---

**处理完成时间**: 2025年10月09日
**文章字数**: 3508字
**内容类型**: 微信文章
**自动分类**: 技术教程
**处理状态**: ✅ 完成
