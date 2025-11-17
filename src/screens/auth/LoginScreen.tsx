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
import { MaterialCommunityIcons } from "@expo/vector-icons";
// 'Hub' e 'useAuthStore' foram removidos pois não são mais necessários aqui

const logo = require("../../assets/images/logo.png");

// O componente CustomModal permanece o mesmo
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

export default function LoginScreen({
  navigation,
}: RootStackScreenProps<"Login">) {
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

  // CORREÇÃO: Removido o 'onClose' do 'showModal' pois não vamos mais navegar daqui
  const showModal = (
    type: "success" | "error",
    title: string,
    message: string
  ) => {
    setModalState({ visible: true, type, title, message });
  };

  const hideModal = () => setModalState({ ...modalState, visible: false });

  // CORREÇÃO: Removida a função 'goToContrastSafely'

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      showModal("error", "Atenção", "Por favor, preencha o email e senha.");
      return;
    }

    setLoading(true);
    try {
      const result = await signIn({ username: email.trim(), password });

      if (
        result.nextStep?.signInStep ===
        "CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED"
      ) {
        setRequireNewPassword(true);
        return; // Correto: Fica na tela para inserir nova senha
      }

      // CORREÇÃO:
      // NÃO FAZEMOS MAIS NADA AQUI.
      // O `signIn()` acima vai disparar o evento "signedIn".
      // O seu `App.tsx` vai ouvir, chamar `checkUser()`,
      // e o `Stack.Navigator` vai trocar a tela automaticamente.
      //
      // Linhas removidas:
      // await checkUser();
      // Hub.dispatch("auth", { event: "signedIn" });
      // showModal("success", "Bem-vindo", "Login realizado com sucesso!", () => goToContrastSafely());
    } catch (error: any) {
      if (error?.name === "UserNotConfirmedException") {
        navigation.navigate("ConfirmSignUp", { email: email.trim() });
      } else if (error?.name === "NotAuthorizedException") {
        showModal("error", "Erro", "Email ou senha incorretos.");
      } else if (error?.name === "UserNotFoundException") {
        showModal("error", "Erro", "Este usuário não existe.");
      } else {
        showModal(
          "error",
          "Erro",
          error?.message || "Algo deu errado. Tente novamente."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmNewPassword = async () => {
    if (!newPassword.trim())
      return Alert.alert("Erro", "Digite uma nova senha.");

    setLoading(true);
    try {
      await confirmSignIn({ challengeResponse: newPassword });

      // CORREÇÃO:
      // Mesmo caso do Login. Não fazemos mais nada aqui.
      // O `confirmSignIn` também dispara um evento de auth
      // que o App.tsx vai pegar.
      //
      // Linhas removidas:
      // await checkUser();
      // Hub.dispatch("auth", { event: "signedIn" });
      // showModal("success", "Sucesso", "Senha atualizada!", () => goToContrastSafely());
    } catch (err: any) {
      Alert.alert("Erro", err.message || "Não foi possível redefinir a senha.");
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
            placeholder={requireNewPassword ? "Nova Senha" : "Senha"}
            placeholderTextColor="#FFFFFF"
            secureTextEntry
            value={requireNewPassword ? newPassword : password}
            onChangeText={requireNewPassword ? setNewPassword : setPassword}
          />          
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={requireNewPassword ? handleConfirmNewPassword : handleLogin}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading
              ? "Aguarde..."
              : requireNewPassword
                ? "Salvar Nova Senha"
                : "Logar"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// Os estilos permanecem os mesmos
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
