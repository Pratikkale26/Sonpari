import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import WalletContextProvider from "@/components/WalletAdaptors";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sonpari - Social Gold Savings App for Families",
  description: "Save small amounts of gold daily with family and friends. Build saving streaks together.",
  keywords: ["gold savings", "digital gold", "family savings", "gold gifting", "micro savings", "Indian families"],
  openGraph: {
    title: "Sonpari - Social Gold Savings App",
    description: "Turn everyday savings into meaningful gold gifts",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} antialiased`}>
        <WalletContextProvider>
          {children}
          <Toaster />
        </WalletContextProvider>
      </body>
    </html>
  );
}
