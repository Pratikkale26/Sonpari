"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Flame, Coins, TrendingUp, Users, ChevronRight, Zap } from "lucide-react";
import Link from "next/link";
import axios from "axios";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

function authHeaders() {
    return { Authorization: `Bearer ${localStorage.getItem("token")}` };
}

export default function DashboardPage() {
    const [user, setUser] = useState<any>(null);
    const [streak, setStreak] = useState<any>(null);
    const [goldPrice, setGoldPrice] = useState<any>(null);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [groups, setGroups] = useState<any[]>([]);
    const [activating, setActivating] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) { router.push("/signin"); return; }

        const headers = { Authorization: `Bearer ${token}` };

        Promise.all([
            axios.get(`${API}/api/user/`, { headers }),
            axios.get(`${API}/api/gold/price`, { headers }),
            axios.get(`${API}/api/gold/history`, { headers }).catch(() => ({ data: { transactions: [] } })),
            axios.get(`${API}/api/groups`, { headers }).catch(() => ({ data: { groups: [] } })),
        ]).then(([userRes, priceRes, txRes, groupsRes]) => {
            setUser(userRes.data.user);
            setGoldPrice(priceRes.data);
            setTransactions((txRes.data.transactions || []).slice(0, 5));
            setGroups((groupsRes.data.groups || []).slice(0, 3));

            if (userRes.data.user.streak) setStreak(userRes.data.user.streak);
        }).catch(() => {
            localStorage.removeItem("token");
            router.push("/signin");
        });
    }, [router]);

    const activateOroAccount = async () => {
        setActivating(true);
        try {
            const { data } = await axios.post(`${API}/api/user/create-oro`, {}, { headers: authHeaders() });
            toast.success(data.message);
            setUser((u: any) => ({ ...u, grailUserId: data.grailUserId }));
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Failed to activate account");
        } finally {
            setActivating(false);
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-amber-50/30">
                <div className="w-12 h-12 rounded-full border-4 border-amber-500 border-t-transparent animate-spin" />
            </div>
        );
    }

    const totalGoldGrams = transactions
        .filter((t) => t.type === "SAVE")
        .reduce((sum: number, t: any) => sum + Number(t.goldGrams), 0);

    const goldValueUsdc = totalGoldGrams * (goldPrice?.usdcPerGram || 74);
    const goldValueInr = totalGoldGrams * (goldPrice?.inrPerGram || 6142);

    return (
        <div className="min-h-screen bg-amber-50/20">
            <AppHeader />

            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-5xl">
                {/* Welcome */}
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">
                        Welcome back, {user.name || user.email.split("@")[0]}! 👋
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Here's your gold savings overview</p>
                </div>

                {/* Activate Oro Account Banner */}
                {!user.grailUserId && (
                    <div className="mb-6 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 p-5 text-white flex items-center justify-between shadow-lg">
                        <div>
                            <p className="font-semibold text-lg">Activate your Gold Account</p>
                            <p className="text-sm text-amber-100">Complete your profile and activate to start buying gold</p>
                        </div>
                        <Button
                            onClick={activateOroAccount}
                            disabled={activating}
                            className="bg-white text-amber-800 hover:bg-amber-100 font-semibold shrink-0"
                        >
                            {activating ? "Activating..." : "Activate Now"} <Zap className="ml-1 h-4 w-4" />
                        </Button>
                    </div>
                )}

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                    {/* Gold Balance */}
                    <Card className="border-amber-200 bg-white shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm text-gray-500 font-medium flex items-center gap-1">
                                <Coins className="h-4 w-4 text-amber-500" /> Total Gold
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold text-gray-900">{totalGoldGrams.toFixed(4)}g</p>
                            <p className="text-sm text-gray-500 mt-1">
                                ≈ ${goldValueUsdc.toFixed(2)} USDC
                            </p>
                            <p className="text-xs text-amber-600 font-medium">≈ ₹{goldValueInr.toFixed(0)}</p>
                        </CardContent>
                    </Card>

                    {/* Streak */}
                    <Card className="border-amber-200 bg-white shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm text-gray-500 font-medium flex items-center gap-1">
                                <Flame className="h-4 w-4 text-orange-500" /> Saving Streak
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold text-gray-900">
                                {user.streakCount || 0}
                                <span className="text-orange-500 ml-1">🔥</span>
                            </p>
                            <p className="text-sm text-gray-500 mt-1">days</p>
                            <p className="text-xs text-gray-400">Buy every 36hrs to keep it alive</p>
                        </CardContent>
                    </Card>

                    {/* Gold Price */}
                    <Card className="border-amber-200 bg-white shadow-sm">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm text-gray-500 font-medium flex items-center gap-1">
                                <TrendingUp className="h-4 w-4 text-green-500" /> Gold Price
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-3xl font-bold text-gray-900">
                                ${goldPrice?.usdcPerGram || "74"}<span className="text-lg text-gray-400">/g</span>
                            </p>
                            <p className="text-sm text-gray-500 mt-1">≈ ₹{goldPrice?.inrPerGram || "6,142"}/g</p>
                            <p className="text-xs text-green-500 font-medium">Live rate</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-2 gap-3 mb-8">
                    <Link href="/buy">
                        <Button className="w-full h-14 bg-gradient-to-r from-amber-600 to-amber-500 text-white text-base font-semibold rounded-xl shadow-amber-200 shadow-md hover:shadow-lg transition-all">
                            <Coins className="mr-2 h-5 w-5" /> Buy Gold
                        </Button>
                    </Link>
                    <Link href="/groups">
                        <Button variant="outline" className="w-full h-14 border-2 border-amber-300 text-amber-800 hover:bg-amber-50 text-base font-semibold rounded-xl">
                            <Users className="mr-2 h-5 w-5" /> My Groups
                        </Button>
                    </Link>
                </div>

                {/* Recent Activity */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Transactions */}
                    <Card className="border-amber-100">
                        <CardHeader className="flex flex-row items-center justify-between pb-3">
                            <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
                            <Link href="/history" className="text-xs text-amber-600 hover:underline">View all</Link>
                        </CardHeader>
                        <CardContent>
                            {transactions.length === 0 ? (
                                <div className="text-center py-6 text-gray-400 text-sm">
                                    <Coins className="h-10 w-10 mx-auto mb-2 text-gray-200" />
                                    No transactions yet. Buy your first gram of gold!
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {transactions.map((tx: any) => (
                                        <div key={tx.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                                            <div>
                                                <p className="text-sm font-medium text-gray-800">
                                                    {tx.type === "SAVE" ? "Bought Gold" : tx.type}
                                                </p>
                                                <p className="text-xs text-gray-400">{new Date(tx.createdAt).toLocaleDateString()}</p>
                                            </div>
                                            <span className="text-sm font-semibold text-amber-700">+{Number(tx.goldGrams).toFixed(4)}g</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Groups */}
                    <Card className="border-amber-100">
                        <CardHeader className="flex flex-row items-center justify-between pb-3">
                            <CardTitle className="text-base font-semibold">My Groups</CardTitle>
                            <Link href="/groups" className="text-xs text-amber-600 hover:underline">View all</Link>
                        </CardHeader>
                        <CardContent>
                            {groups.length === 0 ? (
                                <div className="text-center py-6 text-gray-400 text-sm">
                                    <Users className="h-10 w-10 mx-auto mb-2 text-gray-200" />
                                    No groups yet. Create one and invite your family!
                                    <Link href="/groups/create">
                                        <Button variant="outline" size="sm" className="mt-3 border-amber-300 text-amber-700">
                                            Create Group
                                        </Button>
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {groups.map((g: any) => (
                                        <Link key={g.id} href={`/groups/${g.id}`}>
                                            <div className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0 hover:bg-amber-50 rounded-lg px-2 transition-colors cursor-pointer">
                                                <div>
                                                    <p className="text-sm font-medium text-gray-800">{g.name}</p>
                                                    <p className="text-xs text-gray-400">{g.members?.length || 0} members · {g.myRole}</p>
                                                </div>
                                                <ChevronRight className="h-4 w-4 text-gray-300" />
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
