import type { Metadata } from "next";
import "./globals.css";
import AppShell from "@/components/AppShell";

export const metadata: Metadata = {
  title: "BountyBoard — Stellar Escrow for Freelancers",
  description: "Post and fund bounties on-chain. Crypto escrow powered by Soroban.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" style={{ colorScheme: "light" }}>
      <body style={{
        margin: 0,
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#0a0a0a",
        color: "#ebebdf",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif",
      }}>
        <AppShell>{children}</AppShell>

        <style>{`
          .desktop-nav { display: flex; gap: 4px; align-items: center; }
          .desktop-wallet { display: block; }
          .mobile-menu { display: none; }

          .nav-link:hover { color: #ebebdf !important; background-color: #1a1a18 !important; }

          * { box-sizing: border-box; }
          ::selection { background: #e03a7a33; color: #ebebdf; }
          :focus-visible { outline: 2px solid #e03a7a; outline-offset: 2px; }
          input:focus, select:focus { border-color: #e03a7a !important; outline: none; }
          input::placeholder { color: #444440; }

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
