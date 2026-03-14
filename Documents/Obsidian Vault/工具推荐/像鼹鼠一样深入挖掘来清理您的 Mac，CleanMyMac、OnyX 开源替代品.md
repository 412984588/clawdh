# 像鼹鼠一样深入挖掘来清理您的 Mac，CleanMyMac、OnyX 开源替代品

## 基本信息
- **标题**: 像鼹鼠一样深入挖掘来清理您的 Mac，CleanMyMac、OnyX 开源替代品
- **来源**: 微信公众号
- **作者**: 几乎满级
- **发布时间**: 2025年10月05日
- **URL**: https://mp.weixin.qq.com/s/qS7fsXhko1bT_rlqkprmMA
- **分类**: 工具推荐
- **标签**: #AI #GitHub #工具推荐 #技术分析 #开源

## 内容摘要
Mole 是一个开源的 Mac 系统清理 /磁盘维护工具（命令行 /交互式界面），可深度系统清理、智能应用卸载、回收被浪费的磁盘空间，是类似 CleanMyMac、OnyX 等工具的开源替代品。

功能速览

深度系统清理：

•

清理用户应用程序缓存、日志和临时文件，通常可释放 20-50GB 空间。

•

清理浏览器缓存（如 Chrome、Safari），通常可释放 5-15GB 空间。

•

清理开发工具相关文件（如 npm、Docker、Xcode），通常可释放 15-40GB 空间。

•

清理其他应用程序缓存（如 Dropbox、Spotify），通常可释放 10-40GB...

## 完整内容

Mole 是一个开源的 Mac 系统清理 /磁盘维护工具（命令行 /交互式界面），可深度系统清理、智能应用卸载、回收被浪费的磁盘空间，是类似 CleanMyMac、OnyX 等工具的开源替代品。

功能速览

深度系统清理：

•

清理用户应用程序缓存、日志和临时文件，通常可释放 20-50GB 空间。

•

清理浏览器缓存（如 Chrome、Safari），通常可释放 5-15GB 空间。

•

清理开发工具相关文件（如 npm、Docker、Xcode），通常可释放 15-40GB 空间。

•

清理其他应用程序缓存（如 Dropbox、Spotify），通常可释放 10-40GB 空间。

•

提供白名单保护功能，允许用户选择保护特定的缓存文件。

智能应用程序卸载

•

支持从 22 个以上的位置清理应用程序残留文件，比标准卸载工具更彻底。

•

卸载应用程序时，会删除应用程序本身以及相关的支持文件、偏好设置、日志、WebKit 存储、扩展和插件等。

•

支持通过交互式菜单选择要卸载的应用程序。

磁盘空间分析

•

提供交互式的磁盘空间分析功能，用户可以通过类似文件管理器的方式浏览文件夹，快速找到并删除大文件。

•

显示每个文件夹和文件的大小，帮助用户直观地了解磁盘空间的占用情况。
快速且轻量级

•

基于终端运行，无多余依赖，使用箭头键导航和分页显示，响应迅速。

大量空间回收：通过清理系统垃圾和卸载应用程序，用户可以轻松回收 100GB 以上的磁盘空间。

安装与部署
•
通过 curl 安装：curl -fsSL https://raw.githubusercontent.com/tw93/mole/main/install.sh | bash。
•
通过 Homebrew 安装：brew install tw93/tap/mole。

更新/卸载

•
更新：mole update 或 brew upgrade mole。
•
卸载：mole remove 或 brew uninstall mole。
使用流程
1
安装：curl/bash，运行 mole 验证。
2
预览清理：mole clean --dry-run，查看回收列表。
3
执行清理：mole clean，确认后运行。
4
白名单：mole clean --whitelist，选保护项。
5
卸载 App：mole uninstall，交互选 App。
6
分析磁盘：mole analyze，导航删除大文件。
7
帮助：mole --help。
适用场景
•

磁盘空间紧张的 Mac 用户: 尤其适合那些长期使用 Mac 电脑，未定期清理系统缓存、导致磁盘空间被大量“隐藏”文件占用的用户。

•

开发者: 由于可以清理 Xcode 的 Derived Data、npm/yarn/pnpm 缓存等，对 macOS 开发者非常实用。

•

追求彻底卸载的用户: 适用于希望完全移除应用，不留任何残留文件的强迫症或注重隐私的用户。

项目信息速览
•
项目地址：github.com/tw93/mole
•
开发者：tw93
•
Stars / Forks：1.4k+ ⭐ / 52 Forks
•
License：MIT

---

**处理完成时间**: 2025年10月09日
**文章字数**: 1386字
**内容类型**: 微信文章
**自动分类**: 工具推荐
**处理状态**: ✅ 完成
