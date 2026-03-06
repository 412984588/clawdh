# 手把手教你用Docker部署Dify平台，打造可视化LLM应用环境

## 基本信息
- **标题**: 手把手教你用Docker部署Dify平台，打造可视化LLM应用环境
- **来源**: 微信公众号
- **作者**: AI宇宙哥
- **发布时间**: 2024年11月18日
- **URL**: https://mp.weixin.qq.com/s/_fNZVRQrXyVkwIdrMtSkMQ
- **分类**: 工具推荐
- **标签**: #AI #GitHub #工具推荐 #技术分析 #行业观察 #效率 #深度学习 #开源

## 内容摘要



“ Dify是一款开源的大语言模型(LLM)应用开发平台。它融合了后端即服务（Backend as Service）和LLM Ops的理念，使开发者可以快速搭建生产级的生成式AI应用。即使你是非技术人员，也能参与到AI应用的定义和数据运营过程中。
Dify内置了构建LLM应用所需的关键技术栈，包括对数百个模型的支持、直观的Prompt编排界面、高质量的RAG引擎、稳健的Agent框架、灵活的流程编排，并同时提供了一套易用的界面和API。这为开发者节省了许多重复造轮子的时间，使其可以专注在创新和业务需求上。”

01

—
关于Dify

你或许可以把LangChain这类的开发库（Lib...

## 完整内容




“ Dify是一款开源的大语言模型(LLM)应用开发平台。它融合了后端即服务（Backend as Service）和LLM Ops的理念，使开发者可以快速搭建生产级的生成式AI应用。即使你是非技术人员，也能参与到AI应用的定义和数据运营过程中。
Dify内置了构建LLM应用所需的关键技术栈，包括对数百个模型的支持、直观的Prompt编排界面、高质量的RAG引擎、稳健的Agent框架、灵活的流程编排，并同时提供了一套易用的界面和API。这为开发者节省了许多重复造轮子的时间，使其可以专注在创新和业务需求上。”

01

—
关于Dify

你或许可以把LangChain这类的开发库（Library）想象为有着锤子、钉子的工具箱。与之相比，Dify提供了更接近生产需要的完整方案，Dify好比是一套脚手架，并且经过了精良的工程设计和软件测试。

重要的是，Dify是开源的，它由一个专业的全职团队和社区共同打造。你可以基于任何模型自部署类似AssistantsAPI和GPTs的能力，在灵活和安全的基础上，同时保持对数据的完全控制。

02

—


前提条件

Dify可以在运行Docker环境的Windows、MacOS、Linux等电脑中部署，安装Dify之前, 请确保你的机器已满足最低安装要求：

CPU >= 2 Core
RAM >= 4 GiB

此外，操作系统还需要安装好Docker环境，不同OS所需的软件如下：

操作系统	软件	描述


macOS

	

Docker Desktop

	

为 Docker 虚拟机（VM）至少分配 2 个虚拟 CPU(vCPU) 和 8GB 初始内存，否则安装可能会失败。




Linux

	

Docker 19.03 or later 

Docker Compose 1.28 or later

	







Windows

	

Docker Desktop

WSL 2

	

建议将源代码和其他数据绑定到 Linux 容器中时，将其存储在 Linux 文件系统中，而不是 Windows 文件系统中。

03

—


部署过程
一、克隆Dify代码仓库


从github克隆 Dify 源代码至要本地环境。

git clone https://github.com/langgenius/dify.git

二、启动Dify

1. 进入Dify源代码的Docker目录

cd dify/docker

2. 复制环境配置文件

cp .env.example .env

3. 启动Dify的Docker容器

根据你系统上的Docker Compose版本，选择合适的命令来启动容器。你可以通过docker compose version命令检查版本，详细说明请参考Docker官方文档。


如果版本是 Docker Compose V2，使用以下命令：

docker compose up -d

如果版本是 Docker Compose V1，使用以下命令：

docker-compose up -d

运行命令后，你应该会看到类似以下的输出，显示所有容器的状态和端口映射：


[+] Running 11/11
 ✔ Network docker_ssrf_proxy_network  Created                                                                 0.1s 
 ✔ Network docker_default             Created                                                                 0.0s 
 ✔ Container docker-redis-1           Started                                                                 2.4s 
 ✔ Container docker-ssrf_proxy-1      Started                                                                 2.8s 
 ✔ Container docker-sandbox-1         Started                                                                 2.7s 
 ✔ Container docker-web-1             Started                                                                 2.7s 
 ✔ Container docker-weaviate-1        Started                                                                 2.4s 
 ✔ Container docker-db-1              Started                                                                 2.7s 
 ✔ Container docker-api-1             Started                                                                 6.5s 
 ✔ Container docker-worker-1          Started                                                                 6.4s 
 ✔ Container docker-nginx-1           Started                                                                 7.1s

最后检查是否所有容器都正常运行：


docker compose ps
在这个输出中，你应该可以看到包括3个业务服务 api / worker / web，以及6个基础组件 weaviate / db / redis / nginx / ssrf_proxy / sandbox 。

NAME                  IMAGE                              COMMAND                   SERVICE      CREATED              STATUS                        PORTS
docker-api-1          langgenius/dify-api:0.6.13         "/bin/bash /entrypoi…"   api          About a minute ago   Up About a minute             5001/tcp
docker-db-1           postgres:15-alpine                 "docker-entrypoint.s…"   db           About a minute ago   Up About a minute (healthy)   5432/tcp
docker-nginx-1        nginx:latest                       "sh -c 'cp /docker-e…"   nginx        About a minute ago   Up About a minute             0.0.0.0:80->80/tcp, :::80->80/tcp, 0.0.0.0:443->443/tcp, :::443->443/tcp
docker-redis-1        redis:6-alpine                     "docker-entrypoint.s…"   redis        About a minute ago   Up About a minute (healthy)   6379/tcp
docker-sandbox-1      langgenius/dify-sandbox:0.2.1      "/main"                   sandbox      About a minute ago   Up About a minute             
docker-ssrf_proxy-1   ubuntu/squid:latest                "sh -c 'cp /docker-e…"   ssrf_proxy   About a minute ago   Up About a minute             3128/tcp
docker-weaviate-1     semitechnologies/weaviate:1.19.0   "/bin/weaviate --hos…"   weaviate     About a minute ago   Up About a minute             
docker-web-1          langgenius/dify-web:0.6.13         "/bin/sh ./entrypoin…"   web          About a minute ago   Up About a minute             3000/tcp
docker-worker-1       langgenius/dify-api:0.6.13         "/bin/bash /entrypoi…"   worker       About a minute ago   Up About a minute             5001/tcp
通过这些步骤，你应该可以成功在本地安装Dify。


05

—


更新Dify

当Dify版本更新后，你可以克隆或拉取最新的Dify源代码，并通过命令行更新已经部署的Dify环境。

进入dify源代码的docker目录，按顺序执行以下命令：


cd dify/docker
docker compose down
git pull origin main
docker compose pull
docker compose up -d

执行上述命令更新完成后，需按以下操作同步环境变量配置 (重要！)。

如果.env.example文件有更新，请务必同步修改您本地的.env文件。
检查.env文件中的所有配置项，确保它们与您的实际运行环境相匹配。
您可能需要将.env.example中的新变量添加到.env文件中，
并更新已更改的任何值。
07

—


使用Dify

按照以上步骤部署好Dify后，首先前往管理员初始化页面设置设置管理员账户：

# 本地环境
http://localhost/install


# 服务器环境
http://your_server_ip/install

可以打开以下地址访问Dify主页面：

# 本地环境
http://localhost


# 服务器环境
http://your_server_ip




08

—


写在最后

通过私有化本地部署Dify，结合Ollama等大模型运行环境，可以打造自己的私有大模型工具链，实现大模型的本地可视化运行。在涉密或敏感数据场合具有极大的应用价值。

Ollama的本地部署及使用可参照本公众号的以下文章：

轻松在个人电脑上搭建私有大语言模型服务：Ollama的部署和使用


赶快用起来吧！！！




文末福利：
1、关注本公众号“AI未来智能宇宙”，在后台回复“AIGC创新应用洞察报告”，即可免费领取最新的AIGC创新应用洞察报告。
2、关注本公众号“AI未来智能宇宙”，在后台回复“aflow论文”，即可免费领取aflow论文文件。
3、关注本公众号“AI未来智能宇宙”，在后台回复“研究报告”，即可免费领取超专业的人工智能行业发展研究报告。
往期精彩回顾：

• 新手必读！从零开始预训练大语言模型，创建自己的大语言神器

• MetaGPT aflow：智能工作流的革新，助你轻松实现AI自动化

• 硬核升级！在Ollama中使用Llama3.2视觉模型

• Transformer架构详解

• Attention is All You Need

• 解锁大模型极致潜能：深度剖析大模型调优之道

• 揭秘大模型微调：如何让机器智能跃升一个台阶？

• 大模型Agent：人工智能新前沿的深度解读

• 大语言模型中的向量化：概念、目的与作用

• RAG：开启智能知识探索新纪元

• 大模型应用框架解析：RAG、Agent、微调、提示词工程究竟是什么?

• 大模型在各行各业中的应用现状及前景分析

• 就在刚刚，OpenAI震撼发布o1大模型！突破推理极限，大模型迈入新时代！

• 轻松在个人电脑上搭建私有大语言模型服务：Ollama的部署和使用

• 职场必备的9大AI工具，关键还全部免费！

• 提示词工程：解锁大语言模型的强大潜力

• 常用AI大模型-豆包、通义千问、Kimi、文心一言......

• AI编码神器Cursor：再也不用学习复杂的编程语言了

• AI编码利器：阿里云通义灵码

• AI界的“超级学霸”——大语言模型的来龙去脉

• 人工智能AI的现状和未来

⏬⏬点击订阅公众号⏬⏬





---

**处理完成时间**: 2025年10月09日
**文章字数**: 5926字
**内容类型**: 微信文章
**自动分类**: 工具推荐
**处理状态**: ✅ 完成
