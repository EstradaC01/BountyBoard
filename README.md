# BountyBoard

**A crypto escrow & bounty board on Stellar — "Fiverr for freelancers and creators."**

Post a paid bounty, lock the payment in escrow, and release it only when the work is
approved — with a neutral arbiter to settle disputes. All on-chain, settled in seconds for
fractions of a cent.

## Problem

A freelance designer in Lagos takes a $100 logo gig from a client she's never met. She has
no protection: if she delivers and the client ghosts, she eats the loss; if she's paid up
front, the client risks paying for nothing. Traditional escrow services are slow, expensive,
and often unavailable cross-border, so most informal freelance work runs on blind trust.

## Solution

BountyBoard is a Soroban smart contract that holds the client's payment in escrow. The
client posts and funds a bounty in XLM; the freelancer submits work; the client approves to
release the funds. If they disagree, either party raises a dispute and a pre-agreed arbiter
decides whether to pay the freelancer or refund the client. Stellar's fast, near-free
settlement makes small cross-border gigs economical — something card rails and legacy escrow
can't do.

## Stellar features used

- **XLM transfers via the Stellar Asset Contract (SAC)** — escrow deposits and payouts use
  the SEP-41 token interface, so the contract holds and releases real value.
- **Soroban smart contract** — the escrow logic, state machine, and arbiter resolution.
- **On-contract custody** — funds live at the contract address until a valid state transition
  releases them.

## Core feature (MVP) — the transaction flow

A full lifecycle, demoable in under two minutes:

1. `create_bounty` — client posts a bounty (amount, freelancer, arbiter, description).
2. `fund` — client deposits XLM → held by the contract (status `Funded`).
3. `submit_work` — freelancer marks the work delivered (status `Submitted`).
4. `approve` — client approves → XLM released to the freelancer (status `Approved`).

Dispute branch: `dispute` (by client or freelancer) → `resolve_dispute` (by the arbiter) →
funds paid to the freelancer or refunded to the client (status `Resolved`).

| Status | Meaning |
|---|---|
| `Open` | Created, not yet funded (can be `cancel`led) |
| `Funded` | Escrow deposited |
| `Submitted` | Work delivered, awaiting approval |
| `Approved` | Released to freelancer (terminal) |
| `Disputed` | Awaiting arbiter |
| `Resolved` | Arbiter settled — paid or refunded (terminal) |
| `Cancelled` | Cancelled before funding (terminal) |

## Why this wins

It moves real money for real users (freelancers, creators, SMEs) where trust is the bottleneck,
showcases Stellar's speed and near-zero fees on small cross-border payments, and demos a
complete end-to-end escrow flow in one short session.

## Prerequisites

- [Rust](https://www.rust-lang.org/tools/install) (stable) with the `wasm32-unknown-unknown` target
- [Stellar CLI](https://developers.stellar.org/docs/tools/cli) (Soroban) — `stellar` v22+

## Build

```sh
stellar contract build
```

## Test

```sh
cargo test
```

Five tests cover the happy path, an invalid-state edge case, storage state verification, and
both dispute outcomes.

## Deploy to testnet

```sh
# Build the optimized Wasm, then deploy
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/bounty_board.wasm \
  --source <your-account> \
  --network testnet
```

## Sample CLI invocation

Create a bounty (replace the addresses, token, and amount with real values; XLM uses 7
decimals, so `1000000000` = 100 XLM):

```sh
stellar contract invoke \
  --id <CONTRACT_ID> \
  --source <CLIENT_ACCOUNT> \
  --network testnet \
  -- create_bounty \
  --client <CLIENT_ADDRESS> \
  --freelancer <FREELANCER_ADDRESS> \
  --arbiter <ARBITER_ADDRESS> \
  --token <XLM_SAC_ADDRESS> \
  --amount 1000000000 \
  --description "Design a logo"
```

Then `fund`, `submit_work`, and `approve` (or `dispute` / `resolve_dispute`) the returned id.

## License

MIT


## Successful Testnet Transaction
Screenshot of the testnet transaction in the explorer 

TransactionID: Contract CBPSPVYP2U6N6PWU55IRHMYUP3PRKTNIUQRU2BLF37TVFABLEFHRTQ47
<img width="1897" height="795" alt="SmartContractScreenshot" src="https://github.com/user-attachments/assets/5ce44d77-f6d7-4cc1-b728-4320d0b96e67" />
