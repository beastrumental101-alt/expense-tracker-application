import { ScrollView, Text, View, TouchableOpacity, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useTransactions } from "@/lib/transaction-context";
import { formatCurrency, getRecentTransactions } from "@/lib/utils-expense";
import { getCategoryIcon, getCategoryLabel } from "@/lib/types";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useColors } from "@/hooks/use-colors";
import { useMemo } from "react";

export default function HomeScreen() {
  const router = useRouter();
  const colors = useColors();
  const { transactions, settings, monthlyData, isLoading } = useTransactions();

  // Get current month data
  const currentMonth = useMemo(() => {
    const today = new Date();
    return today.toISOString().substring(0, 7);
  }, []);

  const currentMonthData = monthlyData[currentMonth];
  const recentTransactions = useMemo(() => getRecentTransactions(transactions, 5), [transactions]);

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
          <View className="gap-2">
            <Text className="text-3xl font-bold text-foreground">Expense Tracker</Text>
            <Text className="text-sm text-muted">Manage your finances</Text>
          </View>

          {/* Quick Add Buttons */}
          <View className="flex-row gap-4">
            <TouchableOpacity
              onPress={() => router.push("../add-transaction?type=income")}
              style={{ flex: 1 }}
              className="bg-success rounded-2xl p-4 active:opacity-80"
            >
              <Text className="text-white font-semibold text-center">+ Income</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push("../add-transaction?type=expense")}
              style={{ flex: 1 }}
              className="bg-error rounded-2xl p-4 active:opacity-80"
            >
              <Text className="text-white font-semibold text-center">+ Expense</Text>
            </TouchableOpacity>
          </View>

          {/* Monthly Summary Card */}
          {currentMonthData && (
            <View className="bg-surface rounded-2xl p-6 border border-border gap-4">
              <Text className="text-lg font-semibold text-foreground">This Month</Text>

              <View className="gap-3">
                <View className="flex-row justify-between items-center">
                  <Text className="text-sm text-muted">Income</Text>
                  <Text className="text-lg font-semibold text-success">
                    {formatCurrency(currentMonthData.totalIncome, settings.currencySymbol)}
                  </Text>
                </View>

                <View className="flex-row justify-between items-center">
                  <Text className="text-sm text-muted">Expenses</Text>
                  <Text className="text-lg font-semibold text-error">
                    {formatCurrency(currentMonthData.totalExpense, settings.currencySymbol)}
                  </Text>
                </View>

                <View className="h-px bg-border" />

                <View className="flex-row justify-between items-center">
                  <Text className="text-sm font-semibold text-foreground">Balance</Text>
                  <Text
                    className={`text-lg font-bold ${
                      currentMonthData.balance >= 0 ? "text-success" : "text-error"
                    }`}
                  >
                    {formatCurrency(currentMonthData.balance, settings.currencySymbol)}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Recent Transactions */}
          <View className="gap-3">
            <View className="flex-row justify-between items-center">
              <Text className="text-lg font-semibold text-foreground">Recent Transactions</Text>
              <TouchableOpacity onPress={() => router.push("./history")}>
                <Text className="text-sm text-primary font-medium">View All</Text>
              </TouchableOpacity>
            </View>

            {recentTransactions.length > 0 ? (
              <View className="gap-2">
                {recentTransactions.map((transaction) => (
                  <View
                    key={transaction.id}
                    className="flex-row items-center justify-between bg-surface rounded-xl p-4 border border-border"
                  >
                    <View className="flex-row items-center gap-3 flex-1">
                      <View
                        className="w-10 h-10 rounded-full items-center justify-center"
                        style={{
                          backgroundColor:
                            transaction.type === "income"
                              ? colors.success + "20"
                              : colors.error + "20",
                        }}
                      >
                        <IconSymbol
                          name={getCategoryIcon(transaction.category) as any}
                          size={20}
                          color={
                            transaction.type === "income" ? colors.success : colors.error
                          }
                        />
                      </View>
                      <View className="flex-1">
                        <Text className="text-sm font-semibold text-foreground">
                          {getCategoryLabel(transaction.category)}
                        </Text>
                        <Text className="text-xs text-muted">{transaction.date}</Text>
                      </View>
                    </View>
                    <Text
                      className={`text-sm font-semibold ${
                        transaction.type === "income" ? "text-success" : "text-error"
                      }`}
                    >
                      {transaction.type === "income" ? "+" : "-"}
                      {formatCurrency(transaction.amount, settings.currencySymbol)}
                    </Text>
                  </View>
                ))}
              </View>
            ) : (
              <View className="bg-surface rounded-xl p-6 items-center gap-2">
                <Text className="text-sm text-muted">No transactions yet</Text>
                <Text className="text-xs text-muted">Start by adding your first transaction</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
