
import React from 'react';
import { Users, Activity, Clock, DollarSign, Search, Filter } from 'lucide-react';

export const StatCard = ({ title, value, subtext, icon: Icon, color }: any) => (
    <div className="bg-white dark:bg-[#2C2C2E] p-6 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl ${color} bg-opacity-10 text-opacity-100`}>
                <Icon size={24} className={color.replace('bg-', 'text-')} />
            </div>
            {subtext && <span className="text-xs font-semibold text-green-500 bg-green-500/10 px-2 py-1 rounded-full">{subtext}</span>}
        </div>
        <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wider">{title}</h3>
        <p className="text-3xl font-black text-slate-900 dark:text-white mt-1">{value}</p>
    </div>
);

export const UserTable = ({ users }: { users: any[] }) => (
    <div className="bg-white dark:bg-[#2C2C2E] rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
            <h3 className="font-bold text-lg dark:text-white">Recent Members</h3>
            <div className="flex gap-2">
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg text-slate-400">
                    <Filter size={18} />
                </button>
                <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search users..."
                        className="pl-9 pr-4 py-2 bg-gray-50 dark:bg-white/5 border-none rounded-xl text-sm w-48 focus:ring-2 focus:ring-blue-500 mb-0"
                    />
                </div>
            </div>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead className="bg-gray-50/50 dark:bg-white/5">
                    <tr>
                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">User</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Plan</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Joined</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Last Active</th>
                        <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                    {users.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50/50 dark:hover:bg-white/5 transition-colors">
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs">
                                        {user.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm text-slate-900 dark:text-slate-200">{user.name}</p>
                                        <p className="text-xs text-slate-500">{user.email}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="px-6 py-4">
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${user.plan === 'Pro'
                                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400'
                                        : 'bg-gray-100 text-gray-700 dark:bg-gray-700/50 dark:text-gray-400'
                                    }`}>
                                    {user.plan}
                                </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-slate-500">{user.joined}</td>
                            <td className="px-6 py-4 text-sm text-slate-500">{user.lastActive}</td>
                            <td className="px-6 py-4">
                                <div className="flex items-center gap-1.5">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Online</span>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    </div>
);
