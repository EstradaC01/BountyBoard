"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import type { Bounty } from "@/types/bounty";
import { getBounty, getApplicants, acceptApplicant } from "@/lib/contract";
import { stroopsToXlm, getBountyEvents, type ContractEvent } from "@/lib/stellar";
import { useWallet } from "@/context/WalletContext";
import { useToast } from "@/context/ToastContext";
import BountyStatusBadge from "@/components/BountyStatusBadge";
import ActionButtons from "@/components/ActionButtons";
import SkeletonCard from "@/components/SkeletonCard";

function truncate(addr: string) {
  return `${addr.slice(0, 8)}...${addr.slice(-6)}`;
}

interface Props {
  id: number;
  onClose?: () => void;
}

export default function BountyDetailContent({ id, onClose }: Props) {
  const { address } = useWallet();
  const { showToast, dismissToast } = useToast();
  const [bounty, setBounty] = useState<Bounty | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [events, setEvents] = useState<ContractEvent[]>([]);
  const [applicants, setApplicants] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [acceptingAddr, setAcceptingAddr] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    const b = await getBounty(id);
    if (!b) setNotFound(true);
    else setBounty(b);
    setLoading(false);
    const evts = await getBountyEvents(id);
    setEvents(evts);
    const apps = await getApplicants(id);
    setApplicants(apps);
  }, [id]);

  useEffect(() => { refresh(); }, [refresh]);

  function copyLink() {
    const url = `${window.location.origin}/bounty/${id}`;
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      showToast("Link copied to clipboard!", "success", 2500);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  async function handleAccept(applicant: string) {
    if (!address || !bounty) return;
    setAcceptingAddr(applicant);
    const toastId = showToast("Accepting applicant... Waiting for Freighter.", "loading");
    try {
      await acceptApplicant(address, bounty.id, applicant);
      dismissToast(toastId);
      showToast("Freelancer accepted! They can now submit work.", "success");
      refresh();
    } catch (e) {
      dismissToast(toastId);
      showToast(e instanceof Error ? e.message : "Failed to accept applicant", "error");
    } finally {
      setAcceptingAddr(null);
    }
  }

  if (loading) {
    return (
      <div style={{ padding: "32px 24px" }}>
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
      <div style={{ padding: "80px 24px", textAlign: "center" }}>
        <p style={{ fontSize: 18, fontWeight: 600, color: "#444440", marginBottom: 8 }}>
          Bounty #{id} not found.
        </p>
        {onClose ? (
          <button
            onClick={onClose}
            style={{ color: "#c9ee00", background: "none", border: "none", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
          >
            Back
          </button>
        ) : (
          <Link href="/" style={{ color: "#c9ee00", textDecoration: "none", fontSize: 14, fontWeight: 600 }}>
            Back to board
          </Link>
        )}
      </div>
    );
  }

  const infoRow = (label: string, value: string) => (
    <div style={{ display: "flex", gap: 12, padding: "10px 0", borderBottom: "1px solid #1a1a18" }}>
      <span style={{ fontSize: 12, fontWeight: 700, color: "#444440", width: 100, flexShrink: 0, letterSpacing: "0.04em", textTransform: "uppercase" }}>
        {label}
      </span>
      <span style={{ fontSize: 13, fontFamily: "monospace", color: "#888880", wordBreak: "break-all" }}>
        {value}
      </span>
    </div>
  );

  const eventLabel: Record<string, string> = {
    create_bounty:   "Bounty created",
    fund:            "Escrow funded",
    submit_work:     "Work submitted",
    approve:         "Work approved -- funds released",
    dispute:         "Dispute raised",
    resolve_dispute: "Dispute resolved",
    cancel:          "Bounty cancelled",
    apply:           "Applicant applied",
    accept_applicant:"Freelancer accepted",
  };

  const statusDotColor: Record<string, string> = {
    create_bounty:   "#444440",
    fund:            "#3535d5",
    submit_work:     "#e53a0d",
    approve:         "#c9ee00",
    dispute:         "#e53a0d",
    resolve_dispute: "#e03a7a",
    cancel:          "#444440",
    apply:           "#888880",
    accept_applicant:"#c9ee00",
  };

  const isClient = address === bounty.client;
  const freelancerAccepted = applicants.includes(bounty.freelancer);
  const canAccept = isClient && !freelancerAccepted && (bounty.status === "Open" || bounty.status === "Funded");

  return (
    <div style={{ padding: "32px 24px" }}>
      {/* Back + Share row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        {onClose ? (
          <button
            onClick={onClose}
            style={{ fontSize: 14, fontWeight: 600, color: "#888880", background: "none", border: "none", cursor: "pointer", padding: 0, fontFamily: "inherit" }}
          >
            Back
          </button>
        ) : (
          <Link href="/" style={{ fontSize: 14, fontWeight: 600, color: "#888880", textDecoration: "none" }}>
            Back to board
          </Link>
        )}
        <button
          onClick={copyLink}
          style={{
            fontSize: 13, fontWeight: 600, padding: "6px 14px", borderRadius: 6,
            border: "1px solid #333330",
            backgroundColor: copied ? "#c9ee00" : "transparent",
            color: copied ? "#0a0a0a" : "#888880",
            cursor: "pointer", transition: "all 0.15s",
            marginRight: onClose ? 40 : 0,
          }}
        >
          {copied ? "Copied!" : "Share"}
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

        {bounty.workProof && (
          <div style={{ marginTop: 16, padding: "12px 14px", backgroundColor: "#1a1a18", borderRadius: 8, border: "1px solid #2a2a28" }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#444440", textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 6px 0" }}>
              Work Proof
            </p>
            {bounty.workProof.startsWith("http") ? (
              <a href={bounty.workProof} target="_blank" rel="noopener noreferrer" style={{ fontSize: 13, color: "#818cf8", wordBreak: "break-all" }}>
                {bounty.workProof}
              </a>
            ) : (
              <p style={{ fontSize: 13, color: "#888880", margin: 0, wordBreak: "break-all" }}>{bounty.workProof}</p>
            )}
          </div>
        )}
      </div>

      {/* Applicants panel -- visible to client when there are applicants */}
      {applicants.length > 0 && (
        <div style={{ backgroundColor: "#141414", borderRadius: 8, border: "1px solid #222220", padding: 24, marginBottom: 12 }}>
          <h2 style={{ fontSize: 13, fontWeight: 700, color: "#444440", margin: "0 0 16px 0", letterSpacing: "0.06em", textTransform: "uppercase" }}>
            Applicants ({applicants.length})
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {applicants.map((addr) => {
              const isAccepted = addr === bounty.freelancer;
              const someoneAccepted = freelancerAccepted;
              return (
                <div
                  key={addr}
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    gap: 12, padding: "10px 14px", borderRadius: 6,
                    backgroundColor: isAccepted ? "#0e1607" : "#0a0a0a",
                    border: `1px solid ${isAccepted ? "#c9ee00" : "#222220"}`,
                    opacity: someoneAccepted && !isAccepted ? 0.4 : 1,
                  }}
                >
                  <span style={{ fontSize: 13, fontFamily: "monospace", color: isAccepted ? "#c9ee00" : "#888880", wordBreak: "break-all" }}>
                    {addr}
                  </span>
                  {isAccepted ? (
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#c9ee00", letterSpacing: "0.05em", flexShrink: 0 }}>
                      ACCEPTED
                    </span>
                  ) : canAccept && (
                    <button
                      disabled={!!acceptingAddr}
                      onClick={() => handleAccept(addr)}
                      style={{
                        padding: "6px 14px", borderRadius: 6, border: "none", flexShrink: 0,
                        backgroundColor: acceptingAddr === addr ? "#a8c700" : "#c9ee00",
                        color: "#0a0a0a", fontWeight: 700, fontSize: 13,
                        cursor: acceptingAddr ? "not-allowed" : "pointer",
                      }}
                    >
                      {acceptingAddr === addr ? "Accepting..." : "Accept"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
          {!isClient && (
            <p style={{ fontSize: 12, color: "#444440", marginTop: 12, marginBottom: 0 }}>
              Only the client can accept an applicant.
            </p>
          )}
        </div>
      )}

      {/* Flow hint */}
      <div style={{ backgroundColor: "#141414", borderRadius: 8, border: "1px solid #222220", padding: "12px 16px", marginBottom: 12, fontSize: 12, color: "#444440" }}>
        <span style={{ fontWeight: 700, color: "#666660" }}>Flow: </span>
        Open / Funded (apply) -- Client accepts -- Freelancer submits -- Approved | Disputed -- Resolved
      </div>

      {/* Actions */}
      {address ? (
        <div style={{ backgroundColor: "#141414", borderRadius: 8, border: "1px solid #222220", padding: 24, marginBottom: 12 }}>
          <h2 style={{ fontSize: 13, fontWeight: 700, color: "#444440", margin: "0 0 16px 0", letterSpacing: "0.06em", textTransform: "uppercase" }}>
            Actions
          </h2>
          <ActionButtons bounty={bounty} walletAddress={address} onSuccess={refresh} />
        </div>
      ) : (
        <div style={{ backgroundColor: "#141414", border: "1px solid #222220", borderRadius: 8, padding: "14px 16px", textAlign: "center", fontSize: 14, color: "#666660", marginBottom: 12 }}>
          Connect your wallet to take action on this bounty.
        </div>
      )}

      {/* Activity Timeline */}
      <div style={{ backgroundColor: "#141414", borderRadius: 8, border: "1px solid #222220", padding: 24 }}>
        <h2 style={{ fontSize: 13, fontWeight: 700, color: "#444440", margin: "0 0 20px 0", letterSpacing: "0.06em", textTransform: "uppercase" }}>
          Activity
        </h2>

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
                      {evt.txHash.slice(0, 12)}...
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