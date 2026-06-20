#![cfg(test)]

use super::*;
use soroban_sdk::{
    testutils::Address as _,
    token::{StellarAssetClient, TokenClient},
    Address, Env, String,
};

/// Shared test fixture. Not a `#[test]`, so the file keeps exactly 5 tests.
struct Setup<'a> {
    env: Env,
    client: Address,
    freelancer: Address,
    arbiter: Address,
    token: Address,
    token_client: TokenClient<'a>,
    contract: ContractClient<'a>,
}

const STARTING_BALANCE: i128 = 1000;
const AMOUNT: i128 = 100;

fn setup<'a>() -> Setup<'a> {
    let env = Env::default();
    env.mock_all_auths();

    let client = Address::generate(&env);
    let freelancer = Address::generate(&env);
    let arbiter = Address::generate(&env);

    // Register a Stellar Asset Contract (stand-in for native XLM) and mint to the client.
    let sac = env.register_stellar_asset_contract_v2(client.clone());
    let token = sac.address();
    StellarAssetClient::new(&env, &token).mint(&client, &STARTING_BALANCE);
    let token_client = TokenClient::new(&env, &token);

    let contract = ContractClient::new(&env, &env.register(Contract, ()));

    Setup {
        env,
        client,
        freelancer,
        arbiter,
        token,
        token_client,
        contract,
    }
}

impl<'a> Setup<'a> {
    fn create(&self) -> u64 {
        self.contract.create_bounty(
            &self.client,
            &self.freelancer,
            &self.arbiter,
            &self.token,
            &AMOUNT,
            &String::from_str(&self.env, "Design a logo"),
        )
    }
}

/// Test 1 — Happy path: create -> fund -> submit -> approve releases funds to freelancer.
#[test]
fn happy_path() {
    let s = setup();
    let id = s.create();

    s.contract.fund(&id);
    assert_eq!(s.token_client.balance(&s.contract.address), AMOUNT);
    assert_eq!(s.token_client.balance(&s.client), STARTING_BALANCE - AMOUNT);

    s.contract.submit_work(&id);
    s.contract.approve(&id);

    assert_eq!(s.token_client.balance(&s.freelancer), AMOUNT);
    assert_eq!(s.token_client.balance(&s.contract.address), 0);
}

/// Test 2 — Edge case: submitting work before the bounty is funded is rejected.
#[test]
fn submit_before_funding_fails() {
    let s = setup();
    let id = s.create();

    let result = s.contract.try_submit_work(&id);
    assert_eq!(result, Err(Ok(Error::InvalidStatus)));
}

/// Test 3 — State verification: storage reflects the correct state mid-lifecycle.
#[test]
fn state_after_submit() {
    let s = setup();
    let id = s.create();
    s.contract.fund(&id);
    s.contract.submit_work(&id);

    let bounty = s.contract.get_bounty(&id);
    assert_eq!(bounty.status, Status::Submitted);
    assert_eq!(bounty.amount, AMOUNT);
    assert_eq!(bounty.freelancer, s.freelancer);
    assert_eq!(bounty.client, s.client);
}

/// Test 4 — Dispute resolved in favor of the freelancer pays them out.
#[test]
fn dispute_pays_freelancer() {
    let s = setup();
    let id = s.create();
    s.contract.fund(&id);
    s.contract.submit_work(&id);

    s.contract.dispute(&id, &s.client);
    s.contract.resolve_dispute(&id, &true);

    assert_eq!(s.token_client.balance(&s.freelancer), AMOUNT);
    assert_eq!(s.token_client.balance(&s.contract.address), 0);
    assert_eq!(s.contract.get_bounty(&id).status, Status::Resolved);
}

/// Test 5 — Dispute resolved against the freelancer refunds the client.
#[test]
fn dispute_refunds_client() {
    let s = setup();
    let id = s.create();
    s.contract.fund(&id);

    s.contract.dispute(&id, &s.freelancer);
    s.contract.resolve_dispute(&id, &false);

    assert_eq!(s.token_client.balance(&s.client), STARTING_BALANCE);
    assert_eq!(s.token_client.balance(&s.contract.address), 0);
    assert_eq!(s.contract.get_bounty(&id).status, Status::Resolved);
}
