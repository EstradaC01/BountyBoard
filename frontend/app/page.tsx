"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Bounty, BountyStatus } from "@/types/bounty";
import { getAllBounties } from "@/lib/contract";
import BountyCard from "@/components/BountyCard";

const ALL_STATUSES: BountyStatus[] = [
  "Open", "Funded", "Submitted", "Approved", "Disputed", "Resolved", "Cancelled",
];

export default function BountyBoardPage() {
  const [bounties, setBounties] = useState<Bounty[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<BountyStatus | "All">("All");

  useEffect(() => {
    getAllBounties()
      .then(setBounties)
      .finally(() => setLoading(false));
  }, []);

  const visible =
    filter === "All" ? bounties : bounties.filter((b) => b.status === filter);

  return (
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100%" }}>
      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)", color: "#fff", padding: "48px 24px" }}>
        <div style={{ maxWidth: 1152, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div>
            <h1 style={{ fontSize: 32, fontWeight: 800, marginBottom: 8, letterSpacing: "-0.5px" }}>Bounty Board</h1>
            <p style={{ fontSize: 16, opacity: 0.85 }}>Trustless escrow for freelancers — powered by Stellar &amp; Soroban.</p>
          </div>
          <Link href="/create" style={{
            display: "inline-block",
            padding: "12px 24px",
            backgroundColor: "#fff",
            color: "#4f46e5",
            borderRadius: 10,
            fontWeight: 700,
            fontSize: 14,
            textDecoration: "none",
            boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
          }}>
            + Post Bounty
          </Link>
        </div>
      </div>

      <div style={{ maxWidth: 1152, margin: "0 auto", padding: "32px 24px" }}>
        {/* Filters */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 28 }}>
          {(["All", ...ALL_STATUSES] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              style={{
                padding: "6px 16px",
                borderRadius: 999,
                fontSize: 13,
                fontWeight: 500,
                border: filter === s ? "none" : "1.5px solid #e2e8f0",
                backgroundColor: filter === s ? "#4f46e5" : "#fff",
                color: filter === s ? "#fff" : "#475569",
                cursor: "pointer",
                transition: "all 0.15s",
              }}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ backgroundColor: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", padding: 20, height: 180, opacity: 0.5 }} />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 24px", color: "#94a3b8" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
            <p style={{ fontSize: 18, fontWeight: 600, color: "#64748b", marginBottom: 8 }}>No bounties found</p>
            <p style={{ fontSize: 14 }}>
              {filter !== "All" ? "Try a different filter, or " : ""}
              <Link href="/create" style={{ color: "#4f46e5", textDecoration: "underline" }}>post the first one</Link>.
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
            {visible.map((b) => (
              <BountyCard key={b.id} bounty={b} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
