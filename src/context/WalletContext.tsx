"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useReducer,
} from "react";
import {
  connectWallet as _connectFreighter,
  getXlmBalance,
  sendXlm,
  walletErrorMessage,
  type WalletError,
} from "@/lib/stellar/wallet";
import {
  connectViaKit,
  signViaKit,
  resetWalletsKit,
  walletKitErrorMessage,
  type WalletKitError,
} from "@/lib/stellar/wallets";
import {
  buildCreateNoteTx,
  buildDeleteNoteTx,
  submitSignedTx,
  contractErrorMessage,
  type ContractError,
} from "@/lib/stellar/contract";

// ─── State ───────────────────────────────────────────────────────────────────

export type ConnectionStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "disconnecting"
  | "error";

export type TxStatus = "idle" | "pending" | "success" | "failed";

/** Which wallet integration is active */
export type WalletType = "freighter" | "kit" | null;

interface WalletState {
  publicKey: string | null;
  balance: string | null;
  connectionStatus: ConnectionStatus;
  walletType: WalletType;
  // Payment TX
  txStatus: TxStatus;
  txHash: string | null;
  errorMessage: string | null;
  txErrorMessage: string | null;
  isBalanceLoading: boolean;
  // Contract TX (separate from payment TX)
  contractTxStatus: TxStatus;
  contractTxHash: string | null;
  contractTxError: string | null;
}

const initialState: WalletState = {
  publicKey: null,
  balance: null,
  connectionStatus: "idle",
  walletType: null,
  txStatus: "idle",
  txHash: null,
  errorMessage: null,
  txErrorMessage: null,
  isBalanceLoading: false,
  contractTxStatus: "idle",
  contractTxHash: null,
  contractTxError: null,
};

// ─── Actions ─────────────────────────────────────────────────────────────────

type Action =
  | { type: "CONNECT_START" }
  | { type: "CONNECT_SUCCESS"; publicKey: string; walletType: WalletType }
  | { type: "CONNECT_ERROR"; message: string }
  | { type: "DISCONNECT" }
  | { type: "BALANCE_LOADING" }
  | { type: "BALANCE_LOADED"; balance: string }
  | { type: "BALANCE_ERROR"; message: string }
  | { type: "TX_START" }
  | { type: "TX_SUCCESS"; hash: string }
  | { type: "TX_FAILED"; message: string }
  | { type: "TX_RESET" }
  | { type: "CONTRACT_TX_START" }
  | { type: "CONTRACT_TX_SUCCESS"; hash: string }
  | { type: "CONTRACT_TX_FAILED"; message: string }
  | { type: "CONTRACT_TX_RESET" };

function reducer(state: WalletState, action: Action): WalletState {
  switch (action.type) {
    case "CONNECT_START":
      return { ...state, connectionStatus: "connecting", errorMessage: null };
    case "CONNECT_SUCCESS":
      return {
        ...state,
        connectionStatus: "connected",
        publicKey: action.publicKey,
        walletType: action.walletType,
        errorMessage: null,
      };
    case "CONNECT_ERROR":
      return {
        ...state,
        connectionStatus: "error",
        errorMessage: action.message,
      };
    case "DISCONNECT":
      return { ...initialState, connectionStatus: "idle" };
    case "BALANCE_LOADING":
      return { ...state, isBalanceLoading: true };
    case "BALANCE_LOADED":
      return { ...state, balance: action.balance, isBalanceLoading: false };
    case "BALANCE_ERROR":
      return { ...state, isBalanceLoading: false };
    case "TX_START":
      return {
        ...state,
        txStatus: "pending",
        txHash: null,
        txErrorMessage: null,
      };
    case "TX_SUCCESS":
      return { ...state, txStatus: "success", txHash: action.hash };
    case "TX_FAILED":
      return { ...state, txStatus: "failed", txErrorMessage: action.message };
    case "TX_RESET":
      return { ...state, txStatus: "idle", txHash: null, txErrorMessage: null };
    case "CONTRACT_TX_START":
      return {
        ...state,
        contractTxStatus: "pending",
        contractTxHash: null,
        contractTxError: null,
      };
    case "CONTRACT_TX_SUCCESS":
      return {
        ...state,
        contractTxStatus: "success",
        contractTxHash: action.hash,
      };
    case "CONTRACT_TX_FAILED":
      return {
        ...state,
        contractTxStatus: "failed",
        contractTxError: action.message,
      };
    case "CONTRACT_TX_RESET":
      return {
        ...state,
        contractTxStatus: "idle",
        contractTxHash: null,
        contractTxError: null,
      };
    default:
      return state;
  }
}

// ─── Context ─────────────────────────────────────────────────────────────────

interface WalletContextValue extends WalletState {
  /** Connect using Freighter directly (legacy path) */
  connect: () => Promise<void>;
  /** Connect using StellarWalletsKit multi-wallet picker */
  connectWithKit: (walletId: string) => Promise<void>;
  disconnect: () => void;
  refreshBalance: () => Promise<void>;
  sendPayment: (destination: string, amount: string, memo?: string) => Promise<void>;
  resetTx: () => void;
  /** Invoke create_note on the deployed contract */
  createNote: (title: string, content: string) => Promise<void>;
  /** Invoke delete_note on the deployed contract */
  deleteNote: (id: bigint) => Promise<void>;
  resetContractTx: () => void;
}

export const WalletContext = createContext<WalletContextValue | null>(null);

// ─── Provider ────────────────────────────────────────────────────────────────

export function WalletContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // ── Balance ──

  const refreshBalance = useCallback(async (pubKey?: string) => {
    const key = pubKey ?? state.publicKey;
    if (!key) return;
    dispatch({ type: "BALANCE_LOADING" });
    try {
      const balance = await getXlmBalance(key);
      dispatch({ type: "BALANCE_LOADED", balance });
    } catch (err) {
      dispatch({
        type: "BALANCE_ERROR",
        message: walletErrorMessage(err as WalletError),
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.publicKey]);

  // ── Connect: Freighter (direct) ──

  const connect = useCallback(async () => {
    dispatch({ type: "CONNECT_START" });
    try {
      const publicKey = await _connectFreighter();
      dispatch({ type: "CONNECT_SUCCESS", publicKey, walletType: "freighter" });
      dispatch({ type: "BALANCE_LOADING" });
      try {
        const balance = await getXlmBalance(publicKey);
        dispatch({ type: "BALANCE_LOADED", balance });
      } catch {
        dispatch({ type: "BALANCE_ERROR", message: "" });
      }
    } catch (err) {
      dispatch({
        type: "CONNECT_ERROR",
        message: walletErrorMessage(err as WalletError),
      });
    }
  }, []);

  // ── Connect: StellarWalletsKit (multi-wallet picker) ──

  const connectWithKit = useCallback(async (walletId: string) => {
    dispatch({ type: "CONNECT_START" });
    try {
      const publicKey = await connectViaKit(walletId);
      dispatch({ type: "CONNECT_SUCCESS", publicKey, walletType: "kit" });
      dispatch({ type: "BALANCE_LOADING" });
      try {
        const balance = await getXlmBalance(publicKey);
        dispatch({ type: "BALANCE_LOADED", balance });
      } catch {
        dispatch({ type: "BALANCE_ERROR", message: "" });
      }
    } catch (err) {
      dispatch({
        type: "CONNECT_ERROR",
        message: walletKitErrorMessage(err as WalletKitError),
      });
    }
  }, []);

  // ── Disconnect ──

  const disconnect = useCallback(() => {
    resetWalletsKit();
    dispatch({ type: "DISCONNECT" });
  }, []);

  // ── Payment TX ──

  const sendPayment = useCallback(
    async (destination: string, amount: string, memo?: string) => {
      if (!state.publicKey) return;
      dispatch({ type: "TX_START" });
      try {
        const hash = await sendXlm({
          sourcePublicKey: state.publicKey,
          destination,
          amount,
          memo,
        });
        dispatch({ type: "TX_SUCCESS", hash });
        // Auto-refresh balance
        dispatch({ type: "BALANCE_LOADING" });
        try {
          const balance = await getXlmBalance(state.publicKey);
          dispatch({ type: "BALANCE_LOADED", balance });
        } catch {
          dispatch({ type: "BALANCE_ERROR", message: "" });
        }
      } catch (err) {
        dispatch({
          type: "TX_FAILED",
          message: walletErrorMessage(err as WalletError),
        });
      }
    },
    [state.publicKey]
  );

  const resetTx = useCallback(() => {
    dispatch({ type: "TX_RESET" });
  }, []);

  // ── Contract TX ──

  /**
   * Internal helper: signs a pre-built transaction XDR using the active wallet.
   * Uses signViaKit for both "kit" and "freighter" wallet types (kit wraps Freighter).
   */
  const signTx = useCallback(
    async (txXdr: string): Promise<string> => {
      if (state.walletType === "kit") {
        return signViaKit(txXdr);
      }
      // Freighter direct path
      const { signTransaction } = await import("@stellar/freighter-api");
      const { Networks } = await import("@stellar/stellar-sdk");
      const { signedTxXdr, error } = await signTransaction(txXdr, {
        networkPassphrase: Networks.TESTNET,
        address: state.publicKey!,
      });
      if (error || !signedTxXdr) throw "SIGN_FAILED";
      return signedTxXdr;
    },
    [state.walletType, state.publicKey]
  );

  const createNote = useCallback(
    async (title: string, content: string) => {
      if (!state.publicKey) return;
      dispatch({ type: "CONTRACT_TX_START" });
      try {
        const txXdr = await buildCreateNoteTx(state.publicKey, title, content);
        const signedXdr = await signTx(txXdr);
        const hash = await submitSignedTx(signedXdr);
        dispatch({ type: "CONTRACT_TX_SUCCESS", hash });
        // Refresh balance — fees were deducted
        try {
          const balance = await getXlmBalance(state.publicKey);
          dispatch({ type: "BALANCE_LOADED", balance });
        } catch {
          /* ignore */
        }
      } catch (err) {
        dispatch({
          type: "CONTRACT_TX_FAILED",
          message: contractErrorMessage(err as ContractError),
        });
      }
    },
    [state.publicKey, signTx]
  );

  const deleteNote = useCallback(
    async (id: bigint) => {
      if (!state.publicKey) return;
      dispatch({ type: "CONTRACT_TX_START" });
      try {
        const txXdr = await buildDeleteNoteTx(state.publicKey, id);
        const signedXdr = await signTx(txXdr);
        const hash = await submitSignedTx(signedXdr);
        dispatch({ type: "CONTRACT_TX_SUCCESS", hash });
        try {
          const balance = await getXlmBalance(state.publicKey);
          dispatch({ type: "BALANCE_LOADED", balance });
        } catch {
          /* ignore */
        }
      } catch (err) {
        dispatch({
          type: "CONTRACT_TX_FAILED",
          message: contractErrorMessage(err as ContractError),
        });
      }
    },
    [state.publicKey, signTx]
  );

  const resetContractTx = useCallback(() => {
    dispatch({ type: "CONTRACT_TX_RESET" });
  }, []);

  return (
    <WalletContext.Provider
      value={{
        ...state,
        connect,
        connectWithKit,
        disconnect,
        refreshBalance,
        sendPayment,
        resetTx,
        createNote,
        deleteNote,
        resetContractTx,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useWallet(): WalletContextValue {
  const ctx = useContext(WalletContext);
  if (!ctx) {
    throw new Error("useWallet must be used inside <WalletContextProvider>");
  }
  return ctx;
}
