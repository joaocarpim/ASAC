// src/observers/GameNotificationObserver.tsx
import React, { useState, useEffect, useRef } from "react";
import {
  Animated,
  Text,
  StyleSheet,
  Platform,
  Dimensions,
  View,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  ContractionSubject,
  NotificationEvent,
} from "../services/ContractionSubject";

export const GameNotificationObserver = () => {
  const [notification, setNotification] = useState<NotificationEvent | null>(
    null
  );
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-100)).current; // Começa fora da tela (cima)

  useEffect(() => {
    const handleNotification = (data: NotificationEvent) => {
      setNotification(data);

      // Animação de Entrada (Desce e aparece)
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          bounciness: 8,
        }),
      ]).start();

      // Lógica de sumir automaticamente
      if (data.type === "error") {
        // Erro some em 5 segundos
        setTimeout(hideNotification, 5000);
      } else {
        // Sucesso some rápido (2s) para não atrapalhar a transição de tela
        setTimeout(hideNotification, 2000);
      }
    };

    const hideNotification = () => {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: -100,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => setNotification(null));
    };

    // Se inscreve no Subject
    ContractionSubject.subscribe(handleNotification);

    return () => {
      ContractionSubject.unsubscribe(handleNotification);
    };
  }, []);

  if (!notification) return null;

  return (
    <Animated.View
      style={[
        styles.notificationContainer,
        {
          backgroundColor:
            notification.type === "success" ? "#4CAF50" : "#F44336",
          opacity: fadeAnim,
          transform: [{ translateY }],
        },
      ]}
    >
      <MaterialCommunityIcons
        name={notification.type === "success" ? "check-circle" : "alert-circle"}
        size={28}
        color="#FFF"
      />
      <Text style={styles.notificationText}>{notification.message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  notificationContainer: {
    position: "absolute",
    top: Platform.OS === "android" ? 50 : 60, // Ajuste para ficar abaixo do notch/status bar
    left: 20,
    right: 20,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    zIndex: 9999, // Garante que fique acima de tudo
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  notificationText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 12,
    flex: 1, // Para o texto quebrar linha se precisar
  },
});
