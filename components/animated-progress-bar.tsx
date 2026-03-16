import { View, Text } from "react-native";
import { useEffect } from "react";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useColors } from "@/hooks/use-colors";

interface AnimatedProgressBarProps {
  progress: number; // 0-1
  label: string;
  spent: number;
  budget: number;
  currency: string;
}

export function AnimatedProgressBar({
  progress,
  label,
  spent,
  budget,
  currency,
}: AnimatedProgressBarProps) {
  const colors = useColors();
  const animatedProgress = useSharedValue(0);

  useEffect(() => {
    animatedProgress.value = withTiming(Math.min(progress, 1), {
      duration: 800,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    width: `${animatedProgress.value * 100}%`,
  }));

  // Determine color based on progress
  let progressColor = colors.success;
  if (progress > 0.8) {
    progressColor = colors.warning;
  }
  if (progress >= 1) {
    progressColor = colors.error;
  }

  return (
    <View
      style={{
        marginBottom: 16,
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 12,
      }}
    >
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        <Text
          style={{
            fontSize: 14,
            fontWeight: "600",
            color: colors.foreground,
          }}
        >
          {label}
        </Text>
        <Text
          style={{
            fontSize: 12,
            fontWeight: "600",
            color: colors.muted,
          }}
        >
          {currency} {spent.toFixed(2)} / {currency} {budget.toFixed(2)}
        </Text>
      </View>

      <View
        style={{
          height: 8,
          backgroundColor: colors.border,
          borderRadius: 4,
          overflow: "hidden",
        }}
      >
        <Animated.View
          style={[
            {
              height: "100%",
              backgroundColor: progressColor,
              borderRadius: 4,
            },
            animatedStyle,
          ]}
        />
      </View>

      {progress > 1 && (
        <Text
          style={{
            fontSize: 11,
            color: colors.error,
            marginTop: 6,
            fontWeight: "600",
          }}
        >
          Over budget by {currency} {(spent - budget).toFixed(2)}
        </Text>
      )}
    </View>
  );
}
