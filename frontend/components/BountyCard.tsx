"use client";

import Link from "next/link";
import type { Bounty } from "@/types/bounty";
import BountyStatusBadge from "./BountyStatusBadge";
import { stroopsToXlm } from "@/lib/stellar";

function truncate(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export default function BountyCard({ bounty }: { bounty: Bounty }) {
  return (
    <Link href={`/bounty/${bounty.id}`} style={{ textDecoration: "none" }}>
      <div style={{
        backgroundColor: "#fff",
        borderRadius: 12,
        border: "1.5px solid #e2e8f0",
        padding: "20px",
        cursor: "pointer",
        transition: "box-shadow 0.15s, border-color 0.15s",
        height: "100%",
        boxSizing: "border-box",
      }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 16px rgba(79,70,229,0.12)";
          (e.currentTarget as HTMLDivElement).style.borderColor = "#a5b4fc";
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
          (e.currentTarget as HTMLDivElement).style.borderColor = "#e2e8f0";
        }}
      >
        {/* Top row: description + badge */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 12 }}>
          <p style={{ fontSize: 15, fontWeight: 600, color: "#1e293b", margin: 0, lineHeight: 1.4, flex: 1 }}>
            {bounty.description}
          </p>
          <BountyStatusBadge status={bounty.status} />
        </div>

        {/* Amount */}
        <p style={{ fontSize: 26, fontWeight: 800, color: "#4f46e5", margin: "0 0 16px 0" }}>
          {stroopsToXlm(bounty.amount)} <span style={{ fontSize: 14, fontWeight: 600, color: "#818cf8" }}>XLM</span>
        </p>

        {/* Meta */}
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {[
            { label: "Client", value: truncate(bounty.client) },
            { label: "Freelancer", value: truncate(bounty.freelancer) },
            { label: "Bounty", value: `#${bounty.id}` },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: "flex", gap: 8, fontSize: 12 }}>
              <span style={{ color: "#94a3b8", fontWeight: 600, width: 68, flexShrink: 0 }}>{label}</span>
              <span style={{ color: "#475569", fontFamily: "monospace" }}>{value}</span>
            </div>
          ))}
        </div>
      </div>
    </Link>
  );
}
