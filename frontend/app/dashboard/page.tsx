"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Bounty } from "@/types/bounty";
import { getAllBounties } from "@/lib/contract";
import { useWallet } from "@/context/WalletContext";
import BountyCard from "@/components/BountyCard";

type Role = "client" | "freelancer" | "arbiter";

const ROLE_LABELS: Record<Role, string> = {
  client: "As Client",
  freelancer: "As Freelancer",
  arbiter: "As Arbiter",
};

interface PendingAction {
  bounty: Bounty;
  message: string;
  urgency: "high" | "medium";
}

function getPendingActions(bounties: Bounty[], address: string): PendingAction[] {
  const actions: PendingAction[] = [];
  for (const b of bounties) {
    if (b.client === address) {
      if (b.status === "Open")       actions.push({ bounty: b, message: `Bounty #${b.id} is waiting for you to fund escrow.`, urgency: "medium" });
      if (b.status === "Submitted")  actions.push({ bounty: b, message: `Bounty #${b.id} — freelancer submitted work. Approve or dispute.`, urgency: "high" });
      if (b.status === "Disputed")   actions.push({ bounty: b, message: `Bounty #${b.id} is disputed — waiting for arbiter.`, urgency: "high" });
    }
    if (b.freelancer === address) {
      if (b.status === "Funded")     actions.push({ bounty: b, message: `Bounty #${b.id} is funded and waiting for your work submission.`, urgency: "medium" });
      if (b.status === "Disputed")   actions.push({ bounty: b, message: `Bounty #${b.id} is disputed — waiting for arbiter.`, urgency: "high" });
    }
    if (b.arbiter === address) {
      if (b.status === "Disputed")   actions.push({ bounty: b, message: `Bounty #${b.id} needs your arbitration decision.`, urgency: "high" });
    }
  }
  return actions;
}

export default function DashboardPage() {
  const { address, connect } = useWallet();
  const [bounties, setBounties] = useState<Bounty[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeRole, setActiveRole] = useState<Role>("client");

  useEffect(() => {
    if (!address) return;
    setLoading(true);
    getAllBounties()
      .then(setBounties)
      .finally(() => setLoading(false));
  }, [address]);

  if (!address) {
    return (
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "80px 24px", textAlign: "center" }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔐</div>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: "#1e293b", margin: "0 0 8px 0" }}>Connect your wallet</h1>
        <p style={{ fontSize: 14, color: "#64748b", margin: "0 0 24px 0" }}>
          See all bounties where you&apos;re the client, freelancer, or arbiter.
        </p>
        <button
          onClick={connect}
          style={{ padding: "10px 24px", backgroundColor: "#4f46e5", color: "#fff", borderRadius: 8, border: "none", fontWeight: 600, fontSize: 14, cursor: "pointer" }}
        >
          Connect Freighter
        </button>
      </div>
    );
  }

  const filtered = bounties.filter((b) => b[activeRole] === address);
  const pendingActions = !loading ? getPendingActions(bounties, address) : [];

  return (
    <div style={{ maxWidth: 1152, margin: "0 auto", padding: "32px 24px" }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, color: "#1e293b", margin: "0 0 4px 0" }}>My Bounties</h1>
      <p style={{ fontSize: 13, color: "#94a3b8", margin: "0 0 24px 0" }}>
        Wallet: <span style={{ fontFamily: "monospace" }}>{address.slice(0, 6)}…{address.slice(-4)}</span>
      </p>

      {/* Pending actions banner */}
      {pendingActions.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 13, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: "0.5px", margin: "0 0 10px 0" }}>
            Needs your attention ({pendingActions.length})
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {pendingActions.map(({ bounty, message, urgency }) => (
              <Link key={bounty.id} href={`/bounty/${bounty.id}`} style={{ textDecoration: "none" }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "14px 16px",
                  borderRadius: 10,
                  border: `1.5px solid ${urgency === "high" ? "#fca5a5" : "#fde68a"}`,
                  backgroundColor: urgency === "high" ? "#fff5f5" : "#fffbeb",
                  cursor: "pointer",
                  transition: "box-shadow 0.15s",
                }}
                  onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.08)")}
                  onMouseLeave={e => (e.currentTarget.style.boxShadow = "none")}
                >
                  <span style={{ fontSize: 20, flexShrink: 0 }}>{urgency === "high" ? "🔴" : "🟡"}</span>
                  <p style={{ fontSize: 13, fontWeight: 500, color: "#1e293b", margin: 0, flex: 1 }}>{message}</p>
                  <span style={{ fontSize: 12, color: "#4f46e5", fontWeight: 600, flexShrink: 0 }}>View →</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Role tabs */}
      <div style={{ display: "flex", gap: 4, backgroundColor: "#f1f5f9", borderRadius: 10, padding: 4, width: "fit-content", marginBottom: 24 }}>
        {(Object.keys(ROLE_LABELS) as Role[]).map((r) => {
          const count = bounties.filter((b) => b[r] === address).length;
          return (
            <button
              key={r}
              onClick={() => setActiveRole(r)}
              style={{
                padding: "8px 18px",
                borderRadius: 8,
                border: "none",
                backgroundColor: activeRole === r ? "#fff" : "transparent",
                color: activeRole === r ? "#1e293b" : "#64748b",
                fontWeight: activeRole === r ? 700 : 500,
                fontSize: 13,
                cursor: "pointer",
                boxShadow: activeRole === r ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
                transition: "all 0.15s",
              }}
            >
              {ROLE_LABELS[r]}
              {!loading && (
                <span style={{ marginLeft: 6, fontSize: 11, color: "#94a3b8" }}>({count})</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bounty grid */}
      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} style={{ backgroundColor: "#fff", borderRadius: 12, border: "1px solid #e2e8f0", height: 180, opacity: 0.4 }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 24px", color: "#94a3b8" }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>📭</div>
          <p style={{ fontWeight: 600, color: "#64748b", marginBottom: 8 }}>No bounties as {activeRole}</p>
          {activeRole === "client" && (
            <Link href="/create" style={{ color: "#4f46e5", textDecoration: "underline", fontSize: 14 }}>
              Post your first bounty
            </Link>
          )}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
          {filtered.map((b) => (
            <BountyCard key={b.id} bounty={b} />
          ))}
        </div>
      )}
    </div>
  );
}
