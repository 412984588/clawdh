---
title: "Anthropic 推出 MCP "代码模式"，令牌消耗 从 15万 降至 2000，节省 98.7%"
source: wechat
url: https://mp.weixin.qq.com/s/K0U8r_XaUh6gO6_lLnJbTQ
author: AGI罗盘
pub_date: 2025年11月12日 22:50
created: 2026-01-17 21:08
tags: [AI, 编程]
---

# Anthropic 推出 MCP "代码模式"，令牌消耗 从 15万 降至 2000，节省 98.7%

> 作者: AGI罗盘 | 发布日期: 2025年11月12日 22:50
> 原文链接: [点击查看](https://mp.weixin.qq.com/s/K0U8r_XaUh6gO6_lLnJbTQ)

---

你是否曾经为人工智能代理的缓慢响应和高昂成本感到头疼？

近年来，随着人工智能智能体的能力和规模不断增加，特别是在企业和开发者社区中，智能体通常需要与大量的外部工具和系统进行交互。

自2024年11月发布以来，MCP（模型上下文协议）作为连接AI代理与外部工具和数据的开放标准，迅速成为行业的主流解决方案。

然而，随着接入工具数量的急剧增加，传统的调用工具的方法在扩展性和成本方面逐渐暴露出严重的瓶颈。

本文将结合一些权威分析，深入分析MCP代码执行模型如何从根本上革新代理体系结构，并实现效率、安全性和可维护性的平衡。

传统MCP模式的困境

在讨论创新计划之前，我们不妨回顾一下传统模式面临的问题。

MCP的初衷是通过标准化协议避免AI agent与外部系统之间的重复定制和对接。

只需实现一次MCP标准，开发人员就可以访问丰富的工具生态系统。

到目前为止，已经有数千台MCP服务器，涵盖了主流编程语言和sdk，已经成为连接AI和外部系统的事实上的标准。

然而，在实际的登陆过程中，传统的MCP客户端往往会预加载所有的工具定义。

这些定义涵盖了参数、返回值和使用指令，所有这些都被塞进了模型的上下文中。

一旦要支持数百甚至数千个工具，上下文窗口就很容易被工具定义和中间结果占用，从而导致响应延迟、成本飙升，甚至超出模型处理的上限。

更糟糕的是，在复杂的业务场景中，比如调用谷歌Drive获取两个小时的会议纪要，然后将其同步到Salesforce系统，整个过程需要对完整的文本进行多次“遍历”，令牌消耗往往是数万，甚至数万，不仅经济，而且容易造成数据丢失或响应错误。

因此，无论模型有多快，它都会变慢。

代码执行方式：MCP接地效率突破

正是针对上述缺点，MCP社区和行业专家率先提出了“代码执行”模型。

核心概念非常简单——不再让模型在上下文窗口中逐级调用工具，然后让代理直接生成可执行代码（如TypeScript），由独立的沙箱环境（即隔离的执行空间）负责实际的数据处理和工具调用。

Agent 不需要一次加载所有工具定义，只需要在当前任务中“借用”所需的接口。

其结构类似如下：

// 工具结构
servers
├── google-drive
│   ├── getDocument.ts
│   ├── ... (other tools)
│   └── index.ts
├── salesforce
│   ├── updateRecord.ts
│   ├── ... (other tools)
│   └── index.ts
└── ... (other servers)

真实实验表明，Token 消费从 15万 暴跌至 2000，节省高达 98.7% 的土地成本，效率提升堪比用电动自动驾驶取代油车！

每个工具对应于一个代码文件，该文件清楚地定义了它的输入和输出类型以及逻辑。

Agent 只需要遍历目录并根据需要动态加载接口代码。

数据过滤和高效的过程控制

例如：当从谷歌Sheets中提取 10,000 个销售数据时，只过滤掉状态为“待发货”的订单并汇总金额，然后模型只需要处理最终的关键信息。

在代码执行环境中，代理可以首先过滤和转换数据，只将真正关键的结果返回给模型。

这不仅避免了大量数据流进入上下文，而且还在代码中直接实现了复杂的逻辑，如循环、条件和异常处理，而不需要模型进行重复推理。
Example:

// 过滤出需要的数据
const sheet = await gdrive.getSheet({ sheetId: 'abc123' });
for (const row of sheet.rows) {
  await salesforce.updateRecord({
    objectType: 'Lead',
    recordId: row.salesforceId,
    data: { 
      Email: row.email,
      Phone: row.phone,
      Name: row.name
    }
  });
}
console.log(`Updated ${sheet.rows.length} leads`);
数据隐私和安全保护

更好的是，代码执行模式自然具有隐私优势。

所有中间结果默认保留在沙盒执行环境中，敏感数据（如电子邮件地址、手机号码等）保留在沙盒执行环境中。PII)可以被MCP客户端自动替换为占位符——模型只“看到”任务，而不是原始内容。

这就像是为私人信息披上了一件隐形斗篷。

后续的工具调用通过查找表恢复真实数据，从机制层遏制敏感数据泄露，帮助企业合规（GDPR/CCPA等）管理。

// 只沙盒环境过滤敏感数据，LLM 收到只是一个站位符
[
  { salesforceId: '00Q...', email: '[EMAIL_1]', phone: '[PHONE_1]', name: '[NAME_1]' },
  { salesforceId: '00Q...', email: '[EMAIL_2]', phone: '[PHONE_2]', name: '[NAME_2]' },
  ...
]
状态持久化和技能重用

代码执行还允许智能体记录跨任务的进度，例如将处理结果写入文件并持久化状态以方便后续操作。

更重要的是，代理可以将成功执行的代码保存为技能，封装像‘savesheetascsv（）’这样的函数，添加到技能库中，并成为后续自动化任务的可重用模块，“工具箱”会越来越强大。

// 只定义一次函数的实现
import * as gdrive from'./servers/google-drive';
exportasyncfunctionsaveSheetAsCsv(sheetId: string) {
const data = await gdrive.getSheet({ sheetId });
const csv = data.map(row => row.join(',')).join('\n');
await fs.writeFile(`./workspace/sheet-${sheetId}.csv`, csv);
return`./workspace/sheet-${sheetId}.csv`;
}

// 在任何智能体都可以调用
import { saveSheetAsCsv } from'./skills/save-sheet-as-csv';
const csvPath = awaitsaveSheetAsCsv('abc123');

配合技能MD和其他解释性文档，技能库变得越来越完整，结构化，易于管理和扩展。

MCP代码执行模式标志着智能体范式从“上下文驱动”向“代码驱动”的演变，逐渐摆脱了传统聊天机器人能力的界限，与现代软件系统架构并驾齐驱。

在未来，谁能创造出最安全、最高效的代理平台，谁就能在人工智能变革的浪潮中占据先机。

 

—— END ——

📌 关注 AGI罗盘，探索智能未来
✨ 喜欢本文？欢迎：
👍 点赞 | 📤 分享 | 💬 留言

---
*导入时间: 2026-01-17 21:08:06*
