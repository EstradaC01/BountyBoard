"use client";

import { useState } from "react";
import Link from "next/link";
import { useWallet } from "@/context/WalletContext";
import { useModal } from "@/context/ModalContext";

const NAV_LINKS = [
  { href: "/", label: "Browse" },
  { href: "/dashboard", label: "My Bounties" },
];

function truncate(addr: string) {
  return `${addr.slice(0, 4)}…${addr.slice(-4)}`;
}

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const { address, balance, connect, disconnect } = useWallet();
  const { openCreate } = useModal();

  return (
    <>
      {/* Hamburger button */}
      <button
        onClick={() => setOpen((o) => !o)}
        style={{ background: "none", border: "none", cursor: "pointer", padding: 4, display: "flex", flexDirection: "column", gap: 5 }}
        aria-label="Menu"
      >
        {[0, 1, 2].map((i) => (
          <span key={i} style={{
            display: "block",
            width: 24,
            height: 2,
            backgroundColor: "#888880",
            borderRadius: 2,
            transition: "all 0.2s",
            transform: open
              ? i === 0 ? "rotate(45deg) translate(5px, 5px)"
              : i === 2 ? "rotate(-45deg) translate(5px, -5px)"
              : "none"
              : "none",
            opacity: open && i === 1 ? 0 : 1,
          }} />
        ))}
      </button>

      {open && (
        <>
          <div
            onClick={() => setOpen(false)}
            style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.6)", zIndex: 40 }}
          />
          <div style={{
            position: "fixed",
            top: 64,
            left: 0,
            right: 0,
            backgroundColor: "#0a0a0a",
            borderBottom: "1px solid #222220",
            zIndex: 50,
            padding: "8px 0 16px",
            boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
          }}>
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                style={{ display: "block", padding: "13px 24px", fontSize: 15, fontWeight: 600, color: "#ebebdf", textDecoration: "none" }}
              >
                {label}
              </Link>
            ))}

            <button
              onClick={() => { setOpen(false); openCreate(); }}
              style={{
                display: "block", width: "100%", padding: "13px 24px",
                fontSize: 15, fontWeight: 600, color: "#ebebdf",
                background: "none", border: "none", cursor: "pointer",
                fontFamily: "inherit", textAlign: "left",
              }}
            >
              Post Bounty
            </button>

            <div style={{ height: 1, backgroundColor: "#222220", margin: "8px 24px" }} />

            <div style={{ padding: "8px 24px" }}>
              {address ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 13, color: "#888880", fontFamily: "monospace" }}>{truncate(address)}</span>
                    {balance && (
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#ebebdf", backgroundColor: "#3535d5", padding: "3px 10px", borderRadius: 6 }}>
                        {balance} XLM
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => { disconnect(); setOpen(false); }}
                    style={{ padding: "10px", borderRadius: 8, border: "1px solid #333330", backgroundColor: "transparent", color: "#888880", fontWeight: 600, fontSize: 14, cursor: "pointer", textAlign: "center", fontFamily: "inherit" }}
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => { connect(); setOpen(false); }}
                  style={{ width: "100%", padding: "12px", borderRadius: 8, border: "none", backgroundColor: "#c9ee00", color: "#0a0a0a", fontWeight: 700, fontSize: 14, cursor: "pointer", fontFamily: "inherit" }}
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
