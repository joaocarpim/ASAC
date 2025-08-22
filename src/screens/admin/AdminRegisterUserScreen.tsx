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
import ScreenHeader from "../../components/layout/ScreenHeader";
import { signUp } from "@aws-amplify/auth";
import { generateClient } from "aws-amplify/api";
import { createUser } from "../../graphql/mutations";

const logo = require("../../assets/images/logo.png");

export default function AdminRegisterUserScreen({
  navigation,
}: RootStackScreenProps<"AdminRegisterUser">) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (loading) return;
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert("Erro", "Por favor, preencha todos os campos.");
      return;
    }
    setLoading(true);

    try {
      const { userId } = await signUp({
        username: email.trim(),
        password,
        options: {
          userAttributes: {
            name: name.trim(),
            email: email.trim().toLowerCase(),
          },
        },
      });

      const client = generateClient(); // Criado aqui dentro
      await client.graphql({
        query: createUser,
        variables: {
          input: {
            id: userId,
            name: name.trim(),
            email: email.trim().toLowerCase(),
            points: 0,
            coins: 0,
            role: "User",
          },
        },
        authMode: "userPool",
      });

      Alert.alert("Sucesso!", `O usuário ${name} foi registrado.`, [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      let errorMessage = "Não foi possível registrar o usuário.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      Alert.alert("Erro no Registro", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
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
            placeholder="Nome"
            placeholderTextColor="#FFFFFF"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
          />
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
        </View>
        <TouchableOpacity
          style={styles.button}
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
  buttonText: { color: "#FFFFFF", fontSize: 18, fontWeight: "bold" },
});
