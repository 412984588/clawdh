document.addEventListener('DOMContentLoaded', async () => {
  const setupDiv = document.getElementById('setup');
  const settingsDiv = document.getElementById('settings');
  const summarizeBtn = document.getElementById('summarize');
  const resultDiv = document.getElementById('result');
  const statusDiv = document.getElementById('status');
  const saveKeyBtn = document.getElementById('saveKey');
  const apiKeyInput = document.getElementById('apiKey');
  const maxCommentsInput = document.getElementById('maxComments');

  const DEFAULT_MAX_COMMENTS = 15;

  const localState = await chrome.storage.local.get(['max_comments']);
  maxCommentsInput.value = clampMaxComments(localState.max_comments ?? DEFAULT_MAX_COMMENTS);

  // 检查是否已有 key
  const resp = await chrome.runtime.sendMessage({ action: 'hasApiKey' });
  if (resp.hasKey) {
    setupDiv.style.display = 'none';
    settingsDiv.style.display = 'block';
    summarizeBtn.style.display = 'block';
    statusDiv.textContent = '在 Reddit 帖子页点击按钮即可';
  } else {
    setupDiv.style.display = 'block';
    settingsDiv.style.display = 'none';
    summarizeBtn.style.display = 'none';
  }

  // 保存 key
  saveKeyBtn.addEventListener('click', async () => {
    const key = apiKeyInput.value.trim();
    if (!key.startsWith('sk-')) {
      alert('请输入有效的 API Key（以 sk- 开头）');
      return;
    }
    await chrome.runtime.sendMessage({ action: 'setApiKey', key });
    setupDiv.style.display = 'none';
    settingsDiv.style.display = 'block';
    summarizeBtn.style.display = 'block';
    statusDiv.textContent = '✅ Key 已保存';
  });

  // 生成摘要
  summarizeBtn.addEventListener('click', () => run());

  async function run(retry = 0) {
    summarizeBtn.disabled = true;
    statusDiv.textContent = '提取帖子内容...';
    resultDiv.innerHTML = '<div class="loading">⏳ 提取中...</div>';

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      const url = tab?.url || '';

      // 中文注释：先做页面校验，避免在非 Reddit 页面盲目注入脚本。
      if (!/https:\/\/(www\.)?reddit\.com\/r\/.+\/comments\//.test(url)) {
        throw new Error('请先打开 Reddit 帖子详情页（/r/.../comments/...）');
      }

      const maxComments = clampMaxComments(maxCommentsInput.value);
      await chrome.storage.local.set({ max_comments: maxComments });

      // 注入 content script（防止未自动注入）
      await chrome.scripting
        .executeScript({
          target: { tabId: tab.id },
          files: ['content.js']
        })
        .catch(() => {});

      await new Promise((r) => setTimeout(r, 300));

      const cr = await chrome.tabs.sendMessage(tab.id, {
        action: 'extractContent',
        options: { maxComments }
      });
      if (!cr || !cr.success) throw new Error(cr?.error || '无法提取内容，请确认在Reddit帖子页');

      if (!cr.content.comments || cr.content.comments.length === 0) {
        throw new Error('未找到评论，请确认页面已加载完成');
      }

      statusDiv.textContent = `AI 分析中...（${cr.content.comments.length}条样本）`;
      resultDiv.innerHTML = '<div class="loading">⏳ AI 生成摘要中...</div>';

      const ai = await chrome.runtime.sendMessage({ action: 'summarize', content: cr.content });
      if (!ai.success) throw new Error(ai.error);

      statusDiv.textContent = '✅ 完成';
      resultDiv.innerHTML = '<div class="summary">' + fmt(ai.summary) + '</div>';
      addExport(ai.summary, cr.content.title);
    } catch (e) {
      if (retry < 1) {
        statusDiv.textContent = '重试...';
        await new Promise((r) => setTimeout(r, 1000));
        return run(retry + 1);
      }
      statusDiv.textContent = '❌ 失败';
      resultDiv.innerHTML = '<div class="error">' + e.message + '</div>';
    } finally {
      summarizeBtn.disabled = false;
    }
  }

  function clampMaxComments(value) {
    const parsed = Number.parseInt(value, 10);
    if (!Number.isFinite(parsed)) return DEFAULT_MAX_COMMENTS;
    return Math.max(5, Math.min(50, parsed));
  }

  function fmt(t) {
    return t.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br>').replace(/^- /gm, '• ');
  }

  function addExport(summary, title) {
    const d = document.createElement('div');
    d.className = 'export-row';
    d.innerHTML =
      '<button class="btn btn-secondary" id="cpBtn">📋 复制</button>' +
      '<button class="btn btn-secondary" id="dlBtn">💾 下载</button>';
    resultDiv.appendChild(d);

    document.getElementById('cpBtn').addEventListener('click', () => {
      navigator.clipboard.writeText(summary);
      document.getElementById('cpBtn').textContent = '✅ 已复制';
      setTimeout(() => (document.getElementById('cpBtn').textContent = '📋 复制'), 2000);
    });

    document.getElementById('dlBtn').addEventListener('click', () => {
      const b = new Blob(['# ' + title + '\n\n' + summary], { type: 'text/markdown' });
      const u = URL.createObjectURL(b);
      const a = document.createElement('a');
      a.href = u;
      a.download = 'reddit_digest.md';
      a.click();
      URL.revokeObjectURL(u);
    });
  }
});
