import {
  isConnected,
  requestAccess,
  getAddress,
  signTransaction,
} from "@stellar/freighter-api";
import * as StellarSdk from "@stellar/stellar-sdk";

const HORIZON_URL = "https://horizon-testnet.stellar.org";

export async function getXlmBalance(address: string): Promise<string | null> {
  try {
    const server = new StellarSdk.Horizon.Server(HORIZON_URL);
    const account = await server.loadAccount(address);
    const native = account.balances.find((b) => b.asset_type === "native");
    if (!native) return null;
    // Format to 2 decimal places
    return parseFloat(native.balance).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  } catch {
    return null;
  }
}

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

export interface ContractEvent {
  txHash: string;
  ledger: number;
  timestamp: string;
  topics: string[];
}

export async function getBountyEvents(bountyId: number): Promise<ContractEvent[]> {
  try {
    const server = new StellarSdk.rpc.Server("https://soroban-testnet.stellar.org");
    const res = await server.getEvents({
      startLedger: 1,
      filters: [
        {
          type: "contract",
          contractIds: [CONTRACT_ID],
        },
      ],
      limit: 100,
    });

    return res.events
      .filter((e) => {
        // Each event's topics contain the bounty id as second element
        try {
          const idVal = e.topic[1];
          return StellarSdk.scValToNative(idVal) === bountyId;
        } catch {
          return false;
        }
      })
      .map((e) => ({
        txHash: e.txHash,
        ledger: e.ledger,
        timestamp: new Date(e.ledgerClosedAt).toLocaleString(),
        topics: e.topic.map((t) => {
          try { return String(StellarSdk.scValToNative(t)); } catch { return "?"; }
        }),
      }));
  } catch {
    return [];
  }
}

export async function signTx(xdr: string): Promise<string> {
  const result = await signTransaction(xdr, {
    networkPassphrase: NETWORK_PASSPHRASE,
  });
  if (result.error) throw new Error(result.error.message);
  return result.signedTxXdr;
}
