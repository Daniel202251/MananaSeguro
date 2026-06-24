# Score Contract (`contracts/score`)

This README documents the **score** contract (the retirement savings contract with deposit, withdrawal, and emergency auto-loan logic), not the older Soroban scaffold under `retiro_chain`.

## Overview

The score contract implements a locked retirement savings model in USDC on Soroban:

- Users deposit USDC into locked savings.
- Funds are withdrawable only when the lock period is reached **or** the target goal (`Meta`) is reached.
- Withdrawals charge a 1% platform fee sent to admin.
- Users can request one emergency auto-loan against savings (up to 30%), then repay monthly with interest.

## Units and Business Rules

- **Token amount unit:** stroops (`1 USDC = 10_000_000 stroops`).
- **Percent/fee unit:** basis points where used (`10_000 bps = 100%`).

Business constants in code:

- Minimum deposit: `2_000_000` stroops (`$2` USDC).
- Platform fee on withdrawal: `100` bps (`1%`).
- Max emergency loan: `30%` of locked balance.
- Loan monthly interest: `50` bps (`0.5%` per month).
- Max loan term: `24` months.

## Entrypoints

| Entrypoint | Parameters | What it does | Panics / asserts |
|---|---|---|---|
| `inicializar` | `env: Env`, `admin: Address`, `usdc_token: Address` | Sets admin and USDC token addresses in instance storage. | Requires `admin.require_auth()`. |
| `depositar` | `env: Env`, `usuario: Address`, `monto: i128`, `anios_bloqueo: u32` | Authenticates user, transfers USDC from user to contract, updates locked balance + deposit counter, sets first lock date and default goal (`10x` first deposit), emits `deposito`. | Panics if `monto < $2` equivalent, or lock years not in `1..=40`. Also panics if USDC token is not initialized (`unwrap`) or token transfer fails. |
| `ver_balance` | `env: Env`, `usuario: Address` | Returns locked balance in stroops. | No explicit panic (returns `0` if missing). |
| `ver_retiro` | `env: Env`, `usuario: Address` | Returns withdrawal timestamp (`unix u64`). | No explicit panic (returns `0` if missing). |
| `ver_meta` | `env: Env`, `usuario: Address` | Returns goal amount in stroops. | No explicit panic (returns `0` if missing). |
| `ver_depositos` | `env: Env`, `usuario: Address` | Returns number of deposits. | No explicit panic (returns `0` if missing). |
| `retirar` | `env: Env`, `usuario: Address` | Allows withdrawal when time lock or goal condition is satisfied, charges 1% fee to admin, transfers net to user, clears user savings state, emits `retiro`. | Panics if no locked balance, if neither time nor goal condition is met, or if active loan exists. Also panics if admin/token config is missing (`unwrap`) or token transfer fails. |
| `solicitar_prestamo` | `env: Env`, `usuario: Address`, `monto: i128` | Creates emergency auto-loan, stores principal + month counter, transfers loan amount to user, emits `prestamo`. | Panics if no locked balance, if active loan already exists, if requested amount exceeds 30% of balance, or if amount `< 1 USDC`. Also panics if token config is missing (`unwrap`) or token transfer fails. |
| `pagar_prestamo` | `env: Env`, `usuario: Address` | Charges one monthly payment (`capital + monthly interest`), sends interest to admin, updates/clears loan state, emits `pago_prestamo`. | Panics if no active loan or months already reached max term. Also panics if admin/token config is missing (`unwrap`) or token transfer fails. |
| `ver_prestamo` | `env: Env`, `usuario: Address` | Returns `(loan_balance_stroops, months_paid)`. | No explicit panic (returns `(0, 0)` if missing). |
| `actualizar_meta` | `env: Env`, `usuario: Address`, `nueva_meta: i128` | Lets user set a custom retirement goal in stroops. | Panics if `nueva_meta <= 0`. |

## Storage Model

`DataKey` variants used by the contract:

- `Balance(Address)`: user locked savings balance in **stroops**.
- `DepositCount(Address)`: number of user deposits (`u32` counter).
- `RetiroFecha(Address)`: allowed withdrawal time as Unix timestamp (`u64`, seconds).
- `Meta(Address)`: user retirement target in **stroops**.
- `Prestamo(Address)`: current auto-loan outstanding principal in **stroops**.
- `PrestamoMeses(Address)`: number of paid loan months (`u32`).
- `Admin`: admin address receiving platform fee and loan interest.
- `UsdcToken`: USDC token contract address used for transfers.

## Local Workflow (`contracts/score`)

Run commands from `CreditContract/contracts/score/`.

### Build

```bash
# Soroban WASM build (requires stellar CLI)
stellar contract build

# Rust crate build
cargo build
```

### Test

```bash
cargo test
```

