"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@/context/WalletContext";
import { createBounty } from "@/lib/contract";
import { xlmToStroops } from "@/lib/stellar";

// XLM SAC address on testnet
const XLM_TOKEN = "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC";

export default function CreateBountyPage() {
  const { address, connect } = useWallet();
  const router = useRouter();

  const [form, setForm] = useState({
    freelancer: "",
    arbiter: "",
    amount: "",
    description: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!address) return;
    setSubmitting(true);
    setError(null);
    try {
      await createBounty(address, {
        freelancer: form.freelancer.trim(),
        arbiter: form.arbiter.trim(),
        token: XLM_TOKEN,
        amount: xlmToStroops(form.amount),
        description: form.description.trim(),
      });
      router.push("/dashboard");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to create bounty");
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    "w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 font-mono";
  const labelClass = "block text-sm font-medium text-slate-700 mb-1";

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-slate-900 mb-1">Post a Bounty</h1>
      <p className="text-slate-500 text-sm mb-8">
        Describe the work, set the XLM amount, and lock it in escrow.
      </p>

      {!address ? (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6 text-center">
          <p className="text-slate-700 mb-4">Connect your Freighter wallet to post a bounty.</p>
          <button
            onClick={connect}
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Connect Freighter
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5 bg-white rounded-xl border border-slate-200 p-6">
          <div>
            <label className={labelClass}>Description</label>
            <textarea
              required
              rows={3}
              placeholder="e.g. Design a logo for my startup"
              value={form.description}
              onChange={set("description")}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
            />
          </div>

          <div>
            <label className={labelClass}>Amount (XLM)</label>
            <input
              required
              type="number"
              min="0.0000001"
              step="any"
              placeholder="e.g. 100"
              value={form.amount}
              onChange={set("amount")}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Freelancer Address</label>
            <input
              required
              type="text"
              placeholder="G..."
              value={form.freelancer}
              onChange={set("freelancer")}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Arbiter Address</label>
            <input
              required
              type="text"
              placeholder="G... (neutral third party for disputes)"
              value={form.arbiter}
              onChange={set("arbiter")}
              className={inputClass}
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
          )}

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <p className="text-xs text-slate-400">
              Posting as <span className="font-mono">{address.slice(0, 6)}…{address.slice(-4)}</span>
            </p>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-60"
            >
              {submitting ? "Creating…" : "Create Bounty"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
