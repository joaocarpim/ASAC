// src/components/modals/CompletionModal.tsx

import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useModalStore } from "../../store/useModalStore";
import { useContrast } from "../../hooks/useContrast";
import { Audio } from "expo-av";

export function CompletionModal() {
  const { isOpen, title, message, hideModal } = useModalStore();
  const { theme } = useContrast();

  // Animações
  const rotateAnim = useRef(new Animated.Value(0)).current;
  // ✅ 1. Novo valor animado para o modal (escala e opacidade)
  const modalAnim = useRef(new Animated.Value(0)).current;

  const sound = useRef<Audio.Sound | null>(null);

  // Efeito para carregar o som (só uma vez)
  useEffect(() => {
    const loadSound = async () => {
      try {
        const { sound: soundObject } = await Audio.Sound.createAsync(
          require("../../../assets/som/notification.mp3")
        );
        sound.current = soundObject;
        console.log("[CompletionModal] 🔊 Som de notificação carregado.");
      } catch (error) {
        console.warn("[CompletionModal] ⚠️ Erro ao carregar som:", error);
      }
    };
    loadSound();
    return () => {
      sound.current?.unloadAsync();
    };
  }, []);

  // Efeito para tocar o som e animar (quando o modal abrir)
  useEffect(() => {
    if (isOpen) {
      // ✅ 2. Disparar a animação de "chegada" (pop-in com "spring")
      Animated.spring(modalAnim, {
        toValue: 1,
        stiffness: 120, // Rigidez da mola
        damping: 10, // Amortecimento
        mass: 0.8, // "Peso"
        useNativeDriver: true,
      }).start(); // Inicia a animação do modal

      // Toca o som
      const playSound = async () => {
        try {
          await sound.current?.setPositionAsync(0);
          await sound.current?.playAsync();
          console.log("[CompletionModal] 🔊 Som tocado.");
        } catch (error) {
          console.warn("[CompletionModal] ⚠️ Erro ao tocar som:", error);
        }
      };
      playSound();

      // Inicia a animação de "balançar" o sino
      Animated.loop(
        Animated.sequence([
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 150,
            useNativeDriver: true,
            easing: Easing.linear,
          }),
          Animated.timing(rotateAnim, {
            toValue: -1,
            duration: 150,
            useNativeDriver: true,
            easing: Easing.linear,
          }),
          Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 150,
            useNativeDriver: true,
            easing: Easing.linear,
          }),
          Animated.timing(rotateAnim, {
            toValue: -1,
            duration: 150,
            useNativeDriver: true,
            easing: Easing.linear,
          }),
          Animated.timing(rotateAnim, {
            toValue: 0,
            duration: 150,
            useNativeDriver: true,
            easing: Easing.linear,
          }),
          Animated.delay(1000),
        ])
      ).start();
    } else {
      // ✅ 3. Animação de "saída" (fade-out rápido)
      Animated.timing(modalAnim, {
        toValue: 0,
        duration: 150, // Duração rápida
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();

      // Para e reseta a animação do sino
      rotateAnim.stopAnimation();
      rotateAnim.setValue(0);
    }
  }, [isOpen, rotateAnim, modalAnim]); // Adicionado modalAnim às dependências

  // Interpola a animação do sino
  const rotation = rotateAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: ["-15deg", "15deg"],
  });

  // ✅ 4. Interpolações para o modal (escala e opacidade)
  const modalScale = modalAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.9, 1], // Começa com 90% do tamanho e vai para 100%
  });
  const modalOpacity = modalAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0.7, 1], // Fade in suave
  });

  return (
    <Modal
      transparent={true}
      visible={isOpen}
      animationType="fade" // O "fade" é para o fundo escuro (overlay)
      onRequestClose={hideModal}
    >
      <View style={styles.overlay}>
        {/* ✅ 5. Aplicar os estilos animados ao conteúdo do modal */}
        <Animated.View
          style={[
            styles.modalContent,
            { backgroundColor: theme.card },
            {
              opacity: modalOpacity,
              transform: [{ scale: modalScale }],
            },
          ]}
        >
          <Animated.View style={{ transform: [{ rotate: rotation }] }}>
            <MaterialCommunityIcons
              name="bell-ring-outline"
              size={48}
              color={theme.text}
            />
          </Animated.View>

          <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
          <Text style={[styles.message, { color: theme.text }]}>{message}</Text>

          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.button }]}
            onPress={hideModal}
          >
            <Text style={[styles.buttonText, { color: theme.buttonText }]}>
              OK
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

// ... (seus estilos permanecem os mesmos)
const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "85%",
    maxWidth: 400,
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  button: {
    width: "100%",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
});
