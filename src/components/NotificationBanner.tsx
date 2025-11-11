import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Platform,
  StatusBar,
  SafeAreaView,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  NotificationData,
  NotificationService,
} from "../services/NotificationService";

export function NotificationBanner() {
  const [visible, setVisible] = useState(false);
  const [data, setData] = useState<NotificationData | null>(null);
  const translateY = useRef(new Animated.Value(-150)).current;

  // ✅ LINHA CORRIGIDA
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    NotificationService.on("show", (notificationData) => {
      if (notificationData) {
        showNotification(notificationData as NotificationData);
      }
    });

    NotificationService.on("hide", () => {
      hideNotification();
    });

    return () => {
      NotificationService.off("show", () => {});
      NotificationService.off("hide", () => {});
    };
  }, []);

  const showNotification = (notificationData: NotificationData) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    setData(notificationData);
    setVisible(true);

    Animated.spring(translateY, {
      toValue: 0,
      useNativeDriver: true,
      speed: 12,
      bounciness: 5,
    }).start();

    if (notificationData.duration !== 0) {
      // @ts-ignore - Esta atribuição agora é segura por causa da correção acima
      timerRef.current = setTimeout(() => {
        hideNotification();
      }, notificationData.duration || 4000);
    }
  };

  const hideNotification = () => {
    Animated.timing(translateY, {
      toValue: -150,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setVisible(false);
      setData(null);
    });
  };

  if (!visible || !data) return null;

  const getColors = () => {
    switch (data.type) {
      case "success":
        return { bg: "#4CAF50", icon: "check-circle", text: "#FFFFFF" };
      case "error":
        return { bg: "#F44336", icon: "alert-circle", text: "#FFFFFF" };
      case "warning":
        return { bg: "#FFC107", icon: "alert", text: "#333333" };
      case "info":
      default:
        return { bg: "#2196F3", icon: "information", text: "#FFFFFF" };
    }
  };

  const colors = getColors();

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor: colors.bg, transform: [{ translateY }] },
      ]}
    >
      <SafeAreaView style={styles.safeArea}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={hideNotification}
          style={styles.content}
        >
          <MaterialCommunityIcons
            name={colors.icon as any}
            size={28}
            color={colors.text}
            style={styles.icon}
          />
          <View style={styles.textContainer}>
            <Text style={[styles.title, { color: colors.text }]}>
              {data.title}
            </Text>
            <Text style={[styles.message, { color: colors.text }]}>
              {data.message}
            </Text>
          </View>
        </TouchableOpacity>
      </SafeAreaView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 9999,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  safeArea: {
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    minHeight: 80,
  },
  icon: {
    marginRight: 15,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 4,
  },
  message: {
    fontSize: 14,
  },
});
