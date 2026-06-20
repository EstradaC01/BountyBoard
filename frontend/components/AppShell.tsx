"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { WalletProvider } from "@/context/WalletContext";
import { ToastProvider } from "@/context/ToastContext";
import { ModalProvider, useModal } from "@/context/ModalContext";
import WalletConnect from "@/components/WalletConnect";
import MobileNav from "@/components/MobileNav";
import Modal from "@/components/Modal";
import BountyDetailContent from "@/components/BountyDetailContent";
import CreateBountyForm from "@/components/CreateBountyForm";
import BackgroundShapes from "@/components/BackgroundShapes";

function AppModals() {
  const { modal, close } = useModal();
  if (!modal) return null;

  return (
    <Modal onClose={close} maxWidth={modal.type === "create" ? 560 : 760}>
      {modal.type === "bounty" && (
        <BountyDetailContent id={modal.id} onClose={close} />
      )}
      {modal.type === "create" && (
        <CreateBountyForm onSuccess={close} onCancel={close} />
      )}
    </Modal>
  );
}

const StarMark = ({ size = 18 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
    <path d="M50,2 C52,42 58,48 98,50 C58,52 52,58 50,98 C48,58 42,52 2,50 C42,48 48,42 50,2Z" fill="#e03a7a" />
  </svg>
);

const Brand = ({ size = 17 }: { size?: number }) => (
  <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 9 }}>
    <StarMark size={Math.round(size * 0.9)} />
    <span style={{ fontWeight: 800, fontSize: size, letterSpacing: "-0.04em", lineHeight: 1 }}>
      <span style={{ color: "#ebebdf" }}>Bounty</span><span style={{ color: "#c9ee00" }}>Board</span>
    </span>
  </Link>
);

function AppHeader() {
  const { openCreate } = useModal();

  return (
    <header style={{
      backgroundColor: "rgba(10,10,10,0.85)",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      borderBottom: "1px solid #1c1c1a",
      position: "sticky",
      top: 0,
      zIndex: 50,
    }}>
      <div style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "0 24px",
        height: 64,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 16,
      }}>
        <Brand />

        {/* Desktop — nav, primary CTA, wallet */}
        <div className="header-actions">
          <nav style={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Link href="/" className="nav-link" style={navLinkStyle}>Browse</Link>
            <Link href="/dashboard" className="nav-link" style={navLinkStyle}>My Bounties</Link>
          </nav>

          <motion.button
            onClick={openCreate}
            whileHover={{ scale: 1.03, backgroundColor: "#d4f500" }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.14 }}
            style={{
              marginLeft: 6, padding: "8px 16px", borderRadius: 7,
              backgroundColor: "#c9ee00", color: "#0a0a0a",
              fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer",
              fontFamily: "inherit", letterSpacing: "-0.01em",
            }}
          >
            Post Bounty
          </motion.button>

          <div style={{ width: 1, height: 26, backgroundColor: "#222220", margin: "0 6px" }} />

          <WalletConnect />
        </div>

        {/* Mobile — hamburger */}
        <div className="header-mobile">
          <MobileNav />
        </div>
      </div>
    </header>
  );
}

const navLinkStyle: React.CSSProperties = {
  fontSize: 14, fontWeight: 500, color: "#9a9a92",
  textDecoration: "none", padding: "7px 12px", borderRadius: 6,
  transition: "color 0.15s, background-color 0.15s",
};

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <WalletProvider>
      <ToastProvider>
        <ModalProvider>
          {/* Fixed background layer — sits behind all content */}
          <BackgroundShapes />

          {/* Content stack — sits above the background */}
          <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", minHeight: "100vh" }}>
            <AppHeader />
            <main style={{ flex: 1 }}>{children}</main>
            <footer style={{
              borderTop: "1px solid #222220",
              padding: "20px 24px",
              textAlign: "center",
              fontSize: 12,
              color: "#444440",
              backgroundColor: "rgba(10,10,10,0.88)",
              backdropFilter: "blur(14px)",
              WebkitBackdropFilter: "blur(14px)",
            }}>
              BountyBoard · Powered by{" "}
              <span style={{ color: "#e53a0d" }}>Stellar</span>
              {" "}&amp;{" "}
              <span style={{ color: "#e03a7a" }}>Soroban</span>
              {" "}· Testnet
            </footer>
          </div>

          <AppModals />
        </ModalProvider>
      </ToastProvider>
    </WalletProvider>
  );
}
