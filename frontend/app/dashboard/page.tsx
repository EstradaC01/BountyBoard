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
      <div className="max-w-lg mx-auto px-4 py-20 text-center">
        <p className="text-4xl mb-4">🔐</p>
        <h1 className="text-xl font-bold text-slate-900 mb-2">Connect your wallet</h1>
        <p className="text-slate-500 text-sm mb-6">
          See all bounties where you&apos;re the client, freelancer, or arbiter.
        </p>
        <button
          onClick={connect}
          className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          Connect Freighter
        </button>
      </div>
    );
  }

  const filtered = bounties.filter((b) => b[activeRole] === address);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-900 mb-1">My Bounties</h1>
      <p className="text-slate-500 text-sm mb-6">
        Showing bounties for <span className="font-mono">{address.slice(0, 6)}…{address.slice(-4)}</span>
      </p>

      {/* Role tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-lg p-1 mb-6 w-fit">
        {(Object.keys(ROLE_LABELS) as Role[]).map((r) => (
          <button
            key={r}
            onClick={() => setActiveRole(r)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              activeRole === r
                ? "bg-white shadow text-slate-900"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            {ROLE_LABELS[r]}
            {!loading && (
              <span className="ml-1.5 text-xs text-slate-400">
                ({bounties.filter((b) => b[r] === address).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-slate-200 p-5 animate-pulse h-44" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <p className="text-3xl mb-3">📭</p>
          <p className="font-medium">No bounties as {activeRole}</p>
          {activeRole === "client" && (
            <Link href="/create" className="text-indigo-600 underline text-sm mt-2 inline-block">
              Post your first bounty
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((b) => (
            <BountyCard key={b.id} bounty={b} />
          ))}
        </div>
      )}
    </div>
  );
}
