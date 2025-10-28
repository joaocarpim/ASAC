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
import { fetchAuthSession } from "aws-amplify/auth";

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
      const session = await fetchAuthSession();
      const idToken = session.tokens?.idToken?.toString();

      if (!idToken) {
        Alert.alert("Erro", "Token de autenticação não encontrado.");
        setLoading(false);
        return;
      }

      console.log("🔑 Enviando Token para a Lambda:", idToken);

      const client = generateClient();
      
      const ADMIN_REGISTER_MUTATION = `
        mutation AdminRegisterUser($name: String!, $email: String!, $password: String!) {
          adminRegisterUser(name: $name, email: $email, password: $password)
        }
      `;

      const result = await client.graphql({
        query: ADMIN_REGISTER_MUTATION,
        variables: {
          name: name.trim(),
          email: email.trim(),
          password: password,
        },
      });

      console.log("📥 Resposta da Lambda:", result);

      // Verificar se result tem a propriedade data
      if ('data' in result && result.data) {
        const response = result.data as any;
        
        if (response.adminRegisterUser) {
          Alert.alert(
            "Sucesso",
            `Usuário ${name} cadastrado com sucesso!`,
            [
              {
                text: "OK",
                onPress: () => {
                  setName("");
                  setEmail("");
                  setPassword("");
                  navigation.goBack();
                },
              },
            ]
          );
        } else {
          Alert.alert("Erro", "Falha ao cadastrar usuário.");
        }
      } else {
        Alert.alert("Erro", "Resposta inválida da API.");
      }
    } catch (error: any) {
      console.error("❌ Erro ao registrar usuário:", error);
      
      let errorMessage = "Erro desconhecido ao cadastrar usuário.";
      
      if (error?.errors && error.errors.length > 0) {
        errorMessage = error.errors[0].message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      Alert.alert("Erro", errorMessage);
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
  container: {
    flex: 1,
    backgroundColor: "#F0EFEA",
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  iconContainer: {
    alignItems: "center",
    marginVertical: 20,
  },
  form: {
    marginTop: 10,
  },
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
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    paddingVertical: 15,
    fontSize: 16,
    color: "#191970",
  },
  hint: {
    color: "#666",
    fontSize: 14,
    marginBottom: 20,
    textAlign: "center",
  },
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
  buttonDisabled: {
    opacity: 0.6,
  },
  registerButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});