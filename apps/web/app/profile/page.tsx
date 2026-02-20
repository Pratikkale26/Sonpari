"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppHeader } from "@/components/AppHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { User, Shield, Flame, CheckCircle, AlertCircle } from "lucide-react";
import axios from "axios";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
const headers = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

export default function ProfilePage() {
    const [user, setUser] = useState<any>(null);
    const [streak, setStreak] = useState<any>(null);
    const [form, setForm] = useState({ name: "", phone: "", password: "", confirmPassword: "" });
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        if (!localStorage.getItem("token")) { router.push("/signin"); return; }
        axios.get(`${API}/api/user`, { headers: headers() }).then((r) => {
            const u = r.data.user;
            setUser(u);
            setForm((f) => ({ ...f, name: u.name || "", phone: u.phone || "" }));
        }).catch(() => {
            localStorage.removeItem("token");
            router.push("/signin");
        });
    }, [router]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (form.password && form.password !== form.confirmPassword) {
            return toast.error("Passwords don't match");
        }
        setLoading(true);
        try {
            const payload: any = { name: form.name.trim(), phone: form.phone.trim() };
            if (form.password) payload.password = form.password;

            await axios.post(`${API}/api/user/profile`, payload, { headers: headers() });
            setUser((u: any) => ({ ...u, name: form.name, phone: form.phone }));
            toast.success("Profile updated!");
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Update failed");
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-amber-50/20">
                <AppHeader />
                <div className="flex justify-center py-20">
                    <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-amber-50/20">
            <AppHeader />
            <main className="container mx-auto px-4 py-8 max-w-lg space-y-5">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
                    <p className="text-gray-500 text-sm">Manage your account settings</p>
                </div>

                {/* Account Status Card */}
                <Card className={`border-2 ${user.grailUserId ? "border-green-200 bg-green-50" : "border-amber-200 bg-amber-50"}`}>
                    <CardContent className="p-4 flex items-center Gap-3">
                        <div className="flex items-center gap-3">
                            {user.grailUserId ? (
                                <CheckCircle className="h-8 w-8 text-green-500 shrink-0" />
                            ) : (
                                <AlertCircle className="h-8 w-8 text-amber-500 shrink-0" />
                            )}
                            <div>
                                <p className="font-semibold text-sm text-gray-900">
                                    {user.grailUserId ? "Gold Account Active ✓" : "Gold Account Not Activated"}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {user.grailUserId
                                        ? `Oro ID: ${user.grailUserId.slice(0, 12)}...`
                                        : "Go to Dashboard to activate"}
                                </p>
                            </div>
                        </div>
                        <div className="ml-auto flex items-center gap-1.5">
                            <Flame className="h-4 w-4 text-orange-400" />
                            <span className="text-sm font-bold text-gray-700">{user.streakCount || 0} day streak</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Edit Profile */}
                <Card className="border-amber-200 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-base flex items-center gap-2">
                            <User className="h-4 w-4 text-amber-500" /> Personal Info
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSave} className="space-y-4">
                            <div className="space-y-1.5">
                                <Label>Email</Label>
                                <Input value={user.email} disabled className="bg-gray-50 text-gray-500 cursor-not-allowed" />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Full Name</Label>
                                <Input
                                    placeholder="Enter your name"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Phone (optional)</Label>
                                <Input
                                    placeholder="+91..."
                                    value={form.phone}
                                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                />
                            </div>

                            <div className="border-t pt-4 space-y-3">
                                <p className="text-xs text-gray-400 flex items-center gap-1">
                                    <Shield className="h-3 w-3" /> Leave password blank to keep current password
                                </p>
                                <div className="space-y-1.5">
                                    <Label>New Password</Label>
                                    <Input
                                        type="password"
                                        placeholder="New password"
                                        value={form.password}
                                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label>Confirm Password</Label>
                                    <Input
                                        type="password"
                                        placeholder="Confirm new password"
                                        value={form.confirmPassword}
                                        onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                                    />
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-amber-600 hover:bg-amber-700 text-white font-semibold"
                            >
                                {loading ? "Saving..." : "Save Changes"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
