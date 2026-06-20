"use client";

import { useState } from "react";
import { useWallet } from "@/context/WalletContext";
import { useToast } from "@/context/ToastContext";
import { createBounty } from "@/lib/contract";
import { xlmToStroops } from "@/lib/stellar";

const XLM_TOKEN = "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC";

const TRUSTED_ARBITERS = [
  { label: "Arbiter Alpha", address: "GDT5V7OGJCZYYEK5NALO4BVLBWSWUCN4WDYJZBNNUVWYPPT3MV4LVILJ" },
  { label: "Arbiter Beta",  address: "GDFQM676MVLC2WDNPKMXS7SMSSOJMF5UGADL4526VNTOCNIZISKAGHPH" },
  { label: "Arbiter Gamma", address: "GCJ6Z6QY72FGHM7SJ5P2GG7G45DKWRJOPC36ORQTKHRD5BXWTFYJDMK5" },
  { label: "Arbiter Delta", address: "GBPKL5Q26INSYUJ4UTNLMNIYEND6Z7MH34OJAYCUJ7HBXV2QUHLBBL57" },
];

// Placeholder freelancer -- replaced once apply/accept flow is live on-chain
const PLACEHOLDER_FREELANCER = "GDT5V7OGJCZYYEK5NALO4BVLBWSWUCN4WDYJZBNNUVWYPPT3MV4LVILJ";

interface FieldErrors {
  description?: string;
  amount?: string;
  arbiter?: string;
}

const labelStyle: React.CSSProperties = {
  display: "block", fontSize: 12, fontWeight: 700, color: "#444440",
  marginBottom: 6, letterSpacing: "0.06em", textTransform: "uppercase",
};

const errorStyle: React.CSSProperties = { fontSize: 12, color: "#e53a0d", marginTop: 4 };

interface Props {
  onSuccess: () => void;
  onCancel?: () => void;
}

export default function CreateBountyForm({ onSuccess, onCancel }: Props) {
  const { address, connect } = useWallet();
  const { showToast, dismissToast } = useToast();

  const [form, setForm] = useState({
    description: "",
    amount: "",
    arbiter: TRUSTED_ARBITERS[0].address,
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  function inputStyle(hasError: boolean): React.CSSProperties {
    return {
      width: "100%", padding: "10px 14px", borderRadius: 6,
      border: `1px solid ${hasError ? "#e53a0d" : "#222220"}`,
      fontSize: 14, color: "#ebebdf",
      backgroundColor: hasError ? "#150808" : "#0a0a0a",
      fontFamily: "inherit", outline: "none", boxSizing: "border-box",
    };
  }

  function setField(field: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setForm(f => ({ ...f, [field]: e.target.value }));
      setErrors(prev => ({ ...prev, [field]: undefined }));
    };
  }

  function validate(): boolean {
    const next: FieldErrors = {};
    if (!form.description.trim()) next.description = "Description is required.";
    const amt = parseFloat(form.amount);
    if (!form.amount || isNaN(amt) || amt <= 0) next.amount = "Enter a valid amount greater than 0.";
    if (!form.arbiter) next.arbiter = "Select a trusted arbiter.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!address || !validate()) return;
    setSubmitting(true);
    const toastId = showToast("Creating bounty... Waiting for Freighter.", "loading");
    try {
      await createBounty(address, {
        freelancer: PLACEHOLDER_FREELANCER,
        arbiter: form.arbiter,
        token: XLM_TOKEN,
        amount: xlmToStroops(form.amount),
        description: form.description.trim(),
      });
      dismissToast(toastId);
      showToast("Bounty created! Fund it to open it for applicants.", "success");
      onSuccess();
    } catch (err) {
      dismissToast(toastId);
      showToast(err instanceof Error ? err.message : "Failed to create bounty", "error");
    } finally {
      setSubmitting(false);
    }
  }

  if (!address) {
    return (
      <div style={{ padding: "40px 24px", textAlign: "center" }}>
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
    );
  }

  const selectedArbiter = TRUSTED_ARBITERS.find(a => a.address === form.arbiter);

  return (
    <div style={{ padding: "28px 24px" }}>
      <h2 style={{ fontSize: 20, fontWeight: 800, color: "#ebebdf", margin: "0 0 4px 0", letterSpacing: "-0.03em" }}>
        Post a Bounty
      </h2>
      <p style={{ fontSize: 14, color: "#444440", margin: "0 0 24px 0" }}>
        Describe the work, set the XLM amount, and lock it in escrow. Anyone can apply once it&apos;s live.
      </p>

      <form onSubmit={handleSubmit} noValidate style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        <div>
          <label style={labelStyle}>Description</label>
          <textarea
            rows={3}
            placeholder="e.g. Design a logo for my startup"
            value={form.description}
            onChange={setField("description")}
            style={{ ...inputStyle(!!errors.description), fontFamily: "inherit", resize: "none" }}
          />
          {errors.description && <p style={errorStyle}>{String.fromCharCode(9888)} {errors.description}</p>}
        </div>

        <div>
          <label style={labelStyle}>Amount (XLM)</label>
          <div style={{ position: "relative" }}>
            <input
              type="number" min="0.0000001" step="any" placeholder="e.g. 100"
              value={form.amount} onChange={setField("amount")}
              style={{ ...inputStyle(!!errors.amount), paddingRight: 52 }}
            />
            <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", fontSize: 12, fontWeight: 700, color: "#444440", letterSpacing: "0.05em" }}>
              XLM
            </span>
          </div>
          {errors.amount && <p style={errorStyle}>{String.fromCharCode(9888)} {errors.amount}</p>}
        </div>

        <div>
          <label style={labelStyle}>Trusted Arbiter</label>
          <select
            value={form.arbiter}
            onChange={setField("arbiter")}
            style={{
              ...inputStyle(!!errors.arbiter),
              appearance: "none" as React.CSSProperties["appearance"],
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 14px center",
              paddingRight: 36,
              cursor: "pointer",
            }}
          >
            {TRUSTED_ARBITERS.map(a => (
              <option key={a.address} value={a.address} style={{ backgroundColor: "#0a0a0a" }}>
                {a.label}
              </option>
            ))}
          </select>
          {errors.arbiter && <p style={errorStyle}>{String.fromCharCode(9888)} {errors.arbiter}</p>}
          {selectedArbiter && (
            <p style={{ fontSize: 11, color: "#444440", marginTop: 6, fontFamily: "monospace" }}>
              {selectedArbiter.address.slice(0, 8)}...{selectedArbiter.address.slice(-6)}
            </p>
          )}
          <p style={{ fontSize: 11, color: "#444440", marginTop: 4 }}>
            A neutral third party that resolves disputes between you and the freelancer.
          </p>
        </div>

        <div style={{ paddingTop: 8, borderTop: "1px solid #222220", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <p style={{ fontSize: 12, color: "#444440", margin: 0 }}>
            Posting as <span style={{ fontFamily: "monospace" }}>{address.slice(0, 6)}...{address.slice(-4)}</span>
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                style={{
                  padding: "10px 16px", backgroundColor: "transparent",
                  color: "#888880", borderRadius: 6, border: "1px solid #333330",
                  fontWeight: 600, fontSize: 14, cursor: "pointer", fontFamily: "inherit",
                }}
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: "10px 22px",
                backgroundColor: submitting ? "#a8c700" : "#c9ee00",
                color: "#0a0a0a", borderRadius: 6, border: "none",
                fontWeight: 700, fontSize: 14,
                cursor: submitting ? "not-allowed" : "pointer",
                opacity: submitting ? 0.7 : 1,
              }}
            >
              {submitting ? "Creating..." : "Create Bounty"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
