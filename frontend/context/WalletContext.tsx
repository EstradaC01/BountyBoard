"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { isConnected, getAddress, requestAccess, WatchWalletChanges } from "@stellar/freighter-api";
import { getXlmBalance } from "@/lib/stellar";

interface WalletContextType {
  address: string | null;
  balance: string | null;
  connecting: boolean;
  switching: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  switchWallet: () => void;
  refreshBalance: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType>({
  address: null,
  balance: null,
  connecting: false,
  switching: false,
  connect: async () => {},
  disconnect: () => {},
  switchWallet: () => {},
  refreshBalance: async () => {},
});

export function WalletProvider({ children }: { children: ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [switching, setSwitching] = useState(false);

  async function fetchBalance(addr: string) {
    const bal = await getXlmBalance(addr);
    setBalance(bal);
  }

  // Auto-connect on mount if already permitted
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

  // Watch for account changes made inside the Freighter extension
  useEffect(() => {
    const watcher = new WatchWalletChanges(1500);
    watcher.watch((data) => {
      if (data.error || !data.address) return;
      setAddress((prev) => {
        if (prev !== data.address) {
          setSwitching(false);
          fetchBalance(data.address);
        }
        return data.address;
      });
    });
    return () => watcher.stop();
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
    setSwitching(false);
  }

  // Clears local state and waits — WatchWalletChanges will pick up the new account
  // when the user switches inside the Freighter extension popup.
  function switchWallet() {
    setAddress(null);
    setBalance(null);
    setSwitching(true);
  }

  async function refreshBalance() {
    if (address) await fetchBalance(address);
  }

  return (
    <WalletContext.Provider value={{ address, balance, connecting, switching, connect, disconnect, switchWallet, refreshBalance }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  return useContext(WalletContext);
}
