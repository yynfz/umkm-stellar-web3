"use client";

import { useCallback, useEffect, useState } from "react";
import { useWallet } from "@/context/WalletContext";
import { fetchNotes, type Note } from "@/lib/stellar/contract";
import { CONTRACT_ID, STELLAR_EXPERT_BASE_URL, txExplorerUrl } from "@/lib/stellar/config";

function truncate(str: string, start = 10, end = 8): string {
  return `${str.slice(0, start)}…${str.slice(-end)}`;
}

const MAX_SYMBOL_LEN = 32;

export default function ContractNotesCard() {
  const {
    publicKey,
    connectionStatus,
    contractTxStatus,
    contractTxHash,
    contractTxError,
    createNote,
    deleteNote,
    resetContractTx,
  } = useWallet();

  const isConnected = connectionStatus === "connected";
  const isContractPending = contractTxStatus === "pending";
  const isContractSuccess = contractTxStatus === "success";
  const isContractFailed = contractTxStatus === "failed";

  // ── Notes list ──
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // ── Create form ──
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  // ── Delete tracking ──
  const [deletingId, setDeletingId] = useState<bigint | null>(null);

  const loadNotes = useCallback(async () => {
    setIsLoadingNotes(true);
    setLoadError(null);
    try {
      const fetched = await fetchNotes();
      setNotes(fetched);
    } catch {
      setLoadError("Could not load notes from the contract. Please try again.");
    } finally {
      setIsLoadingNotes(false);
    }
  }, []);

  // Load on mount
  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  // Reload after a successful write
  useEffect(() => {
    if (isContractSuccess) {
      loadNotes();
    }
  }, [isContractSuccess, loadNotes]);

  const validate = (): boolean => {
    if (!title.trim()) {
      setFormError("Title is required.");
      return false;
    }
    if (title.trim().length > MAX_SYMBOL_LEN) {
      setFormError(`Title must be ${MAX_SYMBOL_LEN} characters or less.`);
      return false;
    }
    if (!content.trim()) {
      setFormError("Content is required.");
      return false;
    }
    if (content.trim().length > MAX_SYMBOL_LEN) {
      setFormError(`Content must be ${MAX_SYMBOL_LEN} characters or less.`);
      return false;
    }
    setFormError(null);
    return true;
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    resetContractTx();
    await createNote(title.trim(), content.trim());
    setTitle("");
    setContent("");
  };

  const handleDelete = async (id: bigint) => {
    setDeletingId(id);
    resetContractTx();
    await deleteNote(id);
    setDeletingId(null);
  };

  return (
    <div className="card glass-card contract-notes-card">
      {/* ── Header ── */}
      <div className="card-header">
        <div className="card-icon contract-icon">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="icon">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M14 2v6h6M16 13H8m8 4H8m2-8H8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div>
          <h2 className="card-title">On-Chain Notes</h2>
          <p className="card-subtitle">UMKM Profit-Sharing Contract</p>
        </div>
        <span className="badge badge-live">Live · Testnet</span>
      </div>

      {/* ── Contract ID ── */}
      <div className="contract-field" style={{ marginBottom: "1.25rem" }}>
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
              <path d="M6 3H3a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-3M9 2h4m0 0v4m0-4L8 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </a>
        </div>
      </div>

      {/* ── Notes List ── */}
      <div className="notes-section">
        <div className="notes-section-header">
          <span className="notes-section-label">
            On-Chain Notes
            {notes.length > 0 && (
              <span className="notes-count">{notes.length}</span>
            )}
          </span>
          <button
            id="refresh-notes-btn"
            className="btn btn-ghost btn-sm"
            onClick={loadNotes}
            disabled={isLoadingNotes}
            title="Refresh notes"
          >
            <svg viewBox="0 0 16 16" fill="none" className={`btn-icon-sm${isLoadingNotes ? " spin" : ""}`} xmlns="http://www.w3.org/2000/svg">
              <path d="M13.5 8A5.5 5.5 0 1 1 8 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M8 1v3l2-1.5L8 1Z" fill="currentColor"/>
            </svg>
            Refresh
          </button>
        </div>

        {isLoadingNotes && (
          <div className="notes-list">
            {[1, 2].map((i) => (
              <div key={i} className="note-skeleton" />
            ))}
          </div>
        )}

        {!isLoadingNotes && loadError && (
          <div className="error-block" role="alert">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="error-icon">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M12 8v4m0 3.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            {loadError}
          </div>
        )}

        {!isLoadingNotes && !loadError && notes.length === 0 && (
          <div className="notes-empty">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="notes-empty-icon">
              <path d="M9 12h6m-3-3v6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              <rect x="3" y="3" width="18" height="18" rx="3" stroke="currentColor" strokeWidth="1.5"/>
            </svg>
            <p>No notes yet. Be the first to post on-chain!</p>
          </div>
        )}

        {!isLoadingNotes && notes.length > 0 && (
          <ul className="notes-list" aria-label="On-chain notes">
            {notes.map((note) => (
              <li key={String(note.id)} className="note-item">
                <div className="note-content">
                  <span className="note-title">{note.title}</span>
                  <span className="note-body">{note.content}</span>
                  <span className="note-id">ID: {String(note.id).slice(0, 10)}…</span>
                </div>
                {isConnected && (
                  <button
                    id={`delete-note-${String(note.id).slice(0, 6)}`}
                    className="note-delete-btn"
                    onClick={() => handleDelete(note.id)}
                    disabled={isContractPending || deletingId === note.id}
                    title="Delete note on-chain"
                    aria-label={`Delete note "${note.title}"`}
                  >
                    {deletingId === note.id ? (
                      <span className="spinner spinner-sm" />
                    ) : (
                      <svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="delete-icon">
                        <path d="M3 4h10M6 4V3h4v1M5 4l.5 9h5L11 4" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ── Contract TX status ── */}
      {isContractSuccess && contractTxHash && (
        <div className="contract-tx-result success" role="status">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="result-icon-svg">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/>
            <path d="m8.5 12 2.5 2.5 4.5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <div className="contract-tx-body">
            <span className="contract-tx-title">Transaction confirmed!</span>
            <div className="tx-hash-block">
              <span className="tx-hash-label">Hash</span>
              <span className="tx-hash-value" title={contractTxHash}>
                {contractTxHash.slice(0, 16)}…{contractTxHash.slice(-8)}
              </span>
            </div>
            <a
              id="contract-tx-explorer-link"
              href={txExplorerUrl(contractTxHash)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline btn-sm"
            >
              View on Stellar Expert ↗
            </a>
          </div>
          <button
            id="contract-tx-dismiss-btn"
            className="btn btn-ghost btn-sm"
            onClick={resetContractTx}
          >
            Dismiss
          </button>
        </div>
      )}

      {isContractFailed && contractTxError && (
        <div className="error-block" role="alert">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="error-icon">
            <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M9 9l6 6M15 9l-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <span>{contractTxError}</span>
          <button className="btn-link" onClick={resetContractTx}>Dismiss</button>
        </div>
      )}

      {/* ── Create Note form (wallet-gated) ── */}
      {isConnected ? (
        <form
          id="create-note-form"
          className="create-note-form"
          onSubmit={handleCreate}
          noValidate
        >
          <div className="notes-section-label" style={{ marginBottom: "0.75rem" }}>
            Post a Note On-Chain
          </div>

          <div className="form-field">
            <label htmlFor="note-title-input" className="form-label">
              Title
              <span className="char-count">{title.length}/{MAX_SYMBOL_LEN}</span>
            </label>
            <input
              id="note-title-input"
              type="text"
              value={title}
              maxLength={MAX_SYMBOL_LEN}
              onChange={(e) => { setTitle(e.target.value); setFormError(null); }}
              placeholder="e.g. UMKM Update Q2"
              className="form-input"
              disabled={isContractPending}
            />
          </div>

          <div className="form-field">
            <label htmlFor="note-content-input" className="form-label">
              Content
              <span className="char-count">{content.length}/{MAX_SYMBOL_LEN}</span>
            </label>
            <input
              id="note-content-input"
              type="text"
              value={content}
              maxLength={MAX_SYMBOL_LEN}
              onChange={(e) => { setContent(e.target.value); setFormError(null); }}
              placeholder="e.g. Revenue up 12% this quarter"
              className="form-input"
              disabled={isContractPending}
            />
          </div>

          {formError && (
            <div className="error-block" role="alert">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="error-icon">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M12 8v4m0 3.5v.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              {formError}
            </div>
          )}

          <button
            id="create-note-btn"
            type="submit"
            disabled={isContractPending}
            className="btn btn-primary btn-full"
          >
            {isContractPending ? (
              <>
                <span className="spinner" />
                Submitting to Testnet…
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="btn-icon">
                  <path d="M12 5v14M5 12l7-7 7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Post Note On-Chain
              </>
            )}
          </button>
        </form>
      ) : (
        <div className="notes-wallet-gate">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="lock-icon">
            <rect x="3" y="11" width="18" height="11" rx="2" stroke="currentColor" strokeWidth="1.5"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <p>Connect your wallet to post notes on-chain</p>
        </div>
      )}
    </div>
  );
}
