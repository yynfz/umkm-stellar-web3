/**
 * StellarWalletsKit wrapper.
 * Freighter is the primary (default) wallet; xBull and Lobstr are secondary options.
 *
 * Package: @creit.tech/stellar-wallets-kit
 * Docs: https://stellarwalletskit.dev
 */

import type { IStellarWalletsKit } from "@creit.tech/stellar-wallets-kit";
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

let _kitInstance: IStellarWalletsKit | null = null;

export async function getWalletsKit(): Promise<IStellarWalletsKit> {
  if (_kitInstance) return _kitInstance;

  const {
    StellarWalletsKit,
    WalletNetwork,
    FREIGHTER_ID,
    FreighterModule,
    xBullModule,
    LobstrModule,
  } = await import("@creit.tech/stellar-wallets-kit");

  const network =
    STELLAR_NETWORK === "TESTNET"
      ? WalletNetwork.TESTNET
      : WalletNetwork.PUBLIC;

  _kitInstance = new StellarWalletsKit({
    network,
    // Freighter is listed first → it becomes the default/selected wallet
    selectedWalletId: FREIGHTER_ID,
    modules: [
      new FreighterModule(),
      new xBullModule(),
      new LobstrModule(),
    ],
  });

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
export async function connectViaKit(): Promise<string> {
  const kit = await getWalletsKit();

  return new Promise((resolve, reject) => {
    kit.openModal({
      onWalletSelected: async (option) => {
        try {
          kit.setWallet(option.id);
          const { address } = await kit.getAddress();
          if (!address) {
            reject("ACCESS_DENIED" as WalletKitError);
            return;
          }
          resolve(address);
        } catch (err) {
          console.error("Wallet selection error:", err);
          reject("ACCESS_DENIED" as WalletKitError);
        }
      },
      onClosed: (err) => {
        if (err) {
          reject("ACCESS_DENIED" as WalletKitError);
        }
        // If user just closed without selecting, resolve with nothing → caller handles
      },
    });
  });
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
