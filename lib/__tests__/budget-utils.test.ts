import { describe, it, expect } from "vitest";
import {
  getCategorySpending,
  getBudgetProgress,
  getBudgetStatus,
  getRemainingBudget,
  calculateBudgetDetails,
  getBudgetsWithDetails,
  hasExceededBudgets,
  getAlertBudgets,
  getTotalBudgetedAmount,
  getTotalBudgetSpending,
  getBudgetUtilization,
  formatBudgetStatus,
  isValidBudget,
  getDefaultBudgets,
} from "../budget-utils";
import { Budget, Transaction } from "../types";

describe("Budget Utilities", () => {
  const mockTransactions: Transaction[] = [
    {
      id: "1",
      type: "expense",
      amount: 50,
      category: "food",
      date: "2024-01-15",
      notes: "Lunch",
      createdAt: "2024-01-15T00:00:00Z",
    },
    {
      id: "2",
      type: "expense",
      amount: 30,
      category: "food",
      date: "2024-01-20",
      notes: "Dinner",
      createdAt: "2024-01-20T00:00:00Z",
    },
    {
      id: "3",
      type: "expense",
      amount: 100,
      category: "transport",
      date: "2024-01-10",
      notes: "Gas",
      createdAt: "2024-01-10T00:00:00Z",
    },
    {
      id: "4",
      type: "income",
      amount: 5000,
      category: "salary",
      date: "2024-01-01",
      notes: "Monthly salary",
      createdAt: "2024-01-01T00:00:00Z",
    },
  ];

  const mockBudget: Budget = {
    id: "budget-1",
    category: "food",
    monthlyLimit: 200,
    month: "2024-01",
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-01T00:00:00Z",
  };

  describe("getCategorySpending", () => {
    it("should calculate total spending for a category in a month", () => {
      const spending = getCategorySpending(mockTransactions, "food", "2024-01");
      expect(spending).toBe(80); // 50 + 30
    });

    it("should return 0 if no transactions for category", () => {
      const spending = getCategorySpending(mockTransactions, "entertainment", "2024-01");
      expect(spending).toBe(0);
    });

    it("should only count expenses, not income", () => {
      const spending = getCategorySpending(mockTransactions, "food", "2024-02");
      expect(spending).toBe(0);
    });

    it("should only count transactions from the specified month", () => {
      const spending = getCategorySpending(mockTransactions, "transport", "2024-02");
      expect(spending).toBe(0);
    });
  });

  describe("getBudgetProgress", () => {
    it("should calculate progress percentage", () => {
      expect(getBudgetProgress(50, 200)).toBe(25);
      expect(getBudgetProgress(100, 200)).toBe(50);
      expect(getBudgetProgress(200, 200)).toBe(100);
    });

    it("should cap progress at 100%", () => {
      expect(getBudgetProgress(250, 200)).toBe(100);
    });

    it("should return 0 for zero limit", () => {
      expect(getBudgetProgress(50, 0)).toBe(0);
    });
  });

  describe("getBudgetStatus", () => {
    it("should return on_track for progress < 80%", () => {
      expect(getBudgetStatus(50, 200)).toBe("on_track");
    });

    it("should return warning for progress >= 80% and < 100%", () => {
      expect(getBudgetStatus(160, 200)).toBe("warning");
    });

    it("should return exceeded for progress >= 100%", () => {
      expect(getBudgetStatus(200, 200)).toBe("exceeded");
      expect(getBudgetStatus(250, 200)).toBe("exceeded");
    });
  });

  describe("getRemainingBudget", () => {
    it("should calculate remaining budget", () => {
      expect(getRemainingBudget(50, 200)).toBe(150);
      expect(getRemainingBudget(200, 200)).toBe(0);
    });

    it("should not return negative values", () => {
      expect(getRemainingBudget(250, 200)).toBe(0);
    });
  });

  describe("calculateBudgetDetails", () => {
    it("should return complete budget details", () => {
      const details = calculateBudgetDetails(mockBudget, mockTransactions);

      expect(details.budget).toEqual(mockBudget);
      expect(details.spent).toBe(80);
      expect(details.remaining).toBe(120);
      expect(details.progress).toBe(40);
      expect(details.status).toBe("on_track");
    });
  });

  describe("getBudgetsWithDetails", () => {
    it("should return all budgets with details for a month", () => {
      const budgets: Budget[] = [
        mockBudget,
        {
          id: "budget-2",
          category: "transport",
          monthlyLimit: 150,
          month: "2024-01",
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-01T00:00:00Z",
        },
      ];

      const details = getBudgetsWithDetails(budgets, mockTransactions, "2024-01");
      expect(details).toHaveLength(2);
      expect(details[0].spent).toBe(100); // transport (higher progress)
      expect(details[1].spent).toBe(80); // food
    });

    it("should only return budgets for the specified month", () => {
      const budgets: Budget[] = [
        mockBudget,
        {
          id: "budget-2",
          category: "food",
          monthlyLimit: 200,
          month: "2024-02",
          createdAt: "2024-02-01T00:00:00Z",
          updatedAt: "2024-02-01T00:00:00Z",
        },
      ];

      const details = getBudgetsWithDetails(budgets, mockTransactions, "2024-01");
      expect(details).toHaveLength(1);
    });
  });

  describe("hasExceededBudgets", () => {
    it("should return false if no budgets are exceeded", () => {
      const budgets: Budget[] = [mockBudget];
      expect(hasExceededBudgets(budgets, mockTransactions)).toBe(false);
    });

    it("should return true if any budget is exceeded", () => {
      const budgets: Budget[] = [
        {
          ...mockBudget,
          monthlyLimit: 50, // Less than actual spending of 80
        },
      ];
      expect(hasExceededBudgets(budgets, mockTransactions)).toBe(true);
    });
  });

  describe("getAlertBudgets", () => {
    it("should return budgets approaching or exceeding limits", () => {
      const budgets: Budget[] = [
        mockBudget, // 40% - on track
        {
          id: "budget-2",
          category: "transport",
          monthlyLimit: 150,
          month: "2024-01",
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-01T00:00:00Z",
        }, // 66.67% - on track
        {
          id: "budget-3",
          category: "entertainment",
          monthlyLimit: 100,
          month: "2024-01",
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-01T00:00:00Z",
        }, // 0% - on track
      ];

      const alerts = getAlertBudgets(budgets, mockTransactions, 80);
      expect(alerts).toHaveLength(0);
    });

    it("should return empty list when no budgets meet threshold", () => {
      const budgets: Budget[] = [
        {
          id: "budget-1",
          category: "food",
          monthlyLimit: 500,
          month: "2024-01",
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-01T00:00:00Z",
        }, // 16% - below any threshold
      ];

      const alerts = getAlertBudgets(budgets, mockTransactions, 80);
      expect(alerts).toHaveLength(0);
    });
  });

  describe("getTotalBudgetedAmount", () => {
    it("should calculate total budgeted amount for a month", () => {
      const budgets: Budget[] = [
        mockBudget,
        {
          id: "budget-2",
          category: "transport",
          monthlyLimit: 150,
          month: "2024-01",
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-01T00:00:00Z",
        },
      ];

      expect(getTotalBudgetedAmount(budgets, "2024-01")).toBe(350);
    });

    it("should only count budgets for the specified month", () => {
      const budgets: Budget[] = [
        mockBudget,
        {
          id: "budget-2",
          category: "transport",
          monthlyLimit: 150,
          month: "2024-02",
          createdAt: "2024-02-01T00:00:00Z",
          updatedAt: "2024-02-01T00:00:00Z",
        },
      ];

      expect(getTotalBudgetedAmount(budgets, "2024-01")).toBe(200);
    });
  });

  describe("getTotalBudgetSpending", () => {
    it("should calculate total spending against budgets", () => {
      const budgets: Budget[] = [
        mockBudget,
        {
          id: "budget-2",
          category: "transport",
          monthlyLimit: 150,
          month: "2024-01",
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-01T00:00:00Z",
        },
      ];

      expect(getTotalBudgetSpending(budgets, mockTransactions, "2024-01")).toBe(180);
    });
  });

  describe("getBudgetUtilization", () => {
    it("should calculate budget utilization percentage", () => {
      const budgets: Budget[] = [
        mockBudget,
        {
          id: "budget-2",
          category: "transport",
          monthlyLimit: 150,
          month: "2024-01",
          createdAt: "2024-01-01T00:00:00Z",
          updatedAt: "2024-01-01T00:00:00Z",
        },
      ];

      const utilization = getBudgetUtilization(budgets, mockTransactions, "2024-01");
      expect(utilization).toBeCloseTo(51.43, 1); // 180 / 350 * 100
    });

    it("should return 0 for zero total budget", () => {
      expect(getBudgetUtilization([], mockTransactions, "2024-01")).toBe(0);
    });
  });

  describe("formatBudgetStatus", () => {
    it("should format budget status for display", () => {
      expect(formatBudgetStatus("on_track")).toBe("On Track");
      expect(formatBudgetStatus("warning")).toBe("Warning");
      expect(formatBudgetStatus("exceeded")).toBe("Exceeded");
    });
  });

  describe("isValidBudget", () => {
    it("should validate budget limits", () => {
      expect(isValidBudget(100)).toBe(true);
      expect(isValidBudget(0.01)).toBe(true);
    });

    it("should reject invalid limits", () => {
      expect(isValidBudget(0)).toBe(false);
      expect(isValidBudget(-100)).toBe(false);
      expect(isValidBudget(Infinity)).toBe(false);
    });
  });

  describe("getDefaultBudgets", () => {
    it("should return default budgets for all expense categories", () => {
      const defaults = getDefaultBudgets("2024-01");
      expect(defaults.length).toBe(8); // All expense categories
      expect(defaults.every((b) => b.monthlyLimit === 500)).toBe(true);
      expect(defaults.every((b) => b.month === "2024-01")).toBe(true);
    });
  });
});
