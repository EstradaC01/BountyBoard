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
} from "@/lib/contract";
import { useToast } from "@/context/ToastContext";
import { useWallet } from "@/context/WalletContext";

interface Props {
  bounty: Bounty;
  walletAddress: string;
  onSuccess: () => void;
}

const LABELS: Record<string, { pending: string; active: string; success: string }> = {
  Fund:          { pending: "Fund Escrow",        active: "Funding…",     success: "Escrow funded! XLM is now locked." },
  Submit:        { pending: "Submit Work",         active: "Submitting…",  success: "Work submitted! Awaiting client approval." },
  Approve:       { pending: "Approve & Release",   active: "Approving…",   success: "Approved! Funds released to freelancer." },
  Dispute:       { pending: "Raise Dispute",       active: "Disputing…",   success: "Dispute raised. Waiting for arbiter." },
  Cancel:        { pending: "Cancel Bounty",       active: "Cancelling…",  success: "Bounty cancelled." },
  PayFreelancer: { pending: "Pay Freelancer",      active: "Resolving…",   success: "Resolved! Freelancer has been paid." },
  RefundClient:  { pending: "Refund Client",       active: "Resolving…",   success: "Resolved! Client has been refunded." },
};

export default function ActionButtons({ bounty, walletAddress, onSuccess }: Props) {
  const [loading, setLoading] = useState<string | null>(null);
  const { showToast, dismissToast } = useToast();
  const { refreshBalance } = useWallet();

  const isClient     = walletAddress === bounty.client;
  const isFreelancer = walletAddress === bounty.freelancer;
  const isArbiter    = walletAddress === bounty.arbiter;

  async function run(key: string, fn: () => Promise<void>) {
    setLoading(key);
    const toastId = showToast(`${LABELS[key].active} Waiting for Freighter…`, "loading");
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
        padding: "10px 20px",
        borderRadius: 8,
        border: "none",
        backgroundColor: loading === key ? "#818cf8" : "#4f46e5",
        color: "#fff",
        fontWeight: 600,
        fontSize: 14,
        cursor: loading ? "not-allowed" : "pointer",
        opacity: loading && loading !== key ? 0.5 : 1,
        transition: "all 0.15s",
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
        padding: "10px 20px",
        borderRadius: 8,
        border: "none",
        backgroundColor: loading === key ? "#f87171" : "#dc2626",
        color: "#fff",
        fontWeight: 600,
        fontSize: 14,
        cursor: loading ? "not-allowed" : "pointer",
        opacity: loading && loading !== key ? 0.5 : 1,
        transition: "all 0.15s",
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
        padding: "10px 20px",
        borderRadius: 8,
        border: "1.5px solid #e2e8f0",
        backgroundColor: "#fff",
        color: "#475569",
        fontWeight: 600,
        fontSize: 14,
        cursor: loading ? "not-allowed" : "pointer",
        opacity: loading && loading !== key ? 0.5 : 1,
        transition: "all 0.15s",
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
  if (isFreelancer && bounty.status === "Funded") {
    buttons.push(primaryBtn("Submit", () => submitWork(walletAddress, bounty.id)));
  }
  if (isFreelancer && bounty.status === "Submitted") {
    buttons.push(dangerBtn("Dispute", () => disputeBounty(walletAddress, bounty.id)));
  }
  if (isArbiter && bounty.status === "Disputed") {
    buttons.push(primaryBtn("PayFreelancer", () => resolveDispute(walletAddress, bounty.id, "PayFreelancer")));
    buttons.push(dangerBtn("RefundClient",  () => resolveDispute(walletAddress, bounty.id, "RefundClient")));
  }

  if (buttons.length === 0) return null;

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
      {buttons}
    </div>
  );
}
