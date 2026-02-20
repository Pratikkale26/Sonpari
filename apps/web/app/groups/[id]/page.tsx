"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Crown, Users, Coins, Plus, Gift, ChevronRight, Copy, Check, Flame } from "lucide-react";
import axios from "axios";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
const headers = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

export default function GroupDetailPage() {
    const params = useParams();
    const groupId = params.id as string;
    const router = useRouter();

    const [group, setGroup] = useState<any>(null);
    const [myRole, setMyRole] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const [promoting, setPromoting] = useState<string | null>(null);

    const fetchGroup = async () => {
        try {
            const { data } = await axios.get(`${API}/api/groups/${groupId}`, { headers: headers() });
            setGroup(data.group);
            setMyRole(data.myRole);
        } catch {
            toast.error("Failed to load group");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!localStorage.getItem("token")) { router.push("/signin"); return; }
        fetchGroup();
    }, [groupId]);

    const copyCode = () => {
        navigator.clipboard.writeText(group.inviteCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const promote = async (targetUserId: string) => {
        setPromoting(targetUserId);
        try {
            await axios.post(`${API}/api/groups/${groupId}/promote`, { targetUserId }, { headers: headers() });
            toast.success("Member promoted to admin!");
            fetchGroup();
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Failed to promote");
        } finally {
            setPromoting(null);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-amber-50/20">
                <AppHeader />
                <div className="flex justify-center py-20">
                    <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
                </div>
            </div>
        );
    }

    if (!group) return null;

    const isAdmin = myRole === "ADMIN";
    const openProposals = (group.proposals || []).filter((p: any) => p.status === "OPEN");

    return (
        <div className="min-h-screen bg-amber-50/20">
            <AppHeader />
            <main className="container mx-auto px-4 py-6 max-w-2xl space-y-5">

                {/* Header */}
                <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
                    <CardContent className="p-5 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white text-2xl font-bold shadow-md">
                                {group.name[0]}
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">{group.name}</h1>
                                {group.description && <p className="text-sm text-gray-500">{group.description}</p>}
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs text-gray-400">{group.members?.length} members</span>
                                    {isAdmin && <Badge className="bg-amber-100 text-amber-700 text-xs">Admin</Badge>}
                                </div>
                            </div>
                        </div>
                        <Button variant="ghost" size="sm" onClick={copyCode} className="text-amber-600 gap-1 text-xs">
                            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                            {copied ? "Copied!" : group.inviteCode}
                        </Button>
                    </CardContent>
                </Card>

                {/* Group Buy Proposals */}
                <Card className="border-amber-100">
                    <CardHeader className="flex flex-row items-center justify-between pb-3">
                        <CardTitle className="text-base flex items-center gap-1.5">
                            <Coins className="h-4 w-4 text-amber-500" /> Group Proposals
                        </CardTitle>
                        {isAdmin && (
                            <Link href={`/groups/${groupId}/proposal/new`}>
                                <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white text-xs h-7">
                                    <Plus className="h-3 w-3 mr-1" /> New
                                </Button>
                            </Link>
                        )}
                    </CardHeader>
                    <CardContent>
                        {openProposals.length === 0 ? (
                            <div className="text-center py-5 text-sm text-gray-400">
                                {isAdmin ? "Create a group buy proposal for everyone to join!" : "No active proposals right now."}
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {openProposals.map((p: any) => {
                                    const totalGrams = p.contributions?.reduce((s: number, c: any) => s + Number(c.goldGrams), 0) || 0;
                                    return (
                                        <Link key={p.id} href={`/groups/${groupId}/proposal/${p.id}`}>
                                            <div className="flex items-center justify-between p-3 border border-amber-100 rounded-xl hover:bg-amber-50 transition-colors cursor-pointer">
                                                <div>
                                                    <p className="font-medium text-sm text-gray-900">{p.occasion || "Group Buy"}</p>
                                                    <p className="text-xs text-gray-400">{p.contributions?.length || 0} contributors · {totalGrams.toFixed(4)}g total</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Open</span>
                                                    <ChevronRight className="h-4 w-4 text-gray-300" />
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Gifting Coming Soon */}
                <Card className="border-dashed border-2 border-gray-200 opacity-70">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <Gift className="h-8 w-8 text-gray-300" />
                            <div>
                                <p className="font-semibold text-sm text-gray-700">Group Gifting</p>
                                <p className="text-xs text-gray-400">Send gold to a another group</p>
                            </div>
                        </div>
                        <Badge variant="secondary" className="text-xs">Coming Soon</Badge>
                    </CardContent>
                </Card>

                {/* Members */}
                <Card className="border-amber-100">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base flex items-center gap-1.5">
                            <Users className="h-4 w-4 text-amber-500" /> Members
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {group.members?.map((m: any) => (
                                <div key={m.userId} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                                    <div className="flex items-center gap-3">
                                        <div className="h-9 w-9 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 font-bold text-sm">
                                            {(m.user?.name || m.user?.email || "?")[0].toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-1">
                                                <p className="text-sm font-medium text-gray-800">{m.user?.name || m.user?.email}</p>
                                                {m.role === "ADMIN" && <Crown className="h-3 w-3 text-amber-500" />}
                                            </div>
                                            <p className="text-xs text-gray-400 flex items-center gap-1">
                                                <Flame className="h-3 w-3 text-orange-400" /> {m.user?.streakCount || 0} streak
                                            </p>
                                        </div>
                                    </div>
                                    {isAdmin && m.role !== "ADMIN" && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="text-xs text-amber-600 hover:bg-amber-50 h-7"
                                            onClick={() => promote(m.userId)}
                                            disabled={promoting === m.userId}
                                        >
                                            {promoting === m.userId ? "..." : "Make Admin"}
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
