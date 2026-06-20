"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { isConnected, getAddress, requestAccess } from "@stellar/freighter-api";
import { getXlmBalance } from "@/lib/stellar";

interface WalletContextType {
  address: string | null;
  balance: string | null;
  connecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  refreshBalance: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType>({
  address: null,
  balance: null,
  connecting: false,
  connect: async () => {},
  disconnect: () => {},
  refreshBalance: async () => {},
});

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);

  async function fetchBalance(addr: string) {
    const bal = await getXlmBalance(addr);
    setBalance(bal);
  }

  useEffect(() => {
    isConnected()
      .then(async (connected) => {
        if (!connected) return;
        const result = await getAddress();
        if (result.address) {
          setAddress(result.address);
          fetchBalance(result.address);
        }
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
      fetchBalance(result.address);
    } catch {
      alert("Freighter not found. Please install the Freighter browser extension.");
    } finally {
      setConnecting(false);
    }
  }

  function disconnect() {
    setAddress(null);
    setBalance(null);
  }

  async function refreshBalance() {
    if (address) await fetchBalance(address);
  }

  return (
    <WalletContext.Provider value={{ address, balance, connecting, connect, disconnect, refreshBalance }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  return useContext(WalletContext);
}
