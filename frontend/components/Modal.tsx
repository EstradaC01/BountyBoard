"use client";
import { useEffect } from "react";

interface ModalProps {
  children: React.ReactNode;
  onClose: () => void;
  maxWidth?: number;
}

export default function Modal({ children, onClose, maxWidth = 760 }: ModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      zIndex: 300,
      overflowY: "auto",
      padding: "40px 16px",
      display: "flex",
      justifyContent: "center",
      alignItems: "flex-start",
    }}>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0,0,0,0.8)",
          backdropFilter: "blur(4px)",
        }}
      />
      {/* Panel */}
      <div style={{
        position: "relative",
        zIndex: 1,
        width: "100%",
        maxWidth,
        backgroundColor: "#0a0a0a",
        borderRadius: 12,
        border: "1px solid #333330",
        boxShadow: "0 32px 80px rgba(0,0,0,0.7)",
        animation: "modalIn 0.18s ease",
      }}>
        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            width: 30,
            height: 30,
            borderRadius: 6,
            border: "1px solid #333330",
            backgroundColor: "#141414",
            color: "#888880",
            fontSize: 14,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2,
            flexShrink: 0,
          }}
        >
          ✕
        </button>
        {children}
      </div>

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: translateY(16px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  );
}
