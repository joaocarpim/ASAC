// Caminho: ASAC/src/screens/auth/NewPasswordScreen.tsx

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
  Modal, // Importação do Modal
} from "react-native";
import { RootStackScreenProps } from "../../navigation/types";
import { confirmResetPassword } from "aws-amplify/auth";
import { MaterialCommunityIcons } from "@expo/vector-icons"; // Ícones para o modal

const logo = require("../../assets/images/logo.png");

// INÍCIO: COMPONENTE DO MODAL (COPIADO DO LOGINSCREEN)
type CustomModalProps = {
  visible: boolean;
  title: string;
  message: string;
  onClose: () => void;
  type: "success" | "error";
};

const CustomModal = ({
  visible,
  title,
  message,
  onClose,
  type,
}: CustomModalProps) => (
  <Modal
    animationType="fade"
    transparent
    visible={visible}
    onRequestClose={onClose}
  >
    <View style={styles.modalBackdrop}>
      <View style={styles.modalContainer}>
        {type === "error" && (
          <MaterialCommunityIcons
            name="alert-circle-outline"
            size={48}
            color="#D32F2F"
          />
        )}
        {type === "success" && (
          <MaterialCommunityIcons
            name="check-circle-outline"
            size={48}
            color="#2E7D32"
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
// FIM: COMPONENTE DO MODAL

export default function NewPasswordScreen({
  route,
  navigation,
}: RootStackScreenProps<"NewPassword">) {
  const { username } = route.params;
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // INÍCIO: LÓGICA PARA CONTROLAR O MODAL
  const [modalState, setModalState] = useState({
    visible: false,
    title: "",
    message: "",
    type: "error" as "success" | "error",
  });

  const showModal = (
    type: "success" | "error",
    title: string,
    message: string,
    onCloseCallback?: () => void
  ) => {
    setModalState({
      visible: true,
      type,
      title,
      message,
    });
    // Armazena a função de callback para ser chamada ao fechar
    setCloseAction(() => onCloseCallback);
  };

  const [closeAction, setCloseAction] = useState<(() => void) | undefined>();

  const handleCloseModal = () => {
    setModalState({ ...modalState, visible: false });
    if (closeAction) {
      closeAction();
    }
  };
  // FIM: LÓGICA PARA CONTROLAR O MODAL

  const handleConfirmReset = async () => {
    if (loading) return;
    if (!code || !newPassword) {
      // ERRO: Chama o modal com a mensagem de erro
      showModal(
        "error",
        "Atenção",
        "Por favor, preencha o código e sua nova senha."
      );
      return;
    }
    setLoading(true);
    try {
      console.log(`🔑 Tentando redefinir a senha para: ${username}`);
      await confirmResetPassword({
        username,
        confirmationCode: code,
        newPassword,
      });
      console.log("✅ Senha redefinida com sucesso!");

      // SUCESSO: Chama o modal e define o redirecionamento para o login
      showModal(
        "success",
        "Sucesso!",
        "Sua senha foi redefinida. Você será redirecionado para o login.",
        () => navigation.navigate("Login")
      );
    } catch (error: any) {
      console.error("❌ Erro ao redefinir senha:", error);
      // ERRO: Chama o modal com a mensagem de erro da AWS
      showModal(
        "error",
        "Erro",
        error.message ||
          "Não foi possível redefinir a senha. Verifique o código."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      {/* RENDERIZAÇÃO DO MODAL */}
      <CustomModal
        visible={modalState.visible}
        title={modalState.title}
        message={modalState.message}
        type={modalState.type}
        onClose={handleCloseModal}
      />
      <StatusBar barStyle="dark-content" backgroundColor="#FFC700" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* ... O resto do seu JSX (logo, inputs, etc) permanece o mesmo ... */}
        <View style={styles.logoContainer}>
          <Image source={logo} style={styles.logo} />
          <Text style={styles.logoText}>ASAC</Text>
        </View>
        <View style={styles.formContainer}>
          <Text style={styles.promptText}>
            Insira o código enviado para seu email e defina uma nova senha.
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Código de Verificação"
            placeholderTextColor="#FFFFFF"
            keyboardType="numeric"
            value={code}
            onChangeText={setCode}
          />
          <TextInput
            style={styles.input}
            placeholder="Nova Senha"
            placeholderTextColor="#FFFFFF"
            secureTextEntry
            value={newPassword}
            onChangeText={setNewPassword}
          />
        </View>
        <TouchableOpacity
          style={styles.button}
          onPress={handleConfirmReset}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Salvando..." : "Salvar Nova Senha"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// Estilos, incluindo os novos estilos para o modal
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFC700" },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "space-around",
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
  buttonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "bold" },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#FFF",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    width: "80%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#191970",
  },
  modalMessage: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
  },
  modalButton: {
    backgroundColor: "#191970",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    width: "100%",
  },
  modalButtonText: { color: "#FFF", fontWeight: "bold", fontSize: 16 },
});
