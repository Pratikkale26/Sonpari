"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import Link from "next/link";
import { Eye, EyeOff, Sparkles, ArrowRight } from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export default function SignInPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/user/signin`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();
            if (res.ok) {
                localStorage.setItem("token", data.token);
                toast.success("Welcome back! 👋");
                router.push("/dashboard");
            } else {
                toast.error(data.message || "Sign in failed");
            }
        } catch {
            toast.error("Could not connect to server");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-b from-amber-50 via-white to-white px-4 sm:px-6 lg:px-8 py-12">

            {/* Background elements to match landing page */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-amber-100/40 via-transparent to-transparent pointer-events-none" />
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-200 to-transparent pointer-events-none" />

            <div className="relative w-full max-w-md space-y-8">
                {/* Branding Headers */}
                <div className="text-center">
                    <Link href="/" className="inline-flex items-center gap-2 transition-transform hover:scale-105 active:scale-95">
                        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-md shadow-amber-500/20">
                            <span className="text-white text-lg font-bold">S</span>
                        </div>
                        <span className="text-2xl font-bold tracking-tight text-gray-900">Sonpari</span>
                    </Link>

                    <div className="mt-8 space-y-2">
                        <div className="inline-flex items-center gap-2 rounded-full bg-amber-100/50 px-3 py-1 text-sm font-medium text-amber-900 ring-1 ring-inset ring-amber-500/20 mb-2">
                            <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                            <span>Welcome back</span>
                        </div>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                            Sign in to your account
                        </h1>
                        <p className="text-gray-500 text-lg">
                            Continue tracking your gold savings and streaks.
                        </p>
                    </div>
                </div>

                {/* Main Form Card */}
                <div className="bg-white/70 backdrop-blur-xl ring-1 ring-gray-900/5 sm:rounded-2xl p-6 sm:p-10 shadow-xl shadow-gray-900/5">
                    <form onSubmit={handleSignIn} className="space-y-5">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-gray-700 font-medium">Email address</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="name@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="h-12 bg-white border-gray-200 focus:border-amber-400 focus:ring-amber-400 text-base"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password" className="text-gray-700 font-medium">Password</Label>
                                <span className="text-sm font-medium text-amber-600 hover:text-amber-500 cursor-pointer">
                                    Forgot password?
                                </span>
                            </div>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPw ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="h-12 pr-10 bg-white border-gray-200 focus:border-amber-400 focus:ring-amber-400 text-base"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPw(!showPw)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                                >
                                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="group w-full h-12 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-white text-base font-semibold rounded-xl shadow-lg shadow-amber-500/20 transition-all mt-2"
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <span className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Signing in...
                                </span>
                            ) : (
                                <span className="flex items-center justify-center w-full">
                                    Sign In
                                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                                </span>
                            )}
                        </Button>
                    </form>
                </div>

                {/* Footer Links */}
                <p className="text-center text-gray-500">
                    Don't have an account?{" "}
                    <Link href="/signup" className="font-semibold text-amber-600 hover:text-amber-500 transition-colors">
                        Create one for free
                    </Link>
                </p>
            </div>
        </div>
    );
}
