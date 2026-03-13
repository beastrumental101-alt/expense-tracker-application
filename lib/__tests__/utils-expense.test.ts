import { describe, it, expect } from "vitest";
import {
  formatCurrency,
  formatDate,
  getTodayDate,
  getCurrentMonth,
  getPreviousMonth,
  getNextMonth,
  getTransactionsByMonth,
  getTransactionsByCategory,
  calculateMonthlyData,
  sortTransactionsByDate,
  getRecentTransactions,
  isValidAmount,
  parseAmount,
} from "../utils-expense";
import { Transaction } from "../types";

describe("Expense Tracker Utils", () => {
  describe("formatCurrency", () => {
    it("should format currency with default symbol", () => {
      expect(formatCurrency(100)).toBe("$100.00");
      expect(formatCurrency(1234.5)).toBe("$1234.50");
    });

    it("should format currency with custom symbol", () => {
      expect(formatCurrency(100, "€")).toBe("€100.00");
      expect(formatCurrency(50.5, "£")).toBe("£50.50");
    });

    it("should handle negative amounts", () => {
      expect(formatCurrency(-100)).toBe("$100.00");
    });

    it("should handle zero", () => {
      expect(formatCurrency(0)).toBe("$0.00");
    });
  });

  describe("formatDate", () => {
    it("should format date string correctly", () => {
      const result = formatDate("2024-01-15");
      expect(result).toContain("Jan");
      expect(result).toContain("15");
      expect(result).toContain("2024");
    });
  });

  describe("getTodayDate", () => {
    it("should return today's date in YYYY-MM-DD format", () => {
      const today = getTodayDate();
      expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe("getCurrentMonth", () => {
    it("should return current month in YYYY-MM format", () => {
      const month = getCurrentMonth();
      expect(month).toMatch(/^\d{4}-\d{2}$/);
    });
  });

  describe("getPreviousMonth", () => {
    it("should return previous month", () => {
      expect(getPreviousMonth("2024-02")).toBe("2024-01");
      expect(getPreviousMonth("2024-01")).toBe("2023-12");
    });
  });

  describe("getNextMonth", () => {
    it("should return next month", () => {
      expect(getNextMonth("2024-01")).toBe("2024-02");
      expect(getNextMonth("2024-12")).toBe("2025-01");
    });
  });

  describe("getTransactionsByMonth", () => {
    const transactions: Transaction[] = [
      {
        id: "1",
        type: "income",
        amount: 1000,
        category: "salary",
        date: "2024-01-15",
        createdAt: "2024-01-15T10:00:00Z",
      },
      {
        id: "2",
        type: "expense",
        amount: 50,
        category: "food",
        date: "2024-02-20",
        createdAt: "2024-02-20T10:00:00Z",
      },
      {
        id: "3",
        type: "expense",
        amount: 100,
        category: "transport",
        date: "2024-01-25",
        createdAt: "2024-01-25T10:00:00Z",
      },
    ];

    it("should filter transactions by month", () => {
      const january = getTransactionsByMonth(transactions, "2024-01");
      expect(january).toHaveLength(2);
      expect(january.every((t) => t.date.startsWith("2024-01"))).toBe(true);
    });

    it("should return empty array for month with no transactions", () => {
      const march = getTransactionsByMonth(transactions, "2024-03");
      expect(march).toHaveLength(0);
    });
  });

  describe("getTransactionsByCategory", () => {
    const transactions: Transaction[] = [
      {
        id: "1",
        type: "income",
        amount: 1000,
        category: "salary",
        date: "2024-01-15",
        createdAt: "2024-01-15T10:00:00Z",
      },
      {
        id: "2",
        type: "expense",
        amount: 50,
        category: "food",
        date: "2024-02-20",
        createdAt: "2024-02-20T10:00:00Z",
      },
      {
        id: "3",
        type: "expense",
        amount: 30,
        category: "food",
        date: "2024-01-25",
        createdAt: "2024-01-25T10:00:00Z",
      },
    ];

    it("should filter transactions by category", () => {
      const foodTransactions = getTransactionsByCategory(transactions, "food");
      expect(foodTransactions).toHaveLength(2);
      expect(foodTransactions.every((t) => t.category === "food")).toBe(true);
    });
  });

  describe("calculateMonthlyData", () => {
    const transactions: Transaction[] = [
      {
        id: "1",
        type: "income",
        amount: 1000,
        category: "salary",
        date: "2024-01-15",
        createdAt: "2024-01-15T10:00:00Z",
      },
      {
        id: "2",
        type: "expense",
        amount: 50,
        category: "food",
        date: "2024-01-20",
        createdAt: "2024-01-20T10:00:00Z",
      },
      {
        id: "3",
        type: "expense",
        amount: 100,
        category: "transport",
        date: "2024-01-25",
        createdAt: "2024-01-25T10:00:00Z",
      },
    ];

    it("should calculate monthly data correctly", () => {
      const data = calculateMonthlyData(transactions, "2024-01");
      expect(data.month).toBe("2024-01");
      expect(data.totalIncome).toBe(1000);
      expect(data.totalExpense).toBe(150);
      expect(data.balance).toBe(850);
    });

    it("should categorize expenses correctly", () => {
      const data = calculateMonthlyData(transactions, "2024-01");
      expect(data.categories.food).toBe(50);
      expect(data.categories.transport).toBe(100);
      expect(data.categories.salary).toBe(1000);
    });
  });

  describe("sortTransactionsByDate", () => {
    const transactions: Transaction[] = [
      {
        id: "1",
        type: "income",
        amount: 1000,
        category: "salary",
        date: "2024-01-15",
        createdAt: "2024-01-15T10:00:00Z",
      },
      {
        id: "2",
        type: "expense",
        amount: 50,
        category: "food",
        date: "2024-01-20",
        createdAt: "2024-01-20T10:00:00Z",
      },
      {
        id: "3",
        type: "expense",
        amount: 100,
        category: "transport",
        date: "2024-01-10",
        createdAt: "2024-01-10T10:00:00Z",
      },
    ];

    it("should sort transactions by date (newest first)", () => {
      const sorted = sortTransactionsByDate(transactions);
      expect(sorted[0].date).toBe("2024-01-20");
      expect(sorted[1].date).toBe("2024-01-15");
      expect(sorted[2].date).toBe("2024-01-10");
    });
  });

  describe("getRecentTransactions", () => {
    const transactions: Transaction[] = Array.from({ length: 15 }, (_, i) => ({
      id: `${i}`,
      type: i % 2 === 0 ? "income" : "expense",
      amount: 100 + i * 10,
      category: i % 2 === 0 ? "salary" : "food",
      date: `2024-01-${String(i + 1).padStart(2, "0")}`,
      createdAt: `2024-01-${String(i + 1).padStart(2, "0")}T10:00:00Z`,
    }));

    it("should return recent transactions with default count", () => {
      const recent = getRecentTransactions(transactions);
      expect(recent).toHaveLength(10);
    });

    it("should return recent transactions with custom count", () => {
      const recent = getRecentTransactions(transactions, 5);
      expect(recent).toHaveLength(5);
    });

    it("should return transactions sorted by date (newest first)", () => {
      const recent = getRecentTransactions(transactions, 3);
      expect(recent[0].date).toBe("2024-01-15");
      expect(recent[1].date).toBe("2024-01-14");
      expect(recent[2].date).toBe("2024-01-13");
    });
  });

  describe("isValidAmount", () => {
    it("should validate positive amounts", () => {
      expect(isValidAmount("100")).toBe(true);
      expect(isValidAmount("50.5")).toBe(true);
      expect(isValidAmount("0.01")).toBe(true);
    });

    it("should reject invalid amounts", () => {
      expect(isValidAmount("0")).toBe(false);
      expect(isValidAmount("-100")).toBe(false);
      expect(isValidAmount("abc")).toBe(false);
      expect(isValidAmount("")).toBe(false);
    });
  });

  describe("parseAmount", () => {
    it("should parse valid amount strings", () => {
      expect(parseAmount("100")).toBe(100);
      expect(parseAmount("50.5")).toBe(50.5);
      expect(parseAmount("1000.99")).toBe(1000.99);
    });

    it("should return 0 for invalid amounts", () => {
      expect(parseAmount("abc")).toBe(0);
      expect(parseAmount("")).toBe(0);
    });
  });
});
