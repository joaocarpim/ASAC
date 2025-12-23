import React, { useEffect, useRef } from "react";
import { StyleSheet, Animated, View } from "react-native";
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
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name={icon} size={28} color={iconColor} />
        </View>

        <View style={styles.contentContainer}>
          <AccessibleText
            baseSize={16}
            style={[styles.statValue, { color: textColor }]}
            numberOfLines={1}
            adjustsFontSizeToFit // Ajuda a manter o número dentro da caixa
          >
            {value}
          </AccessibleText>
          <AccessibleText
            baseSize={10}
            style={[styles.statLabel, { color: textColor, opacity: 0.8 }]}
            numberOfLines={2}
          >
            {label}
          </AccessibleText>
        </View>
      </Animated.View>
    );
  }
);

StatItem.displayName = "StatItem";

const styles = StyleSheet.create({
  statItem: {
    width: "100%", // Preenche o espaço dado pelo pai
    height: 110, // ✅ Altura FIXA para garantir que todos sejam iguais
    borderRadius: 16,
    padding: 10,
    alignItems: "center",
    justifyContent: "space-between", // Distribui o conteúdo verticalmente
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 2,
  },
  iconContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  contentContainer: {
    width: "100%",
    alignItems: "center",
    justifyContent: "flex-end",
    paddingBottom: 4,
  },
  statValue: {
    fontWeight: "bold",
    textAlign: "center",
  },
  statLabel: {
    textAlign: "center",
    marginTop: 2,
  },
});
