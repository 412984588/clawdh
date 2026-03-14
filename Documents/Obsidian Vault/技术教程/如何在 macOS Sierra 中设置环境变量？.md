# 如何在 macOS Sierra 中设置环境变量？

## 基本信息
- **标题**: 如何在 macOS Sierra 中设置环境变量？
- **来源**: 微信公众号
- **作者**: 点蓝色字关注👉
- **发布时间**: 2025年01月13日
- **URL**: https://mp.weixin.qq.com/s?__biz=Mzk0MzU5NzQ4Mw==&mid=2247488561&idx=1&sn=6754f0b5886650d3e6031300e0d22bb8&chksm=c25f68946edc4dce9cdc2af6149edbf0ee8ade49e48a3c96ea17345b75c9cca7c14c8d823261&mpshare=1&scene=24&srcid=0116D9aMf5QHgsyEELTJCS3A&sharer_shareinfo=a87d2390e290b564c8f0849f3cb141fc&sharer_shareinfo_first=a87d2390e290b564c8f0849f3cb141fc#rd
- **分类**: 技术教程
- **标签**: #工具推荐

## 内容摘要
命名对象中的环境变量，包含可供多个应用程序或进程使用的数据。基本上，它只是一个具有名称和关联值的变量。它可用于确定任何内容，例如可执行文件、库、当前工作目录、默认 shell 或本地系统设置的位置。

对于 Mac 新手来说，如何设置和管理这些环境变量可能会让人不知所措。本指南提供了一些简单的方法。

显示当前环境变量

这非常简单。只需打开终端printenv并运行如下所示的命令。

HIMANSHUs-MacBook-Pro：~ himanshu$ printenv
JAVA_HOME=/Library/Java/JavaVirtualMachines/jdk1.8.0_131.jdk/C...

## 完整内容

命名对象中的环境变量，包含可供多个应用程序或进程使用的数据。基本上，它只是一个具有名称和关联值的变量。它可用于确定任何内容，例如可执行文件、库、当前工作目录、默认 shell 或本地系统设置的位置。

对于 Mac 新手来说，如何设置和管理这些环境变量可能会让人不知所措。本指南提供了一些简单的方法。

显示当前环境变量

这非常简单。只需打开终端printenv并运行如下所示的命令。

HIMANSHUs-MacBook-Pro：~ himanshu$ printenv
JAVA_HOME=/Library/Java/JavaVirtualMachines/jdk1.8.0_131.jdk/Contents/Home 
TERM_PROGRAM=Apple_Terminal 
SHELL=/bin/bash 
...


这将列出当前设置的所有环境变量。

但是，要显示任何特定环境变量的值，请echo $[variable name]在终端上运行，如下所示。

HIMANSHUs-MacBook-Pro:~himanshu$ echo $JAVA_HOME
/Library/Java/JavaVirtualMachines/jdk1.8.0_131.jdk/Contents/Home

使用终端设置临时环境变量

如果您要设置的环境变量仅使用一两次，则需要为其设置一个临时变量，以避免不必要的变量留在系统中。您只需打开终端并运行export命令，然后输入变量名称及其值即可。

HIMANSHUs-MacBook-Pro：~ himanshu$ export JAVA_HOME=/Library/Java/JavaVirtualMachines/jdk1.8.0_131.jdk/Contents/Home


上述示例将变量设置$JAVA_HOME为指定值。但是，如果您的要求是将值附加到现有环境变量，则将该值分配为

export [existing_variable_name]=[new_value]:$[existing_variable_name]


此处的“:”将值附加到现有值。请参阅下面的示例。

HIMANSHUs-MacBook-Pro：〜himanshu $导出PATH = / Users / himanshu / Documents / apache-maven-3.5.0 / bin：$ PATH

使用终端设置永久环境变量

由于 Mac 使用 bash shell，因此可以将环境变量添加到.bash_profile当前用户的目录中。可以使用命令找到此文件的路径

HIMANSHUs-MacBook-Pro：~himanshu$ ~/.bash_profile


首先使用文本编辑器打开此文件。我使用 nano（基于终端的文本编辑器，您可以使用任何您喜欢的文本编辑器）来打开文件并进行编辑。

HIMANSHUs-MacBook-Pro：~himanshu$ nano .bash_profile


这将.bash_profile在终端中打开该文件。

注意：如果没有名为的文件.bash_profile，则上述nano命令将创建一个名为的新文件.bash_profile。

现在移动到文件末尾，转到下一行。现在使用export命令添加所需的环境变量，就像我们之前做的那样。

按ctrl+X退出编辑器。按Y保存缓冲区，然后返回到终端屏幕。

现在我们完成了！

您可以再次运行echo $[variable_name]来查看刚刚保存的环境变量的值。

更新：在使用新设置的环境变量之前，请不要忘记关闭并重新打开终端。重新打开终端会加载更新的 .bash_profile 文件。本期的分享到这告一段落了，下期我们再见👋！！！

---

**处理完成时间**: 2025年10月09日
**文章字数**: 1595字
**内容类型**: 微信文章
**自动分类**: 技术教程
**处理状态**: ✅ 完成
