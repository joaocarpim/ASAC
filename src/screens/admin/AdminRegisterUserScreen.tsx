// src/screens/admin/AdminRegisterUserScreen.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { RootStackScreenProps } from "../../navigation/types";
import ScreenHeader from "../../components/layout/ScreenHeader";
import { generateClient } from "aws-amplify/api";
// Importa a mutação gerada pelo 'amplify codegen' (Passo 1)
import { adminRegisterUser } from "../../graphql/mutations";

export default function AdminRegisterUserScreen({
  navigation,
}: RootStackScreenProps<"AdminRegisterUser">) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      Alert.alert("Erro", "Preencha todos os campos.");
      return;
    }
    if (password.length < 8) {
      Alert.alert("Erro", "A senha deve ter no mínimo 8 caracteres.");
      return;
    }
    setLoading(true);

    try {
      const client = generateClient();
      console.log("📤 Enviando requisição GraphQL...");

      const result: any = await client.graphql({
        query: adminRegisterUser, // Usa a mutação importada
        variables: {
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password: password,
        },
        authMode: "userPool",
      });

      console.log("📥 Resposta completa:", JSON.stringify(result, null, 2));

      if (result.errors && result.errors.length > 0) {
        throw new Error(result.errors[0].message);
      }

      if (result.data?.adminRegisterUser) {
        const response = result.data.adminRegisterUser;
        let lambdaResponse: {
          success: boolean;
          message?: string;
          error?: string;
        };

        try {
          lambdaResponse = JSON.parse(response);
        } catch (parseError) {
          throw new Error("Resposta inválida da Lambda.");
        }

        console.log("📦 Resposta da Lambda parseada:", lambdaResponse);

        if (lambdaResponse.success) {
          const userName = name;
          const userEmail = email;
          setName("");
          setEmail("");
          setPassword("");

          navigation.goBack();

          setTimeout(() => {
            Alert.alert(
              "✅ Sucesso",
              `Usuário cadastrado!\n\n${userName}\n${userEmail}`
            );
          }, 300);
        } else {
          throw new Error(
            lambdaResponse.error || "Falha ao cadastrar usuário."
          );
        }
      } else {
        throw new Error("Resposta vazia da Lambda.");
      }
    } catch (error: any) {
      console.error("❌ Erro ao registrar usuário:", error);
      let errorMessage = error.message || "Erro desconhecido.";
      if (errorMessage.includes("UsernameExistsException")) {
        errorMessage = "Este email já está cadastrado.";
      } else if (errorMessage.includes("Unauthorized")) {
        errorMessage = "Você não tem permissão para cadastrar usuários.";
      }
      Alert.alert("Erro no Cadastro", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F0EFEA" />
      <ScreenHeader title="Cadastrar Assistido" />
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons
            name="account-plus"
            size={80}
            color="#191970"
          />
        </View>
        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <MaterialCommunityIcons
              name="account"
              size={24}
              color="#191970"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Nome completo"
              placeholderTextColor="#999"
              value={name}
              onChangeText={setName}
              editable={!loading}
            />
          </View>
          <View style={styles.inputContainer}>
            <MaterialCommunityIcons
              name="email"
              size={24}
              color="#191970"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Email"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
            />
          </View>
          <View style={styles.inputContainer}>
            <MaterialCommunityIcons
              name="lock"
              size={24}
              color="#191970"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              placeholder="Senha"
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              editable={!loading}
            />
          </View>
          <Text style={styles.hint}>
            💡 A senha deve ter no mínimo 8 caracteres
          </Text>
          <TouchableOpacity
            style={[styles.registerButton, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <>
                <MaterialCommunityIcons
                  name="check-circle"
                  size={24}
                  color="#FFFFFF"
                  style={{ marginRight: 8 }}
                />
                <Text style={styles.registerButtonText}>Cadastrar</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F0EFEA" },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: 20 },
  iconContainer: { alignItems: "center", marginVertical: 20 },
  form: { marginTop: 10 },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, paddingVertical: 15, fontSize: 16, color: "#191970" },
  hint: { color: "#666", fontSize: 14, marginBottom: 20, textAlign: "center" },
  registerButton: {
    backgroundColor: "#191970",
    borderRadius: 12,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  buttonDisabled: { opacity: 0.6 },
  registerButtonText: { color: "#FFFFFF", fontSize: 18, fontWeight: "bold" },
});
