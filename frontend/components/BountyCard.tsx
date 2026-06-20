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
      <div
        style={{
          backgroundColor: "#141414",
          borderRadius: 8,
          border: "1px solid #222220",
          padding: "18px 20px",
          cursor: "pointer",
          transition: "border-color 0.15s",
          height: "100%",
          boxSizing: "border-box",
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLDivElement).style.borderColor = "#333330";
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLDivElement).style.borderColor = "#222220";
        }}
      >
        {/* Top: badge */}
        <div style={{ marginBottom: 12 }}>
          <BountyStatusBadge status={bounty.status} />
        </div>

        {/* Amount */}
        <p style={{ fontSize: 28, fontWeight: 800, color: "#c9ee00", margin: "0 0 4px 0", letterSpacing: "-0.02em", lineHeight: 1 }}>
          {stroopsToXlm(bounty.amount)}{" "}
          <span style={{ fontSize: 13, fontWeight: 700, color: "#444440", letterSpacing: "0.05em" }}>XLM</span>
        </p>

        {/* Title */}
        <p style={{ fontSize: 14, fontWeight: 600, color: "#ebebdf", margin: "0 0 16px 0", lineHeight: 1.45 }}>
          {bounty.description}
        </p>

        {/* Meta */}
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {[
            { label: "Client",     value: truncate(bounty.client) },
            { label: "Freelancer", value: truncate(bounty.freelancer) },
            { label: "Bounty",     value: `#${bounty.id}` },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: "flex", gap: 8, fontSize: 12 }}>
              <span style={{ color: "#444440", fontWeight: 600, width: 68, flexShrink: 0 }}>{label}</span>
              <span style={{ color: "#666660", fontFamily: "monospace" }}>{value}</span>
            </div>
          ))}
        </div>
      </div>
    </Link>
  );
}
