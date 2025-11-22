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
  iconColor?: string;
  textColor?: string;
  backgroundColor?: string;
  delay?: number;
};

export const StatItem = React.memo(
  ({
    icon,
    value,
    label,
    iconColor = "#FFFFFF",
    textColor = "#FFFFFF",
    backgroundColor = "rgba(255, 255, 255, 0.1)",
    delay = 0,
  }: StatItemProps) => {
    // Animações internas do StatItem
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
            backgroundColor: backgroundColor,
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <MaterialCommunityIcons name={icon} size={32} color={iconColor} />
        <AccessibleText
          baseSize={18}
          style={[styles.statValue, { color: textColor }]}
        >
          {value}
        </AccessibleText>
        <AccessibleText
          baseSize={11}
          style={[styles.statLabel, { color: textColor, opacity: 0.8 }]}
        >
          {label}
        </AccessibleText>
      </Animated.View>
    );
  }
);

StatItem.displayName = "StatItem";

const styles = StyleSheet.create({
  statItem: {
    width: "31%",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    marginBottom: 10,
  },
  statValue: {
    fontWeight: "bold",
    marginTop: 6,
  },
  statLabel: {
    textAlign: "center",
    marginTop: 4,
  },
});
