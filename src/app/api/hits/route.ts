import { sql } from '@/lib/db';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const GLOBAL_BASE = 12400;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get('productId') || 'global';

  try {
    const { rows } = await sql`
      SELECT total, today, last_visit FROM product_hits WHERE product_id = ${productId}
    `;

    if (rows.length === 0) {
      // 초기 데이터 생성
      await sql`
        INSERT INTO product_hits (product_id, total, today, last_visit)
        VALUES (${productId}, 0, 0, CURRENT_DATE)
      `;
      return NextResponse.json({ total: productId === 'global' ? GLOBAL_BASE : 0, today: 0 });
    }

    const stats = rows[0];
    const todayStr = new Date().toISOString().split('T')[0];
    const lastVisitStr = stats.last_visit.toISOString().split('T')[0];

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
  } catch (error) {
    console.error("Postgres GET Error:", error);
    return NextResponse.json({ total: GLOBAL_BASE, today: 1 });
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
  } catch (error) {
    console.error("Postgres POST Error:", error);
    return NextResponse.json({ success: false });
  }
}
