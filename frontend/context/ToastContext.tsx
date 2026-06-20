"use client";

import { createContext, useContext, useState, useCallback, ReactNode } from "react";

type ToastType = "success" | "error" | "loading";

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type: ToastType, duration?: number) => number;
  dismissToast: (id: number) => void;
}

const ToastContext = createContext<ToastContextType>({
  showToast: () => 0,
  dismissToast: () => {},
});

let nextId = 1;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: ToastType, duration = 4000) => {
    const id = nextId++;
    setToasts((prev) => [...prev, { id, message, type }]);
    if (type !== "loading") {
      setTimeout(() => dismissToast(id), duration);
    }
    return id;
  }, [dismissToast]);

  const icons: Record<ToastType, string> = {
    success: "✓",
    error: "✕",
    loading: "⏳",
  };

  const colors: Record<ToastType, { bg: string; border: string; icon: string; text: string }> = {
    success: { bg: "#141414", border: "#c9ee00",  icon: "#c9ee00",  text: "#ebebdf" },
    error:   { bg: "#141414", border: "#e53a0d",  icon: "#e53a0d",  text: "#ebebdf" },
    loading: { bg: "#141414", border: "#3535d5",  icon: "#3535d5",  text: "#ebebdf" },
  };

  return (
    <ToastContext.Provider value={{ showToast, dismissToast }}>
      {children}

      {/* Toast container */}
      <div style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: 10,
        pointerEvents: "none",
      }}>
        {toasts.map((toast) => {
          const c = colors[toast.type];
          return (
            <div
              key={toast.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                backgroundColor: c.bg,
                border: `1.5px solid ${c.border}`,
                borderRadius: 10,
                padding: "12px 16px",
                minWidth: 260,
                maxWidth: 360,
                boxShadow: "0 4px 24px rgba(0,0,0,0.6)",
                pointerEvents: "all",
                animation: "slideIn 0.2s ease",
              }}
            >
              <span style={{ fontSize: 16, color: c.icon, fontWeight: 700, flexShrink: 0 }}>
                {icons[toast.type]}
              </span>
              <span style={{ fontSize: 13, fontWeight: 500, color: c.text, flex: 1 }}>
                {toast.message}
              </span>
              {toast.type !== "loading" && (
                <button
                  onClick={() => dismissToast(toast.id)}
                  style={{ background: "none", border: "none", cursor: "pointer", color: c.icon, fontSize: 14, padding: 0, lineHeight: 1 }}
                >
                  ✕
                </button>
              )}
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
