
// Simple in-memory analytics shim
// In a real app, these would send events to a backend/analytics service (e.g. GA, Mixpanel, or custom DB)

export const Analytics = {
    sessionStart: 0,

    startSession: () => {
        if (typeof window === 'undefined') return;
        Analytics.sessionStart = Date.now();
        // Log "Visit"
        console.log('[Analytics] Session Started');

        // Update local stats for "My Usage"
        const stats = JSON.parse(localStorage.getItem('lumina_usage_stats') || '{"sessions": 0, "totalTime": 0}');
        stats.sessions += 1;
        localStorage.setItem('lumina_usage_stats', JSON.stringify(stats));
    },

    endSession: () => {
        if (typeof window === 'undefined') return;
        const duration = Date.now() - Analytics.sessionStart;
        console.log(`[Analytics] Session Ended. Duration: ${duration}ms`);

        const stats = JSON.parse(localStorage.getItem('lumina_usage_stats') || '{"sessions": 0, "totalTime": 0}');
        stats.totalTime += duration;
        localStorage.setItem('lumina_usage_stats', JSON.stringify(stats));
    },

    logEvent: (name: string, data?: any) => {
        console.log(`[Analytics] Event: ${name}`, data);
    },

    // For Admin Demo - Generating Mock Data
    getGlobalStats: () => {
        // Return simulated data
        return {
            totalUsers: 1240,
            activeToday: 85,
            newUsers: {
                day: 12,
                month: 340,
                year: 1240
            },
            avgSessionMinutes: 45,
            payingUsers: 340
        };
    },

    getUsersList: () => {
        return [
            { id: 1, email: 'saintpbh@gmail.com', name: 'Saint PBH', plan: 'Pro', lastActive: 'Now', joined: '2023-11-01' },
            { id: 2, email: 'john.doe@example.com', name: 'John Doe', plan: 'Free', lastActive: '2h ago', joined: '2024-01-01' },
            { id: 3, email: 'sarah.smith@example.com', name: 'Sarah Smith', plan: 'Pro', lastActive: '1d ago', joined: '2023-12-15' },
            { id: 4, email: 'pastor.lee@church.kr', name: 'Pastor Lee', plan: 'Pro', lastActive: '3d ago', joined: '2023-12-10' },
            { id: 5, email: 'new.member@test.com', name: 'New Member', plan: 'Free', lastActive: '5d ago', joined: '2024-01-02' },
        ];
    }
};
