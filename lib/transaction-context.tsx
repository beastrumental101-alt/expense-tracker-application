/**
 * Transaction context for global state management
 */

import React, { createContext, useContext, useEffect, useReducer, ReactNode } from "react";
import { Transaction, Settings, MonthlyData, Category } from "./types";
import * as storage from "./storage";
import { calculateMonthlyData } from "./utils-expense";

interface TransactionContextType {
  transactions: Transaction[];
  settings: Settings;
  monthlyData: Record<string, MonthlyData>;
  addTransaction: (transaction: Omit<Transaction, "id" | "createdAt">) => Promise<void>;
  updateTransaction: (id: string, updates: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  updateSettings: (updates: Partial<Settings>) => Promise<void>;
  clearAllTransactions: () => Promise<void>;
  exportTransactionsAsCSV: () => Promise<string>;
  isLoading: boolean;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

interface State {
  transactions: Transaction[];
  settings: Settings;
  isLoading: boolean;
}

type Action =
  | { type: "SET_TRANSACTIONS"; payload: Transaction[] }
  | { type: "ADD_TRANSACTION"; payload: Transaction }
  | { type: "UPDATE_TRANSACTION"; payload: { id: string; updates: Partial<Transaction> } }
  | { type: "DELETE_TRANSACTION"; payload: string }
  | { type: "SET_SETTINGS"; payload: Settings }
  | { type: "UPDATE_SETTINGS"; payload: Partial<Settings> }
  | { type: "CLEAR_TRANSACTIONS" }
  | { type: "SET_LOADING"; payload: boolean };

function transactionReducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_TRANSACTIONS":
      return { ...state, transactions: action.payload };
    case "ADD_TRANSACTION":
      return { ...state, transactions: [...state.transactions, action.payload] };
    case "UPDATE_TRANSACTION": {
      const { id, updates } = action.payload;
      return {
        ...state,
        transactions: state.transactions.map((t) => (t.id === id ? { ...t, ...updates } : t)),
      };
    }
    case "DELETE_TRANSACTION":
      return {
        ...state,
        transactions: state.transactions.filter((t) => t.id !== action.payload),
      };
    case "SET_SETTINGS":
      return { ...state, settings: action.payload };
    case "UPDATE_SETTINGS":
      return { ...state, settings: { ...state.settings, ...action.payload } };
    case "CLEAR_TRANSACTIONS":
      return { ...state, transactions: [] };
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
}

const initialState: State = {
  transactions: [],
  settings: { currency: "USD", currencySymbol: "$" },
  isLoading: true,
};

export function TransactionProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(transactionReducer, initialState);

  // Load data from storage on mount
  useEffect(() => {
    async function loadData() {
      dispatch({ type: "SET_LOADING", payload: true });
      try {
        const [transactions, settings] = await Promise.all([
          storage.getTransactions(),
          storage.getSettings(),
        ]);
        dispatch({ type: "SET_TRANSACTIONS", payload: transactions });
        dispatch({ type: "SET_SETTINGS", payload: settings });
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    }

    loadData();
  }, []);

  // Calculate monthly data
  const monthlyData = React.useMemo(() => {
    const data: Record<string, MonthlyData> = {};
    state.transactions.forEach((transaction) => {
      const month = transaction.date.substring(0, 7); // YYYY-MM
      if (!data[month]) {
        data[month] = {
          month,
          totalIncome: 0,
          totalExpense: 0,
          balance: 0,
          categories: {} as Record<Category, number>,
        };
      }

      if (transaction.type === "income") {
        data[month].totalIncome += transaction.amount;
      } else {
        data[month].totalExpense += transaction.amount;
      }

      if (!(transaction.category in data[month].categories)) {
        (data[month].categories as Record<string, number>)[transaction.category] = 0;
      }
      (data[month].categories as Record<string, number>)[transaction.category] += transaction.amount;

      data[month].balance = data[month].totalIncome - data[month].totalExpense;
    });

    return data;
  }, [state.transactions]);

  const contextValue: TransactionContextType = {
    transactions: state.transactions,
    settings: state.settings,
    monthlyData,
    isLoading: state.isLoading,

    addTransaction: async (transaction) => {
      const newTransaction: Transaction = {
        ...transaction,
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
      };
      dispatch({ type: "ADD_TRANSACTION", payload: newTransaction });
      await storage.addTransaction(newTransaction);
    },

    updateTransaction: async (id, updates) => {
      dispatch({ type: "UPDATE_TRANSACTION", payload: { id, updates } });
      await storage.updateTransaction(id, updates);
    },

    deleteTransaction: async (id) => {
      dispatch({ type: "DELETE_TRANSACTION", payload: id });
      await storage.deleteTransaction(id);
    },

    updateSettings: async (updates) => {
      dispatch({ type: "UPDATE_SETTINGS", payload: updates });
      await storage.updateSettings(updates);
    },

    clearAllTransactions: async () => {
      dispatch({ type: "CLEAR_TRANSACTIONS" });
      await storage.clearAllTransactions();
    },

    exportTransactionsAsCSV: async () => {
      return await storage.exportTransactionsAsCSV();
    },
  };

  return (
    <TransactionContext.Provider value={contextValue}>{children}</TransactionContext.Provider>
  );
}

export function useTransactions(): TransactionContextType {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error("useTransactions must be used within TransactionProvider");
  }
  return context;
}
