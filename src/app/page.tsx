import WalletCard from "@/components/WalletCard";
import BalanceCard from "@/components/BalanceCard";
import SendPaymentForm from "@/components/SendPaymentForm";
import UmkmInfoCard from "@/components/UmkmInfoCard";
import CampaignProgressCard from "@/components/CampaignProgressCard";

export default function HomePage() {
  return (
    <>
      {/* Ambient background gradient */}
      <div className="app-bg" aria-hidden="true" />

      <div className="app-wrapper">
        {/* ── Header ── */}
        <header className="site-header">
          <div className="header-inner">
            <div className="logo-mark" aria-hidden="true">✦</div>
            <div>
              <div className="logo-text">umkm-stellar-web3</div>
              <div className="logo-sub">Stellar · Testnet</div>
            </div>
            <span className="header-badge">Testnet Only</span>
          </div>
        </header>

        {/* ── Main ── */}
        <main className="main-content">
          {/* Hero */}
          <section className="hero animate-fade-up" aria-labelledby="hero-title">
            <div className="hero-eyebrow">
              <span className="hero-dot" aria-hidden="true" />
              Rise In × Stellar Development Foundation
            </div>
            <h1 id="hero-title" className="hero-title">
              Fund Indonesian UMKM.<br />
              Earn from Real Revenue.
            </h1>
            <p className="hero-subtitle">
              Invest in vetted MSMEs with transparent on-chain profit sharing.
              No hidden fees. Start with XLM micro-contributions on Stellar.
            </p>
            <p className="hero-disclaimer">
              ⚠️ All flows are on Stellar Testnet and no real funds involved.
            </p>
          </section>

          {/* Wallet + Balance row */}
          <div className="cards-row animate-fade-up animate-delay-1">
            <WalletCard />
            <BalanceCard />
          </div>

          {/* Campaign Progress */}
          <div className="campaign-section animate-fade-up animate-delay-2">
            <CampaignProgressCard />
          </div>

          {/* Send Payment */}
          <div className="payment-section animate-fade-up animate-delay-3">
            <SendPaymentForm />
          </div>

          {/* UMKM Info + Contract */}
          <div className="animate-fade-up animate-delay-3">
            <UmkmInfoCard />
          </div>
        </main>

        {/* ── Footer ── */}
        <footer className="site-footer">
          <div className="footer-inner">
            <p className="footer-disclaimer">
              <strong>Disclaimer:</strong> This application runs exclusively on Stellar Testnet.
              All XLM balances and transactions are simulated. No real Indonesian UMKM businesses
              receive funds through this demo. UMKM statistics are sourced from the Indonesian
              Ministry of MSMEs and BPS National Statistics (2020–2024).
            </p>
            <div className="footer-links">
              <a
                href="https://github.com/yynfz/umkm-stellar-web3"
                target="_blank"
                rel="noopener noreferrer"
                className="link"
              >
                GitHub →
              </a>
              <a
                href="https://stellar.expert/explorer/testnet"
                target="_blank"
                rel="noopener noreferrer"
                className="link"
              >
                Stellar Expert →
              </a>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
