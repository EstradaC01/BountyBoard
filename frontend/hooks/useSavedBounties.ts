"use client";

import { useState, useEffect, useCallback } from "react";

function storageKey(address: string) {
  return `bountyboard:saved:${address}`;
}

function readFromStorage(address: string): Set<number> {
  try {
    const raw = localStorage.getItem(storageKey(address));
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as number[]);
  } catch {
    return new Set();
  }
}

function writeToStorage(address: string, saved: Set<number>) {
  localStorage.setItem(storageKey(address), JSON.stringify([...saved]));
}

export function useSavedBounties(address: string | null) {
  const [saved, setSaved] = useState<Set<number>>(new Set());

  // Reload saved set whenever the wallet changes
  useEffect(() => {
    if (!address) { setSaved(new Set()); return; }
    setSaved(readFromStorage(address));
  }, [address]);

  const toggle = useCallback((id: number) => {
    if (!address) return;
    setSaved((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      writeToStorage(address, next);
      return next;
    });
  }, [address]);

  const isSaved = useCallback((id: number) => saved.has(id), [saved]);

  return { saved, toggle, isSaved };
}
