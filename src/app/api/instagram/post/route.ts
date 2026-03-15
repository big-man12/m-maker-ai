import { NextResponse } from 'next/server';
import { postToInstagram } from '@/lib/instagram';

export async function POST(request: Request) {
  try {
    const { imageUrl, caption } = await request.json();

    if (!imageUrl || !caption) {
      return NextResponse.json({ error: "이미지 URL과 캡션이 필요합니다." }, { status: 400 });
    }

    const result = await postToInstagram(imageUrl, caption);

    const discordWebhookUrl = process.env.DISCORD_WEBHOOK_URL;

    if (!result.success) {
      // 인스타그램 포스팅 실패 시 디스코드 알림 전송
      if (discordWebhookUrl) {
        try {
          await fetch(discordWebhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              content: `인스타그램 포스팅 실패 알림\n에러 내용: ${result.error}\n확인이 필요합니다.`
            })
          });
        } catch (discordError) {
          console.error("Discord error notification failed:", discordError);
        }
      }
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    // 디스코드 성공 알림 전송 (이모지 및 특수 기호 제외)
    if (discordWebhookUrl) {
      try {
        await fetch(discordWebhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: `인스타그램 포스팅 성공 알림\n---\n내용 요약: ${caption.substring(0, 100)}...\n이미지: ${imageUrl}\n---\n이 문구는 시스템을 통해 자동으로 게시되었습니다.`
          })
        });
      } catch (discordError) {
        console.error("Discord notification failed:", discordError);
      }
    }

    return NextResponse.json({ success: true, id: result.id });
  } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
    console.error("Instagram API Route Error:", error);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
