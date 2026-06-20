"use client";

import { use, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import type { Bounty } from "@/types/bounty";
import { getBounty } from "@/lib/contract";
import { stroopsToXlm, getBountyEvents, type ContractEvent } from "@/lib/stellar";
import { useWallet } from "@/context/WalletContext";
import { useToast } from "@/context/ToastContext";
import BountyStatusBadge from "@/components/BountyStatusBadge";
import ActionButtons from "@/components/ActionButtons";
import SkeletonCard from "@/components/SkeletonCard";

function truncate(addr: string) {
  return `${addr.slice(0, 8)}…${addr.slice(-6)}`;
}

export default function BountyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { address } = useWallet();
  const { showToast } = useToast();
  const [bounty, setBounty] = useState<Bounty | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [events, setEvents] = useState<ContractEvent[]>([]);
  const [copied, setCopied] = useState(false);

  const refresh = useCallback(async () => {
    const b = await getBounty(Number(id));
    if (!b) setNotFound(true);
    else setBounty(b);
    setLoading(false);

    // Fetch activity timeline
    const evts = await getBountyEvents(Number(id));
    setEvents(evts);
  }, [id]);

  useEffect(() => { refresh(); }, [refresh]);

  function copyLink() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      showToast("Link copied to clipboard!", "success", 2500);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  if (loading) {
    return (
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "32px 24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
          <div style={{ width: 100, height: 16, backgroundColor: "#e2e8f0", borderRadius: 6 }} />
          <div style={{ width: 80, height: 16, backgroundColor: "#e2e8f0", borderRadius: 6 }} />
        </div>
        <SkeletonCard />
        <div style={{ backgroundColor: "#fff", borderRadius: 14, border: "1.5px solid #e2e8f0", padding: 24, height: 80, opacity: 0.5 }} />
      </div>
    );
  }

  if (notFound || !bounty) {
    return (
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "80px 24px", textAlign: "center", color: "#94a3b8" }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
        <p style={{ fontSize: 18, fontWeight: 600, color: "#64748b" }}>Bounty #{id} not found</p>
        <Link href="/" style={{ color: "#4f46e5", textDecoration: "underline", fontSize: 14 }}>Back to board</Link>
      </div>
    );
  }

  const infoRow = (label: string, value: string) => (
    <div style={{ display: "flex", gap: 12, padding: "10px 0", borderBottom: "1px solid #f1f5f9" }}>
      <span style={{ fontSize: 13, fontWeight: 600, color: "#94a3b8", width: 100, flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: 13, fontFamily: "monospace", color: "#475569", wordBreak: "break-all" }}>{value}</span>
    </div>
  );

  // Map first topic (action name) to a readable label
  const eventLabel: Record<string, string> = {
    create_bounty:    "Bounty created",
    fund:             "Escrow funded",
    submit_work:      "Work submitted",
    approve:          "Work approved — funds released",
    dispute:          "Dispute raised",
    resolve_dispute:  "Dispute resolved",
    cancel:           "Bounty cancelled",
  };

  const statusDotColor: Record<string, string> = {
    create_bounty: "#94a3b8",
    fund: "#2563eb",
    submit_work: "#d97706",
    approve: "#16a34a",
    dispute: "#dc2626",
    resolve_dispute: "#7c3aed",
    cancel: "#94a3b8",
  };

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "32px 24px" }}>
      {/* Back + Share row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <Link href="/" style={{ fontSize: 14, color: "#4f46e5", textDecoration: "none" }}>← Back to board</Link>
        <button
          onClick={copyLink}
          style={{
            fontSize: 13,
            fontWeight: 500,
            padding: "6px 14px",
            borderRadius: 8,
            border: "1.5px solid #e2e8f0",
            backgroundColor: copied ? "#f0fdf4" : "#fff",
            color: copied ? "#16a34a" : "#475569",
            cursor: "pointer",
            transition: "all 0.2s",
          }}
        >
          {copied ? "✓ Copied!" : "🔗 Share"}
        </button>
      </div>

      {/* Main card */}
      <div style={{ backgroundColor: "#fff", borderRadius: 14, border: "1.5px solid #e2e8f0", padding: 24, marginBottom: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 12 }}>
          <h1 style={{ fontSize: 20, fontWeight: 700, color: "#1e293b", margin: 0 }}>{bounty.description}</h1>
          <BountyStatusBadge status={bounty.status} />
        </div>
        <p style={{ fontSize: 32, fontWeight: 800, color: "#4f46e5", margin: "0 0 24px 0" }}>
          {stroopsToXlm(bounty.amount)} <span style={{ fontSize: 16, fontWeight: 600, color: "#818cf8" }}>XLM</span>
        </p>
        <div>
          {infoRow("Bounty #", `#${bounty.id}`)}
          {infoRow("Client", truncate(bounty.client))}
          {infoRow("Freelancer", truncate(bounty.freelancer))}
          {infoRow("Arbiter", truncate(bounty.arbiter))}
          {infoRow("Token", truncate(bounty.token))}
        </div>
      </div>

      {/* Flow hint */}
      <div style={{ backgroundColor: "#f8fafc", borderRadius: 10, border: "1px solid #e2e8f0", padding: "12px 16px", marginBottom: 16, fontSize: 12, color: "#64748b" }}>
        <span style={{ fontWeight: 600 }}>Flow: </span>
        Open → Funded → Submitted → Approved &nbsp;|&nbsp; Disputed → Resolved
      </div>

      {/* Actions */}
      {address ? (
        <div style={{ backgroundColor: "#fff", borderRadius: 14, border: "1.5px solid #e2e8f0", padding: 24, marginBottom: 16 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: "#1e293b", margin: "0 0 16px 0" }}>Actions</h2>
          <ActionButtons bounty={bounty} walletAddress={address} onSuccess={refresh} />
        </div>
      ) : (
        <div style={{ backgroundColor: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 10, padding: "14px 16px", textAlign: "center", fontSize: 14, color: "#1d4ed8", marginBottom: 16 }}>
          Connect your wallet to take action on this bounty.
        </div>
      )}

      {/* Activity Timeline */}
      <div style={{ backgroundColor: "#fff", borderRadius: 14, border: "1.5px solid #e2e8f0", padding: 24 }}>
        <h2 style={{ fontSize: 15, fontWeight: 700, color: "#1e293b", margin: "0 0 20px 0" }}>Activity</h2>

        {events.length === 0 ? (
          <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>No on-chain events found for this bounty yet.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {events.map((evt, i) => {
              const action = evt.topics[0] ?? "unknown";
              const dot = statusDotColor[action] ?? "#94a3b8";
              const isLast = i === events.length - 1;
              return (
                <div key={i} style={{ display: "flex", gap: 16 }}>
                  {/* Timeline line + dot */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 20, flexShrink: 0 }}>
                    <div style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: dot, flexShrink: 0, marginTop: 2 }} />
                    {!isLast && <div style={{ width: 2, flex: 1, backgroundColor: "#e2e8f0", minHeight: 24 }} />}
                  </div>
                  {/* Content */}
                  <div style={{ paddingBottom: isLast ? 0 : 20, flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#1e293b", margin: "0 0 2px 0" }}>
                      {eventLabel[action] ?? action}
                    </p>
                    <p style={{ fontSize: 12, color: "#94a3b8", margin: "0 0 2px 0" }}>{evt.timestamp}</p>
                    <a
                      href={`https://stellar.expert/explorer/testnet/tx/${evt.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: 11, color: "#4f46e5", fontFamily: "monospace" }}
                    >
                      {evt.txHash.slice(0, 12)}…
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
