"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import type { Bounty, BountyStatus } from "@/types/bounty";
import { getAllBounties } from "@/lib/contract";
import BountyCard from "@/components/BountyCard";

const ALL_STATUSES: BountyStatus[] = [
  "Open", "Funded", "Submitted", "Approved", "Disputed", "Resolved", "Cancelled",
];

type SortKey = "newest" | "oldest" | "highest" | "lowest";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "newest",  label: "Newest first" },
  { value: "oldest",  label: "Oldest first" },
  { value: "highest", label: "Highest amount" },
  { value: "lowest",  label: "Lowest amount" },
];

export default function BountyBoardPage() {
  const [bounties, setBounties] = useState<Bounty[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<BountyStatus | "All">("All");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("newest");

  useEffect(() => {
    getAllBounties()
      .then(setBounties)
      .finally(() => setLoading(false));
  }, []);

  const visible = useMemo(() => {
    let list = [...bounties];
    if (filter !== "All") list = list.filter((b) => b.status === filter);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((b) => b.description.toLowerCase().includes(q));
    }
    switch (sort) {
      case "newest":  list.sort((a, b) => b.id - a.id); break;
      case "oldest":  list.sort((a, b) => a.id - b.id); break;
      case "highest": list.sort((a, b) => (b.amount > a.amount ? 1 : -1)); break;
      case "lowest":  list.sort((a, b) => (a.amount > b.amount ? 1 : -1)); break;
    }
    return list;
  }, [bounties, filter, search, sort]);

  return (
    <div style={{ backgroundColor: "#0a0a0a", minHeight: "100%" }}>
      {/* Page header */}
      <div style={{ borderBottom: "1px solid #222220", padding: "24px 24px 0" }}>
        <div style={{ maxWidth: 1152, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, marginBottom: 20, flexWrap: "wrap" }}>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: "#ebebdf", margin: 0, letterSpacing: "-0.03em" }}>
                Open Bounties
              </h1>
              {!loading && (
                <p style={{ fontSize: 13, color: "#444440", margin: "4px 0 0 0" }}>
                  {bounties.length} {bounties.length === 1 ? "bounty" : "bounties"} on-chain
                </p>
              )}
            </div>
            <Link href="/create" style={{
              display: "inline-block",
              padding: "9px 18px",
              backgroundColor: "#c9ee00",
              color: "#0a0a0a",
              borderRadius: 6,
              fontWeight: 700,
              fontSize: 14,
              textDecoration: "none",
              letterSpacing: "-0.01em",
            }}>
              Post Bounty
            </Link>
          </div>

          {/* Search + Sort */}
          <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
            <input
              type="text"
              placeholder="Search bounties…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                flex: 1,
                minWidth: 200,
                padding: "9px 14px",
                borderRadius: 6,
                border: "1px solid #222220",
                fontSize: 14,
                color: "#ebebdf",
                backgroundColor: "#141414",
                outline: "none",
                fontFamily: "inherit",
              }}
            />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              style={{
                padding: "9px 14px",
                borderRadius: 6,
                border: "1px solid #222220",
                fontSize: 14,
                color: "#888880",
                backgroundColor: "#141414",
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* Status filters */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {(["All", ...ALL_STATUSES] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                style={{
                  padding: "5px 14px",
                  borderRadius: 4,
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: "0.02em",
                  border: filter === s ? "none" : "1px solid #222220",
                  backgroundColor: filter === s ? "#c9ee00" : "transparent",
                  color: filter === s ? "#0a0a0a" : "#666660",
                  cursor: "pointer",
                  transition: "all 0.12s",
                }}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Results count when filtered */}
          {!loading && (filter !== "All" || search) && (
            <p style={{ fontSize: 12, color: "#444440", margin: "12px 0 0 0" }}>
              {visible.length} {visible.length === 1 ? "result" : "results"}
            </p>
          )}
        </div>
      </div>

      {/* Grid */}
      <div style={{ maxWidth: 1152, margin: "0 auto", padding: "24px" }}>
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 12 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ backgroundColor: "#141414", borderRadius: 8, border: "1px solid #222220", height: 180, opacity: 0.5 }} />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 24px" }}>
            <p style={{ fontSize: 16, fontWeight: 600, color: "#444440", marginBottom: 8 }}>No bounties here.</p>
            <p style={{ fontSize: 14, color: "#333330" }}>
              {search ? `Nothing matches "${search}" — ` : filter !== "All" ? "Try a different filter, or " : ""}
              <Link href="/create" style={{ color: "#c9ee00", textDecoration: "none", fontWeight: 600 }}>post one</Link>.
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 12 }}>
            {visible.map((b) => (
              <BountyCard key={b.id} bounty={b} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
