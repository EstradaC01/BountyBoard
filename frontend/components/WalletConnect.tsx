"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWallet } from "@/context/WalletContext";

function truncate(addr: string) {
  return `${addr.slice(0, 4)}...${addr.slice(-4)}`;
}

export default function WalletConnect() {
  const { address, balance, connect, disconnect, switchWallet, connecting, switching } = useWallet();
  const [menuOpen, setMenuOpen] = useState(false);

  if (switching) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 13, color: "#888880" }}>
          Switch accounts in Freighter, then come back
        </span>
        <button
          onClick={connect}
          style={{
            fontSize: 13, fontWeight: 700, padding: "5px 12px", borderRadius: 6,
            border: "none", backgroundColor: "#c9ee00", color: "#0a0a0a", cursor: "pointer",
          }}
        >
          Done
        </button>
      </div>
    );
  }

  if (address) {
    return (
      <div style={{ position: "relative", display: "flex", alignItems: "center", gap: 8 }}>
        {/* Balance chip */}
        <div style={{
          display: "flex", alignItems: "center", gap: 6,
          backgroundColor: "#3535d5", borderRadius: 6, padding: "5px 12px",
        }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#ebebdf" }}>
            {balance !== null ? `${balance} XLM` : "..."}
          </span>
        </div>

        {/* Address — click to open menu */}
        <button
          onClick={() => setMenuOpen(v => !v)}
          style={{
            fontSize: 13, color: "#888880", fontFamily: "monospace",
            backgroundColor: menuOpen ? "#2a2a28" : "#1f1f1d",
            padding: "5px 10px", borderRadius: 6,
            border: "1px solid " + (menuOpen ? "#444440" : "transparent"),
            cursor: "pointer", transition: "all 0.12s",
          }}
        >
          {truncate(address)}
          <span style={{ marginLeft: 5, fontSize: 10, opacity: 0.6 }}>{menuOpen ? "▲" : "▼"}</span>
        </button>

        {/* Dropdown menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -6, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.97 }}
              transition={{ duration: 0.12 }}
              style={{
                position: "absolute", top: "calc(100% + 8px)", right: 0,
                backgroundColor: "#141414", border: "1px solid #2a2a28",
                borderRadius: 8, padding: 6, minWidth: 180, zIndex: 100,
                boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
              }}
            >
              {/* Full address display */}
              <div style={{ padding: "8px 10px 10px", borderBottom: "1px solid #222220", marginBottom: 4 }}>
                <p style={{ fontSize: 10, fontWeight: 700, color: "#444440", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 4px 0" }}>
                  Connected
                </p>
                <p style={{ fontSize: 11, fontFamily: "monospace", color: "#666660", margin: 0, wordBreak: "break-all" }}>
                  {address}
                </p>
              </div>

              {/* Switch wallet */}
              <button
                onClick={async () => {
                  setMenuOpen(false);
                  await switchWallet();
                }}
                style={{
                  display: "block", width: "100%", textAlign: "left",
                  padding: "8px 10px", borderRadius: 5, border: "none",
                  backgroundColor: "transparent", color: "#ebebdf",
                  fontSize: 13, fontWeight: 600, cursor: "pointer",
                  fontFamily: "inherit", transition: "background 0.1s",
                }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#1f1f1d")}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                Switch Wallet
              </button>

              {/* Disconnect */}
              <button
                onClick={() => { setMenuOpen(false); disconnect(); }}
                style={{
                  display: "block", width: "100%", textAlign: "left",
                  padding: "8px 10px", borderRadius: 5, border: "none",
                  backgroundColor: "transparent", color: "#e53a0d",
                  fontSize: 13, fontWeight: 600, cursor: "pointer",
                  fontFamily: "inherit", transition: "background 0.1s",
                }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#1f1f1d")}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = "transparent")}
              >
                Disconnect
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Backdrop to close menu on outside click */}
        {menuOpen && (
          <div
            onClick={() => setMenuOpen(false)}
            style={{ position: "fixed", inset: 0, zIndex: 99 }}
          />
        )}
      </div>
    );
  }

  return (
    <motion.button
      onClick={connect}
      disabled={connecting}
      whileHover={!connecting ? { scale: 1.04, backgroundColor: "#d4f500" } : {}}
      whileTap={!connecting ? { scale: 0.96 } : {}}
      transition={{ duration: 0.14 }}
      style={{
        fontSize: 14, fontWeight: 700, padding: "8px 18px",
        borderRadius: 6, border: "none",
        backgroundColor: connecting ? "#a8c700" : "#c9ee00",
        color: "#0a0a0a",
        cursor: connecting ? "not-allowed" : "pointer",
      }}
    >
      {connecting ? "Connecting..." : "Connect Freighter"}
    </motion.button>
  );
}