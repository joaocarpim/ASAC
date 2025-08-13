// screens/onboarding/WelcomeScreen.tsx
import React from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  StatusBar,
} from "react-native";

// 1. IMPORTAÇÃO DOS TIPOS (ajuste o caminho se necessário)
import { RootStackScreenProps } from "../../navigation/types";

// O caminho para o logo pode precisar de ajuste
const logo = require("../../assets/images/logo.png");

// 2. APLICAÇÃO DO TIPO NAS PROPS DO COMPONENTE
export default function WelcomeScreen({
  navigation,
}: RootStackScreenProps<"Welcome">) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFC700" />
      <View style={styles.logoContainer}>
        <Image source={logo} style={styles.logo} />
        <Text style={styles.logoText}>ASAC</Text>
      </View>
      <Text style={styles.description}>
        Aplicativo educacional voltado aos assistidos da ASAC
      </Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate("TutorialStep1")} // Navegação segura
      >
        <Text style={styles.buttonText}>Comece já</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFC700",
    alignItems: "center",
    justifyContent: "space-around",
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  logoContainer: {
    alignItems: "center",
  },
  logo: {
    width: 150,
    height: 150,
    resizeMode: "contain",
  },
  logoText: {
    fontSize: 52,
    fontWeight: "bold",
    color: "#000080",
    marginTop: 10,
  },
  description: {
    fontSize: 18,
    color: "#000080",
    textAlign: "center",
    fontWeight: "bold",
    marginHorizontal: 30,
    marginTop: -50,
  },
  button: {
    backgroundColor: "#191970",
    paddingVertical: 15,
    paddingHorizontal: 60,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    width: "90%",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
});
