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
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
      style={{ colorScheme: "dark" }}
    >
      <body style={{
        margin: 0,
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#0a0a0a",
        color: "#ebebdf",
        fontFamily: "var(--font-geist-sans), Arial, sans-serif",
      }}>
        <WalletProvider>
          <ToastProvider>
            <header style={{
              backgroundColor: "#0a0a0a",
              borderBottom: "1px solid #222220",
              position: "sticky",
              top: 0,
              zIndex: 50,
            }}>
              <div style={{
                maxWidth: 1152,
                margin: "0 auto",
                padding: "0 20px",
                height: 64,
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}>
                <Link href="/" style={{
                  fontWeight: 800,
                  fontSize: 17,
                  color: "#c9ee00",
                  textDecoration: "none",
                  letterSpacing: "-0.03em",
                  flexShrink: 0,
                }}>
                  BountyBoard
                </Link>

                <nav className="desktop-nav">
                  {[
                    { href: "/", label: "Browse" },
                    { href: "/create", label: "Post Bounty" },
                    { href: "/dashboard", label: "My Bounties" },
                  ].map(({ href, label }) => (
                    <Link key={href} href={href} style={{
                      fontSize: 14,
                      fontWeight: 500,
                      color: "#888880",
                      textDecoration: "none",
                      padding: "5px 11px",
                      borderRadius: 6,
                    }}>
                      {label}
                    </Link>
                  ))}
                </nav>

                <div className="desktop-wallet">
                  <WalletConnect />
                </div>

                <div className="mobile-menu">
                  <MobileNav />
                </div>
              </div>
            </header>

            <main style={{ flex: 1 }}>{children}</main>

            <footer style={{
              borderTop: "1px solid #222220",
              padding: "20px 24px",
              textAlign: "center",
              fontSize: 12,
              color: "#444440",
              backgroundColor: "#0a0a0a",
            }}>
              BountyBoard · Powered by Stellar &amp; Soroban · Testnet
            </footer>
          </ToastProvider>
        </WalletProvider>

        <style>{`
          .desktop-nav { display: flex; gap: 4px; }
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
