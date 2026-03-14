import { describe, it, expect } from "vitest";
import {
  getNextRecurrenceDate,
  shouldGenerateTransaction,
  generateTransactionFromRecurring,
  getFrequencyLabel,
  isValidRecurringTransactionDates,
  calculateRecurringTransactionValue,
} from "../recurring-utils";
import { RecurringTransaction } from "../types";

describe("Recurring Transaction Utils", () => {
  describe("getNextRecurrenceDate", () => {
    it("should calculate next daily date", () => {
      expect(getNextRecurrenceDate("2024-01-15", "daily")).toBe("2024-01-16");
    });

    it("should calculate next weekly date", () => {
      expect(getNextRecurrenceDate("2024-01-15", "weekly")).toBe("2024-01-22");
    });

    it("should calculate next biweekly date", () => {
      expect(getNextRecurrenceDate("2024-01-15", "biweekly")).toBe("2024-01-29");
    });

    it("should calculate next monthly date", () => {
      expect(getNextRecurrenceDate("2024-01-15", "monthly")).toBe("2024-02-15");
    });

    it("should calculate next quarterly date", () => {
      expect(getNextRecurrenceDate("2024-01-15", "quarterly")).toBe("2024-04-14");
    });

    it("should calculate next yearly date", () => {
      expect(getNextRecurrenceDate("2024-01-15", "yearly")).toBe("2025-01-15");
    });

    it("should handle month-end dates correctly", () => {
      expect(getNextRecurrenceDate("2024-01-31", "monthly")).toBe("2024-03-02"); // Month overflow
    });
  });

  describe("shouldGenerateTransaction", () => {
    const baseRecurring: RecurringTransaction = {
      id: "test-1",
      type: "expense",
      amount: 100,
      category: "food",
      frequency: "monthly",
      startDate: "2024-01-15",
      createdAt: "2024-01-01T00:00:00Z",
    };

    it("should return false if today is before start date", () => {
      expect(shouldGenerateTransaction(baseRecurring, "2024-01-14")).toBe(false);
    });

    it("should return true if today is start date", () => {
      expect(shouldGenerateTransaction(baseRecurring, "2024-01-15")).toBe(true);
    });

    it("should return false if today is after end date", () => {
      const withEndDate = { ...baseRecurring, endDate: "2024-12-31" };
      expect(shouldGenerateTransaction(withEndDate, "2025-01-01")).toBe(false);
    });

    it("should return true if today is end date", () => {
      const withEndDate = { ...baseRecurring, endDate: "2024-12-31" };
      expect(shouldGenerateTransaction(withEndDate, "2024-12-31")).toBe(true);
    });

    it("should return true if next recurrence date is reached", () => {
      const withLastGenerated = {
        ...baseRecurring,
        lastGeneratedDate: "2024-01-15",
      };
      expect(shouldGenerateTransaction(withLastGenerated, "2024-02-15")).toBe(true);
    });

    it("should return false if next recurrence date not reached", () => {
      const withLastGenerated = {
        ...baseRecurring,
        lastGeneratedDate: "2024-01-15",
      };
      expect(shouldGenerateTransaction(withLastGenerated, "2024-02-14")).toBe(false);
    });
  });

  describe("generateTransactionFromRecurring", () => {
    const recurring: RecurringTransaction = {
      id: "recurring-1",
      type: "income",
      amount: 5000,
      category: "salary",
      frequency: "monthly",
      startDate: "2024-01-01",
      notes: "Monthly salary",
      createdAt: "2024-01-01T00:00:00Z",
    };

    it("should generate transaction with correct properties", () => {
      const transaction = generateTransactionFromRecurring(recurring, "2024-01-15");
      expect(transaction.type).toBe("income");
      expect(transaction.amount).toBe(5000);
      expect(transaction.category).toBe("salary");
      expect(transaction.date).toBe("2024-01-15");
    });

    it("should add [Recurring] prefix to notes", () => {
      const transaction = generateTransactionFromRecurring(recurring, "2024-01-15");
      expect(transaction.notes).toContain("[Recurring]");
      expect(transaction.notes).toContain("Monthly salary");
    });

    it("should add [Recurring] tag if no notes", () => {
      const withoutNotes = { ...recurring, notes: undefined };
      const transaction = generateTransactionFromRecurring(withoutNotes, "2024-01-15");
      expect(transaction.notes).toBe("[Recurring]");
    });
  });

  describe("getFrequencyLabel", () => {
    it("should return correct labels for all frequencies", () => {
      expect(getFrequencyLabel("daily")).toBe("Daily");
      expect(getFrequencyLabel("weekly")).toBe("Weekly");
      expect(getFrequencyLabel("biweekly")).toBe("Every 2 weeks");
      expect(getFrequencyLabel("monthly")).toBe("Monthly");
      expect(getFrequencyLabel("quarterly")).toBe("Quarterly");
      expect(getFrequencyLabel("yearly")).toBe("Yearly");
    });
  });

  describe("isValidRecurringTransactionDates", () => {
    it("should return true for valid dates", () => {
      expect(isValidRecurringTransactionDates("2024-01-01", "2024-12-31")).toBe(true);
    });

    it("should return true for same start and end date", () => {
      expect(isValidRecurringTransactionDates("2024-01-01", "2024-01-01")).toBe(true);
    });

    it("should return false if end date is before start date", () => {
      expect(isValidRecurringTransactionDates("2024-12-31", "2024-01-01")).toBe(false);
    });

    it("should return true if no end date provided", () => {
      expect(isValidRecurringTransactionDates("2024-01-01")).toBe(true);
    });
  });

  describe("calculateRecurringTransactionValue", () => {
    const recurring: RecurringTransaction = {
      id: "recurring-1",
      type: "expense",
      amount: 100,
      category: "food",
      frequency: "monthly",
      startDate: "2024-01-01",
      createdAt: "2024-01-01T00:00:00Z",
    };

    it("should calculate value for monthly recurring in a year", () => {
      const value = calculateRecurringTransactionValue(recurring, "2024-01-01", "2024-12-31");
      expect(value).toBe(1200); // 12 months * 100
    });

    it("should handle partial periods", () => {
      const value = calculateRecurringTransactionValue(recurring, "2024-01-15", "2024-03-15");
      expect(value).toBeGreaterThan(0);
    });

    it("should return 0 if period is before start date", () => {
      const value = calculateRecurringTransactionValue(recurring, "2023-01-01", "2023-12-31");
      expect(value).toBe(0);
    });

    it("should return 0 if period is after end date", () => {
      const withEndDate = { ...recurring, endDate: "2024-06-30" };
      const value = calculateRecurringTransactionValue(withEndDate, "2024-07-01", "2024-12-31");
      expect(value).toBe(0);
    });
  });
});
