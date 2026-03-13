/**
 * Utility functions for the Expense Tracker app
 */

import { Transaction, MonthlyData, Category } from "./types";

/**
 * Format a number as currency
 */
export function formatCurrency(amount: number, symbol: string = "$"): string {
  return `${symbol}${Math.abs(amount).toFixed(2)}`;
}

/**
 * Format a date string (YYYY-MM-DD) to readable format
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/**
 * Get the current date in YYYY-MM-DD format
 */
export function getTodayDate(): string {
  const today = new Date();
  return today.toISOString().split("T")[0];
}

/**
 * Get the current month in YYYY-MM format
 */
export function getCurrentMonth(): string {
  const today = new Date();
  return today.toISOString().substring(0, 7);
}

/**
 * Get the previous month in YYYY-MM format
 */
export function getPreviousMonth(month: string): string {
  const [year, monthNum] = month.split("-").map(Number);
  if (monthNum === 1) {
    return `${year - 1}-12`;
  }
  return `${year}-${String(monthNum - 1).padStart(2, "0")}`;
}

/**
 * Get the next month in YYYY-MM format
 */
export function getNextMonth(month: string): string {
  const [year, monthNum] = month.split("-").map(Number);
  if (monthNum === 12) {
    return `${year + 1}-01`;
  }
  return `${year}-${String(monthNum + 1).padStart(2, "0")}`;
}

/**
 * Filter transactions by month
 */
export function getTransactionsByMonth(transactions: Transaction[], month: string): Transaction[] {
  return transactions.filter((t) => t.date.startsWith(month));
}

/**
 * Filter transactions by category
 */
export function getTransactionsByCategory(
  transactions: Transaction[],
  category: Category
): Transaction[] {
  return transactions.filter((t) => t.category === category);
}

/**
 * Calculate monthly data from transactions
 */
export function calculateMonthlyData(transactions: Transaction[], month: string): MonthlyData {
  const monthTransactions = getTransactionsByMonth(transactions, month);
  const categories: Record<string, number> = {};

  let totalIncome = 0;
  let totalExpense = 0;

  monthTransactions.forEach((t) => {
    if (t.type === "income") {
      totalIncome += t.amount;
    } else {
      totalExpense += t.amount;
    }

    if (!categories[t.category]) {
      categories[t.category] = 0;
    }
    categories[t.category] += t.amount;
  });

  return {
    month,
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
    categories: categories as Record<Category, number>,
  };
}

/**
 * Get transactions sorted by date (newest first)
 */
export function sortTransactionsByDate(transactions: Transaction[]): Transaction[] {
  return [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/**
 * Get the last N transactions
 */
export function getRecentTransactions(transactions: Transaction[], count: number = 10): Transaction[] {
  return sortTransactionsByDate(transactions).slice(0, count);
}

/**
 * Validate transaction amount
 */
export function isValidAmount(amount: string): boolean {
  const num = parseFloat(amount);
  return !isNaN(num) && num > 0;
}

/**
 * Parse amount string to number
 */
export function parseAmount(amount: string): number {
  return parseFloat(amount) || 0;
}
