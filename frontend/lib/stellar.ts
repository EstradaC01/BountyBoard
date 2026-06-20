import {
  isConnected,
  requestAccess,
  getAddress,
  signTransaction,
} from "@stellar/freighter-api";

export const NETWORK = "TESTNET";
export const NETWORK_PASSPHRASE = "Test SDF Network ; September 2015";
export const CONTRACT_ID = "CBPSPVYP2U6N6PWU55IRHMYUP3PRKTNIUQRU2BLF37TVFABLEFHRTQ47";
export const STROOPS_PER_XLM = 10_000_000n;

export function stroopsToXlm(stroops: bigint): string {
  const whole = stroops / STROOPS_PER_XLM;
  const frac = stroops % STROOPS_PER_XLM;
  if (frac === 0n) return whole.toString();
  return `${whole}.${frac.toString().padStart(7, "0").replace(/0+$/, "")}`;
}

export function xlmToStroops(xlm: string): bigint {
  const [whole, frac = ""] = xlm.split(".");
  const fracPadded = frac.padEnd(7, "0").slice(0, 7);
  return BigInt(whole) * STROOPS_PER_XLM + BigInt(fracPadded);
}

export async function getWalletAddress(): Promise<string | null> {
  try {
    const connected = await isConnected();
    if (!connected) return null;
    const result = await getAddress();
    return result.address ?? null;
  } catch {
    return null;
  }
}

export async function connectWallet(): Promise<string | null> {
  try {
    const result = await requestAccess();
    return result.address ?? null;
  } catch {
    return null;
  }
}

export async function signTx(xdr: string): Promise<string> {
  const result = await signTransaction(xdr, {
    networkPassphrase: NETWORK_PASSPHRASE,
  });
  if (result.error) throw new Error(result.error.message);
  return result.signedTxXdr;
}
