// src/observers/ExplanationObserver.tsx
import React, { useState, useEffect, useRef } from "react";
import {
  Animated,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  View,
  Dimensions,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Audio } from "expo-av"; // ✅ 1. Importar Audio
import {
  ExplanationSubject,
  ExplanationEvent,
} from "../services/ExplanationSubject";

const { width } = Dimensions.get("window");

export const ExplanationObserver = () => {
  const [notification, setNotification] = useState<ExplanationEvent | null>(
    null
  );
  const translateY = useRef(new Animated.Value(-200)).current;

  // ✅ 2. Função para tocar o som
  const playNotificationSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        require("../../assets/som/notification.mp3") // Ajuste o caminho se necessário
      );
      await sound.playAsync();
    } catch (error) {
      console.log("Erro ao tocar som de notificação:", error);
    }
  };

  useEffect(() => {
    const handleNotification = (data: ExplanationEvent) => {
      setNotification(data);

      // ✅ 3. Toca o som assim que a notificação chega
      playNotificationSound();

      // Animação de entrada (desce)
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        bounciness: 8,
      }).start();
    };

    ExplanationSubject.subscribe(handleNotification);

    return () => {
      ExplanationSubject.unsubscribe(handleNotification);
    };
  }, []);

  const handleDismiss = () => {
    // Animação de saída (sobe)
    Animated.timing(translateY, {
      toValue: -200,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      if (notification?.onDismiss) {
        notification.onDismiss();
      }
      setNotification(null);
    });
  };

  if (!notification) return null;

  // Lógica de Estilo baseada no tipo
  let bgColor = "#333"; // Default (info)
  let iconName: React.ComponentProps<typeof MaterialCommunityIcons>["name"] =
    "lightbulb-on";
  let borderColor = "rgba(255,255,255,0.2)";

  switch (notification.type) {
    case "success":
      bgColor = "#4CAF50";
      iconName = "thumb-up";
      borderColor = "#81C784";
      break;
    case "error":
      bgColor = "#F44336";
      iconName = "alert-circle";
      borderColor = "#E57373";
      break;
    case "warning":
      bgColor = "#FF9800";
      iconName = "alert";
      borderColor = "#FFB74D";
      break;
  }

  return (
    <Animated.View
      style={[styles.containerWrapper, { transform: [{ translateY }] }]}
    >
      <TouchableOpacity
        style={[
          styles.container,
          { backgroundColor: bgColor, borderColor: borderColor },
        ]}
        onPress={handleDismiss}
        activeOpacity={0.9}
        accessibilityRole="button"
        accessibilityLabel={`${notification.title}. ${notification.message}. Toque para continuar.`}
      >
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name={iconName} size={32} color="#FFF" />
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.title}>{notification.title}</Text>
          <Text style={styles.message}>{notification.message}</Text>
          <Text style={styles.hintText}>(Toque para continuar)</Text>
        </View>

        <View style={styles.chevronContainer}>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#FFF" />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  containerWrapper: {
    position: "absolute",
    top: Platform.OS === "ios" ? 60 : 40,
    left: 15,
    right: 15,
    zIndex: 9999,
    elevation: 10,
  },
  container: {
    flexDirection: "row",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    alignItems: "center",
    borderWidth: 2,
  },
  iconContainer: {
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 4,
  },
  message: {
    color: "#FFF",
    fontSize: 15,
    lineHeight: 20,
  },
  hintText: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 12,
    marginTop: 6,
    fontStyle: "italic",
  },
  chevronContainer: {
    marginLeft: 8,
  },
});
