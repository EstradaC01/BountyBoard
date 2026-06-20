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

  const total = bounties.length;
  const filterPills: { key: BountyStatus | "All"; count: number }[] = [
    { key: "All", count: total },
    ...ALL_STATUSES.map((s) => ({ key: s, count: bounties.filter((b) => b.status === s).length })),
  ];

  return (
    <div style={{ minHeight: "100%" }}>
      {/* ── Compact board toolbar ── */}
      <section style={{ borderBottom: "1px solid #1c1c1a" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "26px 24px 16px" }}>

          {/* Row 1 — title (left), search + sort (right) */}
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 20, flexWrap: "wrap" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "#c9ee00" }} />
                <span style={{ fontSize: 10.5, fontWeight: 700, color: "#9a9a92", textTransform: "uppercase", letterSpacing: "0.16em" }}>
                  Stellar Testnet
                </span>
              </div>
              <h1 style={{ fontSize: 26, fontWeight: 800, color: "#ebebdf", margin: 0, letterSpacing: "-0.035em", lineHeight: 1 }}>
                Open bounties
              </h1>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <div style={{ position: "relative", width: 248 }}>
                <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden="true"
                  style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
                  <circle cx="11" cy="11" r="7" fill="none" stroke="#666660" strokeWidth="2" />
                  <path d="M21 21l-4.3-4.3" stroke="#666660" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <input
                  type="text"
                  placeholder="Search bounties…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{
                    width: "100%", padding: "9px 12px 9px 36px", borderRadius: 8,
                    border: "1px solid #222220", fontSize: 13.5, color: "#ebebdf",
                    backgroundColor: "#141414", outline: "none", fontFamily: "inherit",
                    boxSizing: "border-box",
                  }}
                />
              </div>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                style={{
                  padding: "9px 12px", borderRadius: 8, border: "1px solid #222220",
                  fontSize: 13, color: "#999990", backgroundColor: "#141414",
                  cursor: "pointer", fontFamily: "inherit",
                }}
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2 — filter pills with counts (left), result count (right) */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14, flexWrap: "wrap", marginTop: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
              {filterPills.map(({ key, count }) => {
                const isActive = filter === key;
                const fc = FILTER_COLORS[key];
                const accent = fc?.accent ?? "#666660";
                return (
                  <button
                    key={key}
                    onClick={() => setFilter(key)}
                    className={isActive ? undefined : "filter-pill"}
                    style={{
                      display: "flex", alignItems: "center", gap: 6,
                      padding: "6px 11px", borderRadius: 7,
                      fontSize: 12.5, fontWeight: 600, letterSpacing: "0.01em",
                      border: isActive ? "1px solid transparent" : "1px solid #242422",
                      backgroundColor: isActive ? accent : "transparent",
                      color: isActive ? (fc?.text ?? "#0a0a0a") : "#999990",
                      cursor: "pointer", transition: "all 0.14s", fontFamily: "inherit",
                    }}
                  >
                    {key !== "All" && (
                      <span style={{
                        width: 6, height: 6, borderRadius: "50%", flexShrink: 0,
                        backgroundColor: isActive ? (fc?.text ?? "#0a0a0a") : accent,
                      }} />
                    )}
                    {key}
                    <span style={{
                      fontWeight: 700,
                      color: isActive ? (fc?.text ?? "#0a0a0a") : accent,
                      opacity: isActive ? 0.75 : 1,
                    }}>{count}</span>
                  </button>
                );
              })}
            </div>

            {!loading && (filter !== "All" || search) && (
              <span style={{ fontSize: 12.5, color: "#666660", whiteSpace: "nowrap" }}>
                {visible.length} {visible.length === 1 ? "result" : "results"}
              </span>
            )}
          </div>
        </div>
      </section>

      {/* ── Grid ── */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "22px 24px 56px" }}>
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ backgroundColor: "#141414", borderRadius: 10, border: "1px solid #1e1e1c", height: 188, opacity: 0.5 }} />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div style={{ textAlign: "center", padding: "88px 24px" }}>
            <p style={{ fontSize: 16, fontWeight: 600, color: "#666660", marginBottom: 8 }}>No bounties here.</p>
            <p style={{ fontSize: 14, color: "#555550" }}>
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
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
            {visible.map((b, i) => (
              <BountyCard key={b.id} bounty={b} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
