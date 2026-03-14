import { RecurringTransaction, RecurrenceFrequency, Transaction } from "./types";
import { getTodayDate } from "./utils-expense";

/**
 * Calculate the next date a recurring transaction should be generated
 */
export function getNextRecurrenceDate(
  currentDate: string,
  frequency: RecurrenceFrequency
): string {
  const date = new Date(currentDate);

  switch (frequency) {
    case "daily":
      date.setDate(date.getDate() + 1);
      break;
    case "weekly":
      date.setDate(date.getDate() + 7);
      break;
    case "biweekly":
      date.setDate(date.getDate() + 14);
      break;
    case "monthly":
      date.setMonth(date.getMonth() + 1);
      break;
    case "quarterly":
      date.setMonth(date.getMonth() + 3);
      break;
    case "yearly":
      date.setFullYear(date.getFullYear() + 1);
      break;
  }

  return date.toISOString().split("T")[0];
}

/**
 * Check if a recurring transaction should generate a new transaction today
 */
export function shouldGenerateTransaction(
  recurring: RecurringTransaction,
  today: string = getTodayDate()
): boolean {
  // Check if start date has passed
  if (today < recurring.startDate) {
    return false;
  }

  // Check if end date has passed
  if (recurring.endDate && today > recurring.endDate) {
    return false;
  }

  // If no last generated date, check if today is on or after start date
  if (!recurring.lastGeneratedDate) {
    return today >= recurring.startDate;
  }

  // Calculate next generation date
  const nextDate = getNextRecurrenceDate(recurring.lastGeneratedDate, recurring.frequency);
  return today >= nextDate;
}

/**
 * Generate a transaction from a recurring transaction template
 */
export function generateTransactionFromRecurring(
  recurring: RecurringTransaction,
  date: string = getTodayDate()
): Transaction {
  return {
    id: `${recurring.id}-${date}-${Date.now()}`,
    type: recurring.type,
    amount: recurring.amount,
    category: recurring.category,
    date,
    notes: recurring.notes ? `[Recurring] ${recurring.notes}` : "[Recurring]",
    createdAt: new Date().toISOString(),
  };
}

/**
 * Get all recurring transactions that need to generate transactions today
 */
export function getRecurringTransactionsToGenerate(
  recurringTransactions: RecurringTransaction[],
  today: string = getTodayDate()
): RecurringTransaction[] {
  return recurringTransactions.filter((recurring) => shouldGenerateTransaction(recurring, today));
}

/**
 * Get frequency label for display
 */
export function getFrequencyLabel(frequency: RecurrenceFrequency): string {
  const labels: Record<RecurrenceFrequency, string> = {
    daily: "Daily",
    weekly: "Weekly",
    biweekly: "Every 2 weeks",
    monthly: "Monthly",
    quarterly: "Quarterly",
    yearly: "Yearly",
  };
  return labels[frequency];
}

/**
 * Format recurring transaction for display
 */
export function formatRecurringTransactionDisplay(
  recurring: RecurringTransaction,
  currencySymbol: string = "$"
): string {
  const amount = `${currencySymbol}${recurring.amount.toFixed(2)}`;
  const frequency = getFrequencyLabel(recurring.frequency);
  const type = recurring.type === "income" ? "Income" : "Expense";

  let dateRange = `Starting ${recurring.startDate}`;
  if (recurring.endDate) {
    dateRange += ` until ${recurring.endDate}`;
  }

  return `${type}: ${amount} ${frequency} - ${dateRange}`;
}

/**
 * Validate recurring transaction dates
 */
export function isValidRecurringTransactionDates(
  startDate: string,
  endDate?: string
): boolean {
  if (endDate && endDate < startDate) {
    return false;
  }
  return true;
}

/**
 * Calculate total value of recurring transactions for a given period
 */
export function calculateRecurringTransactionValue(
  recurring: RecurringTransaction,
  startDate: string,
  endDate: string
): number {
  if (startDate > endDate) {
    return 0;
  }

  // Check if recurring transaction is active in this period
  if (recurring.endDate && recurring.endDate < startDate) {
    return 0;
  }

  if (recurring.startDate > endDate) {
    return 0;
  }

  // Calculate occurrences in the period
  const periodStart = new Date(startDate);
  const periodEnd = new Date(endDate);
  const txStart = new Date(Math.max(new Date(recurring.startDate).getTime(), periodStart.getTime()));
  const txEnd = recurring.endDate
    ? new Date(Math.min(new Date(recurring.endDate).getTime(), periodEnd.getTime()))
    : periodEnd;

  let occurrences = 0;
  let currentDate = new Date(txStart);

  while (currentDate <= txEnd) {
    occurrences++;
    currentDate = new Date(getNextRecurrenceDate(currentDate.toISOString().split("T")[0], recurring.frequency));
  }

  return occurrences * recurring.amount;
}
