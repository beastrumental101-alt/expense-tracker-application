/**
 * Storage utilities for persisting transactions and settings to AsyncStorage
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { Transaction, Settings, RecurringTransaction, Budget } from "./types";

const TRANSACTIONS_KEY = "@expense_tracker_transactions";
const SETTINGS_KEY = "@expense_tracker_settings";
const RECURRING_TRANSACTIONS_KEY = "@expense_tracker_recurring_transactions";
const LAST_SYNC_KEY = "@expense_tracker_last_sync";
const BUDGETS_KEY = "@expense_tracker_budgets";

const DEFAULT_SETTINGS: Settings = {
  currency: "USD",
  currencySymbol: "$",
};

/**
 * Get all transactions from storage
 */
export async function getTransactions(): Promise<Transaction[]> {
  try {
    const data = await AsyncStorage.getItem(TRANSACTIONS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error reading transactions:", error);
    return [];
  }
}

/**
 * Save a single transaction
 */
export async function addTransaction(transaction: Transaction): Promise<void> {
  try {
    const transactions = await getTransactions();
    transactions.push(transaction);
    await AsyncStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
  } catch (error) {
    console.error("Error saving transaction:", error);
    throw error;
  }
}

/**
 * Update a transaction
 */
export async function updateTransaction(id: string, updates: Partial<Transaction>): Promise<void> {
  try {
    const transactions = await getTransactions();
    const index = transactions.findIndex((t) => t.id === id);
    if (index !== -1) {
      transactions[index] = { ...transactions[index], ...updates };
      await AsyncStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
    }
  } catch (error) {
    console.error("Error updating transaction:", error);
    throw error;
  }
}

/**
 * Delete a transaction
 */
export async function deleteTransaction(id: string): Promise<void> {
  try {
    const transactions = await getTransactions();
    const filtered = transactions.filter((t) => t.id !== id);
    await AsyncStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error("Error deleting transaction:", error);
    throw error;
  }
}

/**
 * Clear all transactions
 */
export async function clearAllTransactions(): Promise<void> {
  try {
    await AsyncStorage.removeItem(TRANSACTIONS_KEY);
  } catch (error) {
    console.error("Error clearing transactions:", error);
    throw error;
  }
}

/**
 * Get settings
 */
export async function getSettings(): Promise<Settings> {
  try {
    const data = await AsyncStorage.getItem(SETTINGS_KEY);
    return data ? JSON.parse(data) : DEFAULT_SETTINGS;
  } catch (error) {
    console.error("Error reading settings:", error);
    return DEFAULT_SETTINGS;
  }
}

/**
 * Update settings
 */
export async function updateSettings(updates: Partial<Settings>): Promise<void> {
  try {
    const current = await getSettings();
    const updated = { ...current, ...updates };
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error("Error updating settings:", error);
    throw error;
  }
}

/**
 * Export transactions as CSV
 */
export async function exportTransactionsAsCSV(): Promise<string> {
  try {
    const transactions = await getTransactions();
    const settings = await getSettings();

    // CSV header
    const header = ["Date", "Type", "Category", "Amount", "Notes"];
    const rows = transactions.map((t) => [
      t.date,
      t.type.toUpperCase(),
      t.category,
      `${settings.currencySymbol}${t.amount.toFixed(2)}`,
      t.notes || "",
    ]);

    const csv = [header, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");

    return csv;
  } catch (error) {
    console.error("Error exporting transactions:", error);
    throw error;
  }
}

/**
 * Get all recurring transactions from storage
 */
export async function getRecurringTransactions(): Promise<RecurringTransaction[]> {
  try {
    const data = await AsyncStorage.getItem(RECURRING_TRANSACTIONS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error reading recurring transactions:", error);
    return [];
  }
}

/**
 * Add a recurring transaction
 */
export async function addRecurringTransaction(
  recurring: RecurringTransaction
): Promise<void> {
  try {
    const recurringTransactions = await getRecurringTransactions();
    recurringTransactions.push(recurring);
    await AsyncStorage.setItem(
      RECURRING_TRANSACTIONS_KEY,
      JSON.stringify(recurringTransactions)
    );
  } catch (error) {
    console.error("Error saving recurring transaction:", error);
    throw error;
  }
}

/**
 * Update a recurring transaction
 */
export async function updateRecurringTransaction(
  id: string,
  updates: Partial<RecurringTransaction>
): Promise<void> {
  try {
    const recurringTransactions = await getRecurringTransactions();
    const index = recurringTransactions.findIndex((t) => t.id === id);
    if (index !== -1) {
      recurringTransactions[index] = { ...recurringTransactions[index], ...updates };
      await AsyncStorage.setItem(
        RECURRING_TRANSACTIONS_KEY,
        JSON.stringify(recurringTransactions)
      );
    }
  } catch (error) {
    console.error("Error updating recurring transaction:", error);
    throw error;
  }
}

/**
 * Delete a recurring transaction
 */
export async function deleteRecurringTransaction(id: string): Promise<void> {
  try {
    const recurringTransactions = await getRecurringTransactions();
    const filtered = recurringTransactions.filter((t) => t.id !== id);
    await AsyncStorage.setItem(
      RECURRING_TRANSACTIONS_KEY,
      JSON.stringify(filtered)
    );
  } catch (error) {
    console.error("Error deleting recurring transaction:", error);
    throw error;
  }
}

/**
 * Get last sync timestamp
 */
export async function getLastSyncTime(): Promise<number> {
  try {
    const data = await AsyncStorage.getItem(LAST_SYNC_KEY);
    return data ? parseInt(data, 10) : 0;
  } catch (error) {
    console.error("Error reading last sync time:", error);
    return 0;
  }
}

/**
 * Update last sync timestamp
 */
export async function updateLastSyncTime(): Promise<void> {
  try {
    await AsyncStorage.setItem(LAST_SYNC_KEY, Date.now().toString());
  } catch (error) {
    console.error("Error updating last sync time:", error);
    throw error;
  }
}

/**
 * Get all budgets from storage
 */
export async function getBudgets(): Promise<Budget[]> {
  try {
    const data = await AsyncStorage.getItem(BUDGETS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error reading budgets:", error);
    return [];
  }
}

/**
 * Add a budget
 */
export async function addBudget(budget: Budget): Promise<void> {
  try {
    const budgets = await getBudgets();
    budgets.push(budget);
    await AsyncStorage.setItem(BUDGETS_KEY, JSON.stringify(budgets));
  } catch (error) {
    console.error("Error saving budget:", error);
    throw error;
  }
}

/**
 * Update a budget
 */
export async function updateBudget(id: string, updates: Partial<Budget>): Promise<void> {
  try {
    const budgets = await getBudgets();
    const index = budgets.findIndex((b) => b.id === id);
    if (index !== -1) {
      budgets[index] = { ...budgets[index], ...updates, updatedAt: new Date().toISOString() };
      await AsyncStorage.setItem(BUDGETS_KEY, JSON.stringify(budgets));
    }
  } catch (error) {
    console.error("Error updating budget:", error);
    throw error;
  }
}

/**
 * Delete a budget
 */
export async function deleteBudget(id: string): Promise<void> {
  try {
    const budgets = await getBudgets();
    const filtered = budgets.filter((b) => b.id !== id);
    await AsyncStorage.setItem(BUDGETS_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error("Error deleting budget:", error);
    throw error;
  }
}

/**
 * Clear all budgets for a specific month
 */
export async function clearBudgetsForMonth(month: string): Promise<void> {
  try {
    const budgets = await getBudgets();
    const filtered = budgets.filter((b) => b.month !== month);
    await AsyncStorage.setItem(BUDGETS_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error("Error clearing budgets:", error);
    throw error;
  }
}
