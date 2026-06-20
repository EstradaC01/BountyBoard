"use client";

import { motion } from "framer-motion";
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

const STATUS_BG: Record<string, string> = {
  Open:      "#141414",
  Funded:    "#0c0c1c",
  Submitted: "#180e06",
  Approved:  "#0e1607",
  Disputed:  "#1e0808",
  Resolved:  "#18060f",
  Cancelled: "#101010",
};

function truncate(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

interface Props {
  bounty: Bounty;
  index?: number;
  isSaved?: boolean;
  onToggleSave?: (id: number) => void;
}

export default function BountyCard({ bounty, index = 0, isSaved = false, onToggleSave }: Props) {
  const { openBounty } = useModal();
  const accent = STATUS_ACCENT[bounty.status] ?? "#444440";
  const bg = STATUS_BG[bounty.status] ?? "#141414";

  return (
    <motion.div
      role="button"
      tabIndex={0}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, delay: index * 0.06, ease: [0.25, 1, 0.4, 1] }}
      whileHover={{ y: -4, transition: { duration: 0.18, ease: "easeOut" } }}
      whileTap={{ scale: 0.98, transition: { duration: 0.1 } }}
      onClick={() => openBounty(bounty.id)}
      onKeyDown={e => { if (e.key === "Enter" || e.key === " ") openBounty(bounty.id); }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLElement;
        el.style.boxShadow = `inset 4px 0 0 ${accent}, 0 14px 44px ${accent}22`;
        el.style.borderColor = "#333330";
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLElement;
        el.style.boxShadow = `inset 4px 0 0 ${accent}`;
        el.style.borderColor = "#222220";
      }}
      style={{
        backgroundColor: bg,
        backgroundImage: `linear-gradient(155deg, ${accent}0e 0%, transparent 48%)`,
        borderRadius: 8,
        border: "1px solid #222220",
        padding: "18px 20px",
        cursor: "pointer",
        height: "100%",
        boxSizing: "border-box",
        boxShadow: `inset 4px 0 0 ${accent}`,
        outline: "none",
        transition: "box-shadow 0.2s ease, border-color 0.2s ease",
        position: "relative",
      } as React.CSSProperties}
    >
      {/* Save button */}
      {onToggleSave && (
        <button
          onClick={e => { e.stopPropagation(); onToggleSave(bounty.id); }}
          title={isSaved ? "Remove from saved" : "Save for later"}
          style={{
            position: "absolute", top: 14, right: 14,
            background: "none", border: "none", cursor: "pointer",
            padding: 4, borderRadius: 4, lineHeight: 1,
            color: isSaved ? "#e03a7a" : "#444440",
            fontSize: 16,
            transition: "color 0.15s, transform 0.15s",
          }}
          onMouseEnter={e => {
            e.stopPropagation();
            (e.currentTarget as HTMLElement).style.color = isSaved ? "#ff6099" : "#888880";
            (e.currentTarget as HTMLElement).style.transform = "scale(1.2)";
          }}
          onMouseLeave={e => {
            e.stopPropagation();
            (e.currentTarget as HTMLElement).style.color = isSaved ? "#e03a7a" : "#444440";
            (e.currentTarget as HTMLElement).style.transform = "scale(1)";
          }}
        >
          {isSaved ? (
            // Filled bookmark
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M5 3a2 2 0 0 0-2 2v16l9-4 9 4V5a2 2 0 0 0-2-2H5z"/>
            </svg>
          ) : (
            // Outline bookmark
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 3a2 2 0 0 0-2 2v16l9-4 9 4V5a2 2 0 0 0-2-2H5z"/>
            </svg>
          )}
        </button>
      )}

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
    </motion.div>
  );
}