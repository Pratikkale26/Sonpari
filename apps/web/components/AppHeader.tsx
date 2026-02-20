"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";

const navLinks = [
    { href: "/dashboard", label: "Dashboard" },
    { href: "/groups", label: "Groups" },
    { href: "/buy", label: "Buy Gold" },
    { href: "/profile", label: "Profile" },
];

export function AppHeader() {
    const pathname = usePathname();
    const router = useRouter();
    const { connected } = useWallet();

    const handleSignOut = () => {
        localStorage.removeItem("token");
        router.push("/signin");
    };

    return (
        <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-amber-100 shadow-sm">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link href="/dashboard" className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
                        <span className="text-white text-sm font-bold">S</span>
                    </div>
                    <span className="text-lg font-bold text-gray-900">Sonpari</span>
                </Link>

                {/* Nav */}
                <nav className="hidden md:flex items-center gap-1">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${pathname === link.href
                                    ? "bg-amber-100 text-amber-800"
                                    : "text-gray-600 hover:bg-gray-100"
                                }`}
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    <WalletMultiButton
                        style={{
                            backgroundColor: connected ? "#92400e" : "#d97706",
                            borderRadius: "8px",
                            fontSize: "12px",
                            height: "36px",
                            padding: "0 12px",
                        }}
                    />
                    <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-gray-500 hover:text-red-500">
                        <LogOut className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </header>
    );
}
