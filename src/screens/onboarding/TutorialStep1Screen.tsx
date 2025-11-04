import React, { useState } from "react"; // ✅ 1. Importar o useState
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  StatusBar,
} from "react-native";
import { RootStackScreenProps } from "../../navigation/types";

const logo = require("../../assets/images/logo.png");

export default function TutorialStep1Screen({
  navigation,
}: RootStackScreenProps<"TutorialStep1">) {
  // ✅ 2. Adicionar um estado para desabilitar o botão
  const [isLoading, setIsLoading] = useState(false);

  // ✅ 3. Criar uma função para lidar com a navegação
  const handleNavigate = () => {
    if (isLoading) return; // Se já estiver carregando, não faz nada
    setIsLoading(true); // Desabilita o botão
    navigation.navigate("TutorialStep2");
    // Não precisamos de setIsLoading(false) porque a tela será "desmontada" (unmounted)
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#191970" />
      <View style={styles.contentWrapper}>
        <View style={styles.topSection}>
          <Text style={styles.topText}>Acesse os módulos</Text>
          <Image source={logo} style={styles.logo} />
        </View>
        <View style={styles.middleSection}>
          <Text style={styles.middleText}>
            Faça os questionários e{"\n"}garanta pontos
          </Text>
        </View>
      </View>
      <View style={styles.bottomSection}>
        {/* ✅ 4. Atualizar o botão para usar a nova função e o estado 'disabled' */}
        <TouchableOpacity
          style={[styles.button, isLoading && styles.buttonDisabled]} // Adiciona um estilo opcional de desabilitado
          onPress={handleNavigate}
          disabled={isLoading} // Desabilita o botão fisicamente
        >
          <Text style={styles.buttonText}>Avançar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#191970" },
  contentWrapper: { flex: 1, paddingTop: 60, paddingHorizontal: 20 },
  topSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  topText: {
    fontSize: 64,
    fontWeight: "bold",
    color: "#FFA500",
    maxWidth: "60%",
  },
  logo: {
    width: 540,
    height: 540,
    marginRight: -80,
    resizeMode: "contain",
    marginTop: -20,
  },
  middleSection: { flex: 1, justifyContent: "center", alignItems: "center" },
  middleText: {
    fontSize: 24,
    color: "#FFFFFF",
    textAlign: "center",
    marginTop: "-20%",
    lineHeight: 34,
  },
  bottomSection: {
    backgroundColor: "#FFC700",
    paddingVertical: 60,
    paddingHorizontal: 10,
    borderTopLeftRadius: 60,
    borderTopRightRadius: 60,
    alignItems: "center",
  },
  button: {
    backgroundColor: "#191970",
    paddingVertical: 25,
    width: "80%",
    alignSelf: "center",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
  },
  // Estilo opcional para feedback visual
  buttonDisabled: {
    backgroundColor: "#191970",
    opacity: 0.5, // Deixa o botão com aparência de desabilitado
  },
  buttonText: { color: "#FFFFFF", fontSize: 24, fontWeight: "bold" },
});
