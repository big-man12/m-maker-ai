import { NextResponse } from 'next/server';
import db from '@/lib/db';

export async function GET() {
  const stats = db.prepare('SELECT total, today, last_visit FROM hits WHERE id = 1').get() as any;
  const todayStr = new Date().toISOString().split('T')[0];

  if (stats.last_visit !== todayStr) {
    db.prepare('UPDATE hits SET today = 0, last_visit = ? WHERE id = 1').run(todayStr);
    stats.today = 0;
  }

  return NextResponse.json({
    total: stats.total,
    today: stats.today
  });
}

export async function POST() {
  const todayStr = new Date().toISOString().split('T')[0];
  const stats = db.prepare('SELECT today, last_visit FROM hits WHERE id = 1').get() as any;

  if (stats.last_visit === todayStr) {
    db.prepare('UPDATE hits SET total = total + 1, today = today + 1 WHERE id = 1').run();
  } else {
    db.prepare('UPDATE hits SET total = total + 1, today = 1, last_visit = ? WHERE id = 1').run(todayStr);
  }

  const updated = db.prepare('SELECT total, today FROM hits WHERE id = 1').get() as any;
  return NextResponse.json(updated);
}
