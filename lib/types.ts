/**
 * Core types for the Expense Tracker app
 */

export type TransactionType = "income" | "expense";

export type IncomeCategory = "salary" | "freelance" | "investment" | "bonus" | "other";
export type ExpenseCategory =
  | "food"
  | "transport"
  | "entertainment"
  | "shopping"
  | "bills"
  | "health"
  | "education"
  | "other";

export type Category = IncomeCategory | ExpenseCategory;

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: Category;
  date: string; // ISO date string (YYYY-MM-DD)
  notes?: string;
  createdAt: string; // ISO timestamp
}

export interface MonthlyData {
  month: string; // YYYY-MM format
  totalIncome: number;
  totalExpense: number;
  balance: number;
  categories: Record<Category, number>;
}

export interface Settings {
  currency: string; // e.g., "USD", "EUR", "GBP"
  currencySymbol: string; // e.g., "$", "€", "£"
}

// Category metadata for UI rendering
export const INCOME_CATEGORIES: Record<IncomeCategory, { label: string; icon: string }> = {
  salary: { label: "Salary", icon: "attach-money" },
  freelance: { label: "Freelance", icon: "trending-up" },
  investment: { label: "Investment", icon: "trending-up" },
  bonus: { label: "Bonus", icon: "card-giftcard" },
  other: { label: "Other", icon: "help-outline" },
};

export const EXPENSE_CATEGORIES: Record<ExpenseCategory, { label: string; icon: string }> = {
  food: { label: "Food", icon: "restaurant" },
  transport: { label: "Transport", icon: "directions-car" },
  entertainment: { label: "Entertainment", icon: "movie" },
  shopping: { label: "Shopping", icon: "shopping-bag" },
  bills: { label: "Bills", icon: "receipt" },
  health: { label: "Health", icon: "favorite" },
  education: { label: "Education", icon: "school" },
  other: { label: "Other", icon: "help-outline" },
};

export const ALL_CATEGORIES = { ...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES };

export function getCategoryLabel(category: Category): string {
  return ALL_CATEGORIES[category]?.label || category;
}

export function getCategoryIcon(category: Category): string {
  return ALL_CATEGORIES[category]?.icon || "help-outline";
}

export function isIncomeCategory(category: Category): boolean {
  return category in INCOME_CATEGORIES;
}

export function isExpenseCategory(category: Category): boolean {
  return category in EXPENSE_CATEGORIES;
}
