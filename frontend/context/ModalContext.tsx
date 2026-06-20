"use client";
import { createContext, useContext, useState, type ReactNode } from "react";

type ModalState =
  | { type: "bounty"; id: number }
  | { type: "create" }
  | null;

interface ModalContextValue {
  modal: ModalState;
  openBounty: (id: number) => void;
  openCreate: () => void;
  close: () => void;
}

const ModalContext = createContext<ModalContextValue | null>(null);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [modal, setModal] = useState<ModalState>(null);
  return (
    <ModalContext.Provider value={{
      modal,
      openBounty: (id) => setModal({ type: "bounty", id }),
      openCreate: () => setModal({ type: "create" }),
      close: () => setModal(null),
    }}>
      {children}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const ctx = useContext(ModalContext);
  if (!ctx) throw new Error("useModal must be used within ModalProvider");
  return ctx;
}
