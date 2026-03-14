import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(process.cwd(), 'hit.sqlite');
const db = new Database(DB_PATH);

// 테이블 초기화
db.exec(`
  CREATE TABLE IF NOT EXISTS hits (
    id INTEGER PRIMARY KEY DEFAULT 1,
    total INTEGER DEFAULT 0,
    today INTEGER DEFAULT 0,
    last_visit TEXT DEFAULT ''
  );
  
  INSERT OR IGNORE INTO hits (id, total, today, last_visit) VALUES (1, 12400, 0, '');
`);

export default db;
