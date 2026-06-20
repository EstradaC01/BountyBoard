"use client";

import { useState } from "react";
import type { Bounty, DisputeOutcome } from "@/types/bounty";
import {
  fundBounty,
  submitWork,
  approveBounty,
  disputeBounty,
  resolveDispute,
  cancelBounty,
  applyToBounty,
} from "@/lib/contract";
import { useToast } from "@/context/ToastContext";
import { useWallet } from "@/context/WalletContext";

interface Props {
  bounty: Bounty;
  walletAddress: string;
  onSuccess: () => void;
}

const LABELS: Record<string, { pending: string; active: string; success: string }> = {
  Fund:          { pending: "Fund Escrow",        active: "Funding...",    success: "Escrow funded! XLM is now locked." },
  Submit:        { pending: "Submit Work",         active: "Submitting...", success: "Work submitted! Awaiting client approval." },
  Approve:       { pending: "Approve & Release",   active: "Approving...",  success: "Approved! Funds released to freelancer." },
  Dispute:       { pending: "Raise Dispute",       active: "Disputing...",  success: "Dispute raised. Waiting for arbiter." },
  Cancel:        { pending: "Cancel Bounty",       active: "Cancelling...", success: "Bounty cancelled." },
  PayFreelancer: { pending: "Pay Freelancer",      active: "Resolving...",  success: "Resolved! Freelancer has been paid." },
  RefundClient:  { pending: "Refund Client",       active: "Resolving...",  success: "Resolved! Client has been refunded." },
  Apply:         { pending: "Apply",               active: "Applying...",   success: "Applied! The client will review applicants." },
};

export default function ActionButtons({ bounty, walletAddress, onSuccess }: Props) {
  const [loading, setLoading] = useState<string | null>(null);
  const [workProof, setWorkProof] = useState("");
  const [workProofError, setWorkProofError] = useState("");
  const { showToast, dismissToast } = useToast();
  const { refreshBalance } = useWallet();

  const isClient     = walletAddress === bounty.client;
  const isFreelancer = walletAddress === bounty.freelancer;
  const isArbiter    = walletAddress === bounty.arbiter;
  const isApplicant  = !isClient && !isFreelancer && !isArbiter;

  async function run(key: string, fn: () => Promise<void>) {
    setLoading(key);
    const toastId = showToast(`${LABELS[key].active} Waiting for Freighter...`, "loading");
    try {
      await fn();
      dismissToast(toastId);
      showToast(LABELS[key].success, "success");
      await refreshBalance();
      onSuccess();
    } catch (e) {
      dismissToast(toastId);
      showToast(e instanceof Error ? e.message : "Transaction failed", "error");
    } finally {
      setLoading(null);
    }
  }

  const primaryBtn = (key: string, fn: () => Promise<void>) => (
    <button
      key={key}
      disabled={!!loading}
      onClick={() => run(key, fn)}
      style={{
        padding: "10px 20px", borderRadius: 6, border: "none",
        backgroundColor: loading === key ? "#a8c700" : "#c9ee00",
        color: "#0a0a0a", fontWeight: 700, fontSize: 14,
        cursor: loading ? "not-allowed" : "pointer",
        opacity: loading && loading !== key ? 0.4 : 1, transition: "all 0.15s",
      }}
    >
      {loading === key ? LABELS[key].active : LABELS[key].pending}
    </button>
  );

  const dangerBtn = (key: string, fn: () => Promise<void>) => (
    <button
      key={key}
      disabled={!!loading}
      onClick={() => run(key, fn)}
      style={{
        padding: "10px 20px", borderRadius: 6, border: "none",
        backgroundColor: loading === key ? "#c03000" : "#e53a0d",
        color: "#ebebdf", fontWeight: 700, fontSize: 14,
        cursor: loading ? "not-allowed" : "pointer",
        opacity: loading && loading !== key ? 0.4 : 1, transition: "all 0.15s",
      }}
    >
      {loading === key ? LABELS[key].active : LABELS[key].pending}
    </button>
  );

  const ghostBtn = (key: string, fn: () => Promise<void>) => (
    <button
      key={key}
      disabled={!!loading}
      onClick={() => run(key, fn)}
      style={{
        padding: "10px 20px", borderRadius: 6, border: "1.5px solid #333330",
        backgroundColor: "transparent", color: "#ebebdf", fontWeight: 600, fontSize: 14,
        cursor: loading ? "not-allowed" : "pointer",
        opacity: loading && loading !== key ? 0.4 : 1, transition: "all 0.15s",
      }}
    >
      {loading === key ? LABELS[key].active : LABELS[key].pending}
    </button>
  );

  const buttons: React.ReactNode[] = [];

  if (isClient && bounty.status === "Open") {
    buttons.push(primaryBtn("Fund", () => fundBounty(walletAddress, bounty.id)));
    buttons.push(ghostBtn("Cancel", () => cancelBounty(walletAddress, bounty.id)));
  }
  if (isClient && bounty.status === "Submitted") {
    buttons.push(primaryBtn("Approve", () => approveBounty(walletAddress, bounty.id)));
    buttons.push(dangerBtn("Dispute", () => disputeBounty(walletAddress, bounty.id)));
  }
  if (isFreelancer && bounty.status === "Submitted") {
    buttons.push(dangerBtn("Dispute", () => disputeBounty(walletAddress, bounty.id)));
  }
  if (isArbiter && bounty.status === "Disputed") {
    buttons.push(primaryBtn("PayFreelancer", () => resolveDispute(walletAddress, bounty.id, "PayFreelancer")));
    buttons.push(dangerBtn("RefundClient",  () => resolveDispute(walletAddress, bounty.id, "RefundClient")));
  }

  const showApply       = isApplicant && (bounty.status === "Open" || bounty.status === "Funded");
  const showSubmitForm  = isFreelancer && bounty.status === "Funded";

  if (buttons.length === 0 && !showSubmitForm && !showApply) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Apply button -- shown to any wallet that is not already a party */}
      {showApply && (
        <div>
          <button
            disabled={!!loading}
            onClick={() => run("Apply", () => applyToBounty(walletAddress, bounty.id))}
            style={{
              padding: "10px 20px", borderRadius: 6, border: "none",
              backgroundColor: loading === "Apply" ? "#a8c700" : "#c9ee00",
              color: "#0a0a0a", fontWeight: 700, fontSize: 14,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading && loading !== "Apply" ? 0.4 : 1,
            }}
          >
            {loading === "Apply" ? "Applying..." : "Apply for this Bounty"}
          </button>
          <p style={{ fontSize: 12, color: "#444440", marginTop: 6 }}>
            The client will review all applicants and pick a freelancer.
          </p>
        </div>
      )}

      {/* Submit work form -- shown to the assigned freelancer once funded */}
      {showSubmitForm && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <label style={{ fontSize: 13, fontWeight: 600, color: "#888880" }}>
            Work proof -- attach a link or description
          </label>
          <input
            type="text"
            placeholder="e.g. https://drive.google.com/... or describe what you delivered"
            value={workProof}
            onChange={(e) => { setWorkProof(e.target.value); setWorkProofError(""); }}
            style={{
              padding: "10px 12px", borderRadius: 6,
              border: `1px solid ${workProofError ? "#e53a0d" : "#222220"}`,
              fontSize: 14, color: "#ebebdf",
              backgroundColor: workProofError ? "#150808" : "#0a0a0a",
              outline: "none",
            }}
          />
          {workProofError && (
            <p style={{ fontSize: 12, color: "#e53a0d", margin: 0 }}>&#x26a0; {workProofError}</p>
          )}
          <button
            disabled={!!loading}
            onClick={() => {
              if (!workProof.trim()) {
                setWorkProofError("Add a link or description of your work before submitting.");
                return;
              }
              run("Submit", () => submitWork(walletAddress, bounty.id, workProof.trim()));
            }}
            style={{
              padding: "10px 20px", borderRadius: 6, border: "none",
              backgroundColor: loading === "Submit" ? "#a8c700" : "#c9ee00",
              color: "#0a0a0a", fontWeight: 700, fontSize: 14,
              cursor: loading ? "not-allowed" : "pointer", alignSelf: "flex-start",
            }}
          >
            {loading === "Submit" ? "Submitting..." : "Submit Work"}
          </button>
        </div>
      )}

      {buttons.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {buttons}
        </div>
      )}
    </div>
  );
}