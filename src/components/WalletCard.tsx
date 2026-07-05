"use client";

import { useState } from "react";
import { useWallet } from "@/context/WalletContext";
import { accountExplorerUrl } from "@/lib/stellar/config";
import WalletPickerModal from "./WalletPickerModal";

function truncateAddress(addr: string): string {
  return `${addr.slice(0, 6)}…${addr.slice(-6)}`;
}

export default function WalletCard() {
  const { publicKey, connectionStatus, walletType, errorMessage, disconnect } =
    useWallet();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const isConnected = connectionStatus === "connected";
  const isConnecting = connectionStatus === "connecting";

  return (
    <>
      <div className="card glass-card">
        {/* Header */}
        <div className="card-header">
          <div className="card-icon wallet-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="icon">
              <path d="M21 12V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 12a2 2 0 0 1 2 2v1a2 2 0 0 1-2 2h-3a2 2 0 0 1-2-2v-1a2 2 0 0 1 2-2h3Z" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
          </div>
          <div>
            <h2 className="card-title">Stellar Wallet</h2>
            <p className="card-subtitle">
              {isConnected && walletType === "kit" ? "Multi-wallet · Testnet" : "Stellar Testnet"}
            </p>
          </div>
          {isConnected && (
            <div className="status-badge connected" aria-label="Wallet connected">
              <span className="status-dot" />
              Connected
            </div>
          )}
        </div>

        {/* Body */}
        <div className="card-body">
          {!isConnected && !isConnecting && (
            <p className="wallet-prompt">
              Connect your Stellar wallet to support Indonesian UMKM (Testnet)
            </p>
          )}

          {isConnected && publicKey && (
            <div className="wallet-address-block">
              <span className="address-label">Public Key</span>
              <a
                href={accountExplorerUrl(publicKey)}
                target="_blank"
                rel="noopener noreferrer"
                className="address-value"
                title={publicKey}
              >
                {truncateAddress(publicKey)}
                <svg viewBox="0 0 16 16" fill="none" className="external-icon" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 3H3a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-3M9 2h4m0 0v4m0-4L8 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </a>
              {walletType && (
                <span className="wallet-type-chip">
                  {walletType === "kit" ? "StellarWalletsKit" : "Freighter"}
                </span>
              )}
            </div>
          )}

          {errorMessage && (
            <div className="error-block" role="alert">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="error-icon">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M12 8v4m0 3.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <span>{errorMessage}</span>
              {errorMessage.toLowerCase().includes("freighter") && (
                <a
                  id="install-freighter-link"
                  href="https://freighter.app"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-link"
                >
                  Install Freighter →
                </a>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="card-actions">
          {!isConnected ? (
            <button
              id="connect-wallet-btn"
              onClick={() => setIsModalOpen(true)}
              disabled={isConnecting}
              className="btn btn-primary btn-full"
            >
              {isConnecting ? (
                <>
                  <span className="spinner" />
                  Connecting…
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="btn-icon">
                    <path d="M10 9V7a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-6a2 2 0 0 1-2-2v-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    <path d="M15 12H3m0 0 3-3m-3 3 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Connect Wallet
                </>
              )}
            </button>
          ) : (
            <button
              id="disconnect-wallet-btn"
              onClick={disconnect}
              className="btn btn-ghost btn-full"
            >
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="btn-icon">
                <path d="M14 9V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-2M17 15l3-3-3-3m3 3H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Disconnect
            </button>
          )}
        </div>
      </div>

      {/* Multi-wallet picker modal */}
      <WalletPickerModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
