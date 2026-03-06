# 每月免费使用10000分钟GPU：Cloud Studio在云端搭建大模型

## 基本信息
- **标题**: 每月免费使用10000分钟GPU：Cloud Studio在云端搭建大模型
- **来源**: 微信公众号
- **作者**: 编程与架构
- **发布时间**: 2025年01月25日
- **URL**: https://mp.weixin.qq.com/s?__biz=MzAxNDYyNjI1OQ==&mid=2454474285&idx=1&sn=d929cccfd1a7b838265002aea7fb6fd5&chksm=8d24fe3ae5c438e6107340cf9a91555d777b386a7dec21f77bf1f0a97e93fe9f167a6e186f85&mpshare=1&scene=24&srcid=0128QWV2l34eeWkF2aXzy4do&sharer_shareinfo=54e3aa501bbf7927326e0055b6e43b13&sharer_shareinfo_first=54e3aa501bbf7927326e0055b6e43b13#rd
- **分类**: AI技术
- **标签**: #AI #GitHub #工具推荐 #技术分析

## 内容摘要
 

关注下方公众号，获取更多热点资讯
每月免费使用10000分钟GPU：Cloud Studio在云端搭建大模型





先说重点：每月免费使用10000分钟！

随着大模型的普及，越来越多的开发者来学习大模型。 Cloud Studio 提供了一个强大的平台，支持快速创建 GPU 加速的开发环境，尤其适合进行深度学习和 AI 相关的任务。本篇文章将为你详细介绍如何通过 Cloud Studio 在云端创建一台 GPU 服务器，并通过 Ollama 运行机器学习模型，最终通过 Web 端进行访问。

Cloud Studio

产品页面：
https://cloud.tencent.com...

## 完整内容

 

关注下方公众号，获取更多热点资讯
每月免费使用10000分钟GPU：Cloud Studio在云端搭建大模型





先说重点：每月免费使用10000分钟！

随着大模型的普及，越来越多的开发者来学习大模型。 Cloud Studio 提供了一个强大的平台，支持快速创建 GPU 加速的开发环境，尤其适合进行深度学习和 AI 相关的任务。本篇文章将为你详细介绍如何通过 Cloud Studio 在云端创建一台 GPU 服务器，并通过 Ollama 运行机器学习模型，最终通过 Web 端进行访问。

Cloud Studio

产品页面：
https://cloud.tencent.com/product/cloudstudio

IDE： https://ide.cloud.tencent.com/

免费 GPU 资源

提供了一台拥有 16GB 显存 和 32GB 内存 的机器，每月免费使用10000分钟，开发者可以充分利用这些资源进行模型训练、数据处理等操作。

如下图所示，免费 GPU 配置的机器拥有强大的计算能力，适合大多数机器学习任务。

这里我们通过 Ollama 演示

创建并配置云端服务器

在 Cloud Studio 创建完开发环境后，进入控制台并启动你选择的实例。这里，我们将以 Ollama 为例，演示如何在云端服务器上安装并运行深度学习模型。

在控制台创建实例并启动后，你可以通过 Web 终端直接连接到云端服务器。

进入终端界面后，开始配置并下载所需的模型。

下载模型

打开终端，下载我们需要用的模型

安装 Ollama Python 环境

为了让我们能够与模型进行交互，首先需要在服务器上安装 Ollama 环境。在云端的终端中运行以下命令：

pip install ollama

安装完成后，你就能够通过 Ollama 的 Python API 使用该模型。

配置 Python 环境

由于在终端中和编辑器中使用的 Python 解释器路径可能不同，为了确保 Python 环境一致，我们需要将 Python 引用地址统一。你可以通过以下命令修改系统的 Python 引用路径：

rm -f /bin/python3
ln -s /root/miniforge3/bin/python3 /bin/python3

执行上述命令后，Python 解释器路径将指向我们所安装的 Python 环境。

运行一个简单的代码

from ollama import chat
from ollama import ChatResponse

response: ChatResponse = chat(
    model='qwen2.5:0.5b',
    messages=[
        {'role': 'user', 'content': '你是什么模型?'},
    ]
)

print(response['message']['content'])

运行效果

将模型端口暴露出来

默认我们只能在IDE中调用，通过端口暴露可以供其他环境调用

开启 Ollama Web 端口

为了便于远程访问 Ollama 提供的服务，我们可以通过开启 Web 端口的方式将其暴露出去。

首先，我们需要将 Ollama 的服务绑定到 0.0.0.0:12345 上，这样可以通过任意设备访问。打开终端并运行以下命令：

echo 'export OLLAMA_HOST="0.0.0.0:12345"' >> ~/.bashrc
source ~/.bashrc

端口随意

杀掉已有的 Ollama 进程

如果你之前已经启动过 Ollama 服务，可能需要杀掉已有的进程，然后重新启动它。你可以通过以下命令查找并终止正在运行的进程：

(base) root@VM-15-28-ubuntu:/workspace# ps -ef|grep ollama
root          16      13  0 02:53 pts/0    00:00:00 /bin/bash /usr/local/bin/launch_ollama.sh
root         170     169  0 02:54 pts/0    00:00:00 node /root/chatbot-ollama/node_modules/.bin/next dev --port 6889
root        3598    3345  0 03:49 pts/4    00:00:00 /usr/local/bin/ollama serve
root        3710    3687  0 03:50 pts/5    00:00:00 grep --color=auto ollama
(base) root@VM-15-28-ubuntu:/workspace# kill -9 3598
启动 Ollama 服务

完成端口配置后，你可以重新启动 Ollama 服务，使用以下命令：

/usr/local/bin/ollama serve
验证服务是否启动成功

你可以通过以下命令检查服务是否启动成功：

curl localhost:12345

如果服务启动成功，将会返回以下信息：

Ollama is running
通过代理暴露端口

参考文章：NPS指南：简便稳定的内网穿透神器，开源免费！

自由发挥

一旦你成功搭建了云端的开发环境并启动了服务，你就可以根据自己的需要进行各种操作，如使用 Python 与模型交互、进行深度学习训练等。你也可以根据实际需求，将服务与其他应用进行集成。

每个月10000分钟的使用时长，对于没有GPU资源又想学的开发者来说简直是太友好了

 




欢迎关注我的公众号“编程与架构”，原创技术文章第一时间推送。







---

**处理完成时间**: 2025年10月09日
**文章字数**: 2492字
**内容类型**: 微信文章
**自动分类**: AI技术
**处理状态**: ✅ 完成
