import { Budget, Transaction, ExpenseCategory } from "./types";
import { getCurrentMonth } from "./utils-expense";

/**
 * Calculate spending for a category in a given month
 */
export function getCategorySpending(
  transactions: Transaction[],
  category: ExpenseCategory,
  month: string
): number {
  return transactions
    .filter(
      (t) =>
        t.type === "expense" &&
        t.category === category &&
        t.date.startsWith(month)
    )
    .reduce((sum, t) => sum + t.amount, 0);
}

/**
 * Calculate budget progress percentage
 */
export function getBudgetProgress(spent: number, limit: number): number {
  if (limit <= 0) return 0;
  return Math.min((spent / limit) * 100, 100);
}

/**
 * Get budget status based on spending
 */
export type BudgetStatus = "on_track" | "warning" | "exceeded";

export function getBudgetStatus(spent: number, limit: number): BudgetStatus {
  const progress = getBudgetProgress(spent, limit);
  if (progress >= 100) return "exceeded";
  if (progress >= 80) return "warning";
  return "on_track";
}

/**
 * Calculate remaining budget
 */
export function getRemainingBudget(spent: number, limit: number): number {
  return Math.max(limit - spent, 0);
}

/**
 * Get budget details for display
 */
export interface BudgetDetails {
  budget: Budget;
  spent: number;
  remaining: number;
  progress: number;
  status: BudgetStatus;
}

export function calculateBudgetDetails(
  budget: Budget,
  transactions: Transaction[]
): BudgetDetails {
  const spent = getCategorySpending(transactions, budget.category, budget.month);
  const remaining = getRemainingBudget(spent, budget.monthlyLimit);
  const progress = getBudgetProgress(spent, budget.monthlyLimit);
  const status = getBudgetStatus(spent, budget.monthlyLimit);

  return {
    budget,
    spent,
    remaining,
    progress,
    status,
  };
}

/**
 * Get all budgets for a month with their details
 */
export function getBudgetsWithDetails(
  budgets: Budget[],
  transactions: Transaction[],
  month: string = getCurrentMonth()
): BudgetDetails[] {
  return budgets
    .filter((b) => b.month === month)
    .map((budget) => calculateBudgetDetails(budget, transactions))
    .sort((a, b) => b.progress - a.progress); // Sort by progress descending
}

/**
 * Check if any budgets are exceeded
 */
export function hasExceededBudgets(budgets: Budget[], transactions: Transaction[]): boolean {
  return budgets.some((budget) => {
    const spent = getCategorySpending(transactions, budget.category, budget.month);
    return spent > budget.monthlyLimit;
  });
}

/**
 * Get budgets that are approaching or exceeding limits
 */
export function getAlertBudgets(
  budgets: Budget[],
  transactions: Transaction[],
  threshold: number = 80
): BudgetDetails[] {
  return getBudgetsWithDetails(budgets, transactions).filter(
    (details) => details.progress >= threshold
  );
}

/**
 * Calculate total budgeted amount for a month
 */
export function getTotalBudgetedAmount(
  budgets: Budget[],
  month: string = getCurrentMonth()
): number {
  return budgets
    .filter((b) => b.month === month)
    .reduce((sum, b) => sum + b.monthlyLimit, 0);
}

/**
 * Calculate total spent against budgets for a month
 */
export function getTotalBudgetSpending(
  budgets: Budget[],
  transactions: Transaction[],
  month: string = getCurrentMonth()
): number {
  return budgets
    .filter((b) => b.month === month)
    .reduce((sum, b) => {
      const spent = getCategorySpending(transactions, b.category, month);
      return sum + spent;
    }, 0);
}

/**
 * Get budget utilization percentage
 */
export function getBudgetUtilization(
  budgets: Budget[],
  transactions: Transaction[],
  month: string = getCurrentMonth()
): number {
  const total = getTotalBudgetedAmount(budgets, month);
  if (total <= 0) return 0;
  const spent = getTotalBudgetSpending(budgets, transactions, month);
  return (spent / total) * 100;
}

/**
 * Format budget status for display
 */
export function formatBudgetStatus(status: BudgetStatus): string {
  const labels: Record<BudgetStatus, string> = {
    on_track: "On Track",
    warning: "Warning",
    exceeded: "Exceeded",
  };
  return labels[status];
}

/**
 * Get color for budget status
 */
export function getBudgetStatusColor(
  status: BudgetStatus,
  colors: { success: string; warning: string; error: string }
): string {
  switch (status) {
    case "on_track":
      return colors.success;
    case "warning":
      return colors.warning;
    case "exceeded":
      return colors.error;
  }
}

/**
 * Validate budget data
 */
export function isValidBudget(limit: number): boolean {
  return limit > 0 && isFinite(limit);
}

/**
 * Get default budgets for all expense categories
 */
export function getDefaultBudgets(month: string = getCurrentMonth()): Omit<Budget, "id" | "createdAt" | "updatedAt">[] {
  const expenseCategories: ExpenseCategory[] = [
    "food",
    "transport",
    "entertainment",
    "shopping",
    "bills",
    "health",
    "education",
    "other",
  ];

  return expenseCategories.map((category) => ({
    category,
    monthlyLimit: 500, // Default limit
    month,
  }));
}
