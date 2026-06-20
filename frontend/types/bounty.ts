export type BountyStatus =
  | "Open"
  | "Funded"
  | "Submitted"
  | "Approved"
  | "Disputed"
  | "Resolved"
  | "Cancelled";

export interface Bounty {
  id: number;
  client: string;
  freelancer: string;
  arbiter: string;
  token: string;
  amount: bigint;
  description: string;
  status: BountyStatus;
}

export type DisputeOutcome = "PayFreelancer" | "RefundClient";
