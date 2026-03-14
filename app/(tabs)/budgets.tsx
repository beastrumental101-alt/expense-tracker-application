import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Modal,
  Alert,
  TextInput,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useBudgets } from "@/lib/budget-context";
import { useTransactions } from "@/lib/transaction-context";
import { useColors } from "@/hooks/use-colors";
import {
  getCategoryLabel,
  getCategoryIcon,
  EXPENSE_CATEGORIES,
  ExpenseCategory,
} from "@/lib/types";
import {
  calculateBudgetDetails,
  getBudgetStatus,
  formatBudgetStatus,
  getBudgetStatusColor,
} from "@/lib/budget-utils";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { getCurrentMonth } from "@/lib/utils-expense";
import { useState } from "react";

export default function BudgetsScreen() {
  const colors = useColors();
  const { budgets, addBudget, updateBudget, deleteBudget, isLoading } = useBudgets();
  const { transactions, settings } = useTransactions();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedBudgetId, setSelectedBudgetId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory>("food");
  const [budgetAmount, setBudgetAmount] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const currentMonth = getCurrentMonth();
  const currentMonthBudgets = budgets.filter((b) => b.month === currentMonth);

  const handleAddBudget = async () => {
    if (!budgetAmount || parseFloat(budgetAmount) <= 0) {
      alert("Please enter a valid budget amount");
      return;
    }

    // Check if budget already exists for this category
    const exists = currentMonthBudgets.some((b) => b.category === selectedCategory);
    if (exists) {
      alert("Budget already exists for this category this month");
      return;
    }

    setIsSaving(true);
    try {
      await addBudget({
        category: selectedCategory,
        monthlyLimit: parseFloat(budgetAmount),
        month: currentMonth,
      });

      alert("Budget created successfully!");
      setBudgetAmount("");
      setShowAddModal(false);
    } catch (error) {
      console.error("Error creating budget:", error);
      alert("Failed to create budget");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateBudget = async () => {
    if (!selectedBudgetId || !budgetAmount || parseFloat(budgetAmount) <= 0) {
      alert("Please enter a valid budget amount");
      return;
    }

    setIsSaving(true);
    try {
      await updateBudget(selectedBudgetId, {
        monthlyLimit: parseFloat(budgetAmount),
      });

      alert("Budget updated successfully!");
      setBudgetAmount("");
      setShowEditModal(false);
      setSelectedBudgetId(null);
    } catch (error) {
      console.error("Error updating budget:", error);
      alert("Failed to update budget");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteBudget = (id: string) => {
    Alert.alert("Delete Budget", "Are you sure you want to delete this budget?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteBudget(id);
          } catch (error) {
            console.error("Error deleting budget:", error);
            alert("Failed to delete budget");
          }
        },
      },
    ]);
  };

  const handleEditBudget = (budget: any) => {
    setSelectedBudgetId(budget.id);
    setBudgetAmount(budget.monthlyLimit.toString());
    setShowEditModal(true);
  };

  if (isLoading) {
    return (
      <ScreenContainer className="flex items-center justify-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  const budgetDetails = currentMonthBudgets.map((budget) =>
    calculateBudgetDetails(budget, transactions)
  );

  return (
    <ScreenContainer className="p-4">
      <View className="gap-4 flex-1">
        {/* Header */}
        <View className="flex-row items-center justify-between">
          <Text className="text-3xl font-bold text-foreground">Budgets</Text>
          <TouchableOpacity
            onPress={() => {
              setSelectedCategory("food");
              setBudgetAmount("");
              setShowAddModal(true);
            }}
            className="bg-primary rounded-full w-12 h-12 items-center justify-center"
          >
            <Text className="text-2xl text-white font-bold">+</Text>
          </TouchableOpacity>
        </View>

        {/* Current Month Indicator */}
        <View className="bg-surface rounded-xl p-3 border border-border">
          <Text className="text-sm text-muted">
            Budgets for {new Date(currentMonth + "-01").toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </Text>
        </View>

        {/* Budgets List */}
        {budgetDetails.length > 0 ? (
          <FlatList
            data={budgetDetails}
            keyExtractor={(item) => item.budget.id}
            scrollEnabled={true}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => handleEditBudget(item.budget)}
                className="bg-surface rounded-xl p-4 mb-3 border border-border"
              >
                <View className="gap-3">
                  {/* Header */}
                  <View className="flex-row items-center justify-between">
                    <View className="flex-row items-center gap-3 flex-1">
                      <View
                        className="w-10 h-10 rounded-full items-center justify-center"
                        style={{ backgroundColor: colors.primary + "20" }}
                      >
                        <IconSymbol
                          name={getCategoryIcon(item.budget.category) as any}
                          size={20}
                          color={colors.primary}
                        />
                      </View>

                      <View className="flex-1">
                        <Text className="text-sm font-semibold text-foreground">
                          {getCategoryLabel(item.budget.category)}
                        </Text>
                        <Text className="text-xs text-muted">
                          {formatBudgetStatus(item.status)}
                        </Text>
                      </View>
                    </View>

                    <TouchableOpacity
                      onPress={() => handleDeleteBudget(item.budget.id)}
                      className="p-2"
                    >
                      <Text className="text-lg text-error">🗑</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Progress Bar */}
                  <View className="gap-2">
                    <View className="h-2 bg-border rounded-full overflow-hidden">
                      <View
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.min(item.progress, 100)}%`,
                          backgroundColor: getBudgetStatusColor(item.status, colors),
                        }}
                      />
                    </View>

                    {/* Amount Info */}
                    <View className="flex-row justify-between items-center">
                      <Text className="text-xs text-muted">
                        {settings.currencySymbol}
                        {item.spent.toFixed(2)} / {settings.currencySymbol}
                        {item.budget.monthlyLimit.toFixed(2)}
                      </Text>
                      <Text className="text-xs font-semibold text-foreground">
                        {item.progress.toFixed(0)}%
                      </Text>
                    </View>

                    {/* Remaining */}
                    {item.remaining > 0 && (
                      <Text className="text-xs text-success">
                        {settings.currencySymbol}
                        {item.remaining.toFixed(2)} remaining
                      </Text>
                    )}
                    {item.remaining <= 0 && (
                      <Text className="text-xs text-error">
                        Over by {settings.currencySymbol}
                        {Math.abs(item.remaining).toFixed(2)}
                      </Text>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            )}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        ) : (
          <View className="flex-1 items-center justify-center">
            <Text className="text-sm text-muted mb-4">No budgets set for this month</Text>
            <TouchableOpacity
              onPress={() => {
                setSelectedCategory("food");
                setBudgetAmount("");
                setShowAddModal(true);
              }}
              className="bg-primary rounded-xl px-6 py-3"
            >
              <Text className="text-white font-semibold">Create Your First Budget</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Add Budget Modal */}
      <Modal
        visible={showAddModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAddModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-background rounded-t-3xl p-6 gap-4">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-xl font-bold text-foreground">Add Budget</Text>
              <TouchableOpacity onPress={() => setShowAddModal(false)}>
                <Text className="text-lg text-primary font-semibold">✕</Text>
              </TouchableOpacity>
            </View>

            {/* Category Selection */}
            <View className="gap-2">
              <Text className="text-sm font-semibold text-muted">Category</Text>
              <FlatList
                data={Object.entries(EXPENSE_CATEGORIES).filter(
                  ([key]) =>
                    !currentMonthBudgets.some((b) => b.category === key)
                )}
                keyExtractor={([key]) => key}
                scrollEnabled={false}
                renderItem={({ item: [key, value] }) => (
                  <TouchableOpacity
                    onPress={() => setSelectedCategory(key as ExpenseCategory)}
                    className={`p-3 rounded-xl border mb-2 ${
                      selectedCategory === key ? "bg-primary border-primary" : "bg-surface border-border"
                    }`}
                  >
                    <Text
                      className={`text-sm font-semibold ${
                        selectedCategory === key ? "text-white" : "text-foreground"
                      }`}
                    >
                      {value.label}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>

            {/* Budget Amount */}
            <View className="gap-2">
              <Text className="text-sm font-semibold text-muted">Monthly Budget</Text>
              <View className="flex-row items-center bg-surface rounded-xl border border-border px-4 py-3">
                <Text className="text-lg font-semibold text-foreground">{settings.currencySymbol}</Text>
                <TextInput
                  placeholder="0.00"
                  placeholderTextColor={colors.muted}
                  value={budgetAmount}
                  onChangeText={setBudgetAmount}
                  keyboardType="decimal-pad"
                  className="flex-1 ml-2 text-base font-semibold text-foreground"
                />
              </View>
            </View>

            {/* Save Button */}
            <TouchableOpacity
              onPress={handleAddBudget}
              disabled={isSaving}
              className={`bg-primary rounded-xl py-4 items-center ${isSaving ? "opacity-50" : ""}`}
            >
              <Text className="text-lg font-bold text-white">
                {isSaving ? "Creating..." : "Create Budget"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Edit Budget Modal */}
      <Modal
        visible={showEditModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-background rounded-t-3xl p-6 gap-4">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-xl font-bold text-foreground">Edit Budget</Text>
              <TouchableOpacity onPress={() => setShowEditModal(false)}>
                <Text className="text-lg text-primary font-semibold">✕</Text>
              </TouchableOpacity>
            </View>

            {/* Budget Amount */}
            <View className="gap-2">
              <Text className="text-sm font-semibold text-muted">Monthly Budget</Text>
              <View className="flex-row items-center bg-surface rounded-xl border border-border px-4 py-3">
                <Text className="text-lg font-semibold text-foreground">{settings.currencySymbol}</Text>
                <TextInput
                  placeholder="0.00"
                  placeholderTextColor={colors.muted}
                  value={budgetAmount}
                  onChangeText={setBudgetAmount}
                  keyboardType="decimal-pad"
                  className="flex-1 ml-2 text-base font-semibold text-foreground"
                />
              </View>
            </View>

            {/* Save Button */}
            <TouchableOpacity
              onPress={handleUpdateBudget}
              disabled={isSaving}
              className={`bg-primary rounded-xl py-4 items-center ${isSaving ? "opacity-50" : ""}`}
            >
              <Text className="text-lg font-bold text-white">
                {isSaving ? "Updating..." : "Update Budget"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
