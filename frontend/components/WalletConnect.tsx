"use client";

import { motion } from "framer-motion";
import { useWallet } from "@/context/WalletContext";

function truncate(addr: string) {
  return `${addr.slice(0, 4)}…${addr.slice(-4)}`;
}

export default function WalletConnect() {
  const { address, balance, connect, disconnect, connecting } = useWallet();

  if (address) {
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          backgroundColor: "#3535d5",
          borderRadius: 6,
          padding: "5px 12px",
        }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#ebebdf" }}>
            {balance !== null ? `${balance} XLM` : "···"}
          </span>
        </div>

        <div style={{
          fontSize: 13,
          color: "#888880",
          fontFamily: "monospace",
          backgroundColor: "#1f1f1d",
          padding: "5px 10px",
          borderRadius: 6,
        }}>
          {truncate(address)}
        </div>

        <motion.button
          onClick={disconnect}
          whileHover={{ borderColor: "#888880", color: "#ebebdf" }}
          whileTap={{ scale: 0.96 }}
          transition={{ duration: 0.14 }}
          style={{
            fontSize: 13,
            fontWeight: 600,
            padding: "5px 12px",
            borderRadius: 6,
            border: "1.5px solid #333330",
            backgroundColor: "transparent",
            color: "#888880",
            cursor: "pointer",
          }}
        >
          Disconnect
        </motion.button>
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
        fontSize: 14,
        fontWeight: 700,
        padding: "8px 18px",
        borderRadius: 6,
        border: "none",
        backgroundColor: connecting ? "#a8c700" : "#c9ee00",
        color: "#0a0a0a",
        cursor: connecting ? "not-allowed" : "pointer",
      }}
    >
      {connecting ? "Connecting…" : "Connect Freighter"}
    </motion.button>
  );
}
