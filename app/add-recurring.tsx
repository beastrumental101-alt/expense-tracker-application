import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Modal,
  FlatList,
  ActivityIndicator,
  Switch,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useRecurring } from "@/lib/recurring-context";
import { useTransactions } from "@/lib/transaction-context";
import { useColors } from "@/hooks/use-colors";
import { getCategoryLabel, EXPENSE_CATEGORIES, INCOME_CATEGORIES, RecurrenceFrequency } from "@/lib/types";
import { getFrequencyLabel } from "@/lib/recurring-utils";
import { router } from "expo-router";
import { useState } from "react";

const FREQUENCIES: RecurrenceFrequency[] = ["daily", "weekly", "biweekly", "monthly", "quarterly", "yearly"];

export default function AddRecurringScreen() {
  const colors = useColors();
  const { addRecurringTransaction, isLoading } = useRecurring();
  const { settings } = useTransactions();

  const [type, setType] = useState<"income" | "expense">("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState<string>(type === "income" ? "salary" : "food");
  const [frequency, setFrequency] = useState<RecurrenceFrequency>("monthly");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [hasEndDate, setHasEndDate] = useState(false);
  const [endDate, setEndDate] = useState("");
  const [notes, setNotes] = useState("");
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showFrequencyModal, setShowFrequencyModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const categories = type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const handleAddRecurring = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    if (hasEndDate && endDate < startDate) {
      alert("End date must be after start date");
      return;
    }

    setIsSaving(true);
    try {
      await addRecurringTransaction({
        type,
        amount: parseFloat(amount),
        category: category as any,
        frequency,
        startDate,
        endDate: hasEndDate ? endDate : undefined,
        notes: notes || undefined,
      });

      alert("Recurring transaction created successfully!");
      router.back();
    } catch (error) {
      console.error("Error creating recurring transaction:", error);
      alert("Failed to create recurring transaction");
    } finally {
      setIsSaving(false);
    }
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
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View className="gap-6 pb-6">
          {/* Header */}
          <View className="flex-row items-center justify-between">
            <Text className="text-3xl font-bold text-foreground">Add Recurring</Text>
            <TouchableOpacity onPress={() => router.back()}>
              <Text className="text-lg text-primary font-semibold">✕</Text>
            </TouchableOpacity>
          </View>

          {/* Type Selection */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-muted">Type</Text>
            <View className="flex-row gap-2">
              {(["income", "expense"] as const).map((t) => (
                <TouchableOpacity
                  key={t}
                  onPress={() => {
                    setType(t);
                    setCategory(t === "income" ? "salary" : "food");
                  }}
                  className={`flex-1 py-3 px-4 rounded-xl border ${
                    type === t ? "bg-primary border-primary" : "bg-surface border-border"
                  }`}
                >
                  <Text
                    className={`text-base font-semibold text-center capitalize ${
                      type === t ? "text-white" : "text-foreground"
                    }`}
                  >
                    {t}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Amount */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-muted">Amount</Text>
            <View className="flex-row items-center bg-surface rounded-xl border border-border px-4 py-3">
              <Text className="text-lg font-semibold text-foreground">{settings.currencySymbol}</Text>
              <TextInput
                placeholder="0.00"
                placeholderTextColor={colors.muted}
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
                className="flex-1 ml-2 text-base font-semibold text-foreground"
              />
            </View>
          </View>

          {/* Category */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-muted">Category</Text>
            <TouchableOpacity
              onPress={() => setShowCategoryModal(true)}
              className="bg-surface rounded-xl border border-border p-4 flex-row items-center justify-between"
            >
              <Text className="text-base font-semibold text-foreground">
                {getCategoryLabel(category as any)}
              </Text>
              <Text className="text-lg text-muted">›</Text>
            </TouchableOpacity>
          </View>

          {/* Frequency */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-muted">Frequency</Text>
            <TouchableOpacity
              onPress={() => setShowFrequencyModal(true)}
              className="bg-surface rounded-xl border border-border p-4 flex-row items-center justify-between"
            >
              <Text className="text-base font-semibold text-foreground">
                {getFrequencyLabel(frequency)}
              </Text>
              <Text className="text-lg text-muted">›</Text>
            </TouchableOpacity>
          </View>

          {/* Start Date */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-muted">Start Date</Text>
            <TextInput
              value={startDate}
              onChangeText={setStartDate}
              placeholder="YYYY-MM-DD"
              className="bg-surface rounded-xl border border-border px-4 py-3 text-base font-semibold text-foreground"
            />
          </View>

          {/* End Date Toggle */}
          <View className="flex-row items-center justify-between bg-surface rounded-xl border border-border px-4 py-3">
            <Text className="text-base font-semibold text-foreground">Set End Date</Text>
            <Switch
              value={hasEndDate}
              onValueChange={setHasEndDate}
              trackColor={{ false: colors.border, true: colors.primary }}
            />
          </View>

          {/* End Date */}
          {hasEndDate && (
            <View className="gap-2">
              <Text className="text-sm font-semibold text-muted">End Date</Text>
              <TextInput
                value={endDate}
                onChangeText={setEndDate}
                placeholder="YYYY-MM-DD"
                className="bg-surface rounded-xl border border-border px-4 py-3 text-base font-semibold text-foreground"
              />
            </View>
          )}

          {/* Notes */}
          <View className="gap-2">
            <Text className="text-sm font-semibold text-muted">Notes (Optional)</Text>
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
            onPress={handleAddRecurring}
            disabled={isSaving}
            className={`bg-primary rounded-xl py-4 items-center ${isSaving ? "opacity-50" : ""}`}
          >
            <Text className="text-lg font-bold text-white">
              {isSaving ? "Creating..." : "Create Recurring Transaction"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Category Modal */}
      <Modal
        visible={showCategoryModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCategoryModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-background rounded-t-3xl p-6 gap-4">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-xl font-bold text-foreground">Select Category</Text>
              <TouchableOpacity onPress={() => setShowCategoryModal(false)}>
                <Text className="text-lg text-primary font-semibold">✕</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={Object.entries(categories)}
              keyExtractor={([key]) => key}
              scrollEnabled={false}
              renderItem={({ item: [key, value] }) => (
                <TouchableOpacity
                  onPress={() => {
                    setCategory(key);
                    setShowCategoryModal(false);
                  }}
                  className={`p-4 rounded-xl border mb-2 ${
                    category === key ? "bg-primary border-primary" : "bg-surface border-border"
                  }`}
                >
                  <Text
                    className={`text-base font-semibold ${
                      category === key ? "text-white" : "text-foreground"
                    }`}
                  >
                    {value.label}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Frequency Modal */}
      <Modal
        visible={showFrequencyModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowFrequencyModal(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-background rounded-t-3xl p-6 gap-4">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-xl font-bold text-foreground">Select Frequency</Text>
              <TouchableOpacity onPress={() => setShowFrequencyModal(false)}>
                <Text className="text-lg text-primary font-semibold">✕</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={FREQUENCIES}
              keyExtractor={(item) => item}
              scrollEnabled={false}
              renderItem={({ item: freq }) => (
                <TouchableOpacity
                  onPress={() => {
                    setFrequency(freq);
                    setShowFrequencyModal(false);
                  }}
                  className={`p-4 rounded-xl border mb-2 ${
                    frequency === freq ? "bg-primary border-primary" : "bg-surface border-border"
                  }`}
                >
                  <Text
                    className={`text-base font-semibold ${
                      frequency === freq ? "text-white" : "text-foreground"
                    }`}
                  >
                    {getFrequencyLabel(freq)}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}
