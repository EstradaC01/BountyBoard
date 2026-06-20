"use client";

import { useState } from "react";
import Link from "next/link";
import { useWallet } from "@/context/WalletContext";

const NAV_LINKS = [
  { href: "/", label: "Browse" },
  { href: "/create", label: "Post Bounty" },
  { href: "/dashboard", label: "My Bounties" },
];

function truncate(addr: string) {
  return `${addr.slice(0, 4)}…${addr.slice(-4)}`;
}

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const { address, balance, connect, disconnect } = useWallet();

  return (
    <>
      {/* Hamburger button */}
      <button
        onClick={() => setOpen((o) => !o)}
        style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex", flexDirection: "column", gap: 5 }}
        aria-label="Menu"
      >
        {[0, 1, 2].map((i) => (
          <span key={i} style={{ display: "block", width: 24, height: 2, backgroundColor: "#475569", borderRadius: 2, transition: "all 0.2s",
            transform: open
              ? i === 0 ? "rotate(45deg) translate(5px, 5px)"
              : i === 1 ? "opacity: 0; scaleX(0)"
              : "rotate(-45deg) translate(5px, -5px)"
              : "none",
            opacity: open && i === 1 ? 0 : 1,
          }} />
        ))}
      </button>

      {/* Dropdown drawer */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            onClick={() => setOpen(false)}
            style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.2)", zIndex: 40 }}
          />
          {/* Menu */}
          <div style={{
            position: "fixed",
            top: 64,
            left: 0,
            right: 0,
            backgroundColor: "#fff",
            borderBottom: "1px solid #e2e8f0",
            zIndex: 50,
            padding: "8px 0 16px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
          }}>
            {/* Nav links */}
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                style={{ display: "block", padding: "13px 24px", fontSize: 15, fontWeight: 600, color: "#1e293b", textDecoration: "none" }}
              >
                {label}
              </Link>
            ))}

            {/* Divider */}
            <div style={{ height: 1, backgroundColor: "#f1f5f9", margin: "8px 24px" }} />

            {/* Wallet section */}
            <div style={{ padding: "8px 24px" }}>
              {address ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 13, color: "#64748b", fontFamily: "monospace" }}>{truncate(address)}</span>
                    {balance && (
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#6d28d9", backgroundColor: "#ede9fe", padding: "3px 10px", borderRadius: 6 }}>
                        {balance} XLM
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => { disconnect(); setOpen(false); }}
                    style={{ padding: "10px", borderRadius: 8, border: "1.5px solid #e2e8f0", backgroundColor: "#fff", color: "#475569", fontWeight: 600, fontSize: 14, cursor: "pointer", textAlign: "center" }}
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => { connect(); setOpen(false); }}
                  style={{ width: "100%", padding: "12px", borderRadius: 8, border: "none", backgroundColor: "#4f46e5", color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer" }}
                >
                  Connect Freighter
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
