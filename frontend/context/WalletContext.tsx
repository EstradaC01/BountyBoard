"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { isConnected, getAddress, requestAccess } from "@stellar/freighter-api";

interface WalletContextType {
  address: string | null;
  connecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextType>({
  address: null,
  connecting: false,
  connect: async () => {},
  disconnect: () => {},
});

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    isConnected()
      .then(async (connected) => {
        if (!connected) return;
        const result = await getAddress();
        if (result.address) setAddress(result.address);
      })
      .catch(() => {});
  }, []);

  async function connect() {
    setConnecting(true);
    try {
      const result = await requestAccess();
      if (result.error) {
        alert("Freighter not found. Please install the Freighter browser extension.");
        return;
      }
      setAddress(result.address);
    } catch {
      alert("Freighter not found. Please install the Freighter browser extension.");
    } finally {
      setConnecting(false);
    }
  }

  function disconnect() {
    setAddress(null);
  }

  return (
    <WalletContext.Provider value={{ address, connecting, connect, disconnect }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  return useContext(WalletContext);
}
