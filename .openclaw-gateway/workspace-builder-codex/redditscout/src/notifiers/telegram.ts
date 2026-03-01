import { TelegramConfig } from "../types.js";

export async function sendTelegramMessage(config: TelegramConfig, text: string): Promise<void> {
  // Telegram 单条消息上限约 4096 字符，超长时切片发送。
  const chunkSize = 3800;
  const chunks: string[] = [];
  for (let i = 0; i < text.length; i += chunkSize) {
    chunks.push(text.slice(i, i + chunkSize));
  }

  for (const chunk of chunks) {
    const response = await fetch(`https://api.telegram.org/bot${config.botToken}/sendMessage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: config.chatId,
        text: chunk,
        disable_web_page_preview: true,
      }),
    });

    if (!response.ok) {
      const reason = await response.text();
      throw new Error(`Telegram 推送失败: ${response.status} ${reason}`);
    }
  }
}
