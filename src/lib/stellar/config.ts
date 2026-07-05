import { Networks } from "@stellar/stellar-sdk";

// ─── Network ────────────────────────────────────────────────────────────────
export const STELLAR_NETWORK = "TESTNET" as const;
export const HORIZON_URL = "https://horizon-testnet.stellar.org";
export const SOROBAN_RPC_URL = "https://soroban-testnet.stellar.org";
export const NETWORK_PASSPHRASE = Networks.TESTNET;

// ─── Deployed Soroban contract ───────────────────────────────────────────────
// NotesContract · deployed on Stellar Testnet
// WASM hash: 0cacf5b4b5dd69e608bc4d1c99f8994a6fbcf174787778be0559cc928162c5c0
export const CONTRACT_ID =
  "CAM35KLUIZ5L4OYVFZ4XZN7TFKLYVWCR67XWU4LADGYAAR4DIYL4SN7U";

// ─── Campaign goal (configurable) ────────────────────────────────────────────
// Change this to update the crowdfunding progress bar target
export const CAMPAIGN_GOAL_XLM = 500;

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
