import {
  Horizon,
  TransactionBuilder,
  Operation,
  Asset,
  Memo,
} from "@stellar/stellar-sdk";
import {
  isConnected,
  requestAccess,
  getAddress,
  signTransaction,
} from "@stellar/freighter-api";
import {
  HORIZON_URL,
  NETWORK_PASSPHRASE,
} from "./config";

const server = new Horizon.Server(HORIZON_URL);

// ─── Types ──────────────────────────────────────────────────────────────────

export type WalletError =
  | "FREIGHTER_NOT_INSTALLED"
  | "ACCESS_DENIED"
  | "ACCOUNT_NOT_FOUND"
  | "NETWORK_ERROR"
  | "SIGN_FAILED"
  | "SUBMIT_FAILED"
  | "UNKNOWN";

export interface SendXlmParams {
  sourcePublicKey: string;
  destination: string;
  amount: string;
  memo?: string;
}

// ─── connectWallet ──────────────────────────────────────────────────────────

/**
 * Checks Freighter is installed, requests access, and returns the public key.
 * Throws a typed WalletError string on failure.
 */
export async function connectWallet(): Promise<string> {
  let connected: boolean;
  try {
    const result = await isConnected();
    connected = result.isConnected ?? false;
  } catch {
    throw "FREIGHTER_NOT_INSTALLED" as WalletError;
  }

  if (!connected) {
    throw "FREIGHTER_NOT_INSTALLED" as WalletError;
  }

  // First try getAddress (silent — no popup if already authorized)
  try {
    const { address: existingAddress, error: addrError } = await getAddress();
    if (!addrError && existingAddress) {
      return existingAddress;
    }
  } catch {
    // fall through to requestAccess
  }

  // requestAccess triggers Freighter popup
  const { address, error } = await requestAccess();
  if (error) {
    throw "ACCESS_DENIED" as WalletError;
  }
  if (!address) {
    throw "ACCESS_DENIED" as WalletError;
  }
  return address;
}

// ─── getXlmBalance ──────────────────────────────────────────────────────────

/**
 * Loads account from Horizon and extracts the native XLM balance.
 * Throws a typed WalletError string on failure.
 */
export async function getXlmBalance(publicKey: string): Promise<string> {
  try {
    const account = await server.loadAccount(publicKey);
    const nativeBalance = account.balances.find(
      (b) => b.asset_type === "native"
    );
    return nativeBalance ? nativeBalance.balance : "0";
  } catch (err: unknown) {
    if (
      err &&
      typeof err === "object" &&
      "response" in err &&
      (err as { response: { status: number } }).response?.status === 404
    ) {
      throw "ACCOUNT_NOT_FOUND" as WalletError;
    }
    throw "NETWORK_ERROR" as WalletError;
  }
}

// ─── sendXlm ────────────────────────────────────────────────────────────────

/**
 * Builds a native XLM payment, signs via Freighter, submits to Horizon.
 * Returns the transaction hash on success.
 * Throws a typed WalletError string on failure.
 */
export async function sendXlm({
  sourcePublicKey,
  destination,
  amount,
  memo,
}: SendXlmParams): Promise<string> {
  let account: Horizon.AccountResponse;
  try {
    account = await server.loadAccount(sourcePublicKey);
  } catch {
    throw "ACCOUNT_NOT_FOUND" as WalletError;
  }

  let txBuilder: TransactionBuilder;
  try {
    txBuilder = new TransactionBuilder(account, {
      fee: "100",
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(
        Operation.payment({
          destination,
          asset: Asset.native(),
          amount,
        })
      )
      .setTimeout(30);

    if (memo) {
      txBuilder = txBuilder.addMemo(Memo.text(memo));
    }
  } catch {
    throw "UNKNOWN" as WalletError;
  }

  const tx = txBuilder.build();
  const txXdr = tx.toXDR();

  // Sign via Freighter
  const { signedTxXdr, error: signError } = await signTransaction(txXdr, {
    networkPassphrase: NETWORK_PASSPHRASE,
    address: sourcePublicKey,
  });

  if (signError || !signedTxXdr) {
    throw "SIGN_FAILED" as WalletError;
  }

  // Submit to Horizon
  try {
    const signedTx = TransactionBuilder.fromXDR(signedTxXdr, NETWORK_PASSPHRASE);
    const result = await server.submitTransaction(signedTx);
    return result.hash;
  } catch (err: unknown) {
    console.error("Submit error:", err);
    throw "SUBMIT_FAILED" as WalletError;
  }
}

// ─── Friendly error messages ─────────────────────────────────────────────────

export function walletErrorMessage(error: WalletError): string {
  const messages: Record<WalletError, string> = {
    FREIGHTER_NOT_INSTALLED:
      "Freighter wallet not detected. Please install the Freighter extension.",
    ACCESS_DENIED:
      "Wallet access denied. Please approve the connection in Freighter.",
    ACCOUNT_NOT_FOUND:
      "Account not found on Stellar Testnet. Fund it via Friendbot first.",
    NETWORK_ERROR:
      "Could not connect to Stellar Testnet. Check your internet connection.",
    SIGN_FAILED:
      "Transaction signing was cancelled or failed in Freighter.",
    SUBMIT_FAILED:
      "Transaction submission to Stellar Testnet failed. Check destination address and balance.",
    UNKNOWN: "An unexpected error occurred. Please try again.",
  };
  return messages[error] ?? messages.UNKNOWN;
}
