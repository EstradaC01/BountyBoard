import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { WalletProvider } from "@/context/WalletContext";
import { ToastProvider } from "@/context/ToastContext";
import WalletConnect from "@/components/WalletConnect";
import MobileNav from "@/components/MobileNav";
import Link from "next/link";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "BountyBoard — Stellar Escrow for Freelancers",
  description: "Post and fund bounties on-chain. Crypto escrow powered by Soroban.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`} style={{ colorScheme: "light" }}>
      <body style={{ margin: 0, minHeight: "100vh", display: "flex", flexDirection: "column", backgroundColor: "#f8fafc", color: "#0f172a", fontFamily: "var(--font-geist-sans), Arial, sans-serif" }}>
        <WalletProvider>
          <ToastProvider>
            <header style={{ backgroundColor: "#ffffff", borderBottom: "1px solid #e2e8f0", position: "sticky", top: 0, zIndex: 50, boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
              <div style={{ maxWidth: 1152, margin: "0 auto", padding: "0 20px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>

                {/* Logo */}
                <Link href="/" style={{ fontWeight: 800, fontSize: 18, color: "#4f46e5", textDecoration: "none", letterSpacing: "-0.3px", flexShrink: 0 }}>
                  BountyBoard
                </Link>

                {/* Desktop nav */}
                <nav className="desktop-nav">
                  {[{ href: "/", label: "Browse" }, { href: "/create", label: "Post Bounty" }, { href: "/dashboard", label: "My Bounties" }].map(({ href, label }) => (
                    <Link key={href} href={href} style={{ fontSize: 14, fontWeight: 500, color: "#475569", textDecoration: "none" }}>
                      {label}
                    </Link>
                  ))}
                </nav>

                {/* Desktop wallet */}
                <div className="desktop-wallet">
                  <WalletConnect />
                </div>

                {/* Mobile hamburger */}
                <div className="mobile-menu">
                  <MobileNav />
                </div>
              </div>
            </header>

            <main style={{ flex: 1 }}>{children}</main>

            <footer style={{ borderTop: "1px solid #e2e8f0", padding: "20px 24px", textAlign: "center", fontSize: 12, color: "#94a3b8", backgroundColor: "#fff" }}>
              BountyBoard · Powered by Stellar &amp; Soroban · Testnet
            </footer>
          </ToastProvider>
        </WalletProvider>

        <style>{`
          .desktop-nav { display: flex; gap: 24px; }
          .desktop-wallet { display: block; }
          .mobile-menu { display: none; }

          @media (max-width: 640px) {
            .desktop-nav { display: none; }
            .desktop-wallet { display: none; }
            .mobile-menu { display: block; }
          }
        `}</style>
      </body>
    </html>
  );
}
