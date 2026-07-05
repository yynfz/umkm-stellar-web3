"use client";

import { useWallet } from "@/context/WalletContext";
import { useEffect, useRef } from "react";

interface WalletPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WALLETS = [
  {
    id: "freighter",
    name: "Freighter",
    description: "Default — Stellar's official browser wallet",
    isPrimary: true,
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="wallet-option-logo" xmlns="http://www.w3.org/2000/svg">
        <rect width="40" height="40" rx="10" fill="#6378ff"/>
        <path d="M10 20h20M20 10v20" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
        <circle cx="20" cy="20" r="5" stroke="#fff" strokeWidth="2"/>
      </svg>
    ),
  },
  {
    id: "xbull",
    name: "xBull",
    description: "Multi-network Stellar wallet",
    isPrimary: false,
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="wallet-option-logo" xmlns="http://www.w3.org/2000/svg">
        <rect width="40" height="40" rx="10" fill="#8b5cf6"/>
        <path d="M13 13l14 14M27 13L13 27" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    id: "lobstr",
    name: "Lobstr",
    description: "Mobile-first Stellar wallet",
    isPrimary: false,
    icon: (
      <svg viewBox="0 0 40 40" fill="none" className="wallet-option-logo" xmlns="http://www.w3.org/2000/svg">
        <rect width="40" height="40" rx="10" fill="#10b981"/>
        <ellipse cx="20" cy="20" rx="8" ry="10" stroke="#fff" strokeWidth="2"/>
        <path d="M12 20h16" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
  },
];

export default function WalletPickerModal({ isOpen, onClose }: WalletPickerModalProps) {
  const { connectWithKit, connect, connectionStatus } = useWallet();
  const overlayRef = useRef<HTMLDivElement>(null);

  const isConnecting = connectionStatus === "connecting";

  // Close on backdrop click
  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  // Lock body scroll
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSelectWallet = async (walletId: string) => {
    // "freighter" id → use direct Freighter path for reliability
    if (walletId === "freighter") {
      await connect();
    } else {
      await connectWithKit();
    }
    onClose();
  };

  return (
    <div
      ref={overlayRef}
      className="modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-label="Connect wallet"
      onClick={handleOverlayClick}
    >
      <div className="modal-panel">
        {/* Header */}
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Connect Wallet</h2>
            <p className="modal-subtitle">Choose your Stellar wallet to continue</p>
          </div>
          <button
            id="wallet-modal-close"
            className="modal-close-btn"
            onClick={onClose}
            aria-label="Close"
          >
            <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Wallet options */}
        <div className="wallet-options-list">
          {WALLETS.map((wallet) => (
            <button
              key={wallet.id}
              id={`wallet-option-${wallet.id}`}
              className={`wallet-option-btn${wallet.isPrimary ? " wallet-option-primary" : ""}`}
              onClick={() => handleSelectWallet(wallet.id)}
              disabled={isConnecting}
            >
              {wallet.icon}
              <div className="wallet-option-info">
                <span className="wallet-option-name">
                  {wallet.name}
                  {wallet.isPrimary && (
                    <span className="wallet-option-badge">Default</span>
                  )}
                </span>
                <span className="wallet-option-desc">{wallet.description}</span>
              </div>
              {isConnecting ? (
                <span className="spinner spinner-sm" />
              ) : (
                <svg viewBox="0 0 16 16" fill="none" className="wallet-option-arrow" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </button>
          ))}
        </div>

        <p className="modal-footer-note">
          🔒 This app runs on Stellar Testnet only. No real funds involved.
        </p>
      </div>
    </div>
  );
}
