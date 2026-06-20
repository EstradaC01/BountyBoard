"use client";

import type { BountyStatus } from "@/types/bounty";

const styles: Record<BountyStatus, { bg: string; color: string }> = {
  Open:      { bg: "#f1f5f9", color: "#475569" },
  Funded:    { bg: "#dbeafe", color: "#1d4ed8" },
  Submitted: { bg: "#fef9c3", color: "#a16207" },
  Approved:  { bg: "#dcfce7", color: "#15803d" },
  Disputed:  { bg: "#fee2e2", color: "#b91c1c" },
  Resolved:  { bg: "#ede9fe", color: "#6d28d9" },
  Cancelled: { bg: "#f1f5f9", color: "#94a3b8" },
};

export default function BountyStatusBadge({ status }: { status: BountyStatus }) {
  const { bg, color } = styles[status];
  return (
    <span style={{
      display: "inline-block",
      padding: "3px 10px",
      borderRadius: 999,
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: "0.3px",
      textTransform: "uppercase",
      backgroundColor: bg,
      color,
      whiteSpace: "nowrap",
    }}>
      {status}
    </span>
  );
}
