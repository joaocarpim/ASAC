// src/components/MagnifierButton.tsx

import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { useAccessibility } from "../context/AccessibilityProvider";

const MagnifierButton: React.FC = () => {
  const { magnifier, toggleMagnifierMode } = useAccessibility();

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: magnifier.isActive ? "#06a301ff" : "#040466ff" },
      ]}
      onPress={toggleMagnifierMode}
      accessible={true}
      accessibilityLabel={
        magnifier.isActive
          ? "Desativar lupa de aumento"
          : "Ativar lupa de aumento"
      }
      accessibilityRole="button"
    >
      <Text style={styles.buttonText}>🔍</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // ✅ BOTÃO MENOR E SEM MARGEM VERTICAL
  button: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  buttonText: {
    fontSize: 22, // Ícone um pouco menor
    color: "white",
  },
});

export default MagnifierButton;
