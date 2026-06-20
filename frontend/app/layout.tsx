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
          .header-actions { display: flex; align-items: center; gap: 8px; }
          .header-mobile { display: none; }

          .nav-link:hover { color: #ebebdf !important; background-color: #181815 !important; }
          .filter-pill:hover { border-color: #3a3a36 !important; color: #ebebdf !important; }

          * { box-sizing: border-box; }
          ::selection { background: #c9ee0033; color: #ebebdf; }
          :focus-visible { outline: 2px solid #c9ee00; outline-offset: 2px; }
          input:focus, select:focus { border-color: #c9ee00 !important; outline: none; }
          input::placeholder { color: #555550; }

          @media (max-width: 720px) {
            .header-actions { display: none; }
            .header-mobile { display: block; }
          }
        `}</style>
      </body>
    </html>
  );
}
