"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { Card, CardContent } from "@/components/ui/card";
import axios from "axios";
import { Flame } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

function authHeaders() {
    return { Authorization: `Bearer ${localStorage.getItem("token")}` };
}

const MILESTONES = [
    { streak: 3, name: "Starter", emoji: "🥉", description: "Save 3 days in a row" },
    { streak: 7, name: "Week Warrior", emoji: "🥈", description: "7 day streak" },
    { streak: 14, name: "Fortnight Saver", emoji: "🥇", description: "14 day streak" },
    { streak: 30, name: "Diamond Hands", emoji: "💎", description: "30 day streak" },
    { streak: 60, name: "Gold Legend", emoji: "🌟", description: "60 day streak" },
    { streak: 100, name: "Sonpari Elite", emoji: "👑", description: "100 day streak" },
];

export default function BadgesPage() {
    const [badges, setBadges] = useState<any[]>([]);
    const [longest, setLongest] = useState(0);
    const [current, setCurrent] = useState(0);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) { router.push("/signin"); return; }

        axios.get(`${API}/api/user/badges`, { headers: authHeaders() })
            .then(r => {
                setBadges(r.data.badges || []);
                setLongest(r.data.longestStreak || 0);
                setCurrent(r.data.currentStreak || 0);
            })
            .catch(() => setBadges(MILESTONES.map(m => ({ ...m, earned: false }))))
            .finally(() => setLoading(false));
    }, [router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-amber-50/30">
                <div className="w-12 h-12 rounded-full border-4 border-amber-500 border-t-transparent animate-spin" />
            </div>
        );
    }

    const earnedCount = badges.filter(b => b.earned).length;
    // find next milestone
    const next = badges.find(b => !b.earned);
    const progressToNext = next ? Math.min((longest / next.streak) * 100, 100) : 100;

    return (
        <div className="min-h-screen bg-amber-50/20">
            <AppHeader />
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-2xl">
                <div className="mb-8 text-center">
                    <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-1.5 text-sm font-semibold text-amber-800 mb-3">
                        <Flame className="h-4 w-4 text-orange-500" /> Streak Rewards
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">Your Badges</h1>
                    <p className="text-gray-500 mt-2">
                        Earned {earnedCount}/{badges.length} badges · Best streak: {longest} days
                    </p>
                </div>

                {/* Current Streak */}
                <Card className="mb-6 border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <p className="text-sm font-medium text-gray-500">Current Streak</p>
                                <p className="text-4xl font-bold text-gray-900">{current} <span className="text-orange-500">🔥</span></p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-gray-400">Longest</p>
                                <p className="text-xl font-bold text-amber-700">{longest} days</p>
                            </div>
                        </div>
                        {next && (
                            <>
                                <div className="flex justify-between text-xs text-gray-500 mb-1">
                                    <span>Progress to {next.emoji} {next.name}</span>
                                    <span>{longest}/{next.streak} days</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2">
                                    <div
                                        className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-full transition-all"
                                        style={{ width: `${progressToNext}%` }}
                                    />
                                </div>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Badge Grid */}
                <div className="grid grid-cols-2 gap-4">
                    {badges.map((badge) => (
                        <Card
                            key={badge.name}
                            className={`border-2 transition-all ${badge.earned
                                ? "border-amber-300 bg-gradient-to-br from-amber-50 to-orange-50 shadow-md shadow-amber-100"
                                : "border-gray-100 bg-gray-50 opacity-60"
                                }`}
                        >
                            <CardContent className="p-5 text-center">
                                <div className={`text-5xl mb-3 transition-all ${badge.earned ? "scale-110" : "grayscale opacity-50"}`}>
                                    {badge.earned ? badge.emoji : "🔒"}
                                </div>
                                <p className={`font-bold text-base ${badge.earned ? "text-gray-900" : "text-gray-400"}`}>
                                    {badge.name}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">{badge.description}</p>
                                {badge.earned && (
                                    <span className="mt-2 inline-block text-xs font-semibold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                                        Earned ✓
                                    </span>
                                )}
                                {!badge.earned && (
                                    <p className="mt-2 text-xs text-gray-400">{badge.streak} day streak required</p>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </main>
        </div>
    );
}
