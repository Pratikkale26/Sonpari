"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { LogIn } from "lucide-react";
import axios from "axios";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export default function JoinGroupPage() {
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleJoin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!code.trim()) return toast.error("Enter an invite code");
        setLoading(true);
        try {
            const { data } = await axios.post(
                `${API}/api/groups/join`,
                { inviteCode: code.trim().toUpperCase() },
                { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
            );
            toast.success(`Joined ${data.groupName}!`);
            router.push(`/groups/${data.groupId}`);
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Failed to join group");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-amber-50/20">
            <AppHeader />
            <main className="container mx-auto px-4 py-10 max-w-sm">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Join a Group</h1>
                    <p className="text-gray-500 text-sm">Enter the invite code shared by the group admin</p>
                </div>
                <Card className="border-amber-200 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <LogIn className="h-5 w-5 text-amber-500" /> Enter Invite Code
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleJoin} className="space-y-4">
                            <div className="space-y-1.5">
                                <Label>Invite Code</Label>
                                <Input
                                    placeholder="e.g. XKJD8A2B"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                                    className="font-mono text-lg tracking-widest text-center"
                                    maxLength={10}
                                />
                            </div>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold"
                            >
                                {loading ? "Joining..." : "Join Group"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
