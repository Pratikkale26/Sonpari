"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Users, Copy, Check } from "lucide-react";
import axios from "axios";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export default function CreateGroupPage() {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);
    const [created, setCreated] = useState<any>(null);
    const [copied, setCopied] = useState(false);
    const router = useRouter();

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return toast.error("Group name is required");
        setLoading(true);
        try {
            const { data } = await axios.post(
                `${API}/api/groups`,
                { name: name.trim(), description: description.trim() },
                { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
            );
            setCreated(data.group);
            toast.success("Group created!");
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Failed to create group");
        } finally {
            setLoading(false);
        }
    };

    const copyCode = () => {
        navigator.clipboard.writeText(created.inviteCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (created) {
        return (
            <div className="min-h-screen bg-amber-50/20">
                <AppHeader />
                <main className="container mx-auto px-4 py-10 max-w-md">
                    <Card className="border-green-200 bg-green-50 text-center">
                        <CardContent className="pt-8 pb-6 space-y-4">
                            <div className="h-16 w-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto">
                                <Users className="h-8 w-8 text-amber-600" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">Group Created! 🎉</h2>
                            <p className="text-gray-600 text-sm">{created.name} is ready. Share the invite code!</p>

                            <div className="bg-white border-2 border-amber-200 rounded-xl p-4 flex items-center justify-between">
                                <div>
                                    <p className="text-xs text-gray-400">Invite Code</p>
                                    <p className="text-2xl font-mono font-bold text-amber-700 tracking-widest">{created.inviteCode}</p>
                                </div>
                                <Button variant="ghost" onClick={copyCode} className="text-amber-600">
                                    {copied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
                                </Button>
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    className="flex-1 bg-amber-600 hover:bg-amber-700 text-white"
                                    onClick={() => router.push(`/groups/${created.id}`)}
                                >
                                    Go to Group
                                </Button>
                                <Button variant="outline" className="flex-1" onClick={() => router.push("/groups")}>
                                    All Groups
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-amber-50/20">
            <AppHeader />
            <main className="container mx-auto px-4 py-10 max-w-md">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Create a Group</h1>
                    <p className="text-gray-500 text-sm">Start saving gold together</p>
                </div>

                <Card className="border-amber-200 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-base">Group Details</CardTitle>
                        <CardDescription>You'll become the admin and get an invite code to share</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleCreate} className="space-y-4">
                            <div className="space-y-1.5">
                                <Label>Group Name *</Label>
                                <Input
                                    placeholder="e.g. Sharma Family Gold Fund"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    maxLength={60}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Description (optional)</Label>
                                <Textarea
                                    placeholder="What's this group for?"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={2}
                                />
                            </div>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold"
                            >
                                {loading ? "Creating..." : "Create Group"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
