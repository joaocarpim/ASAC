// screens/onboarding/TutorialStep2Screen.tsx
import React from "react";
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

export default function TutorialStep2Screen({
  navigation,
}: RootStackScreenProps<"TutorialStep2">) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#191970" />

      <Image source={logo} style={styles.logo} />

      <View style={styles.topSection}>
        <Text style={styles.topText}>Ganhe moedas</Text>
      </View>

      <View style={styles.middleSection}>
        <Text style={styles.middleText}>
            Acertou 7/10{"\n"}próximo módulo
        </Text>
      </View>

      <View style={styles.bottomSection}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("TutorialStep3")}
        >
          <Text style={styles.buttonText}>Avançar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#191970",
  },
  // A logo agora é posicionada de forma absoluta
  logo: {
    width: 280, // Tamanho maior
    height: 280, // Tamanho maior
    resizeMode: "contain",
    position: "absolute", // Chave da solução!
    top: 55, // Distância do topo
    right: -70, // Distância da direita
    zIndex: 1, // Garante que a logo fique por cima, se necessário
  },
  topSection: {
    // A seção do topo agora serve apenas para o texto
    paddingTop: 80,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  topText: {
    fontSize: 34, // Aumentei um pouco para equilibrar
    fontWeight: "bold",
    color: "#FFA500",
    maxWidth: "65%", // O texto pode ocupar mais espaço agora
  },
  middleSection: {
    flex: 1,
    top: 55, // Distância do topo
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 30,
  },
  middleText: {
    fontSize: 24,
    color: "#FFFFFF",
    textAlign: "center",
    lineHeight: 34,
  },
  bottomSection: {
    backgroundColor: "#FFC700",
    paddingVertical: 40,
    paddingHorizontal: 20,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    alignItems: "center",
  },
  button: {
    backgroundColor: "#191970",
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    width: "100%", // Ocupa a largura da seção inferior
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
  },
});
