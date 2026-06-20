"use client";

import { useModal } from "@/context/ModalContext";
import type { Bounty } from "@/types/bounty";
import BountyStatusBadge from "./BountyStatusBadge";
import { stroopsToXlm } from "@/lib/stellar";

const STATUS_ACCENT: Record<string, string> = {
  Open:      "#ebebdf",
  Funded:    "#3535d5",
  Submitted: "#e53a0d",
  Approved:  "#c9ee00",
  Disputed:  "#e53a0d",
  Resolved:  "#e03a7a",
  Cancelled: "#444440",
};

function truncate(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export default function BountyCard({ bounty }: { bounty: Bounty }) {
  const { openBounty } = useModal();
  const accent = STATUS_ACCENT[bounty.status] ?? "#444440";

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => openBounty(bounty.id)}
      onKeyDown={e => { if (e.key === "Enter" || e.key === " ") openBounty(bounty.id); }}
      style={{
        backgroundColor: "#141414",
        borderRadius: 8,
        border: "1px solid #222220",
        padding: "18px 20px",
        cursor: "pointer",
        transition: "all 0.15s",
        height: "100%",
        boxSizing: "border-box",
        boxShadow: `inset 4px 0 0 ${accent}`,
        outline: "none",
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.borderColor = "#333330";
        el.style.transform = "translateY(-2px)";
        el.style.boxShadow = `inset 4px 0 0 ${accent}, 0 8px 32px rgba(0,0,0,0.5)`;
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLDivElement;
        el.style.borderColor = "#222220";
        el.style.transform = "translateY(0)";
        el.style.boxShadow = `inset 4px 0 0 ${accent}`;
      }}
    >
      <div style={{ marginBottom: 12 }}>
        <BountyStatusBadge status={bounty.status} />
      </div>

      <p style={{ fontSize: 36, fontWeight: 800, color: accent, margin: "0 0 4px 0", letterSpacing: "-0.04em", lineHeight: 1 }}>
        {stroopsToXlm(bounty.amount)}{" "}
        <span style={{ fontSize: 13, fontWeight: 700, color: "#444440", letterSpacing: "0.05em" }}>XLM</span>
      </p>

      <p style={{ fontSize: 14, fontWeight: 600, color: "#ebebdf", margin: "0 0 16px 0", lineHeight: 1.45 }}>
        {bounty.description}
      </p>

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
  );
}
