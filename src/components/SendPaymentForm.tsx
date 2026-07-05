"use client";

import { useCallback, useState } from "react";
import { useWallet } from "@/context/WalletContext";
import { DEMO_DESTINATION_ADDRESS, txExplorerUrl } from "@/lib/stellar/config";

export default function SendPaymentForm() {
  const { publicKey, connectionStatus, txStatus, txHash, txErrorMessage, sendPayment, resetTx } =
    useWallet();

  const [destination, setDestination] = useState(DEMO_DESTINATION_ADDRESS);
  const [amount, setAmount] = useState("1");
  const [formError, setFormError] = useState<string | null>(null);

  const isConnected = connectionStatus === "connected";
  const isPending = txStatus === "pending";
  const isSuccess = txStatus === "success";
  const isFailed = txStatus === "failed";

  const validate = useCallback((): boolean => {
    if (!destination.trim() || destination.trim().length < 56) {
      setFormError("Please enter a valid Stellar public key (starts with G…).");
      return false;
    }
    if (!destination.trim().startsWith("G")) {
      setFormError("Destination must be a Stellar account (starts with G).");
      return false;
    }
    const amt = parseFloat(amount);
    if (isNaN(amt) || amt <= 0) {
      setFormError("Amount must be a positive number.");
      return false;
    }
    if (amt < 0.0000001) {
      setFormError("Minimum amount is 0.0000001 XLM.");
      return false;
    }
    setFormError(null);
    return true;
  }, [destination, amount]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    await sendPayment(destination.trim(), amount);
  };

  const handleReset = () => {
    resetTx();
    setFormError(null);
  };

  if (!isConnected) {
    return (
      <div className="card glass-card send-form-disabled">
        <div className="card-header">
          <div className="card-icon send-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="icon">
              <path d="M22 2 11 13M22 2 15 22l-4-9-9-4 20-7Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <h2 className="card-title">Send Contribution</h2>
            <p className="card-subtitle">Fund a UMKM campaign</p>
          </div>
        </div>
        <div className="send-lock-overlay">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="lock-icon">
            <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="1.5" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <p>Connect your wallet to send XLM</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card glass-card">
      {/* Header */}
      <div className="card-header">
        <div className="card-icon send-icon">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="icon">
            <path d="M22 2 11 13M22 2 15 22l-4-9-9-4 20-7Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div>
          <h2 className="card-title">Send Contribution</h2>
          <p className="card-subtitle">Fund a UMKM campaign</p>
        </div>
      </div>

      {/* Success State */}
      {isSuccess && txHash && (
        <div className="tx-result success" role="status">
          <div className="tx-result-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="result-icon-svg">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
              <path d="m8.5 12 2.5 2.5 4.5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="tx-result-body">
            <p className="tx-result-title">Contribution confirmed!</p>
            <p className="tx-result-subtitle">Transaction submitted to Stellar Testnet</p>
            <div className="tx-hash-block">
              <span className="tx-hash-label">Hash</span>
              <span className="tx-hash-value" title={txHash}>
                {txHash.slice(0, 16)}…{txHash.slice(-8)}
              </span>
            </div>
            <a
              id="tx-explorer-link"
              href={txExplorerUrl(txHash)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline btn-sm"
            >
              View on Stellar Expert ↗
            </a>
          </div>
          <button
            id="send-another-btn"
            onClick={handleReset}
            className="btn btn-ghost btn-sm"
          >
            Send another
          </button>
        </div>
      )}

      {/* Form (hidden when success) */}
      {!isSuccess && (
        <form onSubmit={handleSubmit} className="send-form" noValidate>
          {/* Destination */}
          <div className="form-field">
            <label htmlFor="destination-input" className="form-label">
              UMKM Campaign Address
              <span className="form-badge">Testnet</span>
            </label>
            <input
              id="destination-input"
              type="text"
              value={destination}
              onChange={(e) => {
                setDestination(e.target.value);
                setFormError(null);
              }}
              placeholder="G… (Stellar public key)"
              className="form-input"
              disabled={isPending}
              autoComplete="off"
              spellCheck={false}
            />
            <p className="form-hint">
              Testnet demo address
            </p>
          </div>

          {/* Amount */}
          <div className="form-field">
            <label htmlFor="amount-input" className="form-label">
              XLM Amount to Contribute
            </label>
            <div className="input-with-unit">
              <input
                id="amount-input"
                type="number"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  setFormError(null);
                }}
                min="0.0000001"
                step="0.01"
                placeholder="1.00"
                className="form-input"
                disabled={isPending}
              />
              <span className="input-unit">XLM</span>
            </div>
          </div>

          {/* Validation Error */}
          {formError && (
            <div className="error-block" role="alert">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="error-icon">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
                <path d="M12 8v4m0 3.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              {formError}
            </div>
          )}

          {/* TX Error */}
          {isFailed && txErrorMessage && (
            <div className="error-block" role="alert">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="error-icon">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5" />
                <path d="M9 9l6 6M15 9l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              {txErrorMessage}
            </div>
          )}

          {/* Disclaimer */}
          <p className="form-disclaimer">
            ⚠️ This is a simulation on Stellar Testnet. No real funds are transferred.
          </p>

          {/* Submit */}
          <button
            id="send-payment-btn"
            type="submit"
            disabled={isPending || !publicKey}
            className="btn btn-primary btn-full"
          >
            {isPending ? (
              <>
                <span className="spinner" />
                Submitting to Testnet…
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="btn-icon">
                  <path d="M22 2 11 13M22 2 15 22l-4-9-9-4 20-7Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                {isFailed ? "Try Again" : "Send Contribution"}
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
}
