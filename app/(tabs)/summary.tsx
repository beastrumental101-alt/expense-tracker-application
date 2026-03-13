import { ScrollView, Text, View, TouchableOpacity, ActivityIndicator } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useTransactions } from "@/lib/transaction-context";
import { formatCurrency, getCurrentMonth, getNextMonth, getPreviousMonth } from "@/lib/utils-expense";
import { useColors } from "@/hooks/use-colors";
import { getCategoryLabel } from "@/lib/types";
import { useState, useMemo } from "react";

export default function SummaryScreen() {
  const colors = useColors();
  const { monthlyData, settings, isLoading } = useTransactions();
  const [currentMonth, setCurrentMonth] = useState(getCurrentMonth());

  const data = monthlyData[currentMonth];
  const previousMonthData = monthlyData[getPreviousMonth(currentMonth)];

  const categoryBreakdown = useMemo(() => {
    if (!data) return [];
    return Object.entries(data.categories)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: data.totalExpense > 0 ? (amount / data.totalExpense) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [data]);

  if (isLoading) {
    return (
      <ScreenContainer className="flex items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="gap-6">
          {/* Header */}
          <Text className="text-3xl font-bold text-foreground">Monthly Summary</Text>

          {/* Month Navigation */}
          <View className="flex-row items-center justify-between bg-surface rounded-xl p-4 border border-border">
            <TouchableOpacity onPress={() => setCurrentMonth(getPreviousMonth(currentMonth))}>
              <Text className="text-lg text-primary font-semibold">‹</Text>
            </TouchableOpacity>
            <Text className="text-lg font-semibold text-foreground">
              {new Date(currentMonth + "-01").toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
              })}
            </Text>
            <TouchableOpacity onPress={() => setCurrentMonth(getNextMonth(currentMonth))}>
              <Text className="text-lg text-primary font-semibold">›</Text>
            </TouchableOpacity>
          </View>

          {/* Summary Cards */}
          {data ? (
            <View className="gap-3">
              {/* Income Card */}
              <View className="bg-surface rounded-2xl p-6 border border-border gap-2">
                <Text className="text-sm text-muted font-medium">Total Income</Text>
                <Text className="text-3xl font-bold text-success">
                  {formatCurrency(data.totalIncome, settings.currencySymbol)}
                </Text>
              </View>

              {/* Expense Card */}
              <View className="bg-surface rounded-2xl p-6 border border-border gap-2">
                <Text className="text-sm text-muted font-medium">Total Expenses</Text>
                <Text className="text-3xl font-bold text-error">
                  {formatCurrency(data.totalExpense, settings.currencySymbol)}
                </Text>
              </View>

              {/* Balance Card */}
              <View
                className="bg-surface rounded-2xl p-6 border border-border gap-2"
                style={{
                  borderColor: data.balance >= 0 ? colors.success : colors.error,
                  borderWidth: 2,
                }}
              >
                <Text className="text-sm text-muted font-medium">Net Balance</Text>
                <Text
                  className="text-3xl font-bold"
                  style={{
                    color: data.balance >= 0 ? colors.success : colors.error,
                  }}
                >
                  {formatCurrency(data.balance, settings.currencySymbol)}
                </Text>
              </View>
            </View>
          ) : (
            <View className="bg-surface rounded-xl p-6 items-center gap-2">
              <Text className="text-sm text-muted">No data for this month</Text>
            </View>
          )}

          {/* Comparison with Previous Month */}
          {previousMonthData && (
            <View className="bg-surface rounded-2xl p-6 border border-border gap-4">
              <Text className="text-lg font-semibold text-foreground">vs Previous Month</Text>

              <View className="gap-3">
                <View className="flex-row justify-between items-center">
                  <Text className="text-sm text-muted">Income Change</Text>
                  <Text
                    className="font-semibold"
                    style={{
                      color:
                        (data?.totalIncome || 0) > previousMonthData.totalIncome
                          ? colors.success
                          : colors.error,
                    }}
                  >
                    {(data?.totalIncome || 0) > previousMonthData.totalIncome ? "+" : ""}
                    {formatCurrency(
                      (data?.totalIncome || 0) - previousMonthData.totalIncome,
                      settings.currencySymbol
                    )}
                  </Text>
                </View>

                <View className="flex-row justify-between items-center">
                  <Text className="text-sm text-muted">Expense Change</Text>
                  <Text
                    className="font-semibold"
                    style={{
                      color:
                        (data?.totalExpense || 0) < previousMonthData.totalExpense
                          ? colors.success
                          : colors.error,
                    }}
                  >
                    {(data?.totalExpense || 0) < previousMonthData.totalExpense ? "-" : "+"}
                    {formatCurrency(
                      Math.abs((data?.totalExpense || 0) - previousMonthData.totalExpense),
                      settings.currencySymbol
                    )}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Category Breakdown */}
          {categoryBreakdown.length > 0 && (
            <View className="bg-surface rounded-2xl p-6 border border-border gap-4">
              <Text className="text-lg font-semibold text-foreground">Category Breakdown</Text>

              <View className="gap-3">
                {categoryBreakdown.map((item, index) => (
                  <View key={index} className="gap-2">
                    <View className="flex-row justify-between items-center">
                      <Text className="text-sm font-semibold text-foreground flex-1">
                        {getCategoryLabel(item.category as any)}
                      </Text>
                      <View className="flex-row items-center gap-2">
                        <Text className="text-sm text-muted">{item.percentage.toFixed(1)}%</Text>
                        <Text className="text-sm font-semibold text-foreground">
                          {formatCurrency(item.amount, settings.currencySymbol)}
                        </Text>
                      </View>
                    </View>

                    {/* Progress Bar */}
                    <View className="h-2 bg-border rounded-full overflow-hidden">
                      <View
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
