"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export default function ProfilePage() {
    const [user, setUser] = useState<any>(null);
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                router.push("/signin");
                return;
            }

            try {
                const response = await fetch(`${API_URL}/api/user/`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (response.ok) {
                    const data = await response.json();
                    setUser(data.user);
                    setName(data.user.name || "");
                    setPhone(data.user.phone || "");
                } else {
                    localStorage.removeItem("token");
                    router.push("/signin");
                }
            } catch (err) {
                console.error("Failed to fetch user");
            }
        };

        fetchUser();
    }, [router]);

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const token = localStorage.getItem("token");
        try {
            const response = await fetch(`${API_URL}/api/user/profile`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ name, phone, password: password || undefined }),
            });

            if (response.ok) {
                toast.success("Profile updated successfully!");
                router.push("/dashboard");
            } else {
                toast.error("Failed to update profile");
            }
        } catch (error) {
            toast.error("An error occurred");
        } finally {
            setLoading(false);
        }
    };

    if (!user) return <div className="flex min-h-screen items-center justify-center bg-gray-50/50">Loading...</div>;

    return (
        <div className="flex min-h-screen items-center justify-center p-4 bg-gray-50/50">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle>Your Profile</CardTitle>
                    <CardDescription>Update your personal information</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleUpdate} className="space-y-4">
                        <div className="space-y-2">
                            <Label>Email</Label>
                            <Input value={user.email} disabled className="bg-gray-100 dark:bg-gray-800" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                                id="name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="John Doe"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone Number</Label>
                            <Input
                                id="phone"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="+91 9876543210"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">New Password (optional)</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Leave blank to keep current"
                            />
                        </div>
                        <div className="flex justify-between pt-4">
                            <Button type="button" variant="outline" onClick={() => router.push("/dashboard")}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={loading}>
                                {loading ? "Saving..." : "Save Changes"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
