"use client";

import { use, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import type { Bounty } from "@/types/bounty";
import { getBounty } from "@/lib/contract";
import { stroopsToXlm } from "@/lib/stellar";
import { useWallet } from "@/context/WalletContext";
import BountyStatusBadge from "@/components/BountyStatusBadge";
import ActionButtons from "@/components/ActionButtons";

function truncate(addr: string) {
  return `${addr.slice(0, 8)}…${addr.slice(-6)}`;
}

export default function BountyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { address } = useWallet();
  const [bounty, setBounty] = useState<Bounty | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const refresh = useCallback(async () => {
    const b = await getBounty(Number(id));
    if (!b) setNotFound(true);
    else setBounty(b);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10 animate-pulse space-y-4">
        <div className="h-7 bg-slate-200 rounded w-48" />
        <div className="h-4 bg-slate-100 rounded w-full" />
        <div className="h-4 bg-slate-100 rounded w-3/4" />
      </div>
    );
  }

  if (notFound || !bounty) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center text-slate-400">
        <p className="text-4xl mb-3">🔍</p>
        <p className="text-lg font-medium">Bounty #{id} not found</p>
        <Link href="/" className="text-indigo-600 underline text-sm mt-2 inline-block">
          Back to board
        </Link>
      </div>
    );
  }

  const row = (label: string, value: string) => (
    <div className="flex gap-3 py-2 border-b border-slate-100 last:border-0">
      <span className="text-sm font-medium text-slate-500 w-28 shrink-0">{label}</span>
      <span className="text-sm font-mono text-slate-800 break-all">{value}</span>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <Link href="/" className="text-sm text-indigo-600 hover:underline mb-6 inline-block">
        ← Back to board
      </Link>

      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-4">
        <div className="flex items-start justify-between gap-3 mb-4">
          <h1 className="text-xl font-bold text-slate-900">{bounty.description}</h1>
          <BountyStatusBadge status={bounty.status} />
        </div>

        <div className="text-3xl font-bold text-indigo-600 mb-6">
          {stroopsToXlm(bounty.amount)} XLM
        </div>

        <div className="divide-y divide-slate-100">
          {row("Bounty #", `#${bounty.id}`)}
          {row("Client", truncate(bounty.client))}
          {row("Freelancer", truncate(bounty.freelancer))}
          {row("Arbiter", truncate(bounty.arbiter))}
          {row("Token", truncate(bounty.token))}
        </div>
      </div>

      {/* State machine hint */}
      <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 mb-4 text-xs text-slate-500">
        <span className="font-medium">Flow: </span>
        Open → Funded → Submitted → Approved &nbsp;|&nbsp; Disputed → Resolved
      </div>

      {/* Actions */}
      {address ? (
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-800 mb-4">Actions</h2>
          <ActionButtons bounty={bounty} walletAddress={address} onSuccess={refresh} />
        </div>
      ) : (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 text-sm text-slate-600 text-center">
          Connect your wallet to take action on this bounty.
        </div>
      )}
    </div>
  );
}
