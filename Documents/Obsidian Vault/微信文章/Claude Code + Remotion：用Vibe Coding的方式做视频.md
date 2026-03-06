---
title: "Claude Code + Remotion：用Vibe Coding的方式做视频"
source: wechat
url: https://mp.weixin.qq.com/s/2U4HzByiP0FAReWG_2OhHw
author: AI编程实验室
pub_date: 2025年12月22日 22:46
created: 2026-01-17 20:18
tags: [AI, 编程]
---

# Claude Code + Remotion：用Vibe Coding的方式做视频

> 作者: AI编程实验室 | 发布日期: 2025年12月22日 22:46
> 原文链接: [点击查看](https://mp.weixin.qq.com/s/2U4HzByiP0FAReWG_2OhHw)

---

大家好，我是鲁工。

前段时间，我在公众号发了一篇用Vibe Coding方式做更适合开发者风格的PPT的文章，发现很多人都非常感兴趣。

Claude Code + Slidev：做出开发者风格的PPT

最近一段时间，确实Vibe Coding的边界正在不断拓展。以前我们用Claude Code写网页、写后端、写脚本、做PPT，现在甚至可以用它来"写"视频了。

这听起来有点反常识，但确实是真的。因为过去一整年，AI视频领域的进展可谓突飞猛进，从可灵即梦到Veo、Sora，大家熟知的AI视频都是依靠视频生成模型（DiT）生成出来的。

但我今天要介绍是就是一个"写"视频的开源框架：

Remotion.

用写网页的方式写视频

Remotion是一个基于React和TypeScript构建视频的开源框架，核心理念就是用写网页的方式写视频。

对于前端开发者来说，这简直是降维打击。你不需要学Premiere、不需要学After Effects，只需要用你熟悉的React组件，就能定义视频的画面、动画、文本，最后渲染输出MP4或GIF。

传统视频制作流程是这样的：打开剪辑软件，导入素材，拖拽时间线，调整关键帧，渲染导出。每次修改都得手动操作，批量生成几乎不可能。

而Remotion的思路完全不同：视频就是代码，代码就是视频。

Remotion的核心概念其实并不复杂，主要就三个：

第一个是useCurrentFrame，用来获取当前帧数。视频的本质就是一帧一帧的画面，这个Hook让你能根据帧数来控制任何动画效果。

import { useCurrentFrame } from "remotion";


export const FadeIn = () => {
  const frame = useCurrentFrame();
  const opacity = Math.min(1, frame / 60);


  return (
    <div style={{ opacity }}>Hello World!</div>
  );
};

上面这段代码，60帧内文字从透明渐变到完全显示。就是这么简单。

第二个是Sequence，用来控制元素的出场时机和持续时长。类似于视频轨道上的片段。

import { Sequence } from 'remotion';
export const MyComp = () => {
  return (
    <Sequence from={10} durationInFrames={20}>
      <div>这段文字在第10帧出现，持续20帧</div>
    </Sequence>
  );
};

第三个是interpolate和spring，用来做更复杂的动画插值和物理弹簧效果。想做出自然的缓动效果，用这两个函数就够了。

import { spring, useCurrentFrame, useVideoConfig } from "remotion";
const frame = useCurrentFrame();
const { fps } = useVideoConfig();
const scale = spring({
  frame,
  fps,
  config: { damping: 200, stiffness: 100 },
});
Remotion如何使用
作为一个成熟的开源项目，Remotion的官方教程非常完善：

https://www.remotion.dev/docs/

在本地开启一个新的工作目录，然后初始化项目：

npx create-video@latest

完了之后，界面会跳出一个模板选择对话，你可以根据个人需要选择合适的视频模板，新手入门的话建议直接选择Hello World即可：

模板地址：

https://www.remotion.dev/templates

然后启动Remotion打开当前项目，即Remotion的工作Studio：

npm run dev

经常剪视频的朋友对这个界面应该不会陌生，经典的视频编辑界面，只不过风格上更加适用于开发者。

使用Claude Code来Vibe Video

说实话，Remotion的学习曲线并不陡峭，但要做出好看的动画效果，还是需要一些设计感和动画知识。

这时候Claude Code就派上用场了。

当然需要使用Context7让Claude Code提前熟悉Remotion文档。

我的工作流程通常是这样的：

先用自然语言描述想要的视频效果
让Claude Code生成Remotion组件代码
用npx remotion studio实时预览
不满意就继续调整，满意就渲染导出



举个例子，我想以Vibe Coding为主题做一个简短的示例视频：

Remotion 是一个基于React 和Typescript构建视频的开源框架，请使用Context7 mcp仔细阅读Remotion官方文档，然后收集资料，以VibeCoding为主题，在当前项目结构基础上，制作一个时长一分钟的短视频。

Claude Code会帮你生成完整的代码，包括动画配置、数字格式化、样式布局。你要做的只是复制粘贴，然后在Remotion Studio中预览效果。如果效果不满意，可以反复让Claude修改。

完成后，可以直接在Remotion Studio中导出为本地视频。

我生成的Vibe Coding示例视频效果如下：

视频加载失败，请刷新页面再试

 刷新

仅作为示例教学使用，如果想要做更加酷炫和更多丰富内容的视频效果，可能需要花一些心思做编排。

适合做什么

Remotion特别适合做这几类视频：

数据可视化视频：把图表、数据用动画的方式呈现出来。因为数据是动态的，用代码生成比手工做效率高太多。

批量生成视频：比如电商的产品介绍视频，换个产品图和文案就能生成新视频。传统剪辑软件做这个简直是噩梦。

技术演示视频：代码高亮、终端动画、架构图演示这类内容，用React组件来写反而更自然。

个人化视频：比如给每个用户生成专属的年度总结视频，传入不同的数据参数就行。

本地渲染还是云端渲染

Remotion提供两种渲染方式。

本地渲染用CLI命令：

npx remotion render

简单直接，适合开发阶段和小批量渲染。

如果需要大规模批量渲染，可以用Remotion Lambda或Cloud Run，把渲染任务丢到云端并行处理。这对于需要生成成百上千个视频的场景很有用。

写在最后

Remotion把视频制作变成了编程问题，Claude Code把编程问题变成了Vibe问题。两者结合，你只需要描述想要什么效果，AI帮你写代码，代码帮你生成视频。

这就是Vibe Coding延伸到视频领域的样子。

当然，Remotion也有它的局限性。它更适合做动画图形类的视频，对于需要大量实拍素材剪辑的内容，AI视频生成和传统剪辑软件还是更合适。

如果你是前端开发者，又经常需要做一些技术演示或数据可视化的视频，强烈建议试试Remotion。







我是鲁工，八年AI算法老兵，AI全栈开发者，深耕AI编程赛道。欢迎关注，感兴趣的朋友也可以加我微信（louwill_）交个朋友。
>/ 作者：鲁工

---
*导入时间: 2026-01-17 20:18:11*
