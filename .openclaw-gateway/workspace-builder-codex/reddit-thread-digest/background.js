// background.js - 直接调用 right.codes API（无需本地服务器）

const API_URL = "https://right.codes/codex/v1/chat/completions";
const MODEL = "gpt-5.2-high";
const REQUEST_TIMEOUT_MS = 45_000;
const MAX_PROMPT_CHARS = 18_000;

// 从 storage 读取 API key
async function getApiKey() {
  return new Promise((resolve) => {
    chrome.storage.local.get(["api_key"], (result) => {
      resolve(result.api_key || "");
    });
  });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "summarize") {
    handleSummarize(request.content).then(sendResponse);
    return true;
  }
  if (request.action === "setApiKey") {
    chrome.storage.local.set({ api_key: request.key });
    sendResponse({ success: true });
    return true;
  }
  if (request.action === "hasApiKey") {
    getApiKey().then((key) => sendResponse({ hasKey: !!key }));
    return true;
  }
});

async function handleSummarize(content) {
  try {
    const apiKey = await getApiKey();
    if (!apiKey) {
      return { success: false, error: "请先设置 API Key" };
    }

    const prompt = buildPrompt(content);

    // 中文注释：增加超时，避免网络异常导致 popup 一直转圈。
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    let response;
    try {
      response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            {
              role: "system",
              content:
                "你是Reddit分析专家，擅长从长帖中提取关键信息。输出中文。",
            },
            { role: "user", content: prompt },
          ],
          max_tokens: 2000,
          temperature: 0.3,
        }),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeoutId);
    }

    if (!response.ok) {
      const errText = await response.text();
      return {
        success: false,
        error: `API错误(${response.status}): ${errText.substring(0, 180)}`,
      };
    }

    const data = await response.json();
    const summary = data.choices?.[0]?.message?.content || "无法生成摘要";
    return { success: true, summary };
  } catch (error) {
    if (error?.name === "AbortError") {
      return {
        success: false,
        error: "请求超时，请稍后重试（可减少评论样本数）",
      };
    }
    return { success: false, error: error.message };
  }
}

function buildPrompt(content) {
  const title = sanitizeText(content?.title || "未知标题");
  const postBody = sanitizeText(content?.postBody || "(无正文)").slice(0, 2500);
  const comments = Array.isArray(content?.comments) ? content.comments : [];

  // 中文注释：兼容 score/votes 两种字段，避免评分全为 0。
  const rankedComments = comments
    .map((comment) => ({
      score: normalizeScore(comment),
      text: sanitizeText(comment?.text || "").slice(0, 600),
    }))
    .filter((comment) => comment.text.length > 0)
    .sort((a, b) => b.score - a.score);

  const head = `分析以下Reddit帖子和评论，生成结构化摘要。\n\n帖子标题：${title}\n帖子内容：${postBody}\n\n精选评论：\n`;
  const tail = `\n\n按以下格式输出：\n\n📌 核心问题\n（一句话概括）\n\n✅ 正方观点\n- 观点1\n- 观点2\n\n❌ 反方观点\n- 观点1\n- 观点2\n\n💡 共识\n（大家普遍同意的点）\n\n🔥 争议点\n（争议最大的点）\n\n⭐ 最佳回答\n（最有价值的评论摘要）`;

  const budget = Math.max(2_000, MAX_PROMPT_CHARS - head.length - tail.length);
  const selected = [];
  let usedChars = 0;

  for (const [index, comment] of rankedComments.entries()) {
    const line = `${index + 1}. [${comment.score}分] ${comment.text}`;
    if (usedChars + line.length > budget) break;
    selected.push(line);
    usedChars += line.length;
  }

  const commentList = selected.length > 0 ? selected.join("\n") : "(无评论)";

  return head + commentList + tail;
}

function sanitizeText(text) {
  return String(text)
    .replace(/\s+/g, " ")
    .replace(/\u0000/g, "")
    .trim();
}

function normalizeScore(comment) {
  const raw = comment?.score ?? comment?.votes ?? 0;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) ? parsed : 0;
}
