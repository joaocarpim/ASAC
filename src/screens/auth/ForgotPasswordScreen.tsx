import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Modal,
} from "react-native";
import { RootStackScreenProps } from "../../navigation/types";
import { resetPassword } from "@aws-amplify/auth";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const logo = require("../../assets/images/logo.png");

// 👇 1. DEFINIÇÃO DE TIPOS PARA AS PROPS DO MODAL
type CustomModalProps = {
  visible: boolean;
  title: string;
  message: string;
  onClose: () => void;
  type: "success" | "error";
};

// Componente de Modal com tipos aplicados
const CustomModal = ({
  visible,
  title,
  message,
  onClose,
  type,
}: CustomModalProps) => (
  <Modal
    animationType="fade"
    transparent={true}
    visible={visible}
    onRequestClose={onClose}
  >
    <View style={styles.modalBackdrop}>
      <View style={styles.modalContainer}>
        {type === "success" ? (
          <MaterialCommunityIcons
            name="check-circle-outline"
            size={48}
            color="green"
          />
        ) : (
          <MaterialCommunityIcons
            name="alert-circle-outline"
            size={48}
            color="#D32F2F"
          />
        )}
        <Text style={styles.modalTitle}>{title}</Text>
        <Text style={styles.modalMessage}>{message}</Text>
        <TouchableOpacity style={styles.modalButton} onPress={onClose}>
          <Text style={styles.modalButtonText}>OK</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

export default function ForgotPasswordScreen({
  navigation,
}: RootStackScreenProps<"ForgotPassword">) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const [modalState, setModalState] = useState({
    visible: false,
    title: "",
    message: "",
    type: "error" as "success" | "error",
    onCloseCallback: () => {},
  });

  // 👇 2. TIPOS ADICIONADOS AOS PARÂMETROS DA FUNÇÃO
  const showModal = (
    type: "success" | "error",
    title: string,
    message: string,
    onCloseCallback: () => void = () => {}
  ) => {
    setModalState({ visible: true, type, title, message, onCloseCallback });
  };

  const hideModal = () => {
    modalState.onCloseCallback();
    setModalState({ ...modalState, visible: false });
  };

  const handleSendCode = async () => {
    if (loading) return;
    if (!email.trim()) {
      showModal("error", "Campo Vazio", "Por favor, preencha o email.");
      return;
    }
    setLoading(true);

    try {
      await resetPassword({ username: email.trim() });
      showModal(
        "success",
        "Código Enviado!",
        "Verifique seu e-mail (e a caixa de spam/lixeira) pelo código de confirmação.",
        () => navigation.navigate("ResetPassword", { email: email.trim() })
      );
    } catch (error) {
      console.log("Erro ao resetar senha:", error);
      if (error && typeof error === "object" && "name" in error) {
        if (error.name === "UserNotFoundException") {
          showModal("error", "Erro", "Este usuário não existe.");
        } else if (error.name === "InvalidParameterException") {
          showModal("error", "Erro", "Digite novamente, email incorreto.");
        } else {
          showModal(
            "error",
            "Erro",
            "Não foi possível iniciar a recuperação. Tente novamente."
          );
        }
      } else {
        showModal("error", "Erro", "Ocorreu um erro desconhecido.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <CustomModal
        visible={modalState.visible}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
        onClose={hideModal}
      />

      <StatusBar barStyle="dark-content" backgroundColor="#FFC700" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.logoContainer}>
          <Image source={logo} style={styles.logo} />
          <Text style={styles.logoText}>ASAC</Text>
        </View>
        <View style={styles.formContainer}>
          <Text style={styles.promptText}>
            Insira seu Email para alterar sua senha
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#FFFFFF"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>
        <TouchableOpacity
          style={styles.button}
          onPress={handleSendCode}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Enviando..." : "Enviar Código"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFC700" },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
  },
  logoContainer: { alignItems: "center", marginBottom: 20 },
  logo: { width: 150, height: 150, resizeMode: "contain" },
  logoText: {
    fontSize: 52,
    fontWeight: "bold",
    color: "#191970",
    marginTop: 10,
  },
  formContainer: { width: "100%", alignItems: "center" },
  promptText: {
    fontSize: 16,
    color: "#191970",
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    width: "100%",
    backgroundColor: "#191970",
    color: "#FFFFFF",
    padding: 15,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 15,
  },
  button: {
    width: "100%",
    backgroundColor: "#191970",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: { color: "#FFFFFF", fontSize: 18, fontWeight: "bold" },

  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    width: "100%",
    maxWidth: 350,
    backgroundColor: "#FFFFFF",
    borderRadius: 15,
    padding: 25,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#191970",
    marginBottom: 15,
    marginTop: 10,
  },
  modalMessage: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 25,
    color: "#333",
    lineHeight: 24,
  },
  modalButton: {
    backgroundColor: "#191970",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 40,
  },
  modalButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "bold" },
});
