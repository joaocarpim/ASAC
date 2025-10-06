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
  Alert,
} from "react-native";
import { RootStackScreenProps } from "../../navigation/types";
import { confirmSignIn } from "aws-amplify/auth";
import { Hub } from "aws-amplify/utils";

const logo = require("../../assets/images/logo.png");

export default function NewPasswordScreen({
  route,
  navigation,
}: RootStackScreenProps<"NewPassword">) {
  const { username } = route.params; // Recebemos o email da tela de Login
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSetNewPassword = async () => {
    if (loading) return;

    if (!newPassword || !confirmPassword) {
      Alert.alert("Atenção", "Por favor, preencha e confirme sua nova senha.");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Erro", "As senhas não coincidem.");
      return;
    }

    setLoading(true);
    try {
      console.log(`🔑 Tentando definir nova senha para o usuário: ${username}`);
      
      // 1. Usa a função correta para finalizar o login com a nova senha
      await confirmSignIn({ challengeResponse: newPassword });
      
      console.log("✅ Nova senha definida com sucesso!");

      // 2. Avisa o resto do app que o login foi bem-sucedido
      Hub.dispatch("auth", { event: "signedIn" });

      // 3. Leva o usuário para a Home, finalizando o fluxo
      navigation.replace("Home");

    } catch (error: any) {
      console.error("❌ Erro ao definir nova senha:", error);
      Alert.alert("Erro", error.message || "Ocorreu um problema ao definir sua senha. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <StatusBar barStyle="dark-content" backgroundColor="#FFC700" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.logoContainer}>
          <Image source={logo} style={styles.logo} />
          <Text style={styles.logoText}>ASAC</Text>
        </View>
        <View style={styles.formContainer}>
          <Text style={styles.promptText}>
            Olá! Por segurança, você precisa definir uma nova senha para sua conta.
          </Text>

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
            placeholder="Confirme a Nova Senha"
            placeholderTextColor="#FFFFFF"
            secureTextEntry
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={handleSetNewPassword}
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

// Estilos consistentes com o resto do seu app de autenticação
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
  button: {
    width: "100%",
    backgroundColor: "#191970",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "bold" },
});