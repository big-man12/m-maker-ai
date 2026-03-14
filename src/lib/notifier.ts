/**
 * Discord Webhook을 통한 실시간 알림 서비스
 */

export async function sendDiscordNotification(message: string) {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;

  if (!webhookUrl) {
    console.warn("DISCORD_WEBHOOK_URL missing. Skipping notification.");
    return { success: false, error: "Webhook URL missing" };
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content: message,
        username: "Money Maker AI Notifier",
        avatar_url: "https://m-maker-ai.vercel.app/favicon.ico"
      })
    });

    if (!response.ok) {
      throw new Error(`Discord API error: ${response.statusText}`);
    }

    return { success: true };
  } catch (error: any) {
    console.error("Discord notification failed:", error.message);
    return { success: false, error: error.message };
  }
}
