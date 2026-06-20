#![no_std]
use soroban_sdk::{
    contract, contracterror, contractimpl, contracttype, token, vec, Address, Env, String, Vec,
};

#[contracttype]
#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum Status {
    Open,
    Funded,
    Submitted,
    Approved,
    Disputed,
    Resolved,
    Cancelled,
}

#[contracttype]
#[derive(Clone)]
pub struct Bounty {
    pub id: u64,
    pub client: Address,
    pub freelancer: Address,
    pub arbiter: Address,
    pub token: Address,
    pub amount: i128,
    pub description: String,
    pub status: Status,
    pub work_proof: String,
}

#[contracttype]
pub enum DataKey {
    Counter,
    Bounty(u64),
    /// List of applicant addresses for a bounty.
    Applicants(u64),
}

#[contracterror]
#[derive(Clone, Copy, PartialEq, Eq, Debug)]
#[repr(u32)]
pub enum Error {
    BountyNotFound = 1,
    InvalidStatus = 2,
    AlreadyFunded = 3,
    Unauthorized = 4,
    InvalidAmount = 5,
    AlreadyApplied = 6,
    ApplicantNotFound = 7,
}

#[contract]
pub struct Contract;

#[contractimpl]
impl Contract {
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
            work_proof: String::from_str(&env, ""),
        };
        env.storage().persistent().set(&DataKey::Bounty(id), &bounty);
        Ok(id)
    }

    pub fn fund(env: Env, bounty_id: u64) -> Result<(), Error> {
        let mut bounty = Self::load(&env, bounty_id)?;
        bounty.client.require_auth();
        match bounty.status {
            Status::Open => {}
            Status::Funded => return Err(Error::AlreadyFunded),
            _ => return Err(Error::InvalidStatus),
        }

        token::Client::new(&env, &bounty.token).transfer(
            &bounty.client,
            &env.current_contract_address(),
            &bounty.amount,
        );

        bounty.status = Status::Funded;
        Self::save(&env, &bounty);
        Ok(())
    }

    /// Any address can apply to an open bounty. Only valid while Open or Funded.
    /// Prevents duplicate applications.
    pub fn apply(env: Env, bounty_id: u64, applicant: Address) -> Result<(), Error> {
        applicant.require_auth();
        let bounty = Self::load(&env, bounty_id)?;
        match bounty.status {
            Status::Open | Status::Funded => {}
            _ => return Err(Error::InvalidStatus),
        }

        let mut applicants: Vec<Address> = env
            .storage()
            .persistent()
            .get(&DataKey::Applicants(bounty_id))
            .unwrap_or_else(|| vec![&env]);

        for a in applicants.iter() {
            if a == applicant {
                return Err(Error::AlreadyApplied);
            }
        }
        applicants.push_back(applicant);
        env.storage()
            .persistent()
            .set(&DataKey::Applicants(bounty_id), &applicants);
        Ok(())
    }

    /// Client picks one of the applicants as the freelancer. Only valid while Open or Funded.
    pub fn accept_applicant(env: Env, bounty_id: u64, applicant: Address) -> Result<(), Error> {
        let mut bounty = Self::load(&env, bounty_id)?;
        bounty.client.require_auth();
        match bounty.status {
            Status::Open | Status::Funded => {}
            _ => return Err(Error::InvalidStatus),
        }

        let applicants: Vec<Address> = env
            .storage()
            .persistent()
            .get(&DataKey::Applicants(bounty_id))
            .unwrap_or_else(|| vec![&env]);

        let mut found = false;
        for a in applicants.iter() {
            if a == applicant {
                found = true;
                break;
            }
        }
        if !found {
            return Err(Error::ApplicantNotFound);
        }

        bounty.freelancer = applicant;
        Self::save(&env, &bounty);
        Ok(())
    }

    /// Returns the list of applicants for a bounty.
    pub fn get_applicants(env: Env, bounty_id: u64) -> Vec<Address> {
        env.storage()
            .persistent()
            .get(&DataKey::Applicants(bounty_id))
            .unwrap_or_else(|| vec![&env])
    }

    pub fn submit_work(env: Env, bounty_id: u64, work_proof: String) -> Result<(), Error> {
        let mut bounty = Self::load(&env, bounty_id)?;
        bounty.freelancer.require_auth();
        if bounty.status != Status::Funded {
            return Err(Error::InvalidStatus);
        }
        bounty.work_proof = work_proof;
        bounty.status = Status::Submitted;
        Self::save(&env, &bounty);
        Ok(())
    }

    pub fn approve(env: Env, bounty_id: u64) -> Result<(), Error> {
        let mut bounty = Self::load(&env, bounty_id)?;
        bounty.client.require_auth();
        if bounty.status != Status::Submitted {
            return Err(Error::InvalidStatus);
        }

        token::Client::new(&env, &bounty.token).transfer(
            &env.current_contract_address(),
            &bounty.freelancer,
            &bounty.amount,
        );

        bounty.status = Status::Approved;
        Self::save(&env, &bounty);
        Ok(())
    }

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

    pub fn resolve_dispute(env: Env, bounty_id: u64, pay_freelancer: bool) -> Result<(), Error> {
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

    pub fn get_bounty(env: Env, bounty_id: u64) -> Result<Bounty, Error> {
        Self::load(&env, bounty_id)
    }

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