"use client";

import { CONTRACT_ID, STELLAR_EXPERT_BASE_URL } from "@/lib/stellar/config";

const UMKM_STATS = [
  {
    value: "~61%",
    label: "of Indonesia's GDP",
    sub: "2020–2024 average (Ministry of MSMEs)",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="stat-icon">
        <path d="M3 3v18h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M7 16l4-4 4 4 4-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    value: "~97%",
    label: "of national workforce",
    sub: "~119 million workers employed",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="stat-icon">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="1.5" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    value: "65M+",
    label: "UMKM businesses",
    sub: "~99% of all business units",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="stat-icon">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 22V12h6v10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

function truncate(str: string, start = 10, end = 8): string {
  return `${str.slice(0, start)}…${str.slice(-end)}`;
}

export default function UmkmInfoCard() {
  return (
    <div className="umkm-section">
      {/* ── UMKM Impact ── */}
      <div className="card glass-card umkm-impact-card">
        <div className="card-header">
          <div className="card-icon umkm-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="icon">
              <path d="M12 2a10 10 0 1 0 0 20A10 10 0 0 0 12 2Z" stroke="currentColor" strokeWidth="1.5" />
              <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10A15.3 15.3 0 0 1 12 2Z" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </div>
          <div>
            <h2 className="card-title">Why UMKM?</h2>
            <p className="card-subtitle">Indonesia's economic backbone</p>
          </div>
        </div>

        <p className="umkm-intro">
          UMKM (Usaha Mikro, Kecil, dan Menengah) or Indonesia's MSMEs (Micro, Small &amp; Medium Enterprises)
          are the backbone of Indonesian economy. This app pilots Stellar-based micro-investments to channel community capital into this critical sector.
        </p>

        <div className="umkm-stats-grid">
          {UMKM_STATS.map((stat) => (
            <div key={stat.label} className="stat-card">
              <div className="stat-icon-wrap">{stat.icon}</div>
              <div className="stat-value">{stat.value}</div>
              <div className="stat-label">{stat.label}</div>
              <div className="stat-sub">{stat.sub}</div>
            </div>
          ))}
        </div>

        <p className="umkm-source">
          Sources: Indonesian Ministry of MSMEs; BPS National Statistics (2020–2024).
          All flows are on Stellar Testnet only and no real investment occurs.
        </p>
      </div>

      {/* ── Soroban Contract ── */}
      <div className="card glass-card contract-card">
        <div className="card-header">
          <div className="card-icon contract-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="icon">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M14 2v6h6M16 13H8m8 4H8m2-8H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <h2 className="card-title">UMKM Profit-Sharing Contract</h2>
            <p className="card-subtitle">Soroban</p>
          </div>
          <span className="badge badge-coming-soon">Coming Soon</span>
        </div>

        <div className="contract-body">
          <div className="contract-field">
            <span className="contract-field-label">Contract ID</span>
            <div className="contract-id-block">
              <code className="contract-id" title={CONTRACT_ID}>
                {truncate(CONTRACT_ID, 12, 8)}
              </code>
              <a
                href={`${STELLAR_EXPERT_BASE_URL}/contract/${CONTRACT_ID}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-icon-only"
                title="View on Stellar Expert"
                aria-label="View contract on Stellar Expert"
              >
                <svg viewBox="0 0 16 16" fill="none" className="external-icon" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 3H3a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-3M9 2h4m0 0v4m0-4L8 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
            </div>
          </div>

          <div className="contract-field">
            <span className="contract-field-label">Network</span>
            <span className="badge badge-testnet">TESTNET</span>
          </div>
        </div>

        <p className="contract-disclaimer">
          This Soroban contract ID is reserved for future implementation of transparent,
          on-chain UMKM revenue-sharing and profit distribution logic. No contract is
          currently deployed.
        </p>
      </div>
    </div>
  );
}
