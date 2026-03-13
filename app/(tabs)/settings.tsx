import { ScrollView, Text, View, TouchableOpacity, Modal, FlatList, ActivityIndicator } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { useTransactions } from "@/lib/transaction-context";
import { useColors } from "@/hooks/use-colors";
import { exportTransactionsAsCSV } from "@/lib/storage";
import { useState } from "react";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system/legacy";

const CURRENCIES = [
  { code: "USD", symbol: "$", label: "US Dollar" },
  { code: "EUR", symbol: "€", label: "Euro" },
  { code: "GBP", symbol: "£", label: "British Pound" },
  { code: "JPY", symbol: "¥", label: "Japanese Yen" },
  { code: "CAD", symbol: "C$", label: "Canadian Dollar" },
  { code: "AUD", symbol: "A$", label: "Australian Dollar" },
  { code: "CHF", symbol: "CHF", label: "Swiss Franc" },
  { code: "CNY", symbol: "¥", label: "Chinese Yuan" },
  { code: "XAF", symbol: "FCFA", label: "Cameroon CFA Franc" },
];

export default function SettingsScreen() {
  const colors = useColors();
  const { settings, updateSettings, clearAllTransactions, transactions, isLoading } =
    useTransactions();
  const [showCurrencyPicker, setShowCurrencyPicker] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  const handleCurrencyChange = async (code: string, symbol: string) => {
    await updateSettings({ currency: code, currencySymbol: symbol });
    setShowCurrencyPicker(false);
  };

  const handleExportCSV = async () => {
    setIsExporting(true);
    try {
      const csv = await exportTransactionsAsCSV();
      const fileName = `expense-tracker-${new Date().toISOString().split("T")[0]}.csv`;

      // For mobile, use Sharing to save the file
      if (await Sharing.isAvailableAsync()) {
        const fileUri = `${FileSystem.documentDirectory}${fileName}`;
        await FileSystem.writeAsStringAsync(fileUri, csv);
        await Sharing.shareAsync(fileUri, {
          mimeType: "text/csv",
          dialogTitle: "Export Transactions",
        });
      } else {
        alert("Sharing is not available on this device");
      }
    } catch (error) {
      console.error("Error exporting CSV:", error);
      alert("Failed to export transactions");
    } finally {
      setIsExporting(false);
    }
  };

  const handleClearData = async () => {
    if (!isClearing) {
      setIsClearing(true);
      return;
    }

    try {
      await clearAllTransactions();
      alert("All transactions have been cleared");
      setIsClearing(false);
    } catch (error) {
      console.error("Error clearing data:", error);
      alert("Failed to clear transactions");
      setIsClearing(false);
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
        <View className="gap-6">
          {/* Header */}
          <Text className="text-3xl font-bold text-foreground">Settings</Text>

          {/* Currency Selection */}
          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground">Currency</Text>
            <TouchableOpacity
              onPress={() => setShowCurrencyPicker(true)}
              className="bg-surface rounded-xl border border-border p-4 flex-row items-center justify-between"
            >
              <View>
                <Text className="text-sm text-muted">Current Currency</Text>
                <Text className="text-base font-semibold text-foreground mt-1">
                  {settings.currency} ({settings.currencySymbol})
                </Text>
              </View>
              <Text className="text-lg text-muted">›</Text>
            </TouchableOpacity>
          </View>

          {/* Data Management */}
          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground">Data Management</Text>

            {/* Export Button */}
            <TouchableOpacity
              onPress={handleExportCSV}
              disabled={isExporting || transactions.length === 0}
              className={`bg-surface rounded-xl border border-border p-4 flex-row items-center justify-between ${
                isExporting || transactions.length === 0 ? "opacity-50" : ""
              }`}
            >
              <View>
                <Text className="text-sm text-muted">Export as CSV</Text>
                <Text className="text-sm font-semibold text-foreground mt-1">
                  {transactions.length} transactions
                </Text>
              </View>
              <Text className="text-lg">{isExporting ? "..." : "↓"}</Text>
            </TouchableOpacity>

            {/* Clear Data Button */}
            <TouchableOpacity
              onPress={handleClearData}
              className={`rounded-xl border p-4 flex-row items-center justify-between ${
                isClearing ? "bg-error border-error" : "bg-surface border-border"
              }`}
            >
              <View>
                <Text className={`text-sm ${isClearing ? "text-white/70" : "text-muted"}`}>
                  Clear All Data
                </Text>
                <Text
                  className={`text-sm font-semibold mt-1 ${
                    isClearing ? "text-white" : "text-foreground"
                  }`}
                >
                  {isClearing ? "Tap again to confirm" : "Delete all transactions"}
                </Text>
              </View>
              <Text className={`text-lg ${isClearing ? "text-white" : "text-error"}`}>
                {isClearing ? "⚠" : "🗑"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* App Info */}
          <View className="gap-3">
            <Text className="text-lg font-semibold text-foreground">About</Text>
            <View className="bg-surface rounded-xl border border-border p-4 gap-3">
              <View className="flex-row justify-between items-center">
                <Text className="text-sm text-muted">App Version</Text>
                <Text className="text-sm font-semibold text-foreground">1.0.0</Text>
              </View>
              <View className="h-px bg-border" />
              <View className="flex-row justify-between items-center">
                <Text className="text-sm text-muted">Total Transactions</Text>
                <Text className="text-sm font-semibold text-foreground">{transactions.length}</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Currency Picker Modal */}
      <Modal
        visible={showCurrencyPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCurrencyPicker(false)}
      >
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-background rounded-t-3xl p-6 gap-4">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-xl font-bold text-foreground">Select Currency</Text>
              <TouchableOpacity onPress={() => setShowCurrencyPicker(false)}>
                <Text className="text-lg text-primary font-semibold">✕</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={CURRENCIES}
              keyExtractor={(item) => item.code}
              scrollEnabled={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => handleCurrencyChange(item.code, item.symbol)}
                  className={`p-4 rounded-xl border mb-2 flex-row items-center justify-between ${
                    settings.currency === item.code
                      ? "bg-primary border-primary"
                      : "bg-surface border-border"
                  }`}
                >
                  <View>
                    <Text
                      className={`text-base font-semibold ${
                        settings.currency === item.code ? "text-white" : "text-foreground"
                      }`}
                    >
                      {item.label}
                    </Text>
                    <Text
                      className={`text-sm mt-1 ${
                        settings.currency === item.code ? "text-white/70" : "text-muted"
                      }`}
                    >
                      {item.code} ({item.symbol})
                    </Text>
                  </View>
                  {settings.currency === item.code && (
                    <Text className="text-lg font-bold text-white">✓</Text>
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
