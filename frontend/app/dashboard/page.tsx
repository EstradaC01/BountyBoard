"use client";

import { useEffect, useState } from "react";
import type { Bounty } from "@/types/bounty";
import { getAllBounties } from "@/lib/contract";
import { useWallet } from "@/context/WalletContext";
import { useModal } from "@/context/ModalContext";
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
  const { openBounty, openCreate } = useModal();
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
        <h1 style={{ fontSize: 20, fontWeight: 800, color: "#ebebdf", margin: "0 0 8px 0", letterSpacing: "-0.02em" }}>
          Connect your wallet
        </h1>
        <p style={{ fontSize: 14, color: "#444440", margin: "0 0 24px 0" }}>
          See all bounties where you&apos;re the client, freelancer, or arbiter.
        </p>
        <button
          onClick={connect}
          style={{ padding: "10px 24px", backgroundColor: "#c9ee00", color: "#0a0a0a", borderRadius: 6, border: "none", fontWeight: 700, fontSize: 14, cursor: "pointer" }}
        >
          Connect Freighter
        </button>
      </div>
    );
  }

  const filtered = bounties.filter((b) => b[activeRole] === address);
  const pendingActions = !loading ? getPendingActions(bounties, address) : [];

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 24px 32px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <span style={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: "#c9ee00" }} />
        <span style={{ fontSize: 11, fontWeight: 700, color: "#9a9a92", textTransform: "uppercase", letterSpacing: "0.18em" }}>
          Connected · <span style={{ fontFamily: "monospace", letterSpacing: 0 }}>{address.slice(0, 6)}…{address.slice(-4)}</span>
        </span>
      </div>
      <h1 style={{ fontSize: 34, fontWeight: 800, color: "#ebebdf", margin: "0 0 28px 0", letterSpacing: "-0.035em", lineHeight: 1.05 }}>
        My bounties
      </h1>

      {/* Pending actions banner */}
      {pendingActions.length > 0 && (
        <div style={{ marginBottom: 28 }}>
          <h2 style={{ fontSize: 11, fontWeight: 700, color: "#444440", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 10px 0" }}>
            Needs your attention ({pendingActions.length})
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {pendingActions.map(({ bounty, message, urgency }) => (
              <div
                key={bounty.id}
                onClick={() => openBounty(bounty.id)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 14,
                  padding: "14px 16px",
                  borderRadius: 8,
                  border: `1px solid ${urgency === "high" ? "#e53a0d" : "#3535d5"}`,
                  backgroundColor: urgency === "high" ? "#150808" : "#08080f",
                  cursor: "pointer",
                  transition: "opacity 0.15s",
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = "0.85")}
                onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
              >
                <span style={{ fontSize: 18, flexShrink: 0 }}>{urgency === "high" ? "🔴" : "🔵"}</span>
                <p style={{ fontSize: 13, fontWeight: 500, color: "#ebebdf", margin: 0, flex: 1 }}>{message}</p>
                <span style={{ fontSize: 12, color: "#c9ee00", fontWeight: 700, flexShrink: 0 }}>View →</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Role tabs */}
      <div style={{ display: "flex", gap: 4, backgroundColor: "#141414", border: "1px solid #222220", borderRadius: 8, padding: 4, width: "fit-content", marginBottom: 24 }}>
        {(Object.keys(ROLE_LABELS) as Role[]).map((r) => {
          const count = bounties.filter((b) => b[r] === address).length;
          return (
            <button
              key={r}
              onClick={() => setActiveRole(r)}
              style={{
                padding: "6px 16px",
                borderRadius: 6,
                fontSize: 13,
                fontWeight: 600,
                border: "none",
                cursor: "pointer",
                backgroundColor: activeRole === r ? "#c9ee00" : "transparent",
                color: activeRole === r ? "#0a0a0a" : "#666660",
                transition: "all 0.12s",
              }}
            >
              {ROLE_LABELS[r]}
              {!loading && (
                <span style={{ marginLeft: 6, fontSize: 11, opacity: 0.7 }}>({count})</span>
              )}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 12 }}>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} style={{ backgroundColor: "#141414", borderRadius: 8, border: "1px solid #222220", height: 176 }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "64px 24px" }}>
          <p style={{ fontSize: 15, fontWeight: 600, color: "#444440", marginBottom: 8 }}>
            No bounties as {activeRole}.
          </p>
          {activeRole === "client" && (
            <button
              onClick={openCreate}
              style={{ color: "#c9ee00", background: "none", border: "none", fontWeight: 600, fontSize: 14, cursor: "pointer", fontFamily: "inherit", padding: 0 }}
            >
              Post your first bounty
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 12 }}>
          {filtered.map((b, i) => (
            <BountyCard key={b.id} bounty={b} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
