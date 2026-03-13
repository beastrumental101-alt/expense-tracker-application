import { ScrollView, Text, View, TouchableOpacity, TextInput, Modal, FlatList } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScreenContainer } from "@/components/screen-container";
import { useTransactions } from "@/lib/transaction-context";
import { useColors } from "@/hooks/use-colors";
import { getTodayDate, parseAmount, isValidAmount } from "@/lib/utils-expense";
import {
  INCOME_CATEGORIES,
  EXPENSE_CATEGORIES,
  TransactionType,
  Category,
  getCategoryLabel,
  getCategoryIcon,
} from "@/lib/types";
import { useState } from "react";
import { IconSymbol } from "@/components/ui/icon-symbol";

export default function AddTransactionScreen() {
  const router = useRouter();
  const colors = useColors();
  const { type: typeParam } = useLocalSearchParams<{ type?: string }>();
  const { addTransaction } = useTransactions();

  const [transactionType, setTransactionType] = useState<TransactionType>(
    (typeParam as TransactionType) || "expense"
  );
  const [amount, setAmount] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [date, setDate] = useState(getTodayDate());
  const [notes, setNotes] = useState("");
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const categories = transactionType === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  const categoryList = Object.entries(categories).map(([key, value]) => ({
    key: key as Category,
    label: value.label,
    icon: value.icon,
  }));

  const handleSave = async () => {
    if (!isValidAmount(amount) || !selectedCategory) {
      alert("Please enter a valid amount and select a category");
      return;
    }

    setIsLoading(true);
    try {
      await addTransaction({
        type: transactionType,
        amount: parseAmount(amount),
        category: selectedCategory,
        date,
        notes: notes || undefined,
      });
      router.back();
    } catch (error) {
      console.error("Error saving transaction:", error);
      alert("Failed to save transaction");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScreenContainer className="p-4">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="gap-6">
          {/* Header */}
          <View className="flex-row items-center justify-between">
            <Text className="text-2xl font-bold text-foreground">Add Transaction</Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text className="text-lg text-primary font-semibold">✕</Text>
            </TouchableOpacity>
          </View>

          {/* Transaction Type Toggle */}
          <View className="flex-row gap-3 bg-surface rounded-xl p-1">
            {(["income", "expense"] as const).map((type) => (
              <TouchableOpacity
                key={type}
                onPress={() => {
                  setTransactionType(type);
                  setSelectedCategory(null);
                }}
                className={`flex-1 py-3 rounded-lg ${
                  transactionType === type
                    ? type === "income"
                      ? "bg-success"
                      : "bg-error"
                    : "bg-transparent"
                }`}
              >
                <Text
                  className={`text-center font-semibold capitalize ${
                    transactionType === type ? "text-white" : "text-foreground"
                  }`}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Amount Input */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-foreground">Amount</Text>
            <View className="flex-row items-center bg-surface rounded-xl border border-border px-4">
              <Text className="text-2xl font-bold text-foreground">$</Text>
              <TextInput
                value={amount}
                onChangeText={setAmount}
                placeholder="0.00"
                placeholderTextColor={colors.muted}
                keyboardType="decimal-pad"
                className="flex-1 py-4 text-2xl font-bold text-foreground ml-2"
              />
            </View>
          </View>

          {/* Category Selection */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-foreground">Category</Text>
            <TouchableOpacity
              onPress={() => setShowCategoryPicker(true)}
              className="bg-surface rounded-xl border border-border p-4 flex-row items-center justify-between"
            >
              {selectedCategory ? (
                <View className="flex-row items-center gap-3">
                  <View
                    className="w-8 h-8 rounded-full items-center justify-center"
                    style={{
                      backgroundColor:
                        transactionType === "income"
                          ? colors.success + "20"
                          : colors.error + "20",
                    }}
                  >
                    <IconSymbol
                      name={getCategoryIcon(selectedCategory) as any}
                      size={16}
                      color={transactionType === "income" ? colors.success : colors.error}
                    />
                  </View>
                  <Text className="text-base font-semibold text-foreground">
                    {getCategoryLabel(selectedCategory)}
                  </Text>
                </View>
              ) : (
                <Text className="text-base text-muted">Select a category</Text>
              )}
              <Text className="text-lg text-muted">›</Text>
            </TouchableOpacity>
          </View>

          {/* Date Input */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-foreground">Date</Text>
            <TextInput
              value={date}
              onChangeText={setDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.muted}
              className="bg-surface rounded-xl border border-border px-4 py-3 text-base text-foreground"
            />
          </View>

          {/* Notes Input */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-foreground">Notes (Optional)</Text>
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="Add a note..."
              placeholderTextColor={colors.muted}
              multiline
              numberOfLines={3}
              className="bg-surface rounded-xl border border-border px-4 py-3 text-base text-foreground"
            />
          </View>

          {/* Save Button */}
          <TouchableOpacity
            onPress={handleSave}
            disabled={isLoading}
            className={`py-4 rounded-xl items-center ${
              transactionType === "income" ? "bg-success" : "bg-error"
            } ${isLoading ? "opacity-50" : ""}`}
          >
            <Text className="text-white font-semibold text-base">
              {isLoading ? "Saving..." : "Save Transaction"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Category Picker Modal */}
      <Modal
        visible={showCategoryPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCategoryPicker(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-background rounded-t-3xl p-6 gap-4">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-xl font-bold text-foreground">Select Category</Text>
              <TouchableOpacity onPress={() => setShowCategoryPicker(false)}>
                <Text className="text-lg text-primary font-semibold">✕</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={categoryList}
              keyExtractor={(item) => item.key}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    setSelectedCategory(item.key);
                    setShowCategoryPicker(false);
                  }}
                  className="flex-row items-center gap-3 py-3 px-4 border-b border-border"
                >
                  <View
                    className="w-8 h-8 rounded-full items-center justify-center"
                    style={{
                      backgroundColor:
                        transactionType === "income"
                          ? colors.success + "20"
                          : colors.error + "20",
                    }}
                  >
                    <IconSymbol
                      name={item.icon as any}
                      size={16}
                      color={transactionType === "income" ? colors.success : colors.error}
                    />
                  </View>
                  <Text className="text-base font-semibold text-foreground flex-1">
                    {item.label}
                  </Text>
                  {selectedCategory === item.key && (
                    <Text className="text-lg text-primary font-bold">✓</Text>
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
