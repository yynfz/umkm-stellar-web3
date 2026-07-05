"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useReducer,
} from "react";
import {
  connectWallet as _connect,
  getXlmBalance,
  sendXlm,
  walletErrorMessage,
  type WalletError,
} from "@/lib/stellar/wallet";

// ─── State ───────────────────────────────────────────────────────────────────

export type ConnectionStatus =
  | "idle"
  | "connecting"
  | "connected"
  | "disconnecting"
  | "error";

export type TxStatus = "idle" | "pending" | "success" | "failed";

interface WalletState {
  publicKey: string | null;
  balance: string | null;
  connectionStatus: ConnectionStatus;
  txStatus: TxStatus;
  txHash: string | null;
  errorMessage: string | null;
  txErrorMessage: string | null;
  isBalanceLoading: boolean;
}

const initialState: WalletState = {
  publicKey: null,
  balance: null,
  connectionStatus: "idle",
  txStatus: "idle",
  txHash: null,
  errorMessage: null,
  txErrorMessage: null,
  isBalanceLoading: false,
};

// ─── Actions ─────────────────────────────────────────────────────────────────

type Action =
  | { type: "CONNECT_START" }
  | { type: "CONNECT_SUCCESS"; publicKey: string }
  | { type: "CONNECT_ERROR"; message: string }
  | { type: "DISCONNECT" }
  | { type: "BALANCE_LOADING" }
  | { type: "BALANCE_LOADED"; balance: string }
  | { type: "BALANCE_ERROR"; message: string }
  | { type: "TX_START" }
  | { type: "TX_SUCCESS"; hash: string }
  | { type: "TX_FAILED"; message: string }
  | { type: "TX_RESET" };

function reducer(state: WalletState, action: Action): WalletState {
  switch (action.type) {
    case "CONNECT_START":
      return { ...state, connectionStatus: "connecting", errorMessage: null };
    case "CONNECT_SUCCESS":
      return {
        ...state,
        connectionStatus: "connected",
        publicKey: action.publicKey,
        errorMessage: null,
      };
    case "CONNECT_ERROR":
      return {
        ...state,
        connectionStatus: "error",
        errorMessage: action.message,
      };
    case "DISCONNECT":
      return {
        ...initialState,
        connectionStatus: "idle",
      };
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
      return {
        ...state,
        txStatus: "failed",
        txErrorMessage: action.message,
      };
    case "TX_RESET":
      return { ...state, txStatus: "idle", txHash: null, txErrorMessage: null };
    default:
      return state;
  }
}

// ─── Context ─────────────────────────────────────────────────────────────────

interface WalletContextValue extends WalletState {
  connect: () => Promise<void>;
  disconnect: () => void;
  refreshBalance: () => Promise<void>;
  sendPayment: (
    destination: string,
    amount: string,
    memo?: string
  ) => Promise<void>;
  resetTx: () => void;
}

export const WalletContext = createContext<WalletContextValue | null>(null);

// ─── Provider ────────────────────────────────────────────────────────────────

export function WalletContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, dispatch] = useReducer(reducer, initialState);

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

  const connect = useCallback(async () => {
    dispatch({ type: "CONNECT_START" });
    try {
      const publicKey = await _connect();
      dispatch({ type: "CONNECT_SUCCESS", publicKey });
      // Fetch balance immediately after connecting
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

  const disconnect = useCallback(() => {
    dispatch({ type: "DISCONNECT" });
  }, []);

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
        // Auto-refresh balance after success (FR-9)
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

  return (
    <WalletContext.Provider
      value={{
        ...state,
        connect,
        disconnect,
        refreshBalance,
        sendPayment,
        resetTx,
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
