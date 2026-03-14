/**
 * Recurring transaction context for managing recurring transactions
 */

import React, { createContext, useContext, useEffect, useReducer, ReactNode } from "react";
import { RecurringTransaction } from "./types";
import * as storage from "./storage";
import {
  shouldGenerateTransaction,
  generateTransactionFromRecurring,
  getNextRecurrenceDate,
} from "./recurring-utils";
import { useTransactions } from "./transaction-context";

interface RecurringContextType {
  recurringTransactions: RecurringTransaction[];
  addRecurringTransaction: (
    recurring: Omit<RecurringTransaction, "id" | "createdAt">
  ) => Promise<void>;
  updateRecurringTransaction: (
    id: string,
    updates: Partial<RecurringTransaction>
  ) => Promise<void>;
  deleteRecurringTransaction: (id: string) => Promise<void>;
  syncRecurringTransactions: () => Promise<void>;
  isLoading: boolean;
}

const RecurringContext = createContext<RecurringContextType | undefined>(undefined);

interface State {
  recurringTransactions: RecurringTransaction[];
  isLoading: boolean;
}

type Action =
  | { type: "SET_RECURRING_TRANSACTIONS"; payload: RecurringTransaction[] }
  | { type: "ADD_RECURRING_TRANSACTION"; payload: RecurringTransaction }
  | {
      type: "UPDATE_RECURRING_TRANSACTION";
      payload: { id: string; updates: Partial<RecurringTransaction> };
    }
  | { type: "DELETE_RECURRING_TRANSACTION"; payload: string }
  | { type: "SET_LOADING"; payload: boolean };

function recurringReducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_RECURRING_TRANSACTIONS":
      return { ...state, recurringTransactions: action.payload };
    case "ADD_RECURRING_TRANSACTION":
      return {
        ...state,
        recurringTransactions: [...state.recurringTransactions, action.payload],
      };
    case "UPDATE_RECURRING_TRANSACTION": {
      const { id, updates } = action.payload;
      return {
        ...state,
        recurringTransactions: state.recurringTransactions.map((t) =>
          t.id === id ? { ...t, ...updates } : t
        ),
      };
    }
    case "DELETE_RECURRING_TRANSACTION":
      return {
        ...state,
        recurringTransactions: state.recurringTransactions.filter(
          (t) => t.id !== action.payload
        ),
      };
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
}

const initialState: State = {
  recurringTransactions: [],
  isLoading: true,
};

export function RecurringProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(recurringReducer, initialState);
  const { addTransaction } = useTransactions();

  // Load recurring transactions on mount
  useEffect(() => {
    async function loadData() {
      dispatch({ type: "SET_LOADING", payload: true });
      try {
        const recurringTransactions = await storage.getRecurringTransactions();
        dispatch({ type: "SET_RECURRING_TRANSACTIONS", payload: recurringTransactions });
      } catch (error) {
        console.error("Error loading recurring transactions:", error);
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    }

    loadData();
  }, []);

  // Sync recurring transactions periodically
  useEffect(() => {
    const syncInterval = setInterval(async () => {
      await syncRecurringTransactions();
    }, 60000); // Sync every minute

    return () => clearInterval(syncInterval);
  }, [state.recurringTransactions, addTransaction]);

  const syncRecurringTransactions = async () => {
    try {
      const lastSync = await storage.getLastSyncTime();
      const now = Date.now();

      // Only sync if more than 1 hour has passed
      if (now - lastSync < 3600000) {
        return;
      }

      for (const recurring of state.recurringTransactions) {
        if (shouldGenerateTransaction(recurring)) {
          // Generate transaction
          const transaction = generateTransactionFromRecurring(recurring);
          await addTransaction({
            type: transaction.type,
            amount: transaction.amount,
            category: transaction.category,
            date: transaction.date,
            notes: transaction.notes,
          });

          // Update last generated date
          const nextDate = getNextRecurrenceDate(recurring.lastGeneratedDate || recurring.startDate, recurring.frequency);
          await storage.updateRecurringTransaction(recurring.id, {
            lastGeneratedDate: nextDate,
          });
          dispatch({
            type: "UPDATE_RECURRING_TRANSACTION",
            payload: { id: recurring.id, updates: { lastGeneratedDate: nextDate } },
          });
        }
      }

      await storage.updateLastSyncTime();
    } catch (error) {
      console.error("Error syncing recurring transactions:", error);
    }
  };

  const contextValue: RecurringContextType = {
    recurringTransactions: state.recurringTransactions,
    isLoading: state.isLoading,

    addRecurringTransaction: async (recurring) => {
      const newRecurring: RecurringTransaction = {
        ...recurring,
        id: `recurring-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
      };
      dispatch({ type: "ADD_RECURRING_TRANSACTION", payload: newRecurring });
      await storage.addRecurringTransaction(newRecurring);
    },

    updateRecurringTransaction: async (id, updates) => {
      dispatch({ type: "UPDATE_RECURRING_TRANSACTION", payload: { id, updates } });
      await storage.updateRecurringTransaction(id, updates);
    },

    deleteRecurringTransaction: async (id) => {
      dispatch({ type: "DELETE_RECURRING_TRANSACTION", payload: id });
      await storage.deleteRecurringTransaction(id);
    },

    syncRecurringTransactions,
  };

  return (
    <RecurringContext.Provider value={contextValue}>{children}</RecurringContext.Provider>
  );
}

export function useRecurring(): RecurringContextType {
  const context = useContext(RecurringContext);
  if (!context) {
    throw new Error("useRecurring must be used within RecurringProvider");
  }
  return context;
}
