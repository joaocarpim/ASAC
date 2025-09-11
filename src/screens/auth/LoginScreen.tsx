// src/screens/auth/LoginScreen.tsx 
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
import { signIn, confirmSignIn } from "aws-amplify/auth";
import { Hub } from "@aws-amplify/core";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const logo = require("../../assets/images/logo.png");

type CustomModalProps = {
  visible: boolean;
  title: string;
  message: string;
  onClose: () => void;
  type: "success" | "error";
};

const CustomModal = ({ visible, title, message, onClose, type }: CustomModalProps) => (
  <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
    <View style={styles.modalBackdrop}>
      <View style={styles.modalContainer}>
        {type === "error" && (
          <MaterialCommunityIcons name="alert-circle-outline" size={48} color="#D32F2F" />
        )}
        {type === "success" && (
          <MaterialCommunityIcons name="check-circle-outline" size={48} color="#2E7D32" />
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

export default function LoginScreen({ navigation }: RootStackScreenProps<"Login">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [requireNewPassword, setRequireNewPassword] = useState(false);

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
    onClose?: () => void
  ) => {
    setModalState({ visible: true, type, title, message });
    if (onClose) {
      // fecha modal após tempo curto e executa ação (navegar)
      setTimeout(() => {
        setModalState((s) => ({ ...s, visible: false }));
        onClose();
      }, 600);
    }
  };

  const hideModal = () => setModalState({ ...modalState, visible: false });

  const handleLogin = async () => {
    if (loading) return;
    if (!email.trim() || !password) {
      showModal("error", "Atenção", "Por favor, preencha o email e senha.");
      return;
    }
    setLoading(true);

    try {
      console.log("🔐 Tentando login com:", email.trim());
      const result = await signIn({ username: email.trim(), password });
      console.log("✅ Login Cognito retornou:", JSON.stringify(result, null, 2));

      if (result.nextStep?.signInStep === "CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED") {
        setRequireNewPassword(true);
        showModal("error", "Nova senha necessária", "Digite uma nova senha para continuar.");
        return;
      }

      // dispara evento global (App.tsx escuta)
      Hub.dispatch("auth", { event: "signedIn" });

      // mostra modal e navega para Home
      showModal("success", "Bem-vindo", "Login realizado com sucesso!", () => {
        navigation.replace("Home");
      });
    } catch (error: any) {
      console.log("❌ ERRO AO FAZER LOGIN DETALHADO:", JSON.stringify(error, null, 2));
      if (error?.name === "UserNotConfirmedException") {
        navigation.navigate("ConfirmSignUp", { email: email.trim() });
      } else if (error?.name === "UserAlreadyAuthenticatedException") {
        // já autenticado — forçar refresh do estado global via Hub
        Hub.dispatch("auth", { event: "signedIn" });
        showModal("success", "Bem-vindo", "Você já está logado.", () => {
          navigation.replace("Home");
        });
      } else if (error?.name === "UserNotFoundException") {
        showModal("error", "Erro", "Este usuário não existe.");
      } else if (error?.name === "NotAuthorizedException") {
        showModal("error", "Erro", "Email ou senha incorretos.");
      } else {
        showModal("error", "Erro", error?.message || "Ocorreu um problema. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmNewPassword = async () => {
    if (!newPassword) {
      Alert.alert("Erro", "Digite uma nova senha.");
      return;
    }

    try {
      console.log("🔄 Confirmando nova senha...");
      // confirmSignIn espera objeto com challengeResponse
      const result = await confirmSignIn({ challengeResponse: newPassword });
      console.log("✅ Nova senha definida:", JSON.stringify(result, null, 2));

      setRequireNewPassword(false);
      setNewPassword("");

      Hub.dispatch("auth", { event: "signedIn" });

      showModal("success", "Sucesso", "Senha alterada! Você está logado.", () => {
        navigation.replace("Home");
      });
    } catch (err: any) {
      console.error("❌ Erro ao confirmar nova senha:", err);
      Alert.alert("Erro", err.message || "Não foi possível redefinir a senha.");
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
          <Text style={styles.promptText}>Acesse o App informando seus dados</Text>

          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#FFFFFF"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />

          {!requireNewPassword ? (
            <TextInput
              style={styles.input}
              placeholder="Senha"
              placeholderTextColor="#FFFFFF"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          ) : (
            <TextInput
              style={styles.input}
              placeholder="Nova Senha"
              placeholderTextColor="#FFFFFF"
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
            />
          )}

          <View style={styles.linksContainer}>
            {!requireNewPassword && (
              <>
                <TouchableOpacity onPress={() => navigation.navigate("ForgotPassword")}>
                  <Text style={styles.linkText}>Recuperar Senha</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => navigation.navigate("ConfirmSignUp", { email: email.trim() })}
                >
                  <Text style={styles.linkText}>Confirmar Conta</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        {!requireNewPassword ? (
          <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
            <Text style={styles.buttonText}>{loading ? "Entrando..." : "Logar"}</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.button} onPress={handleConfirmNewPassword} disabled={loading}>
            <Text style={styles.buttonText}>{loading ? "Salvando..." : "Salvar Nova Senha"}</Text>
          </TouchableOpacity>
        )}
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
  logoText: { fontSize: 52, fontWeight: "bold", color: "#191970", marginTop: 10 },
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
  modalTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 10, color: "#191970" },
  modalMessage: { fontSize: 16, textAlign: "center", marginBottom: 20, color: "#333" },
  modalButton: {
    backgroundColor: "#191970",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    width: "100%",
  },
  modalButtonText: { color: "#FFF", fontWeight: "bold", fontSize: 16 },
});
