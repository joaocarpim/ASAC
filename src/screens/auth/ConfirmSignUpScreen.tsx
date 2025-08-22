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
import { confirmSignUp, resendSignUpCode } from "@aws-amplify/auth";

const logo = require("../../assets/images/logo.png");

export default function ConfirmSignUpScreen({
  route,
  navigation,
}: RootStackScreenProps<"ConfirmSignUp">) {
  // Recebe o e-mail da tela de Login
  const [email, _setEmail] = useState(route.params.email);
  const [confirmationCode, setConfirmationCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleConfirmSignUp = async () => {
    if (loading) return;
    if (!confirmationCode.trim()) {
      Alert.alert("Erro", "Por favor, insira o código de confirmação.");
      return;
    }
    setLoading(true);

    try {
      await confirmSignUp({
        username: email.trim(),
        confirmationCode,
      });
      Alert.alert(
        "Sucesso!",
        "Sua conta foi confirmada com sucesso. Por favor, faça o login.",
        [{ text: "OK", onPress: () => navigation.navigate("Login") }]
      );
    } catch (error) {
      console.log("Erro ao confirmar conta:", error);
      Alert.alert("Erro", "O código de confirmação está incorreto ou expirou.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    try {
      await resendSignUpCode({ username: email.trim() });
      Alert.alert(
        "Código Reenviado",
        "Um novo código foi enviado para o seu e-mail."
      );
    } catch (err) {
      console.log("Erro ao reenviar código:", err);
      Alert.alert(
        "Erro",
        "Não foi possível reenviar o código. Tente novamente mais tarde."
      );
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
          <Text style={styles.promptText}>Confirme sua conta</Text>
          <Text style={styles.infoText}>
            Enviamos um código de confirmação para o seu e-mail:
          </Text>
          <TextInput
            style={[styles.input, styles.inputDisabled]}
            value={email}
            editable={false} // O e-mail não pode ser editado aqui
          />
          <TextInput
            style={styles.input}
            placeholder="Código de Confirmação"
            placeholderTextColor="#FFFFFF"
            keyboardType="numeric"
            value={confirmationCode}
            onChangeText={setConfirmationCode}
          />
          <TouchableOpacity onPress={handleResendCode}>
            <Text style={styles.linkText}>Reenviar Código</Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={styles.button}
          onPress={handleConfirmSignUp}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Confirmando..." : "Confirmar Conta"}
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
    fontSize: 22,
    color: "#191970",
    fontWeight: "bold",
    marginBottom: 10,
  },
  infoText: {
    fontSize: 16,
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
  inputDisabled: { backgroundColor: "#8A8A8A" },
  linkText: {
    color: "#191970",
    fontWeight: "bold",
    fontSize: 14,
    alignSelf: "flex-start",
    marginLeft: 5,
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
