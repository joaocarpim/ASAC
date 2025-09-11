// src/screens/auth/ResetPasswordScreen.tsx
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
import { confirmResetPassword, signIn } from "aws-amplify/auth";
import { Hub } from "aws-amplify/utils";

const logo = require("../../assets/images/logo.png");

export default function ResetPasswordScreen({
  route,
  navigation,
}: RootStackScreenProps<"ResetPassword">) {
  const { email } = route.params;
  const [confirmationCode, setConfirmationCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleConfirmReset = async () => {
    if (loading) return;
    if (!confirmationCode.trim() || !newPassword.trim()) {
      Alert.alert("Erro", "Por favor, preencha todos os campos.");
      return;
    }
    setLoading(true);

    try {
      await confirmResetPassword({
        username: email,
        confirmationCode: confirmationCode.trim(),
        newPassword,
      });

      // login automático após resetar senha
      const result = await signIn({ username: email.trim(), password: newPassword });
      console.log("✅ Usuário autenticado após reset:", JSON.stringify(result, null, 2));

      // dispara evento global e redireciona
      Hub.dispatch("auth", { event: "signedIn" });

      Alert.alert("Sucesso!", "Sua senha foi alterada com sucesso.", [
        {
          text: "OK",
          onPress: () => navigation.replace("Home"),
        },
      ]);
    } catch (error: any) {
      console.log("❌ Erro ao confirmar nova senha:", error);

      if (error?.name === "CodeMismatchException" || error?.name === "ExpiredCodeException") {
        Alert.alert("Código Inválido", "O código está incorreto ou expirou. Solicite um novo.");
      } else if (error?.name === "InvalidPasswordException") {
        Alert.alert(
          "Senha Fraca",
          "A nova senha não atende aos requisitos (mínimo 8 caracteres, com letras, números e símbolos)."
        );
      } else if (error?.name === "LimitExceededException") {
        Alert.alert("Muitas Tentativas", "Você excedeu o número de tentativas. Tente novamente mais tarde.");
      } else {
        Alert.alert("Erro", error?.message || "Não foi possível alterar a senha.");
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
      <StatusBar barStyle="dark-content" backgroundColor="#FFC700" />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.logoContainer}>
          <Image source={logo} style={styles.logo} />
          <Text style={styles.logoText}>ASAC</Text>
        </View>
        <View style={styles.formContainer}>
          <Text style={styles.promptText}>
            Verifique seu e-mail pelo código e defina uma nova senha.
          </Text>
          <TextInput
            style={styles.input}
            placeholder="Código de Confirmação"
            placeholderTextColor="#FFFFFF"
            keyboardType="numeric"
            value={confirmationCode}
            onChangeText={setConfirmationCode}
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
            {loading ? "Salvando..." : "Salvar"}
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
});
