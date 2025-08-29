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
  Modal, // NOVO: Importa o Modal
  Pressable, // NOVO: Importa o Pressable para o botão
} from "react-native";
import { RootStackScreenProps } from "../../navigation/types";
import ScreenHeader from "../../components/layout/ScreenHeader";
import { signUp } from "@aws-amplify/auth";
import { generateClient } from "aws-amplify/api";
import { createUser } from "../../graphql/mutations";

const logo = require("../../assets/images/logo.png");

export default function AdminRegisterUserScreen({
  
}: RootStackScreenProps<"AdminRegisterUser">) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // --- NOVO: Estados para controlar o Modal ---
  const [isModalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  // --- NOVO: Função para exibir o Modal ---
  const triggerModal = (title: string, message: string) => {
    setModalTitle(title);
    setModalMessage(message);
    setModalVisible(true);
  };

  const validateInput = () => {
    // 4. Modal para "preencha todos os campos"
    if (!name.trim() || !email.trim() || !password.trim()) {
      triggerModal(
        "Campos Incompletos",
        "Por favor, preencha todos os campos para continuar."
      );
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      triggerModal(
        "Email Inválido",
        "Por favor, insira um formato de email válido."
      );
      return false;
    }

    // Validação de Senha que agora usa o Modal
    const passwordErrors = [];
    if (password.length < 8) {
      passwordErrors.push("• Pelo menos 8 caracteres");
    }
    if (!/[A-Z]/.test(password)) {
      passwordErrors.push("• Pelo menos uma letra MAIÚSCULA");
    }
    if (!/[a-z]/.test(password)) {
      passwordErrors.push("• Pelo menos uma letra minúscula");
    }
    if (!/[0-9]/.test(password)) {
      passwordErrors.push("• Pelo menos um número");
    }

    if (passwordErrors.length > 0) {
      triggerModal(
        "Senha Fraca",
        "Sua senha não atende aos requisitos de segurança:\n\n" +
          passwordErrors.join("\n")
      );
      return false;
    }

    return true;
  };

  const handleRegister = async () => {
    if (loading || !validateInput()) return;

    setLoading(true);
    let cognitoUserId = null;

    try {
      const signUpResult = await signUp({
        username: email.trim().toLowerCase(),
        password,
        options: {
          userAttributes: {
            email: email.trim().toLowerCase(),
          },
        },
      });

      cognitoUserId = signUpResult.userId;

      const client = generateClient();
      await client.graphql({
        query: createUser,
        variables: {
          input: {
            id: cognitoUserId,
            name: name.trim(),
            email: email.trim().toLowerCase(),
            points: 0,
            coins: 0,
            role: "User",
          },
        },
        authMode: "userPool",
      });

      // Modal de Sucesso
      triggerModal(
        "Sucesso!",
        `O usuário ${name.trim()} foi registrado com sucesso.`
      );
      // Limpa os campos após o sucesso
      setName("");
      setEmail("");
      setPassword("");
      // Opcional: Navegar de volta após fechar o modal de sucesso
      // (você pode adicionar lógica no botão do modal se precisar)
      // navigation.goBack();
    } catch (error: any) {
      console.error("❌ ERRO DURANTE O REGISTRO:", error);

      // Tratamento de erros com o Modal
      switch (error.name) {
        // 1 e 2. Modal para "usuário existe" e "email ja existe"
        case "UsernameExistsException":
          triggerModal(
            "Email já Cadastrado",
            "O email inserido já está em uso por outra conta."
          );
          break;
        // 3. Modal para senha inválida (a verificação do Cognito)
        // OBS: "senha já existe" não é um erro padrão do Cognito. O erro comum é a senha não seguir a política.
        case "InvalidPasswordException":
          triggerModal(
            "Senha Inválida",
            "A senha não atende aos requisitos de segurança definidos pelo sistema. Verifique as regras e tente novamente."
          );
          break;
        case "InvalidParameterException":
          triggerModal(
            "Dados Inválidos",
            "Verifique os dados inseridos. Um ou mais campos podem ser inválidos."
          );
          break;
        default:
          triggerModal(
            "Erro Inesperado",
            "Ocorreu um erro ao tentar registrar o usuário. Tente novamente mais tarde."
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
      {/* --- NOVO: Componente Modal --- */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={isModalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalCenteredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>{modalTitle}</Text>
            <Text style={styles.modalMessage}>{modalMessage}</Text>
            <Pressable
              style={styles.modalButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalButtonText}>OK</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <StatusBar barStyle="dark-content" backgroundColor="#F0EFEA" />
      <ScreenHeader title="Registrar Assistido" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.logoContainer}>
          <Image source={logo} style={styles.logo} />
          <Text style={styles.logoText}>ASAC</Text>
        </View>
        <View style={styles.formContainer}>
          <Text style={styles.promptText}>
            Realize o registro dos assistidos
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Nome completo"
            placeholderTextColor="#FFFFFF80"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            editable={!loading}
          />
          <TextInput
            style={styles.input}
            placeholder="Email"
            placeholderTextColor="#FFFFFF80"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            value={email}
            onChangeText={setEmail}
            editable={!loading}
          />
          <TextInput
            style={styles.input}
            placeholder="Senha"
            placeholderTextColor="#FFFFFF80"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            editable={!loading}
          />
        </View>
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Registrando..." : "Registrar"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  // Seus estilos existentes ...
  container: { flex: 1, backgroundColor: "#F0EFEA" },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "space-around",
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  logoContainer: { alignItems: "center", marginBottom: 30 },
  logo: { width: 120, height: 120, resizeMode: "contain" },
  logoText: {
    fontSize: 48,
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
  buttonDisabled: {
    backgroundColor: "#191970AA",
  },
  buttonText: { color: "#FFFFFF", fontSize: 18, fontWeight: "bold" },

  // --- NOVO: Estilos para o Modal ---
  modalCenteredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.6)", // Fundo escurecido
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 25,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: "85%",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
    color: "#191970",
  },
  modalMessage: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
    lineHeight: 22,
  },
  modalButton: {
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 30,
    elevation: 2,
    backgroundColor: "#191970",
  },
  modalButtonText: {
    color: "white",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 16,
  },
});
