// src/components/progress/StatItem.tsx
import React, { useEffect, useRef } from "react";
import { StyleSheet, Animated } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { AccessibleText } from "../AccessibleComponents";

type IconName = React.ComponentProps<typeof MaterialCommunityIcons>["name"];

type StatItemProps = {
  icon: IconName;
  value: string;
  label: string;
  color?: string;
  delay?: number;
};

export const StatItem = ({
  icon,
  value,
  label,
  color = "#FFFFFF",
  delay = 0,
}: StatItemProps) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 40,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim, delay]);

  return (
    <Animated.View
      style={[
        styles.statItem,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
    >
      <MaterialCommunityIcons name={icon} size={32} color={color} />
      <AccessibleText baseSize={18} style={styles.statValue}>
        {value}
      </AccessibleText>
      <AccessibleText baseSize={11} style={styles.statLabel}>
        {label}
      </AccessibleText>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  statItem: {
    width: "31%",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    marginBottom: 10,
  },
  statValue: {
    color: "#FFFFFF",
    fontWeight: "bold",
    marginTop: 6,
  },
  statLabel: {
    color: "#CCCCCC",
    textAlign: "center",
    marginTop: 4,
  },
});
