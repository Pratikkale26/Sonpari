"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import {
    PublicKey,
    SystemProgram,
    Transaction,
    LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { AppHeader } from "@/components/AppHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Coins, ArrowRight, InfoIcon, Wallet } from "lucide-react";
import axios from "axios";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
const PARENT_WALLET = process.env.NEXT_PUBLIC_PARENT_WALLET || "";

function authHeaders() {
    return { Authorization: `Bearer ${localStorage.getItem("token")}` };
}

const USDC_PER_GRAM = 74;   // live from API in production
const INR_PER_GRAM = 6142;  // ≈ USDC * 83

export default function BuyGoldPage() {
    const [goldGrams, setGoldGrams] = useState("");
    const [step, setStep] = useState<"input" | "paying" | "confirming" | "done">("input");
    const [txSig, setTxSig] = useState("");
    const [result, setResult] = useState<any>(null);
    const [goldPrice, setGoldPrice] = useState({ usdcPerGram: USDC_PER_GRAM, inrPerGram: INR_PER_GRAM });

    const { connection } = useConnection();
    const { publicKey, sendTransaction, connected } = useWallet();
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) { router.push("/signin"); return; }
        // Fetch live price
        axios
            .get(`${API}/api/gold/price`, { headers: authHeaders() })
            .then((r) => setGoldPrice(r.data))
            .catch(() => { });
    }, [router]);

    const grams = parseFloat(goldGrams) || 0;
    const usdcCost = grams * goldPrice.usdcPerGram;
    const inrCost = grams * goldPrice.inrPerGram;

    // Step 1 — Send USDC/SOL payment to parent wallet
    const handlePay = async () => {
        if (!grams || grams <= 0) return toast.error("Enter a valid gold amount");
        if (!connected || !publicKey) return toast.error("Please connect your wallet first");
        if (!PARENT_WALLET) return toast.error("Parent wallet not configured");

        setStep("paying");
        try {
            const tx = new Transaction().add(
                SystemProgram.transfer({
                    fromPubkey: publicKey,
                    toPubkey: new PublicKey(PARENT_WALLET),
                    lamports: Math.round(usdcCost * 0.001 * LAMPORTS_PER_SOL), // placeholder SOL equivalent
                })
            );

            const sig = await sendTransaction(tx, connection);
            await connection.confirmTransaction(sig, "confirmed");
            setTxSig(sig);
            setStep("confirming");
            toast.success("Payment confirmed! Purchasing your gold...");

            // Step 2 — Tell backend to buy gold
            await handleBuyGold(sig);
        } catch (err: any) {
            console.error(err);
            toast.error(err?.message || "Payment failed");
            setStep("input");
        }
    };

    // Step 2 — Submit to our backend → Oro buy
    const handleBuyGold = async (sig: string) => {
        try {
            const { data } = await axios.post(
                `${API}/api/gold/buy`,
                { goldGrams: grams, paymentTxSignature: sig },
                { headers: authHeaders() }
            );
            setResult(data);
            setStep("done");
            toast.success("Gold purchased successfully! 🎉");
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Gold purchase failed");
            setStep("input");
        }
    };

    const reset = () => {
        setGoldGrams("");
        setStep("input");
        setResult(null);
        setTxSig("");
    };

    return (
        <div className="min-h-screen bg-amber-50/20">
            <AppHeader />
            <main className="container mx-auto px-4 py-10 max-w-lg">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Coins className="h-6 w-6 text-amber-500" /> Buy Gold
                    </h1>
                    <p className="text-gray-500 text-sm mt-1">Purchase tokenized gold backed by physical gold</p>
                </div>

                {/* DONE state */}
                {step === "done" && result && (
                    <Card className="border-green-200 bg-green-50">
                        <CardContent className="pt-6 text-center space-y-4">
                            <div className="h-16 w-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                                <Coins className="h-8 w-8 text-green-600" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">Gold Purchased! 🎉</h2>
                            <p className="text-sm text-gray-600">
                                You bought <strong>{result.goldGrams}g</strong> at ${result.quotedPrice}/g
                            </p>
                            <p className="text-xs text-gray-400 break-all">Tx: {result.txId}</p>
                            <div className="flex gap-3 justify-center">
                                <Button onClick={() => router.push("/dashboard")} className="bg-amber-600 hover:bg-amber-700 text-white">
                                    Go to Dashboard
                                </Button>
                                <Button variant="outline" onClick={reset}>Buy More</Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {step !== "done" && (
                    <Card className="border-amber-200 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-base">Enter Amount</CardTitle>
                            <CardDescription>Minimum purchase: 0.001g gold</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-5">
                            {/* Quick amounts */}
                            <div className="flex gap-2">
                                {[0.01, 0.1, 0.5, 1].map((g) => (
                                    <Button
                                        key={g}
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setGoldGrams(g.toString())}
                                        className="text-xs border-amber-200 hover:bg-amber-50 hover:border-amber-400"
                                    >
                                        {g}g
                                    </Button>
                                ))}
                            </div>

                            <div className="space-y-1.5">
                                <Label>Gold Amount (grams)</Label>
                                <Input
                                    type="number"
                                    step="0.001"
                                    min="0.001"
                                    placeholder="0.1"
                                    value={goldGrams}
                                    onChange={(e) => setGoldGrams(e.target.value)}
                                    className="text-lg font-mono"
                                />
                            </div>

                            {/* Quote */}
                            {grams > 0 && (
                                <div className="rounded-xl bg-amber-50 border border-amber-100 p-4 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Gold amount</span>
                                        <span className="font-semibold">{grams}g</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Gold price</span>
                                        <span>${goldPrice.usdcPerGram}/g</span>
                                    </div>
                                    <div className="flex justify-between text-sm border-t pt-2">
                                        <span className="text-gray-700 font-medium">You pay</span>
                                        <div className="text-right">
                                            <p className="font-bold text-amber-800">${usdcCost.toFixed(4)} USDC</p>
                                            <p className="text-xs text-gray-500">≈ ₹{inrCost.toFixed(2)}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Payment method */}
                            <div className="space-y-2">
                                <Label>Payment Method</Label>
                                {!connected ? (
                                    <div className="border-2 border-dashed border-amber-200 rounded-xl p-4 text-center">
                                        <Wallet className="h-8 w-8 text-amber-400 mx-auto mb-2" />
                                        <p className="text-sm text-gray-500 mb-3">Connect your Solana wallet to pay</p>
                                        <WalletMultiButton style={{ backgroundColor: "#d97706", borderRadius: "8px", fontSize: "13px" }} />
                                    </div>
                                ) : (
                                    <div className="border border-green-200 bg-green-50 rounded-xl p-3 flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full bg-green-500" />
                                        <p className="text-sm text-green-700 font-medium">
                                            Wallet connected: {publicKey?.toBase58().slice(0, 8)}...
                                        </p>
                                    </div>
                                )}

                                {/* UPI Coming Soon */}
                                <div className="border border-gray-200 rounded-xl p-3 flex items-center justify-between opacity-60">
                                    <div className="flex items-center gap-2">
                                        <div className="h-6 w-6 bg-purple-100 rounded flex items-center justify-center text-xs font-bold text-purple-700">₹</div>
                                        <span className="text-sm text-gray-600">UPI</span>
                                    </div>
                                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                                        Coming Soon
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-start gap-2 text-xs text-gray-400">
                                <InfoIcon className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                                <p>Payment goes to our custody wallet. We then purchase your gold on the Oro GRAIL network and credit your account.</p>
                            </div>

                            <Button
                                className="w-full h-12 bg-gradient-to-r from-amber-600 to-amber-500 text-white font-semibold text-base rounded-xl disabled:opacity-50"
                                onClick={handlePay}
                                disabled={!connected || !grams || step === "paying" || step === "confirming"}
                            >
                                {step === "paying" ? (
                                    <>Processing payment...</>
                                ) : step === "confirming" ? (
                                    <>Confirming on Solana...</>
                                ) : (
                                    <>Pay & Get Gold <ArrowRight className="ml-2 h-4 w-4 inline" /></>
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </main>
        </div>
    );
}
