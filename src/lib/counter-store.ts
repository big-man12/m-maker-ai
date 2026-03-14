"use client";

export const getHitStats = async () => {
    try {
        // 캐싱 방지용 타임스탬프 추가
        const res = await fetch(`/api/hits?t=${Date.now()}`);
        if (!res.ok) throw new Error("Fetch failed");
        return await res.json();
    } catch (e) {
        console.error("Hit stats fetch error:", e);
        return { total: 12400, today: 0 }; // Fallback
    }
};

export const incrementHit = async () => {
    try {
        await fetch('/api/hits', { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ productId: 'global' }) // 명시적으로 전송
        });
    } catch (e) {
        console.error("Hit counter increment error:", e);
    }
};
