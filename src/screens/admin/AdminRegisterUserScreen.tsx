import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { RootStackScreenProps } from "../../navigation/types";
import ScreenHeader from "../../components/layout/ScreenHeader";
import { generateClient } from "aws-amplify/api";
import { adminRegisterUser } from "../../graphql/mutations";
import AppModal from "../../components/layout/AppModal";

interface ModalInfo {
  visible: boolean;
  type: "success" | "error" | null;
  title: string;
  message: string;
}

export default function AdminRegisterUserScreen({
  navigation,
}: RootStackScreenProps<"AdminRegisterUser">) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [modalInfo, setModalInfo] = useState<ModalInfo>({
    visible: false,
    type: null,
    title: "",
    message: "",
  });

  const handleCloseModal = () => {
    setModalInfo({ visible: false, type: null, title: "", message: "" });
    if (modalInfo.type === "success") {
      navigation.goBack();
    }
  };

  const handleRegister = async () => {
    console.log("🚀 Iniciando registro...");

    // Validações
    if (!name.trim() || !email.trim() || !password.trim()) {
      setModalInfo({
        visible: true,
        type: "error",
        title: "Campos Vazios",
        message: "Por favor, preencha todos os campos.",
      });
      return;
    }

    if (password.length < 8) {
      setModalInfo({
        visible: true,
        type: "error",
        title: "Senha Inválida",
        message: "A senha deve ter no mínimo 8 caracteres.",
      });
      return;
    }

    setLoading(true);

    try {
      const client = generateClient();

      const variables = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: password,
      };

      console.log("📤 Enviando GraphQL com:", variables);

      // TENTATIVA 1: Com authMode userPool
      let result: any;
      try {
        result = await client.graphql({
          query: adminRegisterUser,
          variables: variables,
          authMode: "userPool",
        });
        console.log("✅ Sucesso com userPool");
      } catch (userPoolError: any) {
        console.log("⚠️ Falhou com userPool, tentando com iam...");

        // TENTATIVA 2: Com authMode iam
        try {
          result = await client.graphql({
            query: adminRegisterUser,
            variables: variables,
            authMode: "iam",
          });
          console.log("✅ Sucesso com iam");
        } catch (iamError: any) {
          console.log("⚠️ Falhou com iam, tentando sem authMode...");

          // TENTATIVA 3: Sem authMode (usa o padrão)
          result = await client.graphql({
            query: adminRegisterUser,
            variables: variables,
          });
          console.log("✅ Sucesso sem authMode explícito");
        }
      }

      console.log("📥 Resposta recebida:", result);

      // Verificar erros GraphQL
      if (result.errors && result.errors.length > 0) {
        console.error("❌ Erros GraphQL:", result.errors);

        // Tentar expandir o primeiro erro
        const firstError = result.errors[0];
        console.error(
          "Primeiro erro completo:",
          JSON.stringify(firstError, null, 2)
        );

        const errorMessage = firstError.message || "Erro no servidor GraphQL";
        throw new Error(errorMessage);
      }

      // Verificar se há dados
      if (!result.data?.adminRegisterUser) {
        console.error("❌ Sem dados na resposta");
        throw new Error("Resposta vazia da Lambda.");
      }

      // Parse da resposta
      console.log("🔧 Parseando resposta:", result.data.adminRegisterUser);

      let lambdaResponse: {
        success: boolean;
        message?: string;
        error?: string;
      };

      try {
        lambdaResponse = JSON.parse(result.data.adminRegisterUser);
        console.log("✅ Resposta parseada:", lambdaResponse);
      } catch (parseError) {
        console.error("❌ Erro ao parsear:", parseError);
        throw new Error("Resposta inválida da Lambda.");
      }

      // Processar resultado
      if (lambdaResponse.success) {
        console.log("🎉 Registro bem-sucedido!");

        setModalInfo({
          visible: true,
          type: "success",
          title: "✅ Sucesso",
          message: `Assistido cadastrado!\n\n${name}\n${email}`,
        });

        setName("");
        setEmail("");
        setPassword("");
      } else {
        console.error("❌ Lambda retornou erro:", lambdaResponse.error);

        let errorMessage =
          lambdaResponse.error || lambdaResponse.message || "Erro desconhecido";

        // Tratar erros comuns
        if (errorMessage.includes("UsernameExistsException")) {
          errorMessage = "Este email já está cadastrado.";
        } else if (errorMessage.includes("DynamoDB")) {
          errorMessage = "Erro ao salvar no banco de dados.";
        } else if (errorMessage.includes("password")) {
          errorMessage = "Senha inválida. Mínimo 8 caracteres.";
        }

        throw new Error(errorMessage);
      }
    } catch (error: any) {
      console.error("❌ ERRO FINAL:", error);

      // Tentar extrair mensagem útil
      let errorMessage = "Não foi possível registrar o assistido.";

      if (error.message) {
        errorMessage = error.message;
      } else if (error.errors && error.errors.length > 0) {
        // Expandir manualmente o objeto de erro
        const err = error.errors[0];
        console.error("Tentando acessar propriedades do erro:");
        console.error("- message:", err.message);
        console.error("- errorType:", err.errorType);
        console.error("- errorInfo:", err.errorInfo);

        errorMessage = err.message || err.errorInfo || errorMessage;
      }

      setModalInfo({
        visible: true,
        type: "error",
        title: "Erro no Cadastro",
        message: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle={modalInfo.visible ? "dark-content" : "dark-content"}
        backgroundColor={modalInfo.visible ? "rgba(0, 0, 0, 0.5)" : "#F0EFEA"}
      />
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
      <AppModal
        visible={modalInfo.visible}
        type={modalInfo.type}
        title={modalInfo.title}
        message={modalInfo.message}
        onClose={handleCloseModal}
      />
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
