// src/components/FloatingAccessibilityButton.tsx

import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { useAccessibility } from "../context/AccessibilityProvider";

const FloatingAccessibilityButton: React.FC = () => {
  const { isVoiceMode, toggleVoiceMode, getElementCount } = useAccessibility();

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { backgroundColor: isVoiceMode ? "#06a301ff" : "#040466ff" },
      ]}
      onPress={toggleVoiceMode}
      accessible={true}
      accessibilityLabel={
        isVoiceMode
          ? "Desativar modo de leitura de tela"
          : "Ativar modo de leitura de tela"
      }
      accessibilityRole="button"
      accessibilityHint={
        isVoiceMode
          ? `Modo ativo. ${getElementCount()} elementos detectados. Toque para desativar.`
          : "Toque para ativar exploração por toque com síntese de voz"
      }
    >
      <Text style={styles.buttonText}>{isVoiceMode ? "🔇" : "🔊"}</Text>
      {isVoiceMode && (
        <Text style={styles.counterText}>{getElementCount()}</Text>
      )}
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
    position: "relative",
  },
  buttonText: {
    fontSize: 22, // Ícone um pouco menor
    color: "white",
  },
  counterText: {
    position: "absolute",
    top: -4,
    right: -4,
    backgroundColor: "#FF3B30",
    color: "white",
    fontSize: 9,
    fontWeight: "bold",
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    textAlign: "center",
    lineHeight: 18, // Para alinhar o texto verticalmente
    paddingHorizontal: 4,
  },
});

export default FloatingAccessibilityButton;
