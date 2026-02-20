"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export default function DashboardPage() {
    const [user, setUser] = useState<any>(null);
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

    if (!user) return <div className="flex min-h-screen items-center justify-center bg-gray-50/50">Loading...</div>;

    return (
        <div className="flex min-h-screen flex-col items-center p-8 bg-gray-50/50">
            <Card className="w-full max-w-md mt-10">
                <CardHeader>
                    <CardTitle>Dashboard</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-lg">Welcome back, <span className="font-semibold">{user.name || user.email.split('@')[0]}</span>!</p>

                    <div className="bg-white p-4 rounded-lg border shadow-sm flex justify-between items-center text-sm">
                        <div>
                            <p className="text-gray-500">Gold Balance</p>
                            <p className="text-2xl font-bold">0.00g</p>
                        </div>
                        <div className="text-right">
                            <p className="text-gray-500">Current Value</p>
                            <p className="text-lg font-semibold">₹0</p>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 pt-4">
                        <Button onClick={() => router.push("/profile")} variant="outline" className="w-full">
                            Complete your profile
                        </Button>
                        <Button
                            onClick={() => {
                                localStorage.removeItem("token");
                                router.push("/signin");
                            }}
                            variant="destructive"
                            className="w-full"
                        >
                            Sign out
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
