"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { Card, CardContent } from "@/components/ui/card";
import axios from "axios";
import { Trophy, Medal, Flame, Coins } from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

function authHeaders() {
    return { Authorization: `Bearer ${localStorage.getItem("token")}` };
}

const RANK_STYLES: Record<number, string> = {
    1: "bg-gradient-to-r from-yellow-400 to-amber-500 text-white shadow-lg shadow-amber-300/40",
    2: "bg-gradient-to-r from-gray-300 to-gray-400 text-white shadow-md",
    3: "bg-gradient-to-r from-orange-400 to-amber-600 text-white shadow-md shadow-orange-300/30",
};

const RANK_ICONS: Record<number, React.ReactNode> = {
    1: <Trophy className="h-5 w-5" />,
    2: <Medal className="h-5 w-5" />,
    3: <Medal className="h-5 w-5" />,
};

export default function LeaderboardPage() {
    const [board, setBoard] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) { router.push("/signin"); return; }

        axios.get(`${API}/api/gold/leaderboard`, { headers: authHeaders() })
            .then(r => setBoard(r.data.leaderboard || []))
            .catch(() => setBoard([]))
            .finally(() => setLoading(false));
    }, [router]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-amber-50/30">
                <div className="w-12 h-12 rounded-full border-4 border-amber-500 border-t-transparent animate-spin" />
            </div>
        );
    }

    const top3 = board.slice(0, 3);
    const rest = board.slice(3);

    return (
        <div className="min-h-screen bg-amber-50/20">
            <AppHeader />
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-2xl">
                <div className="mb-8 text-center">
                    <div className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-1.5 text-sm font-semibold text-amber-800 mb-3">
                        <Trophy className="h-4 w-4 text-amber-600" /> Community Rankings
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900">Gold Savers Leaderboard</h1>
                    <p className="text-gray-500 mt-2">Top streak keepers in the Sonpari community</p>
                </div>

                {/* Top 3 Podium */}
                {top3.length > 0 && (
                    <div className="grid grid-cols-3 gap-3 mb-8 items-end">
                        {/* 2nd */}
                        <div className="flex flex-col items-center pt-4">
                            {top3[1] && (
                                <>
                                    <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center text-xl font-bold text-gray-600 mb-2">
                                        {top3[1]?.name?.[0]?.toUpperCase() || "?"}
                                    </div>
                                    <Card className={`w-full ${RANK_STYLES[2]} border-0`}>
                                        <CardContent className="p-3 text-center">
                                            <div className="flex justify-center mb-1">{RANK_ICONS[2]}</div>
                                            <p className="font-bold text-sm truncate">{top3[1].name}</p>
                                            <p className="text-xs opacity-80">{top3[1].longestStreak}🔥 best</p>
                                        </CardContent>
                                    </Card>
                                </>
                            )}
                        </div>
                        {/* 1st */}
                        <div className="flex flex-col items-center">
                            <div className="text-2xl mb-1">👑</div>
                            <div className="w-16 h-16 rounded-full bg-amber-200 flex items-center justify-center text-2xl font-bold text-amber-700 mb-2 ring-4 ring-amber-400">
                                {top3[0]?.name?.[0]?.toUpperCase() || "?"}
                            </div>
                            <Card className={`w-full ${RANK_STYLES[1]} border-0`}>
                                <CardContent className="p-3 text-center">
                                    <div className="flex justify-center mb-1">{RANK_ICONS[1]}</div>
                                    <p className="font-bold text-sm truncate">{top3[0]?.name}</p>
                                    <p className="text-xs opacity-80">{top3[0]?.longestStreak}🔥 best</p>
                                </CardContent>
                            </Card>
                        </div>
                        {/* 3rd */}
                        <div className="flex flex-col items-center pt-4">
                            {top3[2] && (
                                <>
                                    <div className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center text-xl font-bold text-orange-600 mb-2">
                                        {top3[2]?.name?.[0]?.toUpperCase() || "?"}
                                    </div>
                                    <Card className={`w-full ${RANK_STYLES[3]} border-0`}>
                                        <CardContent className="p-3 text-center">
                                            <div className="flex justify-center mb-1">{RANK_ICONS[3]}</div>
                                            <p className="font-bold text-sm truncate">{top3[2].name}</p>
                                            <p className="text-xs opacity-80">{top3[2].longestStreak}🔥 best</p>
                                        </CardContent>
                                    </Card>
                                </>
                            )}
                        </div>
                    </div>
                )}

                {/* Rest of leaderboard */}
                <div className="space-y-3">
                    {rest.map((user) => (
                        <Card key={user.userId} className="border-amber-100 bg-white">
                            <CardContent className="flex items-center p-4 gap-4">
                                <span className="w-8 text-center text-lg font-bold text-gray-400">#{user.rank}</span>
                                <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center font-bold text-amber-700">
                                    {user.name?.[0]?.toUpperCase() || "?"}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-gray-900 truncate">{user.name}</p>
                                    <p className="text-xs text-gray-400">{user.totalGoldGrams.toFixed(4)}g saved</p>
                                </div>
                                <div className="text-right shrink-0">
                                    <div className="flex items-center gap-1 text-orange-500 font-bold">
                                        <Flame className="h-4 w-4" /> {user.currentStreak}
                                    </div>
                                    <p className="text-xs text-gray-400">best: {user.longestStreak}</p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    {board.length === 0 && (
                        <div className="text-center py-16 text-gray-400">
                            <Coins className="h-12 w-12 mx-auto mb-3 text-gray-200" />
                            <p className="text-lg font-medium">No savers yet!</p>
                            <p className="text-sm">Buy your first gram of gold to appear here.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
