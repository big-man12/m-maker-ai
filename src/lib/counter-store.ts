"use client";

export const getHitStats = async () => {
    try {
        const res = await fetch('/api/hits');
        if (!res.ok) throw new Error("Fetch failed");
        return await res.json();
    } catch (e) {
        console.error("Hit stats fetch error:", e);
        return { total: 12400, today: 0 }; // Fallback
    }
};

export const incrementHit = async () => {
    try {
        await fetch('/api/hits', { method: 'POST' });
    } catch (e) {
        console.error("Hit counter increment error:", e);
    }
};
