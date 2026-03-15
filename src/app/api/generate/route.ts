import { generateSocialContent } from '@/lib/social-engine';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { input, category } = await request.json();
    
    if (!input) {
      return NextResponse.json({ error: "입력 내용이 없습니다." }, { status: 400 });
    }

    if (!process.env.GOOGLE_API_KEY) {
        return NextResponse.json({ error: "Vercel 서버에서 GOOGLE_API_KEY를 찾을 수 없습니다. 환경 변수 설정을 확인하고 반드시 Redeploy 해주세요." }, { status: 500 });
    }

    const content = await generateSocialContent(input, category || 'general');
    
    // social-engine.ts에서 에러 시 반환하는 문자열 체크
    if (content.includes("콘텐츠 생성 오류")) {
        return NextResponse.json({ error: content }, { status: 500 });
    }

    return NextResponse.json({ content });
  } catch (error: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
    console.error("API Route Error:", error);
    return NextResponse.json({ error: "서버 오류가 발생했습니다." }, { status: 500 });
  }
}
