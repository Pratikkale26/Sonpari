"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import axios from "axios";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
const headers = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

export default function NewProposalPage() {
    const params = useParams();
    const groupId = params.id as string;
    const router = useRouter();
    const [form, setForm] = useState({ occasion: "", message: "", deadline: "" });
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await axios.post(`${API}/api/groups/${groupId}/proposals`, form, { headers: headers() });
            toast.success("Proposal created!");
            router.push(`/groups/${groupId}`);
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Failed to create proposal");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-amber-50/20">
            <AppHeader />
            <main className="container mx-auto px-4 py-8 max-w-md">
                <div className="mb-5">
                    <h1 className="text-xl font-bold text-gray-900">New Group Buy Proposal</h1>
                    <p className="text-gray-500 text-sm">Everyone can join and buy gold on this proposal</p>
                </div>
                <Card className="border-amber-200 shadow-sm">
                    <CardContent className="pt-5">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-1.5">
                                <Label>Occasion</Label>
                                <Input placeholder="e.g. Diwali 2025, Group savings..." value={form.occasion} onChange={(e) => setForm({ ...form, occasion: e.target.value })} />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Message (optional)</Label>
                                <Textarea placeholder="Why are we buying together?" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} rows={2} />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Deadline (optional)</Label>
                                <Input type="datetime-local" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
                            </div>
                            <Button type="submit" disabled={loading} className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold">
                                {loading ? "Creating..." : "Create Proposal"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
