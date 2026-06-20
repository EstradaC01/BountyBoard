"use client";

import { useEffect, useState, useMemo } from "react";
import type { Bounty, BountyStatus } from "@/types/bounty";
import { getAllBounties } from "@/lib/contract";
import BountyCard from "@/components/BountyCard";
import { useModal } from "@/context/ModalContext";

const ALL_STATUSES: BountyStatus[] = [
  "Open", "Funded", "Submitted", "Approved", "Disputed", "Resolved", "Cancelled",
];

const FILTER_COLORS: Record<string, { accent: string; text: string }> = {
  All:       { accent: "#c9ee00", text: "#0a0a0a" },
  Open:      { accent: "#ebebdf", text: "#0a0a0a" },
  Funded:    { accent: "#3535d5", text: "#ebebdf" },
  Submitted: { accent: "#e53a0d", text: "#ebebdf" },
  Approved:  { accent: "#c9ee00", text: "#0a0a0a" },
  Disputed:  { accent: "#e53a0d", text: "#ebebdf" },
  Resolved:  { accent: "#e03a7a", text: "#ebebdf" },
  Cancelled: { accent: "#555550", text: "#ebebdf" },
};

type SortKey = "newest" | "oldest" | "highest" | "lowest";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "newest",  label: "Newest first" },
  { value: "oldest",  label: "Oldest first" },
  { value: "highest", label: "Highest amount" },
  { value: "lowest",  label: "Lowest amount" },
];

export default function BountyBoardPage() {
  const { openCreate } = useModal();
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
      <div style={{ borderBottom: "1px solid #222220", padding: "28px 24px 0" }}>
        <div style={{ maxWidth: 1152, margin: "0 auto" }}>

          {/* Title row */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 18, flexWrap: "wrap" }}>
            <div>
              <h1 style={{ fontSize: 28, fontWeight: 800, color: "#ebebdf", margin: 0, letterSpacing: "-0.04em" }}>
                Open Bounties
              </h1>

              {/* Colored status breakdown */}
              {!loading && bounties.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginTop: 10 }}>
                  {ALL_STATUSES.map(s => {
                    const count = bounties.filter(b => b.status === s).length;
                    if (count === 0) return null;
                    return (
                      <button
                        key={s}
                        onClick={() => setFilter(s)}
                        style={{
                          display: "flex", alignItems: "center", gap: 5,
                          fontSize: 12, color: "#666660",
                          background: "none", border: "none", cursor: "pointer",
                          padding: 0, fontFamily: "inherit",
                        }}
                      >
                        <span style={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: FILTER_COLORS[s]?.accent ?? "#666660", flexShrink: 0 }} />
                        <span style={{ fontWeight: 700, color: "#888880" }}>{count}</span>
                        <span>{s}</span>
                      </button>
                    );
                  })}
                </div>
              )}
              {!loading && bounties.length === 0 && (
                <p style={{ fontSize: 13, color: "#444440", margin: "6px 0 0 0" }}>No bounties on-chain yet.</p>
              )}
            </div>

            <button
              onClick={openCreate}
              style={{
                padding: "9px 18px",
                backgroundColor: "#c9ee00",
                color: "#0a0a0a",
                borderRadius: 6,
                fontWeight: 700,
                fontSize: 14,
                border: "none",
                cursor: "pointer",
                letterSpacing: "-0.01em",
                flexShrink: 0,
                fontFamily: "inherit",
              }}
            >
              Post Bounty
            </button>
          </div>

          {/* Search + Sort */}
          <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
            <input
              type="text"
              placeholder="Search bounties…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                flex: 1, minWidth: 200, padding: "9px 14px", borderRadius: 6,
                border: "1px solid #222220", fontSize: 14, color: "#ebebdf",
                backgroundColor: "#141414", outline: "none", fontFamily: "inherit",
              }}
            />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              style={{
                padding: "9px 14px", borderRadius: 6, border: "1px solid #222220",
                fontSize: 14, color: "#888880", backgroundColor: "#141414",
                cursor: "pointer", fontFamily: "inherit",
              }}
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* Status filters */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {(["All", ...ALL_STATUSES] as const).map((s) => {
              const isActive = filter === s;
              const fc = FILTER_COLORS[s];
              return (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  style={{
                    display: "flex", alignItems: "center", gap: 5,
                    padding: "5px 12px", borderRadius: 4,
                    fontSize: 12, fontWeight: 700, letterSpacing: "0.02em",
                    border: isActive ? "none" : "1px solid #222220",
                    backgroundColor: isActive ? (fc?.accent ?? "#c9ee00") : "transparent",
                    color: isActive ? (fc?.text ?? "#0a0a0a") : "#666660",
                    cursor: "pointer", transition: "all 0.12s",
                    fontFamily: "inherit",
                  }}
                >
                  {s !== "All" && (
                    <span style={{
                      width: 6, height: 6, borderRadius: "50%", flexShrink: 0,
                      backgroundColor: isActive ? (fc?.text ?? "#0a0a0a") : (fc?.accent ?? "#666660"),
                    }} />
                  )}
                  {s}
                </button>
              );
            })}
          </div>

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
              <button
                onClick={openCreate}
                style={{ color: "#c9ee00", background: "none", border: "none", fontWeight: 600, cursor: "pointer", fontSize: 14, fontFamily: "inherit", padding: 0 }}
              >
                post one
              </button>.
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
