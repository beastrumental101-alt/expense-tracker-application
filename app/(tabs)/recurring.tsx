import {
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Modal,
  Alert,
} from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useRecurring } from "@/lib/recurring-context";
import { useTransactions } from "@/lib/transaction-context";
import { useColors } from "@/hooks/use-colors";
import { getCategoryLabel, getCategoryIcon } from "@/lib/types";
import { getFrequencyLabel, formatRecurringTransactionDisplay } from "@/lib/recurring-utils";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { router } from "expo-router";
import { useState } from "react";

export default function RecurringScreen() {
  const colors = useColors();
  const { recurringTransactions, deleteRecurringTransaction, isLoading } = useRecurring();
  const { settings } = useTransactions();
  const [selectedRecurring, setSelectedRecurring] = useState<string | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const handleDeleteRecurring = (id: string) => {
    Alert.alert(
      "Delete Recurring Transaction",
      "Are you sure you want to delete this recurring transaction?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteRecurringTransaction(id);
            } catch (error) {
              console.error("Error deleting recurring transaction:", error);
              alert("Failed to delete recurring transaction");
            }
          },
        },
      ]
    );
  };

  const selectedItem = recurringTransactions.find((t) => t.id === selectedRecurring);

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
        <View className="flex-row items-center justify-between">
          <Text className="text-3xl font-bold text-foreground">Recurring</Text>
          <TouchableOpacity
            onPress={() => router.push("/add-recurring")}
            className="bg-primary rounded-full w-12 h-12 items-center justify-center"
          >
            <Text className="text-2xl text-white font-bold">+</Text>
          </TouchableOpacity>
        </View>

        {/* Recurring Transactions List */}
        {recurringTransactions.length > 0 ? (
          <FlatList
            data={recurringTransactions}
            keyExtractor={(item) => item.id}
            scrollEnabled={true}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => {
                  setSelectedRecurring(item.id);
                  setShowDetailsModal(true);
                }}
                className="flex-row items-center justify-between bg-surface rounded-xl p-4 mb-2 border border-border"
              >
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
                      {getFrequencyLabel(item.frequency)}
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
                    {settings.currencySymbol}
                    {item.amount.toFixed(2)}
                  </Text>

                  <TouchableOpacity
                    onPress={() => handleDeleteRecurring(item.id)}
                    className="p-2"
                  >
                    <Text className="text-lg text-error">🗑</Text>
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            )}
            contentContainerStyle={{ paddingBottom: 20 }}
          />
        ) : (
          <View className="flex-1 items-center justify-center">
            <Text className="text-sm text-muted mb-4">No recurring transactions yet</Text>
            <TouchableOpacity
              onPress={() => router.push("/add-recurring")}
              className="bg-primary rounded-xl px-6 py-3"
            >
              <Text className="text-white font-semibold">Create Your First One</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Details Modal */}
      {selectedItem && (
        <Modal
          visible={showDetailsModal}
          transparent
          animationType="slide"
          onRequestClose={() => setShowDetailsModal(false)}
        >
          <View className="flex-1 bg-black/50 justify-end">
            <View className="bg-background rounded-t-3xl p-6 gap-4">
              <View className="flex-row items-center justify-between mb-2">
                <Text className="text-xl font-bold text-foreground">Recurring Details</Text>
                <TouchableOpacity onPress={() => setShowDetailsModal(false)}>
                  <Text className="text-lg text-primary font-semibold">✕</Text>
                </TouchableOpacity>
              </View>

              <View className="bg-surface rounded-xl p-4 gap-4 border border-border">
                {/* Category */}
                <View className="flex-row justify-between items-center">
                  <Text className="text-sm text-muted">Category</Text>
                  <Text className="text-sm font-semibold text-foreground">
                    {getCategoryLabel(selectedItem.category)}
                  </Text>
                </View>

                {/* Type */}
                <View className="h-px bg-border" />
                <View className="flex-row justify-between items-center">
                  <Text className="text-sm text-muted">Type</Text>
                  <Text className="text-sm font-semibold text-foreground capitalize">
                    {selectedItem.type}
                  </Text>
                </View>

                {/* Amount */}
                <View className="h-px bg-border" />
                <View className="flex-row justify-between items-center">
                  <Text className="text-sm text-muted">Amount</Text>
                  <Text
                    className={`text-sm font-semibold ${
                      selectedItem.type === "income" ? "text-success" : "text-error"
                    }`}
                  >
                    {selectedItem.type === "income" ? "+" : "-"}
                    {settings.currencySymbol}
                    {selectedItem.amount.toFixed(2)}
                  </Text>
                </View>

                {/* Frequency */}
                <View className="h-px bg-border" />
                <View className="flex-row justify-between items-center">
                  <Text className="text-sm text-muted">Frequency</Text>
                  <Text className="text-sm font-semibold text-foreground">
                    {getFrequencyLabel(selectedItem.frequency)}
                  </Text>
                </View>

                {/* Start Date */}
                <View className="h-px bg-border" />
                <View className="flex-row justify-between items-center">
                  <Text className="text-sm text-muted">Start Date</Text>
                  <Text className="text-sm font-semibold text-foreground">
                    {selectedItem.startDate}
                  </Text>
                </View>

                {/* End Date */}
                {selectedItem.endDate && (
                  <>
                    <View className="h-px bg-border" />
                    <View className="flex-row justify-between items-center">
                      <Text className="text-sm text-muted">End Date</Text>
                      <Text className="text-sm font-semibold text-foreground">
                        {selectedItem.endDate}
                      </Text>
                    </View>
                  </>
                )}

                {/* Last Generated */}
                {selectedItem.lastGeneratedDate && (
                  <>
                    <View className="h-px bg-border" />
                    <View className="flex-row justify-between items-center">
                      <Text className="text-sm text-muted">Last Generated</Text>
                      <Text className="text-sm font-semibold text-foreground">
                        {selectedItem.lastGeneratedDate}
                      </Text>
                    </View>
                  </>
                )}

                {/* Notes */}
                {selectedItem.notes && (
                  <>
                    <View className="h-px bg-border" />
                    <View className="gap-1">
                      <Text className="text-sm text-muted">Notes</Text>
                      <Text className="text-sm text-foreground">{selectedItem.notes}</Text>
                    </View>
                  </>
                )}
              </View>

              {/* Delete Button */}
              <TouchableOpacity
                onPress={() => {
                  setShowDetailsModal(false);
                  handleDeleteRecurring(selectedItem.id);
                }}
                className="bg-error rounded-xl py-3 items-center"
              >
                <Text className="text-lg font-bold text-white">Delete Recurring Transaction</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
    </ScreenContainer>
  );
}
