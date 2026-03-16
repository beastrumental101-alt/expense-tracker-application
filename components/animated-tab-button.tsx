import { Pressable, View, Text } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useColors } from "@/hooks/use-colors";

interface AnimatedTabButtonProps {
  onPress: () => void;
  onLongPress: () => void;
  isFocused: boolean;
  routeName: string;
  color: string;
  label: string;
  icon: React.ReactNode;
}

export function AnimatedTabButton({
  onPress,
  onLongPress,
  isFocused,
  routeName,
  color,
  label,
  icon,
}: AnimatedTabButtonProps) {
  const colors = useColors();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(isFocused ? 1 : 0.6);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.85, {
      damping: 10,
      mass: 1,
      overshootClamping: true,
    });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, {
      damping: 10,
      mass: 1,
      overshootClamping: true,
    });
  };

  // Update opacity based on focus state
  if (isFocused) {
    opacity.value = withTiming(1, { duration: 200 });
  } else {
    opacity.value = withTiming(0.6, { duration: 200 });
  }

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
    >
      <Animated.View style={animatedStyle}>
        <View
          style={{
            alignItems: "center",
            justifyContent: "center",
            paddingVertical: 8,
            paddingHorizontal: 12,
            borderRadius: 12,
            backgroundColor: isFocused
              ? colors.primary + "15"
              : "transparent",
          }}
        >
          <View style={{ marginBottom: isFocused ? 4 : 0 }}>
            {icon}
          </View>
          {isFocused && (
            <Animated.View
              style={{
                transform: [
                  {
                    scaleY: withTiming(1, { duration: 200 }),
                  },
                ],
              }}
            >
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: "600",
                  color: color,
                  marginTop: 2,
                }}
              >
                {label}
              </Text>
            </Animated.View>
          )}
        </View>
      </Animated.View>
    </Pressable>
  );
}
