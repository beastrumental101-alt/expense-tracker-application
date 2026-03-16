import { View, Text } from "react-native";
import { useEffect } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing,
} from "react-native-reanimated";
import { useColors } from "@/hooks/use-colors";
import type { Transaction } from "@/lib/types";

interface AnimatedTransactionCardProps {
  transaction: Transaction;
  index: number;
  currency: string;
}

export function AnimatedTransactionCard({
  transaction,
  index,
  currency,
}: AnimatedTransactionCardProps) {
  const colors = useColors();
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    opacity.value = withDelay(
      index * 50,
      withTiming(1, {
        duration: 400,
        easing: Easing.out(Easing.cubic),
      })
    );
    translateY.value = withDelay(
      index * 50,
      withTiming(0, {
        duration: 400,
        easing: Easing.out(Easing.cubic),
      })
    );
  }, [index]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  const isIncome = transaction.type === "income";
  const amountColor = isIncome ? colors.success : colors.foreground;
  const amountSign = isIncome ? "+" : "-";

  return (
    <Animated.View style={animatedStyle}>
      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: 12,
          padding: 12,
          marginBottom: 8,
          borderLeftWidth: 4,
          borderLeftColor: isIncome ? colors.success : colors.error,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: 14,
              fontWeight: "600",
              color: colors.foreground,
            }}
          >
            {transaction.category}
          </Text>
          <Text
            style={{
              fontSize: 12,
              color: colors.muted,
              marginTop: 4,
            }}
          >
            {new Date(transaction.date).toLocaleDateString()}
          </Text>
        </View>
        <Text
          style={{
            fontSize: 16,
            fontWeight: "700",
            color: amountColor,
          }}
        >
          {amountSign}
          {currency} {transaction.amount.toFixed(2)}
        </Text>
      </View>
    </Animated.View>
  );
}
