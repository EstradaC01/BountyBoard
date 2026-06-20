"use client";

import Link from "next/link";
import { WalletProvider } from "@/context/WalletContext";
import { ToastProvider } from "@/context/ToastContext";
import { ModalProvider, useModal } from "@/context/ModalContext";
import WalletConnect from "@/components/WalletConnect";
import MobileNav from "@/components/MobileNav";
import Modal from "@/components/Modal";
import BountyDetailContent from "@/components/BountyDetailContent";
import CreateBountyForm from "@/components/CreateBountyForm";

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

function AppHeader() {
  const { openCreate } = useModal();

  return (
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
          fontWeight: 800, fontSize: 17, color: "#c9ee00",
          textDecoration: "none", letterSpacing: "-0.03em", flexShrink: 0,
        }}>
          BountyBoard
        </Link>

        <nav className="desktop-nav">
          {[
            { href: "/", label: "Browse" },
            { href: "/dashboard", label: "My Bounties" },
          ].map(({ href, label }) => (
            <Link key={href} href={href} style={{
              fontSize: 14, fontWeight: 500, color: "#888880",
              textDecoration: "none", padding: "5px 11px", borderRadius: 6,
            }}>
              {label}
            </Link>
          ))}
          <button
            onClick={openCreate}
            style={{
              fontSize: 14, fontWeight: 500, color: "#888880",
              background: "none", border: "none", padding: "5px 11px",
              borderRadius: 6, cursor: "pointer", fontFamily: "inherit",
            }}
          >
            Post Bounty
          </button>
        </nav>

        <div className="desktop-wallet">
          <WalletConnect />
        </div>

        <div className="mobile-menu">
          <MobileNav />
        </div>
      </div>
    </header>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <WalletProvider>
      <ToastProvider>
        <ModalProvider>
          <AppHeader />
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
          <AppModals />
        </ModalProvider>
      </ToastProvider>
    </WalletProvider>
  );
}
