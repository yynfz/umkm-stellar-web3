"use client";

import { useWallet } from "@/context/WalletContext";

function formatBalance(balance: string | null): string {
  if (!balance) return "—";
  const num = parseFloat(balance);
  if (isNaN(num)) return "—";
  return num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 7,
  });
}

export default function BalanceCard() {
  const { balance, connectionStatus, isBalanceLoading, refreshBalance } =
    useWallet();

  const isConnected = connectionStatus === "connected";

  return (
    <div className="card glass-card">
      {/* Header */}
      <div className="card-header">
        <div className="card-icon balance-icon">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="icon">
            <path d="M12 2L2 7l10 5 10-5-10-5ZM2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div>
          <h2 className="card-title">XLM Balance</h2>
          <p className="card-subtitle">Available to support UMKM · Testnet only</p>
        </div>
        {isConnected && (
          <button
            id="refresh-balance-btn"
            onClick={() => refreshBalance()}
            disabled={isBalanceLoading}
            className="btn-icon-only"
            aria-label="Refresh balance"
            title="Refresh balance"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className={`icon-sm ${isBalanceLoading ? "spin" : ""}`}
            >
              <path d="M1 4v6h6M23 20v-6h-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4-4.64 4.36A9 9 0 0 1 3.51 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}
      </div>

      {/* Balance Display */}
      <div className="balance-display">
        {!isConnected ? (
          <div className="balance-placeholder">
            <div className="balance-skeleton" />
            <p className="balance-hint">Connect wallet to see your balance</p>
          </div>
        ) : isBalanceLoading ? (
          <div className="balance-placeholder">
            <div className="balance-skeleton animate-pulse" />
          </div>
        ) : (
          <div className="balance-amount-block">
            <span className="stellar-symbol">✦</span>
            <span className="balance-amount">{formatBalance(balance)}</span>
            <span className="balance-unit">XLM</span>
          </div>
        )}
      </div>

      {/* Footer note */}
      <div className="card-footer-note">
        <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="note-icon">
          <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.2"/>
          <path d="M8 5.5v.5M8 8v3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
        </svg>
        Testnet XLM has no real monetary value. Fund via{" "}
        <a
          href="https://friendbot.stellar.org"
          target="_blank"
          rel="noopener noreferrer"
          className="link"
        >
          Friendbot
        </a>
        .
      </div>
    </div>
  );
}
