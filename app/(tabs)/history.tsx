import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Modal,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useTransactions } from "@/lib/transaction-context";
import { formatCurrency, sortTransactionsByDate } from "@/lib/utils-expense";
import { useColors } from "@/hooks/use-colors";
import { getCategoryIcon, getCategoryLabel, EXPENSE_CATEGORIES, INCOME_CATEGORIES } from "@/lib/types";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { useState, useMemo } from "react";

export default function HistoryScreen() {
  const colors = useColors();
  const { transactions, settings, isLoading, deleteTransaction } = useTransactions();
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">("all");
  const [showFilterModal, setShowFilterModal] = useState(false);

  const filteredTransactions = useMemo(() => {
    let filtered = transactions;

    if (filterType !== "all") {
      filtered = filtered.filter((t) => t.type === filterType);
    }

    if (filterCategory) {
      filtered = filtered.filter((t) => t.category === filterCategory);
    }

    return sortTransactionsByDate(filtered);
  }, [transactions, filterCategory, filterType]);

  const handleDeleteTransaction = (id: string) => {
    deleteTransaction(id);
  };

  if (isLoading) {
    return (
      <ScreenContainer className="flex items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="p-4">
      <View className="gap-4 flex-1">
        {/* Header */}
        <Text className="text-3xl font-bold text-foreground">Transaction History</Text>

        {/* Filter Controls */}
        <View className="flex-row gap-2">
          <TouchableOpacity
            onPress={() => setShowFilterModal(true)}
            className="flex-1 bg-surface rounded-xl border border-border p-3 flex-row items-center justify-between"
          >
            <Text className="text-sm font-semibold text-foreground">
              {filterCategory ? getCategoryLabel(filterCategory as any) : "All Categories"}
            </Text>
            <Text className="text-lg text-muted">⚙</Text>
          </TouchableOpacity>

          <View className="flex-row gap-2">
            {(["all", "income", "expense"] as const).map((type) => (
              <TouchableOpacity
                key={type}
                onPress={() => setFilterType(type)}
                className={`px-3 py-2 rounded-lg ${
                  filterType === type
                    ? "bg-primary"
                    : "bg-surface border border-border"
                }`}
              >
                <Text
                  className={`text-xs font-semibold capitalize ${
                    filterType === type ? "text-white" : "text-foreground"
                  }`}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Transactions List */}
        {filteredTransactions.length > 0 ? (
          <FlatList
            data={filteredTransactions}
            keyExtractor={(item) => item.id}
            scrollEnabled={true}
            renderItem={({ item }) => (
              <View className="flex-row items-center justify-between bg-surface rounded-xl p-4 mb-2 border border-border">
                <View className="flex-row items-center gap-3 flex-1">
                  <View
                    className="w-10 h-10 rounded-full items-center justify-center"
                    style={{
                      backgroundColor:
                        item.type === "income" ? colors.success + "20" : colors.error + "20",
                    }}
                  >
                    <IconSymbol
                      name={getCategoryIcon(item.category) as any}
                      size={20}
                      color={item.type === "income" ? colors.success : colors.error}
                    />
                  </View>

                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-foreground">
                      {getCategoryLabel(item.category)}
                    </Text>
                    <Text className="text-xs text-muted">
                      {item.date}
                      {item.notes ? ` • ${item.notes}` : ""}
                    </Text>
                  </View>
                </View>

                <View className="flex-row items-center gap-3">
                  <Text
                    className={`text-sm font-semibold ${
                      item.type === "income" ? "text-success" : "text-error"
                    }`}
                  >
                    {item.type === "income" ? "+" : "-"}
                    {formatCurrency(item.amount, settings.currencySymbol)}
                  </Text>

                  <TouchableOpacity
                    onPress={() => handleDeleteTransaction(item.id)}
                    className="p-2"
                  >
                    <Text className="text-lg text-error">🗑</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        ) : (
          <View className="flex-1 items-center justify-center">
            <Text className="text-sm text-muted">No transactions found</Text>
          </View>
        )}
      </View>

      {/* Filter Modal */}
      <Modal
        visible={showFilterModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFilterModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-background rounded-t-3xl p-6 gap-4">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-xl font-bold text-foreground">Filter by Category</Text>
              <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                <Text className="text-lg text-primary font-semibold">✕</Text>
              </TouchableOpacity>
            </View>

            {/* All Categories Button */}
            <TouchableOpacity
              onPress={() => {
                setFilterCategory(null);
                setShowFilterModal(false);
              }}
              className={`p-4 rounded-xl border ${
                !filterCategory
                  ? "bg-primary border-primary"
                  : "bg-surface border-border"
              }`}
            >
              <Text
                className={`text-base font-semibold ${
                  !filterCategory ? "text-white" : "text-foreground"
                }`}
              >
                All Categories
              </Text>
            </TouchableOpacity>

            {/* Income Categories */}
            <Text className="text-sm font-semibold text-muted mt-2">Income</Text>
            {Object.entries(INCOME_CATEGORIES).map(([key, value]) => (
              <TouchableOpacity
                key={key}
                onPress={() => {
                  setFilterCategory(key);
                  setShowFilterModal(false);
                }}
                className={`p-4 rounded-xl border flex-row items-center justify-between ${
                  filterCategory === key
                    ? "bg-primary border-primary"
                    : "bg-surface border-border"
                }`}
              >
                <Text
                  className={`text-base font-semibold ${
                    filterCategory === key ? "text-white" : "text-foreground"
                  }`}
                >
                  {value.label}
                </Text>
                {filterCategory === key && (
                  <Text className="text-lg font-bold">✓</Text>
                )}
              </TouchableOpacity>
            ))}

            {/* Expense Categories */}
            <Text className="text-sm font-semibold text-muted mt-4">Expenses</Text>
            {Object.entries(EXPENSE_CATEGORIES).map(([key, value]) => (
              <TouchableOpacity
                key={key}
                onPress={() => {
                  setFilterCategory(key);
                  setShowFilterModal(false);
                }}
                className={`p-4 rounded-xl border flex-row items-center justify-between ${
                  filterCategory === key
                    ? "bg-primary border-primary"
                    : "bg-surface border-border"
                }`}
              >
                <Text
                  className={`text-base font-semibold ${
                    filterCategory === key ? "text-white" : "text-foreground"
                  }`}
                >
                  {value.label}
                </Text>
                {filterCategory === key && (
                  <Text className="text-lg font-bold">✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
