import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { RootStackScreenProps } from "../../navigation/types";
import { confirmResetPassword } from "aws-amplify/auth";

export default function NewPasswordScreen({
  route,
  navigation,
}: RootStackScreenProps<"NewPassword">) {
  const { username } = route.params;

  const [password, setPassword] = useState("");
  const [code, setCode] = useState(""); // ✅ Novo: código de verificação enviado pelo Cognito
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!code.trim() || !password) {
      setError("Informe o código de verificação e a nova senha.");
      return;
    }

    setLoading(true);
    try {
      await confirmResetPassword({
        username,
        newPassword: password,
        confirmationCode: code.trim(), // ✅ Obrigatório
      });

      navigation.replace("Login");
    } catch (err: any) {
      console.error("Erro ao redefinir senha:", err);
      setError(err.message || "Erro ao redefinir senha");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <Text style={styles.title}>Definir nova senha</Text>

      <TextInput
        style={styles.input}
        placeholder="Código de verificação"
        value={code}
        onChangeText={setCode}
        keyboardType="number-pad"
      />

      <TextInput
        style={styles.input}
        secureTextEntry
        placeholder="Nova senha"
        value={password}
        onChangeText={setPassword}
      />

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TouchableOpacity
        style={[styles.button, loading && styles.disabled]}
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Salvando..." : "Salvar"}
        </Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0EFEA",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#191970",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#191970",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 15,
  },
  button: {
    backgroundColor: "#191970",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
  disabled: { backgroundColor: "#19197080" },
  error: { color: "red", marginBottom: 10, textAlign: "center" },
});
