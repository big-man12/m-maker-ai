"use client";

const STORAGE_KEY = "social_maker_hits";
const GLOBAL_BASE = 12400; // 시뮬레이션을 위한 기본 글로벌 조회수

export const getHitStats = () => {
    if (typeof window === "undefined") return { total: GLOBAL_BASE, today: 0 };
    
    // 로컬 스토리지 데이터 읽기
    let data;
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        data = stored ? JSON.parse(stored) : { total: 0, today: 0, lastVisit: "" };
    } catch (e) {
        data = { total: 0, today: 0, lastVisit: "" };
    }
    
    const todayStr = new Date().toISOString().split('T')[0];
    
    // 하루가 지났으면 '오늘의 생성수' 초기화 시뮬레이션
    if (data.lastVisit !== todayStr) {
        data.today = 0;
        data.lastVisit = todayStr;
    }
    
    return {
        total: GLOBAL_BASE + data.total,
        today: data.today,
        personalTotal: data.total
    };
};

export const incrementHit = () => {
    if (typeof window === "undefined") return;
    
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        const data = stored ? JSON.parse(stored) : { total: 0, today: 0, lastVisit: "" };
        
        const todayStr = new Date().toISOString().split('T')[0];
        
        data.total += 1;
        if (data.lastVisit === todayStr) {
            data.today += 1;
        } else {
            data.today = 1;
            data.lastVisit = todayStr;
        }
        
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
        console.error("Hit counter increment error:", e);
    }
};
