/**
 * Soroban contract client for the deployed NotesContract.
 *
 * Contract interface (confirmed from WASM contractspecv0):
 *   struct Note { id: u64, title: Symbol, content: Symbol }
 *   read:  get_notes()                              -> Vec<Note>
 *   write: create_note(title: Symbol, content: Symbol) -> Symbol
 *   write: delete_note(id: u64)                    -> Symbol
 */

import {
  rpc as SorobanRpc,
  TransactionBuilder,
  Networks,
  scValToNative,
  nativeToScVal,
  xdr,
  Account,
  BASE_FEE,
  StrKey,
  Contract,
} from "@stellar/stellar-sdk";
import { CONTRACT_ID, SOROBAN_RPC_URL, NETWORK_PASSPHRASE } from "./config";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Note {
  id: bigint;
  title: string;
  content: string;
}

export type ContractError =
  | "CONTRACT_SIMULATE_FAILED"
  | "CONTRACT_BUILD_FAILED"
  | "SUBMIT_FAILED"
  | "INSUFFICIENT_XLM"
  | "SIGN_FAILED"
  | "UNKNOWN";

// ─── Server ──────────────────────────────────────────────────────────────────

function getServer(): SorobanRpc.Server {
  return new SorobanRpc.Server(SOROBAN_RPC_URL, { allowHttp: false });
}

// ─── Contract instance ────────────────────────────────────────────────────────

function getContract(): Contract {
  return new Contract(CONTRACT_ID);
}

// ─── Read: get_notes ─────────────────────────────────────────────────────────

/**
 * Simulates get_notes() and decodes the returned Vec<Note>.
 * No signing required — pure read.
 */
export async function fetchNotes(): Promise<Note[]> {
  const server = getServer();
  const contract = getContract();

  // Use a throw-away source account (doesn't need to exist on chain for simulation)
  const sourceAccount = new Account(
    "GAAZI4TCR3TY5OJHCTJC2A4QSY6CJWJH5IAJTGKIN2ER7LBNVKOCCWN",
    "0"
  );

  const tx = new TransactionBuilder(sourceAccount, {
    fee: BASE_FEE,
    networkPassphrase: Networks.TESTNET,
  })
    .addOperation(contract.call("get_notes"))
    .setTimeout(30)
    .build();

  try {
    const simResult = await server.simulateTransaction(tx);

    if (SorobanRpc.Api.isSimulationError(simResult)) {
      console.error("Simulation error:", simResult.error);
      throw "CONTRACT_SIMULATE_FAILED" as ContractError;
    }

    if (!("result" in simResult) || !simResult.result) {
      return [];
    }

    const returnVal = simResult.result.retval;
    if (!returnVal || returnVal.switch().name === "scvVoid") {
      return [];
    }

    // scvVec of scvMap entries
    const raw = scValToNative(returnVal) as Array<Record<string, unknown>>;
    if (!Array.isArray(raw)) return [];
    return raw.map((entry) => ({
      id: BigInt(String(entry["id"] ?? 0)),
      title: String(entry["title"] ?? ""),
      content: String(entry["content"] ?? ""),
    }));
  } catch (err) {
    if (typeof err === "string") throw err;
    console.error("fetchNotes error:", err);
    throw "CONTRACT_SIMULATE_FAILED" as ContractError;
  }
}

// ─── Write helpers ────────────────────────────────────────────────────────────

/**
 * Builds a fully assembled (not yet signed) transaction XDR for create_note.
 * The caller signs it and submits via submitSignedTx().
 */
export async function buildCreateNoteTx(
  publicKey: string,
  title: string,
  content: string
): Promise<string> {
  const server = getServer();
  const contract = getContract();

  let account: Account;
  try {
    account = await server.getAccount(publicKey);
  } catch {
    throw "INSUFFICIENT_XLM" as ContractError;
  }

  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      contract.call(
        "create_note",
        nativeToScVal(title, { type: "symbol" }),
        nativeToScVal(content, { type: "symbol" })
      )
    )
    .setTimeout(30)
    .build();

  // Simulate to get the resource footprint / auth entries
  const simResult = await server.simulateTransaction(tx);
  if (SorobanRpc.Api.isSimulationError(simResult)) {
    console.error("create_note simulate error:", simResult.error);
    throw "CONTRACT_SIMULATE_FAILED" as ContractError;
  }

  // Assemble the transaction with simulation data (auth + footprint)
  const assembled = SorobanRpc.assembleTransaction(tx, simResult).build();
  return assembled.toXDR();
}

/**
 * Builds a fully assembled (not yet signed) transaction XDR for delete_note.
 */
export async function buildDeleteNoteTx(
  publicKey: string,
  id: bigint
): Promise<string> {
  const server = getServer();
  const contract = getContract();

  let account: Account;
  try {
    account = await server.getAccount(publicKey);
  } catch {
    throw "INSUFFICIENT_XLM" as ContractError;
  }

  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: NETWORK_PASSPHRASE,
  })
    .addOperation(
      contract.call("delete_note", nativeToScVal(id, { type: "u64" }))
    )
    .setTimeout(30)
    .build();

  const simResult = await server.simulateTransaction(tx);
  if (SorobanRpc.Api.isSimulationError(simResult)) {
    console.error("delete_note simulate error:", simResult.error);
    throw "CONTRACT_SIMULATE_FAILED" as ContractError;
  }

  const assembled = SorobanRpc.assembleTransaction(tx, simResult).build();
  return assembled.toXDR();
}

// ─── Submit ───────────────────────────────────────────────────────────────────

/**
 * Submits a signed transaction XDR to Soroban RPC.
 * Returns the transaction hash on success.
 */
export async function submitSignedTx(signedXdr: string): Promise<string> {
  const server = getServer();
  try {
    const tx = TransactionBuilder.fromXDR(signedXdr, NETWORK_PASSPHRASE);
    const sendResult = await server.sendTransaction(tx);

    if (sendResult.status === "ERROR") {
      console.error("sendTransaction error:", sendResult.errorResult);
      throw "SUBMIT_FAILED" as ContractError;
    }

    // Poll for completion
    const hash = sendResult.hash;
    let attempts = 0;
    while (attempts < 15) {
      await new Promise((r) => setTimeout(r, 2000));
      const statusResult = await server.getTransaction(hash);
      if (statusResult.status === SorobanRpc.Api.GetTransactionStatus.SUCCESS) {
        return hash;
      }
      if (statusResult.status === SorobanRpc.Api.GetTransactionStatus.FAILED) {
        throw "SUBMIT_FAILED" as ContractError;
      }
      attempts++;
    }
    throw "SUBMIT_FAILED" as ContractError;
  } catch (err) {
    if (typeof err === "string") throw err;
    console.error("submitSignedTx error:", err);
    throw "SUBMIT_FAILED" as ContractError;
  }
}

// ─── Error messages ───────────────────────────────────────────────────────────

export function contractErrorMessage(error: ContractError): string {
  const messages: Record<ContractError, string> = {
    CONTRACT_SIMULATE_FAILED:
      "Contract simulation failed. The contract may be unavailable or your inputs are invalid.",
    CONTRACT_BUILD_FAILED:
      "Could not build the contract transaction. Check your inputs.",
    SUBMIT_FAILED:
      "Transaction submission to Stellar Testnet failed. Please try again.",
    INSUFFICIENT_XLM:
      "Account not found or insufficient XLM for transaction fees.",
    SIGN_FAILED: "Transaction signing was cancelled or failed.",
    UNKNOWN: "An unexpected error occurred. Please try again.",
  };
  return messages[error] ?? messages.UNKNOWN;
}
