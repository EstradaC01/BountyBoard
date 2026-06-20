#![no_std]
//! BountyBoard — a crypto escrow / bounty board on Stellar ("Fiverr for freelancers").
//!
//! A *client* posts a paid bounty and funds it with XLM, which the contract holds in
//! escrow. The *freelancer* submits work; on the client's approval the escrowed funds are
//! released to the freelancer. If the two disagree, either party can raise a dispute and a
//! neutral *arbiter* (chosen at creation time) decides whether to pay the freelancer or
//! refund the client.
//!
//! Funds are moved with the Stellar Asset Contract (SAC) token interface, so the same
//! contract works with native XLM or any other Stellar asset address.

use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, token, Address, Env, String,
};

/// Lifecycle of a single bounty. The contract enforces the allowed transitions:
/// Open -> Funded -> Submitted -> Approved, with Disputed/Resolved and Cancelled branches.
#[contracttype]
#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum Status {
    /// Created but not yet funded.
    Open,
    /// Client has deposited the escrow amount.
    Funded,
    /// Freelancer has marked the work as delivered.
    Submitted,
    /// Client approved; funds released to the freelancer (terminal).
    Approved,
    /// A party raised a dispute; awaiting the arbiter.
    Disputed,
    /// Arbiter settled the dispute; funds paid out or refunded (terminal).
    Resolved,
    /// Cancelled before funding (terminal).
    Cancelled,
}

/// A single escrow agreement between a client and a freelancer.
#[contracttype]
#[derive(Clone)]
pub struct Bounty {
    pub id: u64,
    pub client: Address,
    pub freelancer: Address,
    pub arbiter: Address,
    /// Token (asset) used for payment, e.g. the native XLM SAC address.
    pub token: Address,
    pub amount: i128,
    pub description: String,
    pub status: Status,
}

/// Storage keys.
#[contracttype]
pub enum DataKey {
    /// Monotonic counter for the next bounty id (instance storage).
    Counter,
    /// A bounty keyed by its id (persistent storage).
    Bounty(u64),
}

/// Contract errors. Returned (not panicked) so callers — and tests via `try_*` — can
/// distinguish failure reasons cleanly.
#[contracterror]
#[derive(Clone, Copy, PartialEq, Eq, Debug)]
#[repr(u32)]
pub enum Error {
    BountyNotFound = 1,
    InvalidStatus = 2,
    AlreadyFunded = 3,
    Unauthorized = 4,
    InvalidAmount = 5,
}

#[contract]
pub struct Contract;

#[contractimpl]
impl Contract {
    /// Client posts a new bounty. No money moves yet — call `fund` next.
    /// Requires the client's authorization and a positive amount.
    pub fn create_bounty(
        env: Env,
        client: Address,
        freelancer: Address,
        arbiter: Address,
        token: Address,
        amount: i128,
        description: String,
    ) -> Result<u64, Error> {
        client.require_auth();
        if amount <= 0 {
            return Err(Error::InvalidAmount);
        }

        // Allocate the next id from the instance counter.
        let id: u64 = env
            .storage()
            .instance()
            .get(&DataKey::Counter)
            .unwrap_or(0u64);
        env.storage().instance().set(&DataKey::Counter, &(id + 1));

        let bounty = Bounty {
            id,
            client,
            freelancer,
            arbiter,
            token,
            amount,
            description,
            status: Status::Open,
        };
        env.storage().persistent().set(&DataKey::Bounty(id), &bounty);
        Ok(id)
    }

    /// Client deposits the escrow amount into the contract. Only valid while `Open`.
    /// The token transfer requires the client's auth (handled inside the token contract).
    pub fn fund(env: Env, bounty_id: u64) -> Result<(), Error> {
        let mut bounty = Self::load(&env, bounty_id)?;
        bounty.client.require_auth();
        match bounty.status {
            Status::Open => {}
            Status::Funded => return Err(Error::AlreadyFunded),
            _ => return Err(Error::InvalidStatus),
        }

        // Move funds from the client into the contract's own custody balance.
        token::Client::new(&env, &bounty.token).transfer(
            &bounty.client,
            &env.current_contract_address(),
            &bounty.amount,
        );

        bounty.status = Status::Funded;
        Self::save(&env, &bounty);
        Ok(())
    }

    /// Freelancer signals the work is delivered. Only valid while `Funded`.
    pub fn submit_work(env: Env, bounty_id: u64) -> Result<(), Error> {
        let mut bounty = Self::load(&env, bounty_id)?;
        bounty.freelancer.require_auth();
        if bounty.status != Status::Funded {
            return Err(Error::InvalidStatus);
        }
        bounty.status = Status::Submitted;
        Self::save(&env, &bounty);
        Ok(())
    }

    /// Client approves the submitted work, releasing escrow to the freelancer.
    /// Only valid while `Submitted`.
    pub fn approve(env: Env, bounty_id: u64) -> Result<(), Error> {
        let mut bounty = Self::load(&env, bounty_id)?;
        bounty.client.require_auth();
        if bounty.status != Status::Submitted {
            return Err(Error::InvalidStatus);
        }

        // Pay out from the contract's custody balance to the freelancer.
        token::Client::new(&env, &bounty.token).transfer(
            &env.current_contract_address(),
            &bounty.freelancer,
            &bounty.amount,
        );

        bounty.status = Status::Approved;
        Self::save(&env, &bounty);
        Ok(())
    }

    /// Either the client or the freelancer raises a dispute, freezing the bounty until the
    /// arbiter resolves it. Only valid while `Funded` or `Submitted`.
    pub fn dispute(env: Env, bounty_id: u64, caller: Address) -> Result<(), Error> {
        let mut bounty = Self::load(&env, bounty_id)?;
        caller.require_auth();
        if caller != bounty.client && caller != bounty.freelancer {
            return Err(Error::Unauthorized);
        }
        match bounty.status {
            Status::Funded | Status::Submitted => {}
            _ => return Err(Error::InvalidStatus),
        }
        bounty.status = Status::Disputed;
        Self::save(&env, &bounty);
        Ok(())
    }

    /// Arbiter settles a dispute: pay the freelancer (`pay_freelancer = true`) or refund the
    /// client (`false`). Only valid while `Disputed`.
    pub fn resolve_dispute(
        env: Env,
        bounty_id: u64,
        pay_freelancer: bool,
    ) -> Result<(), Error> {
        let mut bounty = Self::load(&env, bounty_id)?;
        bounty.arbiter.require_auth();
        if bounty.status != Status::Disputed {
            return Err(Error::InvalidStatus);
        }

        let recipient = if pay_freelancer {
            bounty.freelancer.clone()
        } else {
            bounty.client.clone()
        };
        token::Client::new(&env, &bounty.token).transfer(
            &env.current_contract_address(),
            &recipient,
            &bounty.amount,
        );

        bounty.status = Status::Resolved;
        Self::save(&env, &bounty);
        Ok(())
    }

    /// Client cancels a bounty that was never funded. Only valid while `Open`.
    pub fn cancel(env: Env, bounty_id: u64) -> Result<(), Error> {
        let mut bounty = Self::load(&env, bounty_id)?;
        bounty.client.require_auth();
        if bounty.status != Status::Open {
            return Err(Error::InvalidStatus);
        }
        bounty.status = Status::Cancelled;
        Self::save(&env, &bounty);
        Ok(())
    }

    /// Read a bounty by id.
    pub fn get_bounty(env: Env, bounty_id: u64) -> Result<Bounty, Error> {
        Self::load(&env, bounty_id)
    }

    // --- internal helpers ---

    fn load(env: &Env, bounty_id: u64) -> Result<Bounty, Error> {
        env.storage()
            .persistent()
            .get(&DataKey::Bounty(bounty_id))
            .ok_or(Error::BountyNotFound)
    }

    fn save(env: &Env, bounty: &Bounty) {
        env.storage()
            .persistent()
            .set(&DataKey::Bounty(bounty.id), bounty);
    }
}

mod test;
