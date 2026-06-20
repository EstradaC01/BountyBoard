"use client";

import type { BountyStatus } from "@/types/bounty";

const styles: Record<BountyStatus, { bg: string; color: string }> = {
  Open:      { bg: "#1f1f1d", color: "#ebebdf" },
  Funded:    { bg: "#3535d5", color: "#ebebdf" },
  Submitted: { bg: "#e53a0d", color: "#ebebdf" },
  Approved:  { bg: "#c9ee00", color: "#0a0a0a" },
  Disputed:  { bg: "#e53a0d", color: "#ebebdf" },
  Resolved:  { bg: "#e03a7a", color: "#ebebdf" },
  Cancelled: { bg: "#1f1f1d", color: "#555550" },
};

export default function BountyStatusBadge({ status }: { status: BountyStatus }) {
  const { bg, color } = styles[status];
  return (
    <span style={{
      display: "inline-block",
      padding: "3px 10px",
      borderRadius: 4,
      fontSize: 11,
      fontWeight: 700,
      letterSpacing: "0.5px",
      textTransform: "uppercase",
      backgroundColor: bg,
      color,
      whiteSpace: "nowrap",
    }}>
      {status}
    </span>
  );
}
