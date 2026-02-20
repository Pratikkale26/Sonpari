"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useWallet, useConnection } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { PublicKey, SystemProgram, Transaction, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { AppHeader } from "@/components/AppHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Coins, Check, Wallet, Lock } from "lucide-react";
import axios from "axios";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
const PARENT_WALLET = process.env.NEXT_PUBLIC_PARENT_WALLET || "";
const USDC_PER_GRAM = 74;

const headers = () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` });

export default function ProposalDetailPage() {
    const { id: groupId, pid: proposalId } = useParams() as { id: string; pid: string };
    const router = useRouter();
    const { publicKey, sendTransaction, connected } = useWallet();
    const { connection } = useConnection();

    const [proposal, setProposal] = useState<any>(null);
    const [myRole, setMyRole] = useState("");
    const [loading, setLoading] = useState(true);
    const [goldGrams, setGoldGrams] = useState("");
    const [buying, setBuying] = useState(false);
    const [closing, setClosing] = useState(false);

    const myContribution = proposal?.contributions?.find(
        (c: any) => c.user?.id === undefined // will compare after user load
    );

    const fetchProposal = async () => {
        try {
            const { data } = await axios.get(`${API}/api/groups/${groupId}/proposals/${proposalId}`, { headers: headers() });
            setProposal(data.proposal);
            setMyRole(data.myRole);
        } catch { toast.error("Failed to load proposal"); }
        finally { setLoading(false); }
    };

    useEffect(() => {
        if (!localStorage.getItem("token")) { router.push("/signin"); return; }
        fetchProposal();
    }, []);

    const handleBuyAndContribute = async () => {
        const grams = parseFloat(goldGrams);
        if (!grams || grams <= 0) return toast.error("Enter valid gold amount");
        if (!connected || !publicKey) return toast.error("Connect your wallet first");

        setBuying(true);
        try {
            // 1. Pay to parent wallet
            const usdcCost = grams * USDC_PER_GRAM;
            const tx = new Transaction().add(
                SystemProgram.transfer({
                    fromPubkey: publicKey,
                    toPubkey: new PublicKey(PARENT_WALLET || publicKey.toBase58()),
                    lamports: Math.round(usdcCost * 0.001 * LAMPORTS_PER_SOL),
                })
            );
            const sig = await sendTransaction(tx, connection);
            await connection.confirmTransaction(sig, "confirmed");
            toast.success("Payment confirmed! Purchasing gold...");

            // 2. Buy gold via our API
            const { data: buyData } = await axios.post(
                `${API}/api/gold/buy`,
                { goldGrams: grams, paymentTxSignature: sig },
                { headers: headers() }
            );

            // 3. Record contribution to proposal
            await axios.post(
                `${API}/api/groups/${groupId}/proposals/${proposalId}/contribute`,
                { goldGrams: grams, grailTxnId: buyData.txId },
                { headers: headers() }
            );

            toast.success(`You bought ${grams}g for this proposal! 🎉`);
            setGoldGrams("");
            fetchProposal();
        } catch (err: any) {
            toast.error(err?.response?.data?.message || err.message || "Failed");
        } finally {
            setBuying(false);
        }
    };

    const handleClose = async () => {
        setClosing(true);
        try {
            await axios.post(`${API}/api/groups/${groupId}/proposals/${proposalId}/close`, {}, { headers: headers() });
            toast.success("Proposal closed");
            fetchProposal();
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Failed to close");
        } finally {
            setClosing(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-amber-50/20">
            <AppHeader />
            <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" /></div>
        </div>
    );
    if (!proposal) return null;

    const totalGrams = proposal.contributions?.reduce((s: number, c: any) => s + Number(c.goldGrams), 0) || 0;
    const isOpen = proposal.status === "OPEN";

    return (
        <div className="min-h-screen bg-amber-50/20">
            <AppHeader />
            <main className="container mx-auto px-4 py-6 max-w-lg space-y-4">

                {/* Proposal Header */}
                <Card className="border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50">
                    <CardContent className="p-5">
                        <div className="flex items-start justify-between">
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">{proposal.occasion || "Group Buy"}</h1>
                                {proposal.message && <p className="text-sm text-gray-600 mt-1">{proposal.message}</p>}
                                {proposal.deadline && (
                                    <p className="text-xs text-gray-400 mt-1">Deadline: {new Date(proposal.deadline).toLocaleDateString()}</p>
                                )}
                            </div>
                            <Badge className={isOpen ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}>
                                {isOpen ? "Open" : "Closed"}
                            </Badge>
                        </div>

                        <div className="mt-4 pt-4 border-t border-amber-200 grid grid-cols-2 gap-3">
                            <div>
                                <p className="text-xs text-gray-400">Total Gold Bought</p>
                                <p className="text-xl font-bold text-amber-700">{totalGrams.toFixed(4)}g</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400">Contributors</p>
                                <p className="text-xl font-bold text-gray-900">{proposal.contributions?.length || 0}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Buy Section */}
                {isOpen && (
                    <Card className="border-amber-200 shadow-sm">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base flex items-center gap-2">
                                <Coins className="h-4 w-4 text-amber-500" /> Buy Your Gold for This Proposal
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-1.5">
                                <Label>Gold Amount (grams)</Label>
                                <Input
                                    type="number"
                                    step="0.001"
                                    min="0.001"
                                    placeholder="0.1"
                                    value={goldGrams}
                                    onChange={(e) => setGoldGrams(e.target.value)}
                                    className="font-mono"
                                />
                                {parseFloat(goldGrams) > 0 && (
                                    <p className="text-xs text-amber-600 font-medium">
                                        ≈ ${(parseFloat(goldGrams) * USDC_PER_GRAM).toFixed(2)} USDC / ₹{(parseFloat(goldGrams) * USDC_PER_GRAM * 83).toFixed(0)}
                                    </p>
                                )}
                            </div>

                            {!connected ? (
                                <div className="border-2 border-dashed border-amber-200 rounded-xl p-4 text-center">
                                    <Wallet className="h-6 w-6 text-amber-400 mx-auto mb-2" />
                                    <p className="text-sm text-gray-500 mb-2">Connect wallet to pay</p>
                                    <WalletMultiButton style={{ backgroundColor: "#d97706", borderRadius: "8px", fontSize: "12px" }} />
                                </div>
                            ) : (
                                <Button
                                    className="w-full bg-gradient-to-r from-amber-600 to-amber-500 text-white font-semibold"
                                    onClick={handleBuyAndContribute}
                                    disabled={buying}
                                >
                                    {buying ? "Buying..." : "Buy & Add to Proposal"}
                                </Button>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Contributors */}
                <Card className="border-amber-100">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">Contributors</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {proposal.contributions?.length === 0 ? (
                            <p className="text-sm text-gray-400 text-center py-4">No contributions yet. Be the first!</p>
                        ) : (
                            <div className="space-y-2">
                                {proposal.contributions?.map((c: any) => (
                                    <div key={c.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                                        <div className="flex items-center gap-2">
                                            <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 text-xs font-bold">
                                                {(c.user?.name || c.user?.email || "?")[0].toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-800">{c.user?.name || c.user?.email}</p>
                                                <p className="text-xs text-gray-400">{c.status}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-sm font-semibold text-amber-700">{Number(c.goldGrams).toFixed(4)}g</span>
                                            {c.status === "PAID" && <Check className="h-3.5 w-3.5 text-green-500" />}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Admin close */}
                {myRole === "ADMIN" && isOpen && (
                    <Card className="border-red-100">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold text-gray-700">Close Proposal</p>
                                <p className="text-xs text-gray-400">No more contributions after closing</p>
                            </div>
                            <Button variant="outline" size="sm" onClick={handleClose} disabled={closing} className="border-red-200 text-red-600 hover:bg-red-50">
                                <Lock className="h-3.5 w-3.5 mr-1" /> {closing ? "Closing..." : "Close"}
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </main>
        </div>
    );
}
