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

interface Props {
  bounty: Bounty;
  walletAddress: string;
  onSuccess: () => void;
}

export default function ActionButtons({ bounty, walletAddress, onSuccess }: Props) {
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isClient = walletAddress === bounty.client;
  const isFreelancer = walletAddress === bounty.freelancer;
  const isArbiter = walletAddress === bounty.arbiter;

  async function run(label: string, fn: () => Promise<void>) {
    setLoading(label);
    setError(null);
    try {
      await fn();
      onSuccess();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Transaction failed");
    } finally {
      setLoading(null);
    }
  }

  const btn =
    "px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50";
  const primary = `${btn} bg-indigo-600 hover:bg-indigo-700 text-white`;
  const danger = `${btn} bg-red-600 hover:bg-red-700 text-white`;
  const ghost = `${btn} border border-slate-300 hover:bg-slate-50 text-slate-700`;

  return (
    <div className="space-y-3">
      {error && (
        <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
      )}

      <div className="flex flex-wrap gap-2">
        {/* Client actions */}
        {isClient && bounty.status === "Open" && (
          <>
            <button
              className={primary}
              disabled={!!loading}
              onClick={() => run("Fund", () => fundBounty(walletAddress, bounty.id))}
            >
              {loading === "Fund" ? "Funding…" : "Fund Escrow"}
            </button>
            <button
              className={ghost}
              disabled={!!loading}
              onClick={() => run("Cancel", () => cancelBounty(walletAddress, bounty.id))}
            >
              {loading === "Cancel" ? "Cancelling…" : "Cancel"}
            </button>
          </>
        )}

        {isClient && bounty.status === "Submitted" && (
          <>
            <button
              className={primary}
              disabled={!!loading}
              onClick={() => run("Approve", () => approveBounty(walletAddress, bounty.id))}
            >
              {loading === "Approve" ? "Approving…" : "Approve & Release"}
            </button>
            <button
              className={danger}
              disabled={!!loading}
              onClick={() => run("Dispute", () => disputeBounty(walletAddress, bounty.id))}
            >
              {loading === "Dispute" ? "Disputing…" : "Raise Dispute"}
            </button>
          </>
        )}

        {/* Freelancer actions */}
        {isFreelancer && bounty.status === "Funded" && (
          <button
            className={primary}
            disabled={!!loading}
            onClick={() => run("Submit", () => submitWork(walletAddress, bounty.id))}
          >
            {loading === "Submit" ? "Submitting…" : "Submit Work"}
          </button>
        )}

        {isFreelancer && bounty.status === "Submitted" && (
          <button
            className={danger}
            disabled={!!loading}
            onClick={() => run("Dispute", () => disputeBounty(walletAddress, bounty.id))}
          >
            {loading === "Dispute" ? "Disputing…" : "Raise Dispute"}
          </button>
        )}

        {/* Arbiter actions */}
        {isArbiter && bounty.status === "Disputed" && (
          <>
            <button
              className={primary}
              disabled={!!loading}
              onClick={() =>
                run("PayFreelancer", () =>
                  resolveDispute(walletAddress, bounty.id, "PayFreelancer")
                )
              }
            >
              {loading === "PayFreelancer" ? "Resolving…" : "Pay Freelancer"}
            </button>
            <button
              className={danger}
              disabled={!!loading}
              onClick={() =>
                run("RefundClient", () =>
                  resolveDispute(walletAddress, bounty.id, "RefundClient")
                )
              }
            >
              {loading === "RefundClient" ? "Resolving…" : "Refund Client"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
