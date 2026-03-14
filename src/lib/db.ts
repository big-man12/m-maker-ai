import { sql } from '@vercel/postgres';

export const initDb = async () => {
  try {
    // 상품별 카운트와 날짜별 방문자를 관리하는 테이블 생성
    await sql`
      CREATE TABLE IF NOT EXISTS product_hits (
        id SERIAL PRIMARY KEY,
        product_id TEXT UNIQUE NOT NULL,
        total INTEGER DEFAULT 0,
        today INTEGER DEFAULT 0,
        last_visit DATE DEFAULT CURRENT_DATE
      );
    `;
    
    // 글로벌 기본값을 위한 초기 데이터 (필요 시)
    console.log("✅ Vercel Postgres initialized");
  } catch (error) {
    console.error("❌ DB Initialization Error:", error);
  }
};

export { sql };
