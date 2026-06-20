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

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 12,
  fontWeight: 700,
  color: "#444440",
  marginBottom: 6,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
};

const errorStyle: React.CSSProperties = {
  fontSize: 12,
  color: "#e53a0d",
  marginTop: 4,
};

export default function CreateBountyPage() {
  const { address, connect } = useWallet();
  const { showToast, dismissToast } = useToast();
  const router = useRouter();

  const [form, setForm] = useState({ freelancer: "", arbiter: "", amount: "", description: "" });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  function inputStyle(hasError: boolean): React.CSSProperties {
    return {
      width: "100%",
      padding: "10px 14px",
      borderRadius: 6,
      border: `1px solid ${hasError ? "#e53a0d" : "#222220"}`,
      fontSize: 14,
      color: "#ebebdf",
      backgroundColor: hasError ? "#150808" : "#0a0a0a",
      fontFamily: "monospace",
      outline: "none",
      boxSizing: "border-box",
    };
  }

  function set(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((f) => ({ ...f, [field]: e.target.value }));
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

  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: "40px 24px" }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, color: "#ebebdf", margin: "0 0 4px 0", letterSpacing: "-0.03em" }}>
        Post a Bounty
      </h1>
      <p style={{ fontSize: 14, color: "#444440", margin: "0 0 32px 0" }}>
        Describe the work, set the XLM amount, and lock it in escrow.
      </p>

      {!address ? (
        <div style={{ backgroundColor: "#141414", border: "1px solid #222220", borderRadius: 8, padding: 32, textAlign: "center" }}>
          <p style={{ color: "#888880", marginBottom: 20, fontSize: 14 }}>
            Connect your Freighter wallet to post a bounty.
          </p>
          <button
            onClick={connect}
            style={{ padding: "10px 24px", backgroundColor: "#c9ee00", color: "#0a0a0a", borderRadius: 6, border: "none", fontWeight: 700, fontSize: 14, cursor: "pointer" }}
          >
            Connect Freighter
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate style={{ backgroundColor: "#141414", borderRadius: 8, border: "1px solid #222220", padding: 24, display: "flex", flexDirection: "column", gap: 20 }}>

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
                style={{ ...inputStyle(!!errors.amount), paddingRight: 52 }}
              />
              <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", fontSize: 12, fontWeight: 700, color: "#444440", fontFamily: "sans-serif", letterSpacing: "0.05em" }}>
                XLM
              </span>
            </div>
            {errors.amount && <p style={errorStyle}>⚠ {errors.amount}</p>}
          </div>

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
                ? <p style={{ fontSize: 12, color: "#c9ee00", marginTop: 4 }}>✓ Valid address</p>
                : null
            }
          </div>

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
                ? <p style={{ fontSize: 12, color: "#c9ee00", marginTop: 4 }}>✓ Valid address</p>
                : null
            }
            <p style={{ fontSize: 11, color: "#444440", marginTop: 6 }}>
              A trusted person both parties agree on — settles disputes if client and freelancer disagree.
            </p>
          </div>

          <div style={{ paddingTop: 8, borderTop: "1px solid #222220", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
            <p style={{ fontSize: 12, color: "#444440", margin: 0 }}>
              Posting as <span style={{ fontFamily: "monospace" }}>{address.slice(0, 6)}…{address.slice(-4)}</span>
            </p>
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: "10px 22px",
                backgroundColor: submitting ? "#a8c700" : "#c9ee00",
                color: "#0a0a0a",
                borderRadius: 6,
                border: "none",
                fontWeight: 700,
                fontSize: 14,
                cursor: submitting ? "not-allowed" : "pointer",
                opacity: submitting ? 0.7 : 1,
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
