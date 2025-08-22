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
  Alert,
} from "react-native";
import { RootStackScreenProps } from "../../navigation/types";
import { signIn, fetchAuthSession } from "@aws-amplify/auth";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const logo = require("../../assets/images/logo.png");

type ErrorModalProps = {
  visible: boolean;
  title: string;
  message: string;
  onClose: () => void;
};

const ErrorModal = ({ visible, title, message, onClose }: ErrorModalProps) => (
  <Modal
    animationType="fade"
    transparent={true}
    visible={visible}
    onRequestClose={onClose}
  >
    <View style={styles.modalBackdrop}>
      <View style={styles.modalContainer}>
        <MaterialCommunityIcons
          name="alert-circle-outline"
          size={48}
          color="#D32F2F"
        />
        <Text style={styles.modalTitle}>{title}</Text>
        <Text style={styles.modalMessage}>{message}</Text>
        <TouchableOpacity style={styles.modalButton} onPress={onClose}>
          <Text style={styles.modalButtonText}>Fechar</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

export default function LoginScreen({
  navigation,
}: RootStackScreenProps<"Login">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  const showErrorModal = (title: string, message: string) => {
    setModalTitle(title);
    setModalMessage(message);
    setModalVisible(true);
  };

  const handleLogin = async () => {
    if (loading) return;
    setLoading(true);

    if (!email.trim() || !password) {
      showErrorModal("Atenção", "Por favor, preencha o email e senha.");
      setLoading(false);
      return;
    }

    try {
      await signIn({ username: email.trim(), password });
      const { tokens } = await fetchAuthSession();
      const cognitoGroups = tokens?.accessToken.payload["cognito:groups"];

      if (Array.isArray(cognitoGroups) && cognitoGroups.includes("Admins")) {
        navigation.reset({ index: 0, routes: [{ name: "AdminDashboard" }] });
      } else {
        navigation.reset({ index: 0, routes: [{ name: "Home" }] });
      }
    } catch (error) {
      if (error && typeof error === "object" && "name" in error) {
        if (error.name === "UserNotConfirmedException") {
          Alert.alert(
            "Conta não confirmada",
            "Você precisa confirmar sua conta antes de fazer o login. Vamos te levar para a tela de confirmação."
          );
          navigation.navigate("ConfirmSignUp", { email: email.trim() });
        } else if (error.name === "UserNotFoundException") {
          showErrorModal("Erro", "Este usuário não existe.");
        } else if (error.name === "NotAuthorizedException") {
          showErrorModal(
            "Erro",
            "Digite novamente, email ou senha incorretos."
          );
        } else {
          const typedError = error as { message?: string };
          showErrorModal(
            "Erro",
            typedError.message || "Ocorreu um problema. Tente novamente."
          );
        }
      } else {
        showErrorModal("Erro", "Ocorreu um erro desconhecido.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoToConfirm = () => {
    if (!email.trim()) {
      showErrorModal(
        "Atenção",
        "Por favor, digite seu e-mail no campo acima antes de clicar aqui."
      );
      return;
    }
    navigation.navigate("ConfirmSignUp", { email: email.trim() });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <ErrorModal
        visible={modalVisible}
        title={modalTitle}
        message={modalMessage}
        onClose={() => setModalVisible(false)}
      />

      <StatusBar barStyle="dark-content" backgroundColor="#FFC700" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.logoContainer}>
          <Image source={logo} style={styles.logo} />
          <Text style={styles.logoText}>ASAC</Text>
        </View>
        <View style={styles.formContainer}>
          <Text style={styles.promptText}>
            Acesse o App informando seus dados
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
          <TextInput
            style={styles.input}
            placeholder="Senha"
            placeholderTextColor="#FFFFFF"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <View style={styles.linksContainer}>
            <TouchableOpacity
              onPress={() => navigation.navigate("ForgotPassword")}
            >
              <Text style={styles.linkText}>Recuperar Senha</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleGoToConfirm}>
              <Text style={styles.linkText}>Confirmar Conta</Text>
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity
          style={styles.button}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Entrando..." : "Logar"}
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
  linksContainer: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 5,
  },
  linkText: { color: "#191970", fontWeight: "bold", fontSize: 14 },
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
