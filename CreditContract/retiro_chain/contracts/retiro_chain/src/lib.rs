#![no_std]
use soroban_sdk::{contract, contractimpl, symbol_short, Env, Symbol};
const BALANCE: Symbol = symbol_short!("BALANCE");
const RETIRO: Symbol = symbol_short!("RETIRO");
const OWNER: Symbol = symbol_short!("OWNER");

#[contract]
pub struct RetiroChain;

#[contractimpl]
impl RetiroChain {
    // Inicializa el contrato con el dueño y años al retiro
    pub fn inicializar(env: Env, owner: Symbol, anos: u64) {
        env.storage().instance().set(&OWNER, &owner);
        env.storage().instance().set(&BALANCE, &0u64);

        let ahora = env.ledger().timestamp();
        let segundos_por_ano: u64 = 365 * 24 * 60 * 60;
        let fecha_retiro = ahora + (anos * segundos_por_ano);
        env.storage().instance().set(&RETIRO, &fecha_retiro);
    }

    // Deposita y acumula el balance
    pub fn depositar(env: Env, amount: u64) -> u64 {
        let balance: u64 = env.storage().instance().get(&BALANCE).unwrap_or(0);
        let nuevo_balance = balance + amount;
        env.storage().instance().set(&BALANCE, &nuevo_balance);
        nuevo_balance
    }

    // Regresa el balance actual bloqueado
    pub fn ver_balance(env: Env) -> u64 {
        env.storage().instance().get(&BALANCE).unwrap_or(0)
    }

    // Regresa la fecha unix de retiro
    pub fn ver_retiro(env: Env) -> u64 {
        env.storage().instance().get(&RETIRO).unwrap_or(0)
    }

    // Regresa si ya se puede retirar
    pub fn puede_retirar(env: Env) -> bool {
        let ahora = env.ledger().timestamp();
        let fecha: u64 = env.storage().instance().get(&RETIRO).unwrap_or(0);
        ahora >= fecha
    }
}

mod test;
