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
import { signIn } from "aws-amplify/auth"; // ✅ Amplify v6
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
  <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onClose}>
    <View style={styles.modalBackdrop}>
      <View style={styles.modalContainer}>
        {type === "error" && (
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

export default function LoginScreen({ navigation }: RootStackScreenProps<"Login">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [modalState, setModalState] = useState({
    visible: false,
    title: "",
    message: "",
    type: "error" as "success" | "error",
  });

  const showModal = (type: "success" | "error", title: string, message: string) => {
    setModalState({ visible: true, type, title, message });
  };

  const hideModal = () => {
    setModalState({ ...modalState, visible: false });
  };

  const handleLogin = async () => {
    if (loading) return;
    if (!email.trim() || !password) {
      showModal("error", "Atenção", "Por favor, preencha o email e senha.");
      return;
    }
    setLoading(true);

    try {
      // ✅ Amplify v6 exige username (email no nosso caso)
      const user = await signIn({
        username: email.trim(),
        password,
      });

      console.log("✅ Login bem-sucedido:", user);
    } catch (error: any) {
      console.log("### ERRO AO FAZER LOGIN ###:", error);

      if (error?.name === "UserNotConfirmedException") {
        navigation.navigate("ConfirmSignUp", { email: email.trim() });
      } else if (error?.name === "UserNotFoundException") {
        showModal("error", "Erro", "Este usuário não existe.");
      } else if (error?.name === "NotAuthorizedException") {
        showModal("error", "Erro", "Digite novamente, email ou senha incorretos.");
      } else {
        showModal("error", "Erro", error.message || "Ocorreu um problema. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoToConfirm = () => {
    if (!email.trim()) {
      showModal("error", "Atenção", "Digite seu e-mail no campo acima antes de confirmar.");
      return;
    }
    navigation.navigate("ConfirmSignUp", { email: email.trim() });
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
          <TextInput
            style={styles.input}
            placeholder="Senha"
            placeholderTextColor="#FFFFFF"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
          <View style={styles.linksContainer}>
            <TouchableOpacity onPress={() => navigation.navigate("ForgotPassword")}>
              <Text style={styles.linkText}>Recuperar Senha</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleGoToConfirm}>
              <Text style={styles.linkText}>Confirmar Conta</Text>
            </TouchableOpacity>
          </View>
        </View>
        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? "Entrando..." : "Logar"}</Text>
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
