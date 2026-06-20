"use client";

import { useWallet } from "@/context/WalletContext";

function truncate(addr: string) {
  return `${addr.slice(0, 4)}…${addr.slice(-4)}`;
}

export default function WalletConnect() {
  const { address, connect, disconnect, connecting } = useWallet();

  if (address) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span style={{ fontSize: 13, color: "#64748b", fontFamily: "monospace", backgroundColor: "#f1f5f9", padding: "4px 10px", borderRadius: 6 }}>
          {truncate(address)}
        </span>
        <button
          onClick={disconnect}
          style={{
            fontSize: 13,
            fontWeight: 500,
            padding: "6px 14px",
            borderRadius: 8,
            border: "1.5px solid #e2e8f0",
            backgroundColor: "#fff",
            color: "#475569",
            cursor: "pointer",
          }}
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={connect}
      disabled={connecting}
      style={{
        fontSize: 14,
        fontWeight: 600,
        padding: "8px 18px",
        borderRadius: 8,
        border: "none",
        backgroundColor: connecting ? "#818cf8" : "#4f46e5",
        color: "#fff",
        cursor: connecting ? "not-allowed" : "pointer",
        transition: "background-color 0.15s",
      }}
    >
      {connecting ? "Connecting…" : "Connect Freighter"}
    </button>
  );
}
