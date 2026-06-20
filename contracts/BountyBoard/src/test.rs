#![cfg(test)]

use super::*;
use soroban_sdk::{
    testutils::Address as _,
    token::{StellarAssetClient, TokenClient},
    Address, Env, String,
};

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

    let sac = env.register_stellar_asset_contract_v2(client.clone());
    let token = sac.address();
    StellarAssetClient::new(&env, &token).mint(&client, &STARTING_BALANCE);
    let token_client = TokenClient::new(&env, &token);

    let contract = ContractClient::new(&env, &env.register(Contract, ()));

    Setup { env, client, freelancer, arbiter, token, token_client, contract }
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

/// Test 1 -- Happy path: create -> fund -> submit -> approve releases funds to freelancer.
#[test]
fn happy_path() {
    let s = setup();
    let id = s.create();

    s.contract.fund(&id);
    assert_eq!(s.token_client.balance(&s.contract.address), AMOUNT);
    assert_eq!(s.token_client.balance(&s.client), STARTING_BALANCE - AMOUNT);

    s.contract.submit_work(&id, &String::from_str(&s.env, "https://example.com/my-work"));
    s.contract.approve(&id);

    assert_eq!(s.token_client.balance(&s.freelancer), AMOUNT);
    assert_eq!(s.token_client.balance(&s.contract.address), 0);
}

/// Test 2 -- Edge case: submitting work before the bounty is funded is rejected.
#[test]
fn submit_before_funding_fails() {
    let s = setup();
    let id = s.create();

    let result = s.contract.try_submit_work(&id, &String::from_str(&s.env, "https://example.com/work"));
    assert_eq!(result, Err(Ok(Error::InvalidStatus)));
}

/// Test 3 -- State verification: storage reflects the correct state mid-lifecycle.
#[test]
fn state_after_submit() {
    let s = setup();
    let id = s.create();
    s.contract.fund(&id);
    s.contract.submit_work(&id, &String::from_str(&s.env, "https://example.com/my-work"));

    let bounty = s.contract.get_bounty(&id);
    assert_eq!(bounty.status, Status::Submitted);
    assert_eq!(bounty.amount, AMOUNT);
    assert_eq!(bounty.freelancer, s.freelancer);
    assert_eq!(bounty.client, s.client);
    assert_eq!(bounty.work_proof, String::from_str(&s.env, "https://example.com/my-work"));
}

/// Test 4 -- Dispute resolved in favor of the freelancer pays them out.
#[test]
fn dispute_pays_freelancer() {
    let s = setup();
    let id = s.create();
    s.contract.fund(&id);
    s.contract.submit_work(&id, &String::from_str(&s.env, "https://example.com/my-work"));

    s.contract.dispute(&id, &s.client);
    s.contract.resolve_dispute(&id, &true);

    assert_eq!(s.token_client.balance(&s.freelancer), AMOUNT);
    assert_eq!(s.token_client.balance(&s.contract.address), 0);
    assert_eq!(s.contract.get_bounty(&id).status, Status::Resolved);
}

/// Test 5 -- Dispute resolved against the freelancer refunds the client.
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

/// Test 6 -- apply() adds applicant; accept_applicant() sets freelancer; submit_work() succeeds.
#[test]
fn apply_and_accept() {
    let s = setup();
    let applicant = Address::generate(&s.env);

    // Create with a dummy placeholder freelancer (not the real one yet)
    let id = s.create();
    s.contract.fund(&id);

    // Applicant applies
    s.contract.apply(&id, &applicant);
    let applicants = s.contract.get_applicants(&id);
    assert_eq!(applicants.len(), 1);
    assert_eq!(applicants.get(0).unwrap(), applicant);

    // Duplicate application is rejected
    let dup = s.contract.try_apply(&id, &applicant);
    assert_eq!(dup, Err(Ok(Error::AlreadyApplied)));

    // Client accepts the applicant
    s.contract.accept_applicant(&id, &applicant);
    assert_eq!(s.contract.get_bounty(&id).freelancer, applicant);

    // Accepted freelancer can now submit work
    s.contract.submit_work(&id, &String::from_str(&s.env, "https://example.com/work"));
    s.contract.approve(&id);
    assert_eq!(s.token_client.balance(&applicant), AMOUNT);
}

/// Test 7 -- accept_applicant() rejects someone who never applied.
#[test]
fn accept_non_applicant_fails() {
    let s = setup();
    let id = s.create();
    let stranger = Address::generate(&s.env);

    let result = s.contract.try_accept_applicant(&id, &stranger);
    assert_eq!(result, Err(Ok(Error::ApplicantNotFound)));
}