/**
 * Storage utilities for persisting transactions and settings to AsyncStorage
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { Transaction, Settings } from "./types";

const TRANSACTIONS_KEY = "@expense_tracker_transactions";
const SETTINGS_KEY = "@expense_tracker_settings";

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
