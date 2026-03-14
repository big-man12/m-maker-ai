import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';
import { sendDiscordNotification } from '@/lib/notifier';

export const dynamic = 'force-dynamic';

const GLOBAL_BASE = 12400;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get('productId') || 'global';

  try {
    // 테이블 자동 생성 (최초 1회 실행 보장)
    await sql`
      CREATE TABLE IF NOT EXISTS product_hits (
        id SERIAL PRIMARY KEY,
        product_id TEXT UNIQUE NOT NULL,
        total INTEGER DEFAULT 0,
        today INTEGER DEFAULT 0,
        last_visit DATE DEFAULT CURRENT_DATE
      );
    `;

    const { rows } = await sql`
      SELECT total, today, last_visit FROM product_hits WHERE product_id = ${productId}
    `;

    if (rows.length === 0) {
      const todayStr = new Date().toISOString().split('T')[0];
      // 초기 데이터 생성
      await sql`
        INSERT INTO product_hits (product_id, total, today, last_visit)
        VALUES (${productId}, 0, 0, CURRENT_DATE)
      `;
      return NextResponse.json({ total: productId === 'global' ? GLOBAL_BASE : 0, today: 0 }, {
        headers: { 'Cache-Control': 'no-store' }
      });
    }

    const stats = rows[0];
    const todayDate = new Date();
    const todayStr = todayDate.toISOString().split('T')[0];
    
    // DB에서 온 날짜를 문자열로 변환하여 비교
    const lastVisit = new Date(stats.last_visit);
    const lastVisitStr = lastVisit.toISOString().split('T')[0];

    let todayCount = stats.today;
    if (lastVisitStr !== todayStr) {
      await sql`
        UPDATE product_hits SET today = 0, last_visit = CURRENT_DATE WHERE product_id = ${productId}
      `;
      todayCount = 0;
    }

    return NextResponse.json({
      total: (productId === 'global' ? GLOBAL_BASE : 0) + stats.total,
      today: todayCount
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });
  } catch (error: any) {
    console.error("Postgres GET Error:", error.message);
    // 에러 발생 시에도 최소한 작동하는 것처럼 보이게 하지만, 
    // 실제로는 DB 연동이 안 된 상태임을 알 수 있게 로그를 남겨야 함
    return NextResponse.json({ total: GLOBAL_BASE, today: -1, dbError: error.message });
  }
}

export async function POST(request: Request) {
  let productId = 'global';
  try {
    const text = await request.text();
    if (text) {
      const body = JSON.parse(text);
      productId = body.productId || 'global';
    }
  } catch (e) {
    console.error("Postgres POST Body Parse Error:", e);
  }

  try {
    const todayStr = new Date().toISOString().split('T')[0];
    
    // 테이블 자동 생성 (최초 1회 실행 보장)
    await sql`
      CREATE TABLE IF NOT EXISTS product_hits (
        id SERIAL PRIMARY KEY,
        product_id TEXT UNIQUE NOT NULL,
        total INTEGER DEFAULT 0,
        today INTEGER DEFAULT 0,
        last_visit DATE DEFAULT CURRENT_DATE
      );
    `;

    // UPSERT 형식으로 업데이트
    await sql`
      INSERT INTO product_hits (product_id, total, today, last_visit)
      VALUES (${productId}, 1, 1, CURRENT_DATE)
      ON CONFLICT (product_id) DO UPDATE SET
        total = product_hits.total + 1,
        today = CASE 
                  WHEN product_hits.last_visit = CURRENT_DATE THEN product_hits.today + 1 
                  ELSE 1 
                END,
        last_visit = CURRENT_DATE;
    `;

    // 실시간 알림 발송 (성공 여부와 관계없이 프로세스 진행)
    if (productId === 'global') {
      sendDiscordNotification(`🚀 새로운 방문자가 사이트에 접속했습니다! (현재 총 조회수: ${GLOBAL_BASE + 1})`).catch(e => console.error("Notification async error:", e));
    }

    const { rows } = await sql`
      SELECT total, today FROM product_hits WHERE product_id = ${productId}
    `;
    
    const result = rows[0];
    return NextResponse.json({
      total: (productId === 'global' ? GLOBAL_BASE : 0) + result.total,
      today: result.today
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
      }
    });
  } catch (error: any) {
    console.error("Postgres POST Error:", error.message);
    return NextResponse.json({ success: false, error: error.message });
  }
}
