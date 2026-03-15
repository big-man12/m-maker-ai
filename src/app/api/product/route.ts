import { NextResponse } from 'next/server';
import { getLatestProduct } from '@/lib/product-api';

export async function GET() {
  try {
    const product = await getLatestProduct();
    return Response.json(product || {});
  } catch (error) {
    console.warn("로컬 DB 미연결: 기본 제품 데이터로 대체합니다.");
    return Response.json({
      name: "m-maker-ai",
      image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?q=80&w=1000",
      description: "고품격 소셜 마케팅 자동화 도구"
    });
  }
}
