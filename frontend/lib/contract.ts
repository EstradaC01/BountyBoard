import * as StellarSdk from "@stellar/stellar-sdk";
import { CONTRACT_ID, NETWORK_PASSPHRASE, signTx } from "./stellar";
import type { Bounty, BountyStatus, DisputeOutcome } from "@/types/bounty";

const RPC_URL = "https://soroban-testnet.stellar.org";

function getServer() {
  return new StellarSdk.rpc.Server(RPC_URL);
}

function getContract() {
  return new StellarSdk.Contract(CONTRACT_ID);
}

function scValToStatus(val: StellarSdk.xdr.ScVal): BountyStatus {
  const map: Record<string, BountyStatus> = {
    Open: "Open",
    Funded: "Funded",
    Submitted: "Submitted",
    Approved: "Approved",
    Disputed: "Disputed",
    Resolved: "Resolved",
    Cancelled: "Cancelled",
  };
  // Soroban enums are ScvVec with the variant name as first element sym
  const vec = val.vec();
  if (vec && vec.length > 0) {
    const sym = vec[0].sym();
    if (sym) {
      const key = Buffer.isBuffer(sym) ? sym.toString() : String(sym);
      return map[key] ?? "Open";
    }
  }
  return "Open";
}

function scValToBounty(id: number, val: StellarSdk.xdr.ScVal): Bounty {
  const entries = val.map() ?? [];
  const lookup = new Map<string, StellarSdk.xdr.ScVal>();
  for (const entry of entries) {
    const rawKey = entry.key().sym();
    const key = Buffer.isBuffer(rawKey) ? rawKey.toString() : String(rawKey);
    lookup.set(key, entry.val());
  }

  const amount128 = lookup.get("amount")!.i128();
  const lo = BigInt(amount128.lo().toString());
  const hi = BigInt(amount128.hi().toString());
  const amount = (hi << 64n) | lo;

  return {
    id,
    client: StellarSdk.Address.fromScVal(lookup.get("client")!).toString(),
    freelancer: StellarSdk.Address.fromScVal(lookup.get("freelancer")!).toString(),
    arbiter: StellarSdk.Address.fromScVal(lookup.get("arbiter")!).toString(),
    token: StellarSdk.Address.fromScVal(lookup.get("token")!).toString(),
    amount,
    description: lookup.get("description")!.str().toString(),
    status: scValToStatus(lookup.get("status")!),
    workProof: lookup.get("work_proof")?.str().toString() ?? "",
  };
}

async function buildAndSubmit(
  source: string,
  method: string,
  args: StellarSdk.xdr.ScVal[]
): Promise<void> {
  const server = getServer();
  const contract = getContract();

  const account = await server.getAccount(source);
  const tx = new StellarSdk.TransactionBuilder(account, {
    fee: "100",
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(contract.call(method, ...args))
    .setTimeout(30)
    .build();

  const prepared = await server.prepareTransaction(tx);
  const signed = await signTx(prepared.toXDR());
  const signedTx = StellarSdk.TransactionBuilder.fromXDR(signed, NETWORK_PASSPHRASE);
  const result = await server.sendTransaction(signedTx);

  if (result.status === "ERROR") {
    throw new Error("Transaction rejected by network");
  }

  let attempts = 0;
  while (attempts < 20) {
    await new Promise((r) => setTimeout(r, 1500));
    const status = await server.getTransaction(result.hash);
    if (status.status === StellarSdk.rpc.Api.GetTransactionStatus.SUCCESS) return;
    if (status.status === StellarSdk.rpc.Api.GetTransactionStatus.FAILED) {
      throw new Error("Transaction failed on-chain");
    }
    attempts++;
  }
  throw new Error("Transaction confirmation timeout");
}

// Throwaway public key used only as a source account for read-only simulations (never signs)
const SIMULATION_SOURCE = "GAXVCDHVHV5CMED2Y5J6EDMZGIBECZNP4YP323HKGRK2EMBINHFUOYCA";

function getDummyAccount() {
  return new StellarSdk.Account(SIMULATION_SOURCE, "0");
}

export async function getBounty(id: number): Promise<Bounty | null> {
  try {
    const server = getServer();
    const contract = getContract();

    const tx = new StellarSdk.TransactionBuilder(getDummyAccount(), {
      fee: "100",
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(contract.call("get_bounty", StellarSdk.nativeToScVal(id, { type: "u64" })))
      .setTimeout(30)
      .build();

    const result = await server.simulateTransaction(tx);

    if ("error" in result) return null;
    const retval = (result as StellarSdk.rpc.Api.SimulateTransactionSuccessResponse).result?.retval;
    if (!retval) return null;
    return scValToBounty(id, retval);
  } catch {
    return null;
  }
}

export async function getAllBounties(): Promise<Bounty[]> {
  const bounties: Bounty[] = [];
  let id = 0;
  while (true) {
    const b = await getBounty(id);
    if (!b) break;
    bounties.push(b);
    id++;
  }
  return bounties;
}

export async function createBounty(
  source: string,
  params: {
    freelancer: string;
    arbiter: string;
    token: string;
    amount: bigint;
    description: string;
  }
): Promise<void> {
  await buildAndSubmit(source, "create_bounty", [
    StellarSdk.Address.fromString(source).toScVal(),
    StellarSdk.Address.fromString(params.freelancer).toScVal(),
    StellarSdk.Address.fromString(params.arbiter).toScVal(),
    StellarSdk.Address.fromString(params.token).toScVal(),
    StellarSdk.nativeToScVal(params.amount, { type: "i128" }),
    StellarSdk.nativeToScVal(params.description, { type: "string" }),
  ]);
}

export async function fundBounty(source: string, id: number): Promise<void> {
  await buildAndSubmit(source, "fund", [StellarSdk.nativeToScVal(id, { type: "u64" })]);
}

export async function submitWork(source: string, id: number, workProof: string): Promise<void> {
  await buildAndSubmit(source, "submit_work", [
    StellarSdk.nativeToScVal(id, { type: "u64" }),
    StellarSdk.nativeToScVal(workProof, { type: "string" }),
  ]);
}

export async function approveBounty(source: string, id: number): Promise<void> {
  await buildAndSubmit(source, "approve", [StellarSdk.nativeToScVal(id, { type: "u64" })]);
}

export async function disputeBounty(source: string, id: number): Promise<void> {
  // Contract signature: dispute(env, bounty_id, caller)
  await buildAndSubmit(source, "dispute", [
    StellarSdk.nativeToScVal(id, { type: "u64" }),
    StellarSdk.Address.fromString(source).toScVal(),
  ]);
}

export async function resolveDispute(
  source: string,
  id: number,
  outcome: DisputeOutcome
): Promise<void> {
  // Contract signature: resolve_dispute(env, bounty_id, pay_freelancer: bool)
  const payFreelancer = outcome === "PayFreelancer";
  await buildAndSubmit(source, "resolve_dispute", [
    StellarSdk.nativeToScVal(id, { type: "u64" }),
    StellarSdk.xdr.ScVal.scvBool(payFreelancer),
  ]);
}

export async function cancelBounty(source: string, id: number): Promise<void> {
  await buildAndSubmit(source, "cancel", [StellarSdk.nativeToScVal(id, { type: "u64" })]);
}
export async function applyToBounty(source: string, id: number): Promise<void> {
  await buildAndSubmit(source, "apply", [
    StellarSdk.nativeToScVal(id, { type: "u64" }),
    StellarSdk.Address.fromString(source).toScVal(),
  ]);
}

export async function acceptApplicant(source: string, id: number, applicant: string): Promise<void> {
  await buildAndSubmit(source, "accept_applicant", [
    StellarSdk.nativeToScVal(id, { type: "u64" }),
    StellarSdk.Address.fromString(applicant).toScVal(),
  ]);
}

export async function getApplicants(id: number): Promise<string[]> {
  try {
    const server = getServer();
    const contract = getContract();
    const tx = new StellarSdk.TransactionBuilder(getDummyAccount(), {
      fee: "100",
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(contract.call("get_applicants", StellarSdk.nativeToScVal(id, { type: "u64" })))
      .setTimeout(30)
      .build();
    const result = await server.simulateTransaction(tx);
    if ("error" in result) return [];
    const retval = (result as StellarSdk.rpc.Api.SimulateTransactionSuccessResponse).result?.retval;
    if (!retval) return [];
    const vec = retval.vec() ?? [];
    return vec.map((v) => StellarSdk.Address.fromScVal(v).toString());
  } catch {
    return [];
  }
}