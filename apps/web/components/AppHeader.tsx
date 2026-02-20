"use client";

import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Menu, X } from "lucide-react";
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
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleSignOut = () => {
        localStorage.removeItem("token");
        router.push("/signin");
    };

    return (
        <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-amber-100 shadow-sm transition-all duration-200">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                {/* Logo and Mobile Toggle */}
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden text-gray-500 hover:text-amber-600 hover:bg-amber-50"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </Button>

                    <Link href="/dashboard" className="flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
                        <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
                            <span className="text-white text-sm font-bold">S</span>
                        </div>
                        <span className="text-lg font-bold text-gray-900 hidden sm:block">Sonpari</span>
                    </Link>
                </div>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${pathname === link.href
                                ? "bg-amber-100 text-amber-800"
                                : "text-gray-600 hover:bg-amber-50 hover:text-amber-700"
                                }`}
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>

                {/* Actions */}
                <div className="flex items-center gap-2">
                    <div className="scale-90 sm:scale-100 origin-right">
                        <WalletMultiButton
                            style={{
                                backgroundColor: connected ? "#92400e" : "#d97706",
                                borderRadius: "8px",
                                fontSize: "14px",
                                height: "36px",
                                padding: "0 12px",
                                fontWeight: "600"
                            }}
                        />
                    </div>
                    <Button variant="ghost" size="icon" onClick={handleSignOut} className="text-gray-500 hover:text-red-500 hover:bg-red-50">
                        <LogOut className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Mobile Nav Dropdown */}
            {isMobileMenuOpen && (
                <div className="md:hidden border-t border-amber-100 bg-white/95 backdrop-blur-md absolute w-full shadow-lg">
                    <nav className="container mx-auto px-4 py-3 flex flex-col gap-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className={`px-4 py-3 rounded-xl text-base font-medium transition-all flex items-center ${pathname === link.href
                                        ? "bg-amber-100/50 text-amber-800"
                                        : "text-gray-600 hover:bg-amber-50 hover:text-amber-700 active:bg-amber-100"
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>
                </div>
            )}
        </header>
    );
}
