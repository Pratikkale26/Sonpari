"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import axios from "axios";
import Link from "next/link";
import { Bell, CheckCheck, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

function authHeaders() {
    return { Authorization: `Bearer ${localStorage.getItem("token")}` };
}

interface Notification {
    id: string;
    type: string;
    title: string;
    body: string;
    link?: string;
    read: boolean;
    createdAt: string;
}

export function NotificationBell() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unread, setUnread] = useState(0);
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const fetchNotifications = useCallback(async () => {
        try {
            const token = localStorage.getItem("token");
            if (!token) return;
            const { data } = await axios.get(`${API}/api/notifications`, { headers: authHeaders() });
            setNotifications(data.notifications || []);
            setUnread(data.unreadCount || 0);
        } catch {
            // silently fail
        }
    }, []);

    useEffect(() => {
        fetchNotifications();
        // Poll every 30 seconds for new notifications
        const interval = setInterval(fetchNotifications, 30_000);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const markAllRead = async () => {
        await axios.post(`${API}/api/notifications/read-all`, {}, { headers: authHeaders() }).catch(() => { });
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnread(0);
    };

    const markRead = async (id: string) => {
        await axios.post(`${API}/api/notifications/${id}/read`, {}, { headers: authHeaders() }).catch(() => { });
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
        setUnread(prev => Math.max(0, prev - 1));
    };

    const timeAgo = (dateStr: string) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return "just now";
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        return `${Math.floor(hrs / 24)}d ago`;
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Button */}
            <button
                onClick={() => { setOpen(o => !o); if (!open) fetchNotifications(); }}
                className="relative p-2 rounded-lg text-gray-500 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                aria-label="Notifications"
            >
                <Bell className="h-5 w-5" />
                {unread > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center leading-none">
                        {unread > 9 ? "9+" : unread}
                    </span>
                )}
            </button>

            {/* Dropdown Panel */}
            {open && (
                <div className="absolute right-0 top-full mt-2 w-80 rounded-2xl bg-white shadow-xl border border-gray-100 z-50 overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50 bg-gray-50/50">
                        <span className="font-semibold text-sm text-gray-800">Notifications</span>
                        <div className="flex items-center gap-1">
                            {unread > 0 && (
                                <button
                                    onClick={markAllRead}
                                    className="text-xs text-amber-600 hover:text-amber-800 flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-amber-50"
                                >
                                    <CheckCheck className="h-3 w-3" /> Mark all read
                                </button>
                            )}
                            <button
                                onClick={() => setOpen(false)}
                                className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    </div>

                    {/* Notification List */}
                    <div className="max-h-[400px] overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="py-10 text-center text-gray-400">
                                <Bell className="h-8 w-8 mx-auto mb-2 text-gray-200" />
                                <p className="text-sm">No notifications yet</p>
                            </div>
                        ) : (
                            notifications.map(n => (
                                <div
                                    key={n.id}
                                    className={`flex items-start gap-3 px-4 py-3 border-b border-gray-50 last:border-0 transition-colors ${!n.read ? "bg-amber-50/40" : "hover:bg-gray-50"}`}
                                    onClick={() => { if (!n.read) markRead(n.id); }}
                                >
                                    <div className="flex-1 min-w-0">
                                        {n.link ? (
                                            <Link href={n.link} onClick={() => setOpen(false)}>
                                                <p className={`text-sm font-medium leading-tight ${!n.read ? "text-gray-900" : "text-gray-600"}`}>
                                                    {n.title}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{n.body}</p>
                                            </Link>
                                        ) : (
                                            <>
                                                <p className={`text-sm font-medium leading-tight ${!n.read ? "text-gray-900" : "text-gray-600"}`}>
                                                    {n.title}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{n.body}</p>
                                            </>
                                        )}
                                        <p className="text-[10px] text-gray-300 mt-1">{timeAgo(n.createdAt)}</p>
                                    </div>
                                    {!n.read && (
                                        <div className="mt-1.5 h-2 w-2 rounded-full bg-amber-500 shrink-0" />
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
