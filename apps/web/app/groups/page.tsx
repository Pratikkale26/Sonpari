"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AppHeader } from "@/components/AppHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, Plus, LogIn, ChevronRight, Crown, Flame } from "lucide-react";
import axios from "axios";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
const headers = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

export default function GroupsPage() {
    const [groups, setGroups] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        if (!localStorage.getItem("token")) { router.push("/signin"); return; }
        axios.get(`${API}/api/groups`, { headers: headers() })
            .then((r) => setGroups(r.data.groups || []))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [router]);

    return (
        <div className="min-h-screen bg-amber-50/20">
            <AppHeader />
            <main className="container mx-auto px-4 py-8 max-w-2xl">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <Users className="h-6 w-6 text-amber-500" /> My Groups
                        </h1>
                        <p className="text-gray-500 text-sm">Save gold together with family and friends</p>
                    </div>
                    <div className="flex gap-2">
                        <Link href="/groups/join">
                            <Button variant="outline" size="sm" className="border-amber-300 text-amber-700">
                                <LogIn className="h-4 w-4 mr-1" /> Join
                            </Button>
                        </Link>
                        <Link href="/groups/create">
                            <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white">
                                <Plus className="h-4 w-4 mr-1" /> Create
                            </Button>
                        </Link>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center py-10">
                        <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : groups.length === 0 ? (
                    <Card className="border-dashed border-2 border-amber-200 text-center py-12">
                        <CardContent>
                            <Users className="h-16 w-16 text-amber-200 mx-auto mb-4" />
                            <h2 className="text-lg font-semibold text-gray-700 mb-1">No groups yet</h2>
                            <p className="text-sm text-gray-400 mb-4">Create a group and invite your friends and family to save gold together!</p>
                            <div className="flex gap-2 justify-center">
                                <Link href="/groups/create">
                                    <Button className="bg-amber-600 hover:bg-amber-700 text-white">Create Group</Button>
                                </Link>
                                <Link href="/groups/join">
                                    <Button variant="outline" className="border-amber-300 text-amber-700">Join with Code</Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-3">
                        {groups.map((g: any) => (
                            <Link key={g.id} href={`/groups/${g.id}`}>
                                <Card className="border-amber-100 hover:border-amber-300 hover:shadow-md transition-all cursor-pointer">
                                    <CardContent className="p-4 flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white font-bold text-lg">
                                                {g.name[0]}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-1.5">
                                                    <p className="font-semibold text-gray-900">{g.name}</p>
                                                    {g.myRole === "ADMIN" && (
                                                        <Crown className="h-3.5 w-3.5 text-amber-500" />
                                                    )}
                                                </div>
                                                <p className="text-xs text-gray-400">
                                                    {g.members?.length || 0} members
                                                    {g.description && ` · ${g.description}`}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {(g.proposals?.length || 0) > 0 && (
                                                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                                                    {g.proposals?.length} active
                                                </span>
                                            )}
                                            <ChevronRight className="h-4 w-4 text-gray-300" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
