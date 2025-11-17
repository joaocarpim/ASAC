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
  // ✅ 1. Ler o novo estado 'playSound'
  const { isOpen, title, message, playSound, hideModal } = useModalStore();
  const { theme } = useContrast();

  const rotateAnim = useRef(new Animated.Value(0)).current;
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
      // Animação de "chegada"
      Animated.spring(modalAnim, {
        toValue: 1,
        stiffness: 120,
        damping: 10,
        mass: 0.8,
        useNativeDriver: true,
      }).start();

      // ✅ 2. Tocar o som SOMENTE se 'playSound' for true
      if (playSound) {
        const playSoundAsync = async () => {
          try {
            await sound.current?.setPositionAsync(0);
            await sound.current?.playAsync();
            console.log("[CompletionModal] 🔊 Som tocado.");
          } catch (error) {
            console.warn("[CompletionModal] ⚠️ Erro ao tocar som:", error);
          }
        };
        playSoundAsync();
      }

      // Animação de "balançar" o sino
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
      // Animação de "saída"
      Animated.timing(modalAnim, {
        toValue: 0,
        duration: 150,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
      rotateAnim.stopAnimation();
      rotateAnim.setValue(0);
    }
  }, [isOpen, rotateAnim, modalAnim, playSound]); // ✅ 3. Adicionar 'playSound'

  const rotation = rotateAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: ["-15deg", "15deg"],
  });
  const modalScale = modalAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.9, 1],
  });
  const modalOpacity = modalAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0.7, 1],
  });

  return (
    <Modal
      transparent={true}
      visible={isOpen}
      animationType="fade"
      onRequestClose={hideModal}
    >
      <View style={styles.overlay}>
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
              color={theme.cardText} // Corrigido (baseado no seu arquivo)
            />
          </Animated.View>
          <Text style={[styles.title, { color: theme.cardText }]}>{title}</Text>
          <Text style={[styles.message, { color: theme.cardText }]}>
            {message}
          </Text>
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

// ... (Estilos permanecem os mesmos)
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
