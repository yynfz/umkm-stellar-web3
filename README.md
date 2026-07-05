# umkm-stellar-web3

**Fund Indonesian UMKM on Stellar Testnet.**  
**Earn from Real Revenue.**
**Invest in vetted MSMEs with transparent on-chain profit sharing.**  
**No hidden fees. Start with XLM micro-contributions.**

> ⚠️ **Testnet Only** — All transactions are on Stellar Testnet. No real funds are involved. UMKM profit-sharing is planned using Soroban smart contracts.

---

## About

`umkm-stellar-web3` is a minimal Stellar-native dApp built for the **Stellar Journey to Mastery** challenge by Rise In × Stellar Development Foundation.

It demonstrates the four required flows while piloting UX for a future UMKM-focused crowdfunding and on-chain profit-sharing platform targeting Indonesian Micro, Small & Medium Enterprises (UMKM/MSMEs).

### Why UMKM?

Indonesian MSMEs are the backbone of the country's economy:

| Metric | Value | Source |
|---|---|---|
| GDP contribution | **~58–61%** (2020–2024 avg.) | Ministry of MSMEs |
| Total UMKM businesses | **65+ million** | BPS / Ministry of MSMEs |
| Share of all businesses | **~99%** | Ministry of MSMEs |
| Workforce absorbed | **~119 million workers** | BPS 2022 |
| Share of national labor force | **~97%** | Ministry of MSMEs |

*Sources: Indonesian Ministry of MSMEs; BPS National Statistics. Figures are aggregated from 2020–2024 public reports.*

`umkm-stellar-web3` positions Stellar-based micro-investments as a practical way for alumni networks and retail investors to support this segment.

---

## Features

- ✅ **Connect / Disconnect Freighter Wallet** — requestAccess flow with install detection
- ✅ **Display XLM Balance** — via Horizon `loadAccount`, auto-refreshes post-tx
- ✅ **Send XLM on Testnet** — TransactionBuilder → Freighter sign → Horizon submit
- ✅ **Transaction Feedback** — pending / success (hash + Stellar Expert link) / failure states
- ✅ **UMKM Info Card** — static GDP/employment stats with source attribution
- ✅ **Soroban Contract Preview** — reserved Contract ID displayed in UI for future development
- ✅ **Premium Dark UI** — glassmorphism, gradient typography, animated micro-interactions

---

## Prerequisites

- **Node.js** 20.9+ (`node --version`)
- **npm** 10+
- **Freighter Extension** installed in Chrome/Brave/Firefox: [freighter.app](https://freighter.app)
- **Stellar Testnet account** (funded via Friendbot — see setup below)

---

## Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/yynfz/umkm-stellar-web3.git
cd umkm-stellar-web3
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment

```bash
cp .env.example .env.local
```

No changes needed — all values are public testnet constants.

### 4. Run the development server

```bash
npm run dev
```

> **HTTPS Notice:** Freighter requires a secure context. The dev server runs with `--experimental-https` (self-signed certificate). When your browser shows a security warning, click **"Advanced" → "Proceed anyway"** — this is expected for local HTTPS.

Open [https://localhost:3000](https://localhost:3000) in your browser.

---

## Freighter Wallet Setup

1. Install [Freighter](https://freighter.app) browser extension.
2. Create or import a wallet.
3. Open Freighter → **Settings** → **Network** → select **Testnet**.
4. Copy your public key (starts with `G`).
5. Fund your account: visit `https://friendbot.stellar.org?addr=YOUR_PUBLIC_KEY` — this gives you 10,000 XLM on Testnet.

---

## Walkthrough

### 1. Connect Wallet

Click **"Connect Wallet"** → Freighter popup → Approve → Wallet card shows green "Connected" badge and your truncated address.

### 2. View Balance

The **BalanceCard** immediately shows your XLM balance fetched from Horizon testnet.

### 3. Send Contribution

The **Send Contribution** form is pre-filled with a demo UMKM campaign address. Enter an amount (e.g., `1`) and click **"Send Contribution"** → Freighter signing popup → On success, a green banner shows the transaction hash and a **"View on Stellar Expert"** link.

### 4. Disconnect

Click **"Disconnect"** to clear wallet state and reset the session.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router, TypeScript) |
| Styling | TailwindCSS v4 |
| Stellar SDK | `@stellar/stellar-sdk` v13 |
| Wallet | `@stellar/freighter-api` |
| Network | Stellar Testnet (`https://horizon-testnet.stellar.org`) |

---

## Project Structure

```
umkm-stellar-web3/
├─ src/
│  ├─ app/
│  │  ├─ layout.tsx          # Root layout + WalletContextProvider + SEO metadata
│  │  ├─ page.tsx            # Single-page home route
│  │  └─ globals.css         # Design system (tokens, components, animations)
│  ├─ components/
│  │  ├─ WalletCard.tsx      # Connect/disconnect + address display
│  │  ├─ BalanceCard.tsx     # XLM balance with refresh
│  │  ├─ SendPaymentForm.tsx # Payment form + tx feedback
│  │  └─ UmkmInfoCard.tsx    # UMKM stats + Soroban contract preview
│  ├─ context/
│  │  └─ WalletContext.tsx   # Global state (useReducer) + all wallet actions
│  └─ lib/
│     └─ stellar/
│        ├─ config.ts        # Network constants + explorer URL helpers
│        └─ wallet.ts        # connectWallet, getXlmBalance, sendXlm (pure functions)
├─ contracts/
│  └─ umkm/
│     └─ README.md           # Future Soroban UMKM profit-sharing notes
├─ public/screenshots/       # Submission screenshots (add after running app)
├─ .env.example
└─ README.md
```

---

## Reserved Soroban Contract

The following Soroban contract ID is reserved and being used in this testing project:

```
CAM35KLUIZ5L4OYVFZ4XZN7TFKLYVWCR67XWU4LADGYAAR4DIYL4SN7U
```

Network: **Stellar Testnet** | Status: **Deployed**

---

## License

MIT © 2026 [yynfz](https://github.com/yynfz)
