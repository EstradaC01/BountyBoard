import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/AppShell";

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
        <AppShell>{children}</AppShell>

        <style>{`
          .desktop-nav { display: flex; gap: 4px; align-items: center; }
          .desktop-wallet { display: block; }
          .mobile-menu { display: none; }

          .nav-link:hover { color: #ebebdf !important; background-color: #1a1a18 !important; }

          * { box-sizing: border-box; }
          ::selection { background: #c9ee0033; color: #ebebdf; }
          :focus-visible { outline: 2px solid #c9ee00; outline-offset: 2px; }

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
