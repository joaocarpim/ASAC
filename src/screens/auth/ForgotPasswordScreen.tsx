
// ForgotPasswordScreen.tsx
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
import { resetPassword, confirmResetPassword } from "aws-amplify/auth";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const logo = require("../../assets/images/logo.png");

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

export default function ForgotPasswordScreen({
  navigation,
}: RootStackScreenProps<"ForgotPassword">) {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [codeSent, setCodeSent] = useState(false);

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
    setModalState({ visible: true, type, title, message });
    if (onCloseCallback) {
      // Guarda callback para executar ao fechar
      setTimeout(() => {
        onCloseCallback();
      }, 100);
    }
  };

  const hideModal = () => setModalState({ ...modalState, visible: false });

  // Passo 1: Solicitar código
  const handleSendCode = async () => {
    if (!email.trim()) {
      showModal("error", "Atenção", "Por favor, digite seu email.");
      return;
    }

    setLoading(true);
    try {
      await resetPassword({ username: email.trim() });
      setCodeSent(true);
      showModal(
        "success",
        "Código Enviado",
        "Verifique seu email e insira o código de verificação abaixo."
      );
    } catch (error: any) {
      if (error?.name === "UserNotFoundException") {
        showModal("error", "Erro", "Este email não está cadastrado.");
      } else if (error?.name === "LimitExceededException") {
        showModal(
          "error",
          "Limite Excedido",
          "Muitas tentativas. Aguarde alguns minutos e tente novamente."
        );
      } else {
        showModal(
          "error",
          "Erro",
          error?.message || "Não foi possível enviar o código."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Passo 2: Confirmar nova senha
  const handleResetPassword = async () => {
    if (!code.trim()) {
      showModal("error", "Atenção", "Digite o código de verificação.");
      return;
    }

    if (!newPassword.trim()) {
      showModal("error", "Atenção", "Digite sua nova senha.");
      return;
    }

    if (newPassword.length < 8) {
      showModal("error", "Atenção", "A senha deve ter no mínimo 8 caracteres.");
      return;
    }

    if (newPassword !== confirmPassword) {
      showModal("error", "Atenção", "As senhas não coincidem.");
      return;
    }

    setLoading(true);
    try {
      await confirmResetPassword({
        username: email.trim(),
        confirmationCode: code.trim(),
        newPassword: newPassword,
      });

      showModal(
        "success",
        "Senha Redefinida!",
        "Sua senha foi alterada com sucesso. Você já pode fazer login.",
        () => {
          // Volta para tela de login após 2 segundos
          setTimeout(() => {
            navigation.navigate("Login");
          }, 2000);
        }
      );
    } catch (error: any) {
      if (error?.name === "CodeMismatchException") {
        showModal("error", "Erro", "Código de verificação incorreto.");
      } else if (error?.name === "ExpiredCodeException") {
        showModal(
          "error",
          "Código Expirado",
          "O código expirou. Solicite um novo código."
        );
      } else if (error?.name === "InvalidPasswordException") {
        showModal(
          "error",
          "Senha Inválida",
          "A senha não atende aos requisitos mínimos."
        );
      } else {
        showModal(
          "error",
          "Erro",
          error?.message || "Não foi possível redefinir a senha."
        );
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
      <CustomModal {...modalState} onClose={hideModal} />

      <StatusBar barStyle="dark-content" backgroundColor="#FFC700" />

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.logoContainer}>
          <Image source={logo} style={styles.logo} />
          <Text style={styles.logoText}>ASAC</Text>
        </View>

        <View style={styles.formContainer}>
          {!codeSent ? (
            <>
              <Text style={styles.promptText}>
                Digite seu email para receber o código de recuperação
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

              <TouchableOpacity
                style={styles.button}
                onPress={handleSendCode}
                disabled={loading}
              >
                <Text style={styles.buttonText}>
                  {loading ? "Enviando..." : "Enviar Código"}
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.promptText}>
                Código enviado para {email}
              </Text>
              <Text style={styles.subText}>
                Verifique sua caixa de entrada e spam
              </Text>

              <TextInput
                style={styles.input}
                placeholder="Código de Verificação"
                placeholderTextColor="#FFFFFF"
                keyboardType="number-pad"
                autoCapitalize="none"
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

              <TextInput
                style={styles.input}
                placeholder="Confirmar Nova Senha"
                placeholderTextColor="#FFFFFF"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />

              <TouchableOpacity
                style={styles.button}
                onPress={handleResetPassword}
                disabled={loading}
              >
                <Text style={styles.buttonText}>
                  {loading ? "Redefinindo..." : "Redefinir Senha"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.secondaryButton]}
                onPress={handleSendCode}
                disabled={loading}
              >
                <Text style={styles.buttonText}>Reenviar Código</Text>
              </TouchableOpacity>
            </>
          )}

          <TouchableOpacity
            style={styles.linkContainer}
            onPress={() => navigation.navigate("Login")}
          >
            <Text style={styles.linkText}>Voltar para o Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

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
    marginBottom: 10,
    textAlign: "center",
  },
  subText: {
    fontSize: 14,
    color: "#191970",
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
    marginTop: 10,
  },
  secondaryButton: {
    backgroundColor: "#4A4A8A",
  },
  buttonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "bold" },
  linkContainer: {
    marginTop: 20,
    padding: 10,
  },
  linkText: { color: "#191970", fontWeight: "bold", fontSize: 14 },
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