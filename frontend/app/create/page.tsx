"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useWallet } from "@/context/WalletContext";
import { useToast } from "@/context/ToastContext";
import { createBounty } from "@/lib/contract";
import { xlmToStroops } from "@/lib/stellar";
import * as StellarSdk from "@stellar/stellar-sdk";

const XLM_TOKEN = "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC";

function isValidStellarAddress(addr: string): boolean {
  try {
    StellarSdk.Keypair.fromPublicKey(addr);
    return true;
  } catch {
    return false;
  }
}

interface FieldErrors {
  description?: string;
  amount?: string;
  freelancer?: string;
  arbiter?: string;
}

export default function CreateBountyPage() {
  const { address, connect } = useWallet();
  const { showToast, dismissToast } = useToast();
  const router = useRouter();

  const [form, setForm] = useState({ freelancer: "", arbiter: "", amount: "", description: "" });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  function set(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((f) => ({ ...f, [field]: e.target.value }));
      // Clear error on change
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    };
  }

  function validate(): boolean {
    const next: FieldErrors = {};

    if (!form.description.trim()) {
      next.description = "Description is required.";
    }

    const amt = parseFloat(form.amount);
    if (!form.amount || isNaN(amt) || amt <= 0) {
      next.amount = "Enter a valid amount greater than 0.";
    }

    if (!form.freelancer.trim()) {
      next.freelancer = "Freelancer address is required.";
    } else if (!isValidStellarAddress(form.freelancer.trim())) {
      next.freelancer = "Not a valid Stellar address (must start with G and be 56 chars).";
    } else if (form.freelancer.trim() === address) {
      next.freelancer = "Freelancer can't be the same as the client (you).";
    }

    if (!form.arbiter.trim()) {
      next.arbiter = "Arbiter address is required.";
    } else if (!isValidStellarAddress(form.arbiter.trim())) {
      next.arbiter = "Not a valid Stellar address (must start with G and be 56 chars).";
    } else if (form.arbiter.trim() === address) {
      next.arbiter = "Arbiter can't be the same as the client (you).";
    } else if (form.arbiter.trim() === form.freelancer.trim()) {
      next.arbiter = "Arbiter and freelancer can't be the same address.";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!address || !validate()) return;
    setSubmitting(true);
    const toastId = showToast("Creating bounty… Waiting for Freighter.", "loading");
    try {
      await createBounty(address, {
        freelancer: form.freelancer.trim(),
        arbiter: form.arbiter.trim(),
        token: XLM_TOKEN,
        amount: xlmToStroops(form.amount),
        description: form.description.trim(),
      });
      dismissToast(toastId);
      showToast("Bounty created! Fund it to lock in escrow.", "success");
      router.push("/dashboard");
    } catch (err) {
      dismissToast(toastId);
      showToast(err instanceof Error ? err.message : "Failed to create bounty", "error");
    } finally {
      setSubmitting(false);
    }
  }

  const inputStyle = (hasError: boolean): React.CSSProperties => ({
    width: "100%",
    padding: "10px 12px",
    borderRadius: 8,
    border: `1.5px solid ${hasError ? "#fca5a5" : "#e2e8f0"}`,
    fontSize: 14,
    color: "#1e293b",
    backgroundColor: hasError ? "#fff5f5" : "#fff",
    fontFamily: "monospace",
    outline: "none",
    boxSizing: "border-box",
  });

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: 13,
    fontWeight: 600,
    color: "#475569",
    marginBottom: 6,
  };

  const errorStyle: React.CSSProperties = {
    fontSize: 12,
    color: "#dc2626",
    marginTop: 4,
  };

  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: "40px 24px" }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, color: "#1e293b", margin: "0 0 4px 0" }}>Post a Bounty</h1>
      <p style={{ fontSize: 14, color: "#64748b", margin: "0 0 32px 0" }}>
        Describe the work, set the XLM amount, and lock it in escrow.
      </p>

      {!address ? (
        <div style={{ backgroundColor: "#eff6ff", border: "1px solid #bfdbfe", borderRadius: 12, padding: 32, textAlign: "center" }}>
          <p style={{ color: "#1d4ed8", marginBottom: 16, fontSize: 14 }}>Connect your Freighter wallet to post a bounty.</p>
          <button
            onClick={connect}
            style={{ padding: "10px 24px", backgroundColor: "#4f46e5", color: "#fff", borderRadius: 8, border: "none", fontWeight: 600, fontSize: 14, cursor: "pointer" }}
          >
            Connect Freighter
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate style={{ backgroundColor: "#fff", borderRadius: 14, border: "1.5px solid #e2e8f0", padding: 28, display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Description */}
          <div>
            <label style={labelStyle}>Description</label>
            <textarea
              rows={3}
              placeholder="e.g. Design a logo for my startup"
              value={form.description}
              onChange={set("description")}
              style={{ ...inputStyle(!!errors.description), fontFamily: "inherit", resize: "none" }}
            />
            {errors.description && <p style={errorStyle}>⚠ {errors.description}</p>}
          </div>

          {/* Amount */}
          <div>
            <label style={labelStyle}>Amount (XLM)</label>
            <div style={{ position: "relative" }}>
              <input
                type="number"
                min="0.0000001"
                step="any"
                placeholder="e.g. 100"
                value={form.amount}
                onChange={set("amount")}
                style={{ ...inputStyle(!!errors.amount), paddingRight: 48 }}
              />
              <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", fontSize: 13, fontWeight: 600, color: "#818cf8", fontFamily: "sans-serif" }}>
                XLM
              </span>
            </div>
            {errors.amount && <p style={errorStyle}>⚠ {errors.amount}</p>}
          </div>

          {/* Freelancer */}
          <div>
            <label style={labelStyle}>Freelancer Address</label>
            <input
              type="text"
              placeholder="G... (56 character Stellar address)"
              value={form.freelancer}
              onChange={set("freelancer")}
              style={inputStyle(!!errors.freelancer)}
            />
            {errors.freelancer
              ? <p style={errorStyle}>⚠ {errors.freelancer}</p>
              : form.freelancer && isValidStellarAddress(form.freelancer)
                ? <p style={{ fontSize: 12, color: "#16a34a", marginTop: 4 }}>✓ Valid address</p>
                : null
            }
          </div>

          {/* Arbiter */}
          <div>
            <label style={labelStyle}>Arbiter Address</label>
            <input
              type="text"
              placeholder="G... (neutral third party for disputes)"
              value={form.arbiter}
              onChange={set("arbiter")}
              style={inputStyle(!!errors.arbiter)}
            />
            {errors.arbiter
              ? <p style={errorStyle}>⚠ {errors.arbiter}</p>
              : form.arbiter && isValidStellarAddress(form.arbiter)
                ? <p style={{ fontSize: 12, color: "#16a34a", marginTop: 4 }}>✓ Valid address</p>
                : null
            }
            <p style={{ fontSize: 11, color: "#94a3b8", marginTop: 6 }}>
              A trusted person both parties agree on — settles disputes if client and freelancer disagree.
            </p>
          </div>

          {/* Footer */}
          <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: 16, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <p style={{ fontSize: 12, color: "#94a3b8" }}>
              Posting as <span style={{ fontFamily: "monospace" }}>{address.slice(0, 6)}…{address.slice(-4)}</span>
            </p>
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: "10px 24px",
                backgroundColor: submitting ? "#818cf8" : "#4f46e5",
                color: "#fff",
                borderRadius: 8,
                border: "none",
                fontWeight: 700,
                fontSize: 14,
                cursor: submitting ? "not-allowed" : "pointer",
              }}
            >
              {submitting ? "Creating…" : "Create Bounty"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
