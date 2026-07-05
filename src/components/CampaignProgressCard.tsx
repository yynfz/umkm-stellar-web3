"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Horizon } from "@stellar/stellar-sdk";
import {
  HORIZON_URL,
  DEMO_DESTINATION_ADDRESS,
  CAMPAIGN_GOAL_XLM,
  txExplorerUrl,
  accountExplorerUrl,
} from "@/lib/stellar/config";
import { useWallet } from "@/context/WalletContext";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Contribution {
  txHash: string;
  from: string;
  amount: string;
  timestamp: string;
  ledger: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const server = new Horizon.Server(HORIZON_URL);

function truncateAddr(addr: string): string {
  return `${addr.slice(0, 6)}…${addr.slice(-6)}`;
}

function formatTime(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString("id-ID", {
      dateStyle: "short",
      timeStyle: "short",
    });
  } catch {
    return iso.slice(0, 16);
  }
}

function pct(total: number, goal: number): number {
  return Math.min(100, (total / goal) * 100);
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CampaignProgressCard() {
  const { txStatus } = useWallet(); // re-poll after a successful payment

  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [totalXlm, setTotalXlm] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const loadContributions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const payments = await server
        .payments()
        .forAccount(DEMO_DESTINATION_ADDRESS)
        .limit(20)
        .order("desc")
        .call();

      const list: Contribution[] = [];
      let total = 0;

      for (const op of payments.records) {
        // Only count native XLM payments coming IN to the campaign address
        if (
          op.type === "payment" &&
          op.asset_type === "native" &&
          op.to === DEMO_DESTINATION_ADDRESS
        ) {
          const amount = parseFloat(op.amount);
          total += amount;
          list.push({
            txHash: op.transaction_hash,
            from: op.from,
            amount: op.amount,
            timestamp: op.created_at,
            ledger: op.transaction?.ledger ?? 0,
          });
        }
      }

      setContributions(list);
      setTotalXlm(total);
      setLastUpdated(new Date());
    } catch {
      setError("Could not load contributions. Will retry automatically.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load + auto-refresh every 15s
  useEffect(() => {
    loadContributions();
    intervalRef.current = setInterval(loadContributions, 15_000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [loadContributions]);

  // Re-poll immediately after a successful payment
  useEffect(() => {
    if (txStatus === "success") {
      loadContributions();
    }
  }, [txStatus, loadContributions]);

  const progress = pct(totalXlm, CAMPAIGN_GOAL_XLM);

  return (
    <div className="card glass-card campaign-card">
      {/* ── Header ── */}
      <div className="card-header">
        <div className="card-icon campaign-icon">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="icon">
            <path d="M3 12h18M3 6h18M3 18h13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </div>
        <div>
          <h2 className="card-title">UMKM Campaign</h2>
          <p className="card-subtitle">Crowdfunding progress · Testnet</p>
        </div>
        <button
          id="refresh-campaign-btn"
          className="btn btn-ghost btn-sm"
          onClick={loadContributions}
          disabled={isLoading}
          title="Refresh"
          aria-label="Refresh campaign data"
        >
          <svg viewBox="0 0 16 16" fill="none" className={`btn-icon-sm${isLoading ? " spin" : ""}`} xmlns="http://www.w3.org/2000/svg">
            <path d="M13.5 8A5.5 5.5 0 1 1 8 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M8 1v3l2-1.5L8 1Z" fill="currentColor"/>
          </svg>
        </button>
      </div>

      {/* ── Progress ── */}
      <div className="campaign-progress-section">
        <div className="campaign-amounts">
          <div className="campaign-raised">
            <span className="campaign-amount-value">
              {totalXlm.toLocaleString("en", { maximumFractionDigits: 2 })}
            </span>
            <span className="campaign-amount-unit">XLM raised</span>
          </div>
          <div className="campaign-goal">
            <span>of {CAMPAIGN_GOAL_XLM.toLocaleString()} XLM goal</span>
            <span className="campaign-pct">{progress.toFixed(1)}%</span>
          </div>
        </div>

        <div className="progress-bar-track" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
          <div
            className="progress-bar-fill"
            style={{ width: `${progress}%` }}
          />
        </div>

        {lastUpdated && (
          <p className="campaign-updated">
            Auto-refreshes every 15 s · last updated {lastUpdated.toLocaleTimeString("id-ID")}
          </p>
        )}
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="error-block" role="alert">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="error-icon">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M12 8v4m0 3.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          {error}
        </div>
      )}

      {/* ── Contributions list ── */}
      <div className="contributions-section">
        <span className="notes-section-label">
          Recent Contributions
          {contributions.length > 0 && (
            <span className="notes-count">{contributions.length}</span>
          )}
        </span>

        {isLoading && contributions.length === 0 && (
          <div className="notes-list">
            {[1, 2, 3].map((i) => (
              <div key={i} className="note-skeleton" />
            ))}
          </div>
        )}

        {!isLoading && contributions.length === 0 && !error && (
          <div className="notes-empty">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="notes-empty-icon">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M12 8v4m0 3 .5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <p>No contributions yet. Be the first supporter!</p>
          </div>
        )}

        {contributions.length > 0 && (
          <ul className="contributions-list" aria-label="Recent contributions">
            {contributions.map((c) => (
              <li key={c.txHash} className="contribution-row">
                <div className="contribution-from">
                  <a
                    href={accountExplorerUrl(c.from)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="address-value"
                    title={c.from}
                  >
                    {truncateAddr(c.from)}
                  </a>
                  <span className="contribution-time">{formatTime(c.timestamp)}</span>
                </div>
                <div className="contribution-right">
                  <span className="contribution-amount">{parseFloat(c.amount).toFixed(2)} XLM</span>
                  <a
                    href={txExplorerUrl(c.txHash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-icon-only"
                    title="View transaction"
                    aria-label="View transaction on Stellar Expert"
                  >
                    <svg viewBox="0 0 16 16" fill="none" className="external-icon" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6 3H3a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-3M9 2h4m0 0v4m0-4L8 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </a>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
