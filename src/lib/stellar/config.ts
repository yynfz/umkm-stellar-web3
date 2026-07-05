import { Networks } from "@stellar/stellar-sdk";

// ─── Network ────────────────────────────────────────────────────────────────
export const STELLAR_NETWORK = "TESTNET" as const;
export const HORIZON_URL = "https://horizon-testnet.stellar.org";
export const NETWORK_PASSPHRASE = Networks.TESTNET;

// ─── Reserved Soroban contract (future development) ─────────────────────────
export const CONTRACT_ID =
  "CAM35KLUIZ5L4OYVFZ4XZN7TFKLYVWCR67XWU4LADGYAAR4DIYL4SN7U";

// ─── Explorer ───────────────────────────────────────────────────────────────
export const STELLAR_EXPERT_BASE_URL =
  "https://stellar.expert/explorer/testnet";

export function txExplorerUrl(hash: string): string {
  return `${STELLAR_EXPERT_BASE_URL}/tx/${hash}`;
}

export function accountExplorerUrl(address: string): string {
  return `${STELLAR_EXPERT_BASE_URL}/account/${address}`;
}

// ─── Pre-filled testnet destination (UMKM campaign demo address) ─────────────
// Uses the Stellar Testnet Friendbot address as a safe, always-funded target.
export const DEMO_DESTINATION_ADDRESS =
  "GBFY4DCRW4WJ4AI2OQWP754W5JTRWUF3Y24Y7ZU6TN5GZ63IRT3FRS7V";
