import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

type ModalType = "success" | "error";

interface AppModalProps {
  visible: boolean;
  type: ModalType | null;
  title: string;
  message: string;
  onClose: () => void;
}

export default function AppModal({
  visible,
  type,
  title,
  message,
  onClose,
}: AppModalProps) {
  const iconName =
    type === "success" ? "check-circle-outline" : "alert-circle-outline";
  const iconColor = type === "success" ? "#28a745" : "#dc3545";

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      {/* Overlay Escuro */}
      <View style={styles.overlay}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor="rgba(0, 0, 0, 0.5)"
        />
        {/* Container do Modal */}
        <View style={styles.modalContainer}>
          {/* Ícone */}
          {type && (
            <MaterialCommunityIcons
              name={iconName}
              size={60}
              color={iconColor}
              style={styles.icon}
            />
          )}

          {/* Título */}
          <Text style={styles.title}>{title}</Text>

          {/* Mensagem */}
          <Text style={styles.message}>{message}</Text>

          {/* Botão de Fechar */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>OK</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    marginRight: 70,
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 20,
    width: "70%",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  icon: {
    marginBottom: 15,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 10,
  },
  message: {
    fontSize: 16,
    color: "#555",
    textAlign: "center",
    marginBottom: 25,
    lineHeight: 22,
  },
  closeButton: {
    backgroundColor: "#191970",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 40,
    elevation: 2,
  },
  closeButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});
