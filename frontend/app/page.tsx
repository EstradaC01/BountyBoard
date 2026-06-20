"use client";

import { useEffect, useState, useMemo } from "react";
import type { Bounty, BountyStatus } from "@/types/bounty";
import { getAllBounties } from "@/lib/contract";
import BountyCard from "@/components/BountyCard";
import { useModal } from "@/context/ModalContext";
import { useWallet } from "@/context/WalletContext";
import { useSavedBounties } from "@/hooks/useSavedBounties";

const ALL_STATUSES: BountyStatus[] = [
  "Open", "Funded", "Submitted", "Approved", "Disputed", "Resolved", "Cancelled",
];

const FILTER_COLORS: Record<string, { accent: string; text: string }> = {
  All:       { accent: "#c9ee00", text: "#0a0a0a" },
  Saved:     { accent: "#e03a7a", text: "#ebebdf" },
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

type FilterKey = BountyStatus | "All" | "Saved";

export default function BountyBoardPage() {
  const { openCreate } = useModal();
  const { address } = useWallet();
  const { saved, toggle, isSaved } = useSavedBounties(address);
  const [bounties, setBounties] = useState<Bounty[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterKey>("All");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("newest");

  useEffect(() => {
    getAllBounties()
      .then(setBounties)
      .finally(() => setLoading(false));
  }, []);

  const visible = useMemo(() => {
    let list = [...bounties];
    if (filter === "Saved") {
      list = list.filter((b) => saved.has(b.id));
    } else if (filter !== "All") {
      list = list.filter((b) => b.status === filter);
    }
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
  }, [bounties, filter, search, sort, saved]);

  const savedCount = saved.size;

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
<<<<<<< HEAD
              <p style={{ fontSize: 10, fontWeight: 700, color: "#e53a0d", textTransform: "uppercase", letterSpacing: "0.16em", margin: "0 0 6px 0" }}>
                Stellar Testnet
              </p>
              <h1 style={{ fontSize: 30, fontWeight: 800, color: "#ebebdf", margin: 0, letterSpacing: "-0.04em" }}>
                Open Bounties
              </h1>

              {!loading && bounties.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginTop: 10 }}>
                  {ALL_STATUSES.map(s => {
                    const count = bounties.filter(b => b.status === s).length;
                    if (count === 0) return null;
                    const col = FILTER_COLORS[s]?.accent ?? "#666660";
                    return (
                      <button
                        key={s}
                        onClick={() => setFilter(s)}
                        style={{ display: "flex", alignItems: "center", gap: 5, background: "none", border: "none", cursor: "pointer", padding: "2px 0", fontFamily: "inherit" }}
                      >
                        <span style={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: col, flexShrink: 0 }} />
                        <span style={{ fontSize: 15, fontWeight: 800, color: col, lineHeight: 1 }}>{count}</span>
                        <span style={{ fontSize: 12, color: "#555550" }}>{s}</span>
                      </button>
                    );
                  })}
                </div>
              )}
              {!loading && bounties.length === 0 && (
                <p style={{ fontSize: 13, color: "#444440", margin: "6px 0 0 0" }}>No bounties on-chain yet.</p>
              )}
            </div>

            <motion.button
              onClick={openCreate}
              whileHover={{ scale: 1.04, backgroundColor: "#d4f500" }}
              whileTap={{ scale: 0.96 }}
              transition={{ duration: 0.14 }}
              style={{ padding: "9px 18px", backgroundColor: "#c9ee00", color: "#0a0a0a", borderRadius: 6, fontWeight: 700, fontSize: 14, border: "none", cursor: "pointer", letterSpacing: "-0.01em", flexShrink: 0, fontFamily: "inherit" }}
            >
              Post Bounty
            </motion.button>
          </div>

          {/* Search + Sort */}
          <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
            <input
              type="text"
              placeholder="Search bounties..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ flex: 1, minWidth: 200, padding: "9px 14px", borderRadius: 6, border: "1px solid #222220", fontSize: 14, color: "#ebebdf", backgroundColor: "#141414", outline: "none", fontFamily: "inherit" }}
            />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              style={{ padding: "9px 14px", borderRadius: 6, border: "1px solid #222220", fontSize: 14, color: "#888880", backgroundColor: "#141414", cursor: "pointer", fontFamily: "inherit" }}
            >
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* Filters */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
            <span style={{ fontSize: 10, fontWeight: 700, color: "#333330", textTransform: "uppercase", letterSpacing: "0.12em", flexShrink: 0 }}>Filter</span>
            <div style={{ height: 1, flex: 1, backgroundColor: "#1e1e1c" }} />
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, paddingBottom: 16 }}>
            {/* All */}
            {(["All", ...ALL_STATUSES] as FilterKey[]).map((s) => {
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
                    cursor: "pointer", transition: "all 0.12s", fontFamily: "inherit",
                  }}
                >
                  {s !== "All" && (
                    <span style={{ width: 6, height: 6, borderRadius: "50%", flexShrink: 0, backgroundColor: isActive ? (fc?.text ?? "#0a0a0a") : (fc?.accent ?? "#666660") }} />
                  )}
                  {s}
                </button>
              );
            })}

            {/* Saved — only shown when wallet is connected */}
            {address && (
              <button
                onClick={() => setFilter("Saved")}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "5px 12px", borderRadius: 4,
                  fontSize: 12, fontWeight: 700, letterSpacing: "0.02em",
                  border: filter === "Saved" ? "none" : "1px solid #333330",
                  backgroundColor: filter === "Saved" ? "#e03a7a" : "transparent",
                  color: filter === "Saved" ? "#ebebdf" : "#e03a7a",
                  cursor: "pointer", transition: "all 0.12s", fontFamily: "inherit",
                }}
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M5 3a2 2 0 0 0-2 2v16l9-4 9 4V5a2 2 0 0 0-2-2H5z"/>
                </svg>
                Saved
                {savedCount > 0 && (
                  <span style={{
                    backgroundColor: filter === "Saved" ? "rgba(255,255,255,0.25)" : "#e03a7a22",
                    color: filter === "Saved" ? "#ebebdf" : "#e03a7a",
                    borderRadius: 10, padding: "1px 6px", fontSize: 11, fontWeight: 800,
                  }}>
                    {savedCount}
                  </span>
                )}
              </button>
            )}
          </div>

          {!loading && (filter !== "All" || search) && (
            <p style={{ fontSize: 12, color: "#444440", margin: "0 0 12px 0" }}>
              {visible.length} {visible.length === 1 ? "result" : "results"}
            </p>
          )}
        </div>
      </div>
=======
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
>>>>>>> frontend-fixes

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
<<<<<<< HEAD
          <div style={{ textAlign: "center", padding: "80px 24px" }}>
            <p style={{ fontSize: 16, fontWeight: 600, color: "#444440", marginBottom: 8 }}>
              {filter === "Saved" ? "No saved bounties yet." : "No bounties here."}
            </p>
            <p style={{ fontSize: 14, color: "#333330" }}>
              {filter === "Saved"
                ? "Click the bookmark icon on any bounty card to save it for later."
                : search
                  ? `Nothing matches "${search}" — `
                  : filter !== "All"
                    ? "Try a different filter, or "
                    : ""}
              {filter !== "Saved" && (
                <button
                  onClick={openCreate}
                  style={{ color: "#c9ee00", background: "none", border: "none", fontWeight: 600, cursor: "pointer", fontSize: 14, fontFamily: "inherit", padding: 0 }}
                >
                  post one
                </button>
              )}
              {filter !== "Saved" && "."}
=======
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
>>>>>>> frontend-fixes
            </p>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 14 }}>
            {visible.map((b, i) => (
              <BountyCard
                key={b.id}
                bounty={b}
                index={i}
                isSaved={isSaved(b.id)}
                onToggleSave={address ? toggle : undefined}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}