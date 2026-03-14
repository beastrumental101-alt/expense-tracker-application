/**
 * Budget context for global budget state management
 */

import React, { createContext, useContext, useEffect, useReducer, ReactNode } from "react";
import { Budget } from "./types";
import * as storage from "./storage";
import { useTransactions } from "./transaction-context";
import { getCurrentMonth } from "./utils-expense";

interface BudgetContextType {
  budgets: Budget[];
  addBudget: (budget: Omit<Budget, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  updateBudget: (id: string, updates: Partial<Budget>) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
  clearBudgetsForMonth: (month: string) => Promise<void>;
  isLoading: boolean;
}

const BudgetContext = createContext<BudgetContextType | undefined>(undefined);

interface State {
  budgets: Budget[];
  isLoading: boolean;
}

type Action =
  | { type: "SET_BUDGETS"; payload: Budget[] }
  | { type: "ADD_BUDGET"; payload: Budget }
  | { type: "UPDATE_BUDGET"; payload: { id: string; updates: Partial<Budget> } }
  | { type: "DELETE_BUDGET"; payload: string }
  | { type: "CLEAR_BUDGETS"; payload: string }
  | { type: "SET_LOADING"; payload: boolean };

function budgetReducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_BUDGETS":
      return { ...state, budgets: action.payload };
    case "ADD_BUDGET":
      return { ...state, budgets: [...state.budgets, action.payload] };
    case "UPDATE_BUDGET": {
      const { id, updates } = action.payload;
      return {
        ...state,
        budgets: state.budgets.map((b) => (b.id === id ? { ...b, ...updates } : b)),
      };
    }
    case "DELETE_BUDGET":
      return {
        ...state,
        budgets: state.budgets.filter((b) => b.id !== action.payload),
      };
    case "CLEAR_BUDGETS":
      return {
        ...state,
        budgets: state.budgets.filter((b) => b.month !== action.payload),
      };
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    default:
      return state;
  }
}

const initialState: State = {
  budgets: [],
  isLoading: true,
};

export function BudgetProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(budgetReducer, initialState);
  const { transactions } = useTransactions();

  // Load budgets on mount
  useEffect(() => {
    async function loadData() {
      dispatch({ type: "SET_LOADING", payload: true });
      try {
        const budgets = await storage.getBudgets();
        dispatch({ type: "SET_BUDGETS", payload: budgets });
      } catch (error) {
        console.error("Error loading budgets:", error);
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    }

    loadData();
  }, []);

  const contextValue: BudgetContextType = {
    budgets: state.budgets,
    isLoading: state.isLoading,

    addBudget: async (budget) => {
      const newBudget: Budget = {
        ...budget,
        id: `budget-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      dispatch({ type: "ADD_BUDGET", payload: newBudget });
      await storage.addBudget(newBudget);
    },

    updateBudget: async (id, updates) => {
      dispatch({ type: "UPDATE_BUDGET", payload: { id, updates } });
      await storage.updateBudget(id, updates);
    },

    deleteBudget: async (id) => {
      dispatch({ type: "DELETE_BUDGET", payload: id });
      await storage.deleteBudget(id);
    },

    clearBudgetsForMonth: async (month) => {
      dispatch({ type: "CLEAR_BUDGETS", payload: month });
      await storage.clearBudgetsForMonth(month);
    },
  };

  return (
    <BudgetContext.Provider value={contextValue}>{children}</BudgetContext.Provider>
  );
}

export function useBudgets(): BudgetContextType {
  const context = useContext(BudgetContext);
  if (!context) {
    throw new Error("useBudgets must be used within BudgetProvider");
  }
  return context;
}
