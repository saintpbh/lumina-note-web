'use client';

import React, { useEffect, useState } from 'react';
import { googleDriveManager, GoogleUser } from '@/utils/googleDriveManager';
import { isAdmin } from '@/config/adminConfig';
import { Analytics } from '@/utils/analytics';
import { StatCard, UserTable } from '@/components/admin/AdminComponents'; // Fix path if needed
import { Users, Activity, Clock, DollarSign, ArrowLeft, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { ACTIVE_ANNOUNCEMENT } from '@/config/announcements';

export default function AdminPage() {
    const [user, setUser] = useState<GoogleUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<any>(null);
    const [users, setUsers] = useState<any[]>([]);

    useEffect(() => {
        const checkAuth = async () => {
            // Restore token if needed
            const token = localStorage.getItem('google_drive_token');
            if (token) googleDriveManager.setAccessToken(token);

            // Basic check - in real app, verify server-side session
            const u = await googleDriveManager.getUserInfo();
            setUser(u);

            if (u && isAdmin(u.email)) {
                // Load Data
                setStats(Analytics.getGlobalStats());
                setUsers(Analytics.getUsersList());
            }
            setLoading(false);
        };
        checkAuth();
    }, []);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#121212]">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
        </div>;
    }

    if (!user || !isAdmin(user.email)) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-[#121212] p-4 text-center">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-6">
                    <ShieldAlert className="w-8 h-8 text-red-600 dark:text-red-500" />
                </div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Access Resticted</h1>
                <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md">
                    This area is restricted to administrators. Please sign in with an authorized account (saintpbh@gmail.com).
                </p>
                <div className="flex gap-4">
                    <Link href="/" className="px-6 py-2.5 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl font-medium hover:bg-gray-50 transition-colors">
                        Back to Home
                    </Link>
                    <button onClick={() => window.location.href = '/'} className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors">
                        Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50 dark:bg-[#121212] text-slate-900 dark:text-slate-200">
            {/* Header */}
            <header className="bg-white dark:bg-[#1C1C1E] border-b border-gray-200 dark:border-white/5 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg text-slate-400">
                            <ArrowLeft size={20} />
                        </Link>
                        <h1 className="font-bold text-lg tracking-tight">Lumina Admin <span className="text-blue-500">Dashboard</span></h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-xs font-bold uppercase rounded-full tracking-wider">
                            Saint's View
                        </div>
                        <img src={user.picture || ''} alt={user.name} className="w-8 h-8 rounded-full ring-2 ring-white dark:ring-white/10" />
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="Total Members"
                        value={stats?.totalUsers.toLocaleString()}
                        subtext="+12 today"
                        icon={Users}
                        color="bg-blue-500"
                    />
                    <StatCard
                        title="Active Today"
                        value={stats?.activeToday}
                        subtext="Online now"
                        icon={Activity}
                        color="bg-emerald-500"
                    />
                    <StatCard
                        title="Avg Session"
                        value={`${stats?.avgSessionMinutes}m`}
                        subtext="+5m vs last wh"
                        icon={Clock}
                        color="bg-amber-500"
                    />
                    <StatCard
                        title="Pro Users"
                        value={stats?.payingUsers}
                        subtext="$MRR Stable"
                        icon={DollarSign}
                        color="bg-purple-500"
                    />
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* User Table (Left 2/3) */}
                    <div className="lg:col-span-2">
                        <UserTable users={users} />
                    </div>

                    {/* Announcement Manager (Right 1/3) */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white dark:bg-[#2C2C2E] p-6 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm">
                            <h3 className="font-bold text-lg mb-4">Live Announcement</h3>
                            <div className="bg-slate-50 dark:bg-black/20 p-4 rounded-xl mb-4 border border-slate-100 dark:border-white/5">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Active: {ACTIVE_ANNOUNCEMENT.id}</span>
                                </div>
                                <h4 className="font-bold mb-1">{ACTIVE_ANNOUNCEMENT.title}</h4>
                                <p className="text-xs text-slate-500 line-clamp-3 opacity-70">
                                    {ACTIVE_ANNOUNCEMENT.content.replace(/<[^>]*>?/gm, '')}
                                </p>
                            </div>

                            <button className="w-full py-2.5 bg-slate-900 dark:bg-white dark:text-black text-white font-medium rounded-xl hover:opacity-90 transition-opacity">
                                Create New Message
                            </button>
                            <p className="text-center text-xs text-slate-400 mt-3">
                                Changes deploy a new modal to all users.
                            </p>
                        </div>

                        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-2xl text-white shadow-lg relative overflow-hidden group">
                            <div className="relative z-10">
                                <h3 className="font-bold text-lg mb-1">Developer Status</h3>
                                <p className="text-white/80 text-sm mb-4">System is running optimally. Vercel deployment synced.</p>
                                <div className="flex items-center gap-2 text-xs font-mono bg-white/20 w-fit px-2 py-1 rounded">
                                    <span>v1.2.0</span>
                                    <span>•</span>
                                    <span>stable</span>
                                </div>
                            </div>
                            <Activity className="absolute bottom-[-10px] right-[-10px] w-24 h-24 text-white/10 group-hover:scale-110 transition-transform" />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
