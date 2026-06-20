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
          <div style={{ width: 100, height: 16, backgroundColor: "#1f1f1d", borderRadius: 4 }} />
          <div style={{ width: 80, height: 16, backgroundColor: "#1f1f1d", borderRadius: 4 }} />
        </div>
        <SkeletonCard />
        <div style={{ backgroundColor: "#141414", borderRadius: 8, border: "1px solid #222220", padding: 24, height: 80, opacity: 0.5 }} />
      </div>
    );
  }

  if (notFound || !bounty) {
    return (
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "80px 24px", textAlign: "center" }}>
        <p style={{ fontSize: 18, fontWeight: 600, color: "#444440", marginBottom: 8 }}>Bounty #{id} not found.</p>
        <Link href="/" style={{ color: "#c9ee00", textDecoration: "none", fontSize: 14, fontWeight: 600 }}>← Back to board</Link>
      </div>
    );
  }

  const infoRow = (label: string, value: string) => (
    <div style={{ display: "flex", gap: 12, padding: "10px 0", borderBottom: "1px solid #1a1a18" }}>
      <span style={{ fontSize: 12, fontWeight: 700, color: "#444440", width: 100, flexShrink: 0, letterSpacing: "0.04em", textTransform: "uppercase" }}>{label}</span>
      <span style={{ fontSize: 13, fontFamily: "monospace", color: "#888880", wordBreak: "break-all" }}>{value}</span>
    </div>
  );

  const eventLabel: Record<string, string> = {
    create_bounty:   "Bounty created",
    fund:            "Escrow funded",
    submit_work:     "Work submitted",
    approve:         "Work approved — funds released",
    dispute:         "Dispute raised",
    resolve_dispute: "Dispute resolved",
    cancel:          "Bounty cancelled",
  };

  const statusDotColor: Record<string, string> = {
    create_bounty:   "#444440",
    fund:            "#3535d5",
    submit_work:     "#e53a0d",
    approve:         "#c9ee00",
    dispute:         "#e53a0d",
    resolve_dispute: "#e03a7a",
    cancel:          "#444440",
  };

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "32px 24px" }}>
      {/* Back + Share */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <Link href="/" style={{ fontSize: 14, fontWeight: 600, color: "#888880", textDecoration: "none" }}>← Back to board</Link>
        <button
          onClick={copyLink}
          style={{
            fontSize: 13,
            fontWeight: 600,
            padding: "6px 14px",
            borderRadius: 6,
            border: "1px solid #333330",
            backgroundColor: copied ? "#c9ee00" : "transparent",
            color: copied ? "#0a0a0a" : "#888880",
            cursor: "pointer",
            transition: "all 0.15s",
          }}
        >
          {copied ? "✓ Copied!" : "Share"}
        </button>
      </div>

      {/* Main card */}
      <div style={{ backgroundColor: "#141414", borderRadius: 8, border: "1px solid #222220", padding: 24, marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, marginBottom: 16 }}>
          <h1 style={{ fontSize: 19, fontWeight: 700, color: "#ebebdf", margin: 0, letterSpacing: "-0.02em", lineHeight: 1.3 }}>
            {bounty.description}
          </h1>
          <BountyStatusBadge status={bounty.status} />
        </div>

        <p style={{ fontSize: 56, fontWeight: 800, color: "#c9ee00", margin: "0 0 24px 0", letterSpacing: "-0.04em", lineHeight: 1 }}>
          {stroopsToXlm(bounty.amount)}{" "}
          <span style={{ fontSize: 20, fontWeight: 700, color: "#444440", letterSpacing: "0.04em" }}>XLM</span>
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
      <div style={{ backgroundColor: "#141414", borderRadius: 8, border: "1px solid #222220", padding: "12px 16px", marginBottom: 12, fontSize: 12, color: "#444440" }}>
        <span style={{ fontWeight: 700, color: "#666660" }}>Flow: </span>
        Open → Funded → Submitted → Approved &nbsp;|&nbsp; Disputed → Resolved
      </div>

      {/* Actions */}
      {address ? (
        <div style={{ backgroundColor: "#141414", borderRadius: 8, border: "1px solid #222220", padding: 24, marginBottom: 12 }}>
          <h2 style={{ fontSize: 13, fontWeight: 700, color: "#444440", margin: "0 0 16px 0", letterSpacing: "0.06em", textTransform: "uppercase" }}>Actions</h2>
          <ActionButtons bounty={bounty} walletAddress={address} onSuccess={refresh} />
        </div>
      ) : (
        <div style={{ backgroundColor: "#141414", border: "1px solid #222220", borderRadius: 8, padding: "14px 16px", textAlign: "center", fontSize: 14, color: "#666660", marginBottom: 12 }}>
          Connect your wallet to take action on this bounty.
        </div>
      )}

      {/* Activity Timeline */}
      <div style={{ backgroundColor: "#141414", borderRadius: 8, border: "1px solid #222220", padding: 24 }}>
        <h2 style={{ fontSize: 13, fontWeight: 700, color: "#444440", margin: "0 0 20px 0", letterSpacing: "0.06em", textTransform: "uppercase" }}>Activity</h2>

        {events.length === 0 ? (
          <p style={{ fontSize: 13, color: "#444440", margin: 0 }}>No on-chain events yet.</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {events.map((evt, i) => {
              const action = evt.topics[0] ?? "unknown";
              const dot = statusDotColor[action] ?? "#444440";
              const isLast = i === events.length - 1;
              return (
                <div key={i} style={{ display: "flex", gap: 16 }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 20, flexShrink: 0 }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", backgroundColor: dot, flexShrink: 0, marginTop: 3 }} />
                    {!isLast && <div style={{ width: 1, flex: 1, backgroundColor: "#222220", minHeight: 24 }} />}
                  </div>
                  <div style={{ paddingBottom: isLast ? 0 : 20, flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#ebebdf", margin: "0 0 2px 0" }}>
                      {eventLabel[action] ?? action}
                    </p>
                    <p style={{ fontSize: 12, color: "#444440", margin: "0 0 2px 0" }}>{evt.timestamp}</p>
                    <a
                      href={`https://stellar.expert/explorer/testnet/tx/${evt.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: 11, color: "#3535d5", fontFamily: "monospace" }}
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
