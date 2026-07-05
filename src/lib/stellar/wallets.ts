/**
 * StellarWalletsKit wrapper.
 * Freighter is the primary (default) wallet; xBull and Lobstr are secondary options.
 *
 * Package: @creit.tech/stellar-wallets-kit
 * Docs: https://stellarwalletskit.dev
 */

import type { StellarWalletsKit } from "@creit.tech/stellar-wallets-kit";
import { NETWORK_PASSPHRASE, STELLAR_NETWORK } from "./config";

// ─── Types ────────────────────────────────────────────────────────────────────

export type WalletKitError =
  | "KIT_NOT_INITIALIZED"
  | "WALLET_NOT_FOUND"
  | "ACCESS_DENIED"
  | "SIGN_FAILED"
  | "UNKNOWN";

// ─── Lazy-loaded kit singleton ────────────────────────────────────────────────
// We lazy-import to avoid SSR issues in Next.js (StellarWalletsKit is client-only).

let _kitInstance: typeof StellarWalletsKit | null = null;

export async function getWalletsKit(): Promise<typeof StellarWalletsKit> {
  if (_kitInstance) return _kitInstance;

  const { StellarWalletsKit, Networks } = await import("@creit.tech/stellar-wallets-kit");
  const { FreighterModule, FREIGHTER_ID } = await import("@creit.tech/stellar-wallets-kit/modules/freighter");
  const { xBullModule } = await import("@creit.tech/stellar-wallets-kit/modules/xbull");
  const { LobstrModule } = await import("@creit.tech/stellar-wallets-kit/modules/lobstr");

  const network =
    STELLAR_NETWORK === "TESTNET"
      ? Networks.TESTNET
      : Networks.PUBLIC;

  StellarWalletsKit.init({
    network,
    modules: [
      new FreighterModule(),
      new xBullModule(),
      new LobstrModule(),
    ],
  });
  StellarWalletsKit.setWallet(FREIGHTER_ID);

  _kitInstance = StellarWalletsKit;
  return _kitInstance;
}

/** Reset the singleton (e.g. on disconnect) */
export function resetWalletsKit(): void {
  _kitInstance = null;
}

// ─── Connect (open wallet picker) ─────────────────────────────────────────────

/**
 * Opens the StellarWalletsKit modal so the user can pick a wallet.
 * Resolves with the connected public key.
 * Freighter is pre-selected but the user can switch.
 */
export async function connectViaKit(walletId: string): Promise<string> {
  const kit = await getWalletsKit();
  try {
    kit.setWallet(walletId);
    const { address } = await kit.fetchAddress();
    if (!address) {
      throw new Error("No address returned");
    }
    return address;
  } catch (err) {
    console.error("Wallet selection error:", err);
    throw "ACCESS_DENIED" as WalletKitError;
  }
}

// ─── Sign ─────────────────────────────────────────────────────────────────────

/**
 * Signs a transaction XDR using the currently selected wallet in the kit.
 * Returns the signed XDR string.
 */
export async function signViaKit(txXdr: string): Promise<string> {
  const kit = await getWalletsKit();
  try {
    const { signedTxXdr } = await kit.signTransaction(txXdr, {
      networkPassphrase: NETWORK_PASSPHRASE,
    });
    if (!signedTxXdr) throw new Error("No signed XDR returned");
    return signedTxXdr;
  } catch (err) {
    console.error("signViaKit error:", err);
    throw "SIGN_FAILED" as WalletKitError;
  }
}

// ─── Error messages ───────────────────────────────────────────────────────────

export function walletKitErrorMessage(error: WalletKitError): string {
  const messages: Record<WalletKitError, string> = {
    KIT_NOT_INITIALIZED:
      "Wallet kit is not initialized. Please refresh the page.",
    WALLET_NOT_FOUND:
      "Selected wallet not found. Install the wallet extension and try again.",
    ACCESS_DENIED:
      "Wallet access denied. Please approve the connection in your wallet.",
    SIGN_FAILED:
      "Transaction signing was cancelled or failed in your wallet.",
    UNKNOWN: "An unexpected wallet error occurred. Please try again.",
  };
  return messages[error] ?? messages.UNKNOWN;
}
