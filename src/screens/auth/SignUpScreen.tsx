// src/screens/auth/SignUpScreen.tsx

import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  Alert,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from "react-native";
import { signUp } from "aws-amplify/auth";

const SignUpScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async () => {
    if (!email || !password) {
      Alert.alert("Erro", "Por favor, preencha todos os campos.");
      return;
    }
    setIsLoading(true); // Ativa o indicador de carregamento
    try {
      // Chama a função de cadastro do Amplify
      const result = await signUp({
        username: email, // O username no Cognito será o email do usuário
        password: password,
        options: {
          userAttributes: {
            email: email, // Salva o email como um atributo do usuário
          },
        },
      });

      console.log("Resultado do cadastro:", result);

      // O próximo passo após o cadastro é confirmar a conta
      if (result.nextStep.signUpStep === "CONFIRM_SIGN_UP") {
        Alert.alert(
          "Sucesso!",
          `Usuário criado. Um código de confirmação foi enviado para ${email}.`
        );
        // TODO: Aqui você deve navegar para a tela de confirmação de código
        // navigation.navigate('ConfirmSignUp', { username: email });
      }
    } catch (error: any) {
      console.error("Erro ao cadastrar:", error);
      Alert.alert(
        "Erro no Cadastro",
        error.message || "Não foi possível cadastrar o usuário."
      );
    } finally {
      setIsLoading(false); // Desativa o indicador de carregamento
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Criar Conta</Text>
      <TextInput
        style={styles.input}
        placeholder="Seu melhor e-mail"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        placeholderTextColor="#888"
      />
      <TextInput
        style={styles.input}
        placeholder="Crie uma senha forte"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        placeholderTextColor="#888"
      />
      {isLoading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : (
        <Button title="Cadastrar" onPress={handleSignUp} />
      )}
    </SafeAreaView>
  );
};

// Estilização básica para a tela
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30,
  },
  input: {
    height: 50,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: "#fff",
  },
});

export default SignUpScreen;
