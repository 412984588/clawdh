# suna 堪称开源版manus,本地安装部署

## 基本信息
- **标题**: suna 堪称开源版manus,本地安装部署
- **来源**: 微信公众号
- **作者**: 张士林
- **发布时间**: 2025年08月04日
- **URL**: https://mp.weixin.qq.com/s/hK08dt40cmiYERcylSJs5Q
- **分类**: 技术教程
- **标签**: #AI #GitHub #效率 #深度学习 #开源 #产品

## 内容摘要
suna一个字很nice，要不openmanus好一个级别，但是他的配置内容很多， 即使官方给了一个 setup.py也是很麻烦，本文一步步进行本地部署。

部署流程包含：

配置 Supabase 项目（用于数据库和身份验证）
设置 Redis（用于缓存和会话管理）
部署 Daytona（实现安全的代理执行）
集成大语言模型提供商（Anthropic、OpenAI、OpenRouter 等）
配置网络搜索与爬取功能（Tavily、Firecrawl）
设置 QStash（用于后台任务处理和工作流）
配置 Webhook 处理（实现自动化任务）
可选集成项（RapidAPI、Smithery ...

## 完整内容

suna一个字很nice，要不openmanus好一个级别，但是他的配置内容很多， 即使官方给了一个 setup.py也是很麻烦，本文一步步进行本地部署。

部署流程包含：

配置 Supabase 项目（用于数据库和身份验证）
设置 Redis（用于缓存和会话管理）
部署 Daytona（实现安全的代理执行）
集成大语言模型提供商（Anthropic、OpenAI、OpenRouter 等）
配置网络搜索与爬取功能（Tavily、Firecrawl）
设置 QStash（用于后台任务处理和工作流）
配置 Webhook 处理（实现自动化任务）
可选集成项（RapidAPI、Smithery 用于自定义代理）
一 快速开始
克隆仓库 ，创建conda环境
git clone https://github.com/kortix-ai/suna.gitcd suna
conda create --name suna python==3.12
python setup.py # 运行设置向导
步骤1  安装模式选择，这里选择了手动
Step 1/18: Choose Setup Method
==================================================
ℹ️  You can start Suna using either Docker Compose or by manually starting the services.
How would you like to set up Suna?
[1] Docker Compose (recommended, starts all services automatically)
[2] Manual (requires installing dependencies and running services manually)
这里我输入2  选择了手动
Enter your choice (1 or 2): 2
步骤2 会检测一些基础的安装，如果没有需要安装下，比较简单，下面图就是安装好的结果
Step 2/18: Checking Requirements
==================================================


✅  git is installed.
✅  uv is installed.
✅  node is installed.
✅  npm is installed.
✅  docker is installed.
ℹ️  Checking if Docker is running...
✅  Docker is running.
ℹ️  Verifying project structure...
✅  Suna repository detected.
步骤3  需要Supabase的信息
   首先打开网址https://supabase.com/dashboard/organizations， 第一次需要建立一个Organizations
获取 SupabaseProjectURL 这个后面要用的
获取Supabase anon key 和Supabase service role key
把上面获取的内容进行复制进去，如下面的展示
Step 3/18: Collecting Supabase Information
==================================================


ℹ️  You'll need a Supabase project. Visit https://supabase.com/dashboard/projects to create one.
ℹ️  In your project settings, go to 'API' to find the required information.
Press Enter to continue once you have your project details...
Enter your Supabase Project URL (e.g., https://xyz.supabase.co): 
Enter your Supabase anon key: eyJhbGciOiJIUzI1NiIsMqivvR-6o
Enter your Supabase service role key: eyJhbG
✅  Supabase information saved.:


步骤4  获取daytona信息
登录网址 https://app.daytona.io/ 先获取key
需要一个 snapshots ，我这里写的是

image: kortix/suna:0.1.2，当你运行的时候需要看下终端提示的是哪个版本 例如 image: kortix/suna:0.1.3 或者 image: kortix/suna:0.1.4等

成功后看到 active绿色的标志，
Step 4/18: Collecting Daytona Information
==================================================


ℹ️  Suna uses Daytona for sandboxing. Visit https://app.daytona.io/ to create an account.
ℹ️  Then, generate an API key from the 'Keys' menu.
Press Enter to continue once you have your API key...
Enter your Daytona API key:
✅  Daytona information saved.
⚠️  IMPORTANT: You must create a Suna snapshot in Daytona for it to work properly.
ℹ️  Visit https://app.daytona.io/dashboard/snapshots to create a snapshot.
ℹ️  Create a snapshot with these exact settings:
ℹ️     - Name:          kortix/suna:0.1.2
ℹ️     - Snapshot name: kortix/suna:0.1.2
ℹ️     - Entrypoint:    /usr/bin/supervisord -n -c /etc/supervisor/conf.d/supervisord.conf
Press Enter to continue once you have created the snapshot..
步骤5  配置大模型，因为这里是有选项的，  可以登录https://openrouter.ai/ 进行申请key
Step 5/18: Collecting LLM API Keys
==================================================


ℹ️  Suna requires at least one LLM provider. Supported: OpenAI, Anthropic, Google Gemini, OpenRouter.


Select LLM providers to configure (e.g., 1,3):
[1] OpenAI
[2] Anthropic
[3] Google Gemini
[4] OpenRouter
Select providers: 4
Enter your Openrouter API key: sk-
✅  LLM keys saved. Default model: openrouter/google/gemini-2.5-pro


步骤6  可选项，输入n可以跳过
Step 6/18: Configure AI-Powered Code Editing (Optional)
==================================================


ℹ️  Suna uses Morph for fast, intelligent code editing.
ℹ️  This is optional but highly recommended for the best experience.
ℹ️  An OpenRouter API key is already configured. It can be used as a fallback for code editing if you don't provide a Morpph key.
Do you want to add a Morph API key now? (y/n): y
ℹ️  Great! Please get your API key from: https://morphllm.com/api-keys
Enter your Morph API key (or press Enter to skip): sk-cunVSOB
步骤7  网络爬虫的配置，获取key
登录https://tavily.com
登录https://www.firecrawl.dev/app/api-keys
Step 7/18: Collecting Search and Scraping API Keys
==================================================


ℹ️  Suna uses Tavily for search and Firecrawl for web scraping.
ℹ️  Get a Tavily key at https://tavily.com and a Firecrawl key at https://firecrawl.dev
Press Enter to continue once you have your keys...
Enter your Tavily API key: tvly-HbTgMN
Enter your Firecrawl API key: fc-943ce5b
Are you self-hosting Firecrawl? (y/N): n
✅  Search and scraping keys saved.
步骤 8和9都是可选的，可以跳过
Step 8/18: Collecting RapidAPI Key (Optional)
==================================================


ℹ️  A RapidAPI key enables extra tools like LinkedIn scraping.
ℹ️  Get a key at https://rapidapi.com/. You can skip this and add it later.
Enter your RapidAPI key (or press Enter to skip): ••••
✅  RapidAPI key saved.


Step 9/18: Collecting Smithery API Key (Optional)
==================================================


ℹ️  A Smithery API key is only required for custom agents and workflows.
ℹ️  Get a key at https://smithery.ai/. You can skip this and add it later.
Enter your Smithery API key (or press Enter to skip):
ℹ️  Skipping Smithery API key.
步骤 10  qstash 这个需要申请下，访问网址https://console.upstash.com/qstash， 按照下面的内容就可以获取
Step 10/18: Collecting QStash Configuration
==================================================


ℹ️  QStash is required for Suna's background job processing and scheduling.
ℹ️  QStash enables workflows, automated tasks, and webhook handling.
ℹ️  Get your credentials at https://console.upstash.com/qstash
Press Enter to continue once you have your QStash credentials...
Enter your QStash token: eyJVc2VySUQiM5LTQ2YjY5ODNlZDMiLCJQYXNzd29yZCI6ImNkYWNlN2JiM2MwMDRiZTM5ZTVjMTcyNDc1NWJmMTRjIn0=
Enter your QStash current signing key: sig_gaWf9H
Enter your QStash next signing key: siMfZ1
✅  QStash configuration saved.


Step 11/18: Collecting MCP Configuration
==================================================


ℹ️  Generating a secure encryption key for MCP credentials...
✅  MCP encryption key generated.
✅  MCP configuration saved.
步骤12  可以跳过
Pipedream Project ID


点击new按钮的时候， 会得到Client ID和Client Secret


Step 12/18: Collecting Pipedream Configuration (Optional)
==================================================


ℹ️  Pipedream enables workflow automation and MCP integrations.
ℹ️  Create a Pipedream Connect project at https://pipedream.com/connect to get your credentials.
ℹ️  You can skip this step and configure Pipedream later.
Do you want to configure Pipedream integration? (y/N): y
Enter your Pipedream Project ID (or press Enter to skip): proj_ELs
Enter your Pipedream Client ID: OI42XYMJC07GO7y
Enter your Pipedream Client Secret: 0ER2bmZ
Enter your Pipedream Environment (development/production): [development]:
✅  Pipedream configuration saved.
步骤 13 可以跳过
Step 13/18: Collecting Slack Configuration (Optional)
==================================================


ℹ️  Slack integration enables communication and notifications.
ℹ️  Create a Slack app at https://api.slack.com/apps to get your credentials.
ℹ️  You can skip this step and configure Slack later.
Do you want to configure Slack integration? (y/N): y
Enter your Slack Client ID (or press Enter to skip): 92910
Enter your Slack Client Secret: 8d39627185aa608bf9
Enter your Slack Redirect URI: [http://localhost:3000/api/integrations/slack/callback]:
✅  Slack configuration saved.
步骤14 获取一个webhook地址
登录https://dashboard.ngrok.com/get-started/setup/windows 下载exe，然后用起来ngrok http http://localhost:8080  得到了webhook地址
Step 14/18: Collecting Webhook Configuration
==================================================


ℹ️  Webhook base URL is required for workflows to receive callbacks.
ℹ️  This must be a publicly accessible URL where Suna can receive webhooks.
ℹ️  For local development, you can use services like ngrok or localtunnel.
Enter your webhook base URL (e.g., https://yourdomain.com): https://e5c1ddf177a9.ngrok-free.app
✅  Webhook configuration saved.


步骤16  supbase 这个是一个大头
Step 16/18: Setting up Supabase Database
==================================================


ℹ️  This step will link your project to Supabase and push database migrations.
ℹ️  You can skip this if you've already set up your database or prefer to do it manually.
Do you want to skip the database setup? (Y/n): y
这里我跳过了，后面手动进行处理
# Login to Supabase CLI
supabase login


# Link to your project (find your project reference in the Supabase dashboard)
supabase link --project-ref your_project_reference_id


# Push database migrations
supabase db push
login的时候会弹出网页 需要复制
设置权限
在 Supabase 控制台，点击左侧的 "Settings" → "API"滚动到 "Exposed schemas" 部分确保 basejump 被勾选 ✅
步骤17-18 呼呼自己就安装了
Step 17/18: Installing Dependencies
==================================================


ℹ️  Installing frontend dependencies with npm...


added 954 packages, and audited 955 packages in 48s


283 packages are looking for funding
  run `npm fund` for details


1 moderate severity vulnerability


To address all issues (including breaking changes), run:
  npm audit fix --force


Run `npm audit` for details.
✅  Frontend dependencies installed.
ℹ️  Installing backend dependencies with uv...
ℹ️  Creating virtual environment...
Using CPython 3.12.10
Creating virtual environment at: .venv
Activate with: .venv\Scripts\activate
✅  Virtual environment created.
Resolved 154 packages in 3ms
░░░░░░░░░░░░░░░░░░░░ [0/151] Installing wheels...                                                                         
warning: Failed to hardlink files; falling back to full copy. This may lead to degraded performance.
         If the cache and target directories are on different filesystems, hardlinking may not be supported.
         If this is intentional, set `export UV_LINK_MODE=copy` or use `--link-mode=copy` to suppress this warning.       
Installed 151 packages in 7.57s
 + aioboto3==14.3.0
 + aiobotocore==2.22.0
 + aiofiles==24.1.0
 + aiohappyeyeballs==2.6.1
 + aiohttp==3.12.0
 + aiohttp-retry==2.9.1
 + aioitertools==0.12.0
 + aiosignal==1.3.2
 + altair==4.2.2
 + annotated-types==0.7.0
 + anyio==4.9.0
 + apscheduler==3.11.0
 + asyncio==3.4.3
 + attrs==25.3.0
 + automat==25.4.16
 + backoff==2.2.1
 + boto3==1.37.3
 + botocore==1.37.3
 + certifi==2024.2.2
 + cffi==1.17.1
 + chardet==5.2.0
 + charset-normalizer==3.4.2
 + click==8.1.7
 + colorama==0.4.6
 + constantly==23.10.4
 + croniter==6.0.0
 + cryptography==45.0.4
 + daytona-api-client==0.21.0
 + daytona-api-client-async==0.21.0
 + daytona-sdk==0.21.0
 + deprecated==1.2.18
 + deprecation==2.1.0
 + distro==1.9.0
 + dnspython==2.7.0
 + dramatiq==1.18.0
 + e2b==1.5.1
 + e2b-code-interpreter==1.2.0
 + email-validator==2.0.0
 + entrypoints==0.4
 + environs==9.5.0
 + et-xmlfile==2.0.0
 + exa-py==1.9.1
 + fastapi==0.115.12
 + filelock==3.18.0
 + frozenlist==1.7.0
 + fsspec==2025.5.1
 + gotrue==2.12.3
 + gunicorn==23.0.0
 + h11==0.16.0
 + h2==4.2.0
 + hpack==4.1.0
 + httpcore==1.0.9
 + httpx==0.28.0
 + httpx-sse==0.4.0
 + huggingface-hub==0.33.0
 + hyperframe==6.1.0
 + hyperlink==21.0.0
 + idna==3.10
 + importlib-metadata==8.7.0
 + incremental==24.7.2
 + iniconfig==2.1.0
 + jinja2==3.1.6
 + jiter==0.10.0
 + jmespath==1.0.1
 + jsonschema==4.24.0
 + jsonschema-specifications==2025.4.1
 + langfuse==2.60.5
 + litellm==1.72.2
 + lxml==6.0.0
 + mailtrap==2.0.1
 + markupsafe==3.0.2
 + marshmallow==3.26.1
 + mcp==1.9.4
 + multidict==6.4.4
 + nest-asyncio==1.6.0
 + nodeenv==1.9.1
 + numpy==2.3.0
 + openai==1.90.0
 + openpyxl==3.1.2
 + packaging==24.1
 + pandas==2.3.0
 + pika==1.3.2
 + pillow==11.3.0
 + pluggy==1.6.0
 + postgrest==1.1.1
 + prisma==0.15.0
 + prometheus-client==0.21.1
 + prompt-toolkit==3.0.36
 + propcache==0.3.2
 + protobuf==5.29.5
 + pycparser==2.22
 + pycryptodomex==3.23.0
 + pydantic==2.11.7
 + pydantic-core==2.33.2
 + pydantic-settings==2.9.1
 + pyjwt==2.10.1
 + pypdf2==3.0.1
 + pytesseract==0.3.13
 + pytest==8.3.3
 + pytest-asyncio==0.24.0
 + pytest-mock==3.14.1
 + python-dateutil==2.9.0.post0
 + python-docx==1.1.0
 + python-dotenv==1.0.1
 + python-multipart==0.0.20
 + python-ripgrep==0.0.6
 + pytz==2025.2
 + pyyaml==6.0.1
 + qstash==3.0.0
 + questionary==2.0.1
 + realtime==2.6.0
 + redis==5.2.1
 + referencing==0.36.2
 + regex==2024.11.6
 + requests==2.32.3
 + rpds-py==0.25.1
 + s3transfer==0.11.3
 + sentry-sdk==2.29.1
 + setuptools==75.3.0
 + six==1.17.0
 + sniffio==1.3.1
 + sse-starlette==2.3.6
 + starlette==0.46.2
 + storage3==0.12.0
 + strenum==0.4.15
 + stripe==12.0.1
 + structlog==25.4.0
 + supabase==2.17.0
 + supafunc==0.10.1
 + tavily-python==0.5.4
 + tiktoken==0.9.0
 + tokenizers==0.21.1
 + toml==0.10.2
 + tomlkit==0.13.3
 + toolz==1.0.0
 + tqdm==4.67.1
 + twisted==25.5.0
 + typing-extensions==4.14.0
 + typing-inspection==0.4.1
 + tzdata==2025.2
 + tzlocal==5.3.1
 + upstash-redis==1.3.0
 + urllib3==2.4.0
 + uvicorn==0.27.1
 + vncdotool==1.2.0
 + wcwidth==0.2.13
 + websockets==14.2
 + wrapt==1.17.2
 + yarl==1.20.1
 + zipp==3.23.0
 + zope-interface==7.2
✅  Backend dependencies and package installed.


Step 18/18: Starting Suna
==================================================


ℹ️  All configurations are complete. Manual start is required.


✨ Suna Setup Complete! ✨


ℹ️  Suna is configured to use openrouter/google/gemini-2.5-pro as the default LLM.
ℹ️  Delete the .setup_progress file to reset the setup.
ℹ️  To start Suna, you need to run these commands in separate terminals:


1. Start Infrastructure (in project root):
   docker compose up redis rabbitmq -d


2. Start Frontend (in a new terminal):
   cd frontend && npm run dev


3. Start Backend (in a new terminal):
   cd backend && uv run api.py


4. Start Background Worker (in a new terminal):
   cd backend && uv run dramatiq run_agent_background


Once all services are running, access Suna at: http://localhost:3000


二 访问网页
访问端口 http://localhost:3000


附录： 可以需要的其他安装命令

先安装scoop 

PS C:\Users\Administrator> Set-ExecutionPolicy RemoteSigned -Scope CurrentUser  -Force
PS C:\Users\Administrator> irm scoop.201704.xyz -outfile 'install.ps1'
PS C:\Users\Administrator> .\install.ps1 -ScoopDir 'E:\Scoop' -ScoopGlobalDir 'E:\GlobalScoopApps'  -RunAsAdmin

安装supabase cli 的官方地址

https://supabase.com/docs/guides/local-development/cli/getting-started?queryGroups=platform&platform=windows







---

**处理完成时间**: 2025年10月09日
**文章字数**: 14295字
**内容类型**: 微信文章
**自动分类**: 技术教程
**处理状态**: ✅ 完成
