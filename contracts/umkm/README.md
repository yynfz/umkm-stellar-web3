# UMKM Profit-Sharing Contract — Future Soroban Implementation

**Contract ID (reserved):** `CAM35KLUIZ5L4OYVFZ4XZN7TFKLYVWCR67XWU4LADGYAAR4DIYL4SN7U`  
**Network:** Stellar Testnet  
**Status:** 🔮 Planned — not yet deployed

---

## Overview

This directory is a placeholder for the future Soroban smart contract that will implement transparent, on-chain UMKM revenue-sharing and profit distribution logic for the `umkm-stellar-web3` platform.

## Planned Features

- **UMKM Registration:** On-chain registration of vetted UMKM businesses with metadata (sector, location, revenue targets).
- **Investment Pool Management:** Aggregate micro-contributions from supporters into per-UMKM investment pools.
- **Revenue Distribution:** Off-chain oracle feeds monthly UMKM revenue snapshots; contract calculates and distributes proportional profit shares to investors.
- **Transparency:** All distributions recorded on-chain with transaction hashes, enabling fully auditable profit-sharing.
- **Compliance Hooks:** Optional Shariah-compliant financing modes and KYC/AML integration placeholders.

## Technical References

- [Soroban Docs](https://developers.stellar.org/docs/smart-contracts)
- [Soroban Examples](https://github.com/stellar/soroban-examples)
- [Stellar Contract SDKs](https://developers.stellar.org/docs/tools/sdks/library-list)

## Notes

- The scope is limited to native XLM payment transactions via Horizon.
- No Soroban contract invocation occurs at this level.
- The reserved Contract ID is displayed in the app's `UmkmInfoCard` as a preview.
