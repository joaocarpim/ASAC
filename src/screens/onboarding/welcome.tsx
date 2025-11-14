// screens/onboarding/WelcomeScreen.tsx
import React from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  StatusBar,
  Dimensions,
} from "react-native";
import { RootStackScreenProps } from "../../navigation/types";

const logo = require("../../assets/images/logo.png");
const { width, height } = Dimensions.get("window");

export default function WelcomeScreen({
  navigation,
}: RootStackScreenProps<"Welcome">) {
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFC700" />

      {/* Logo Section */}
      <View style={styles.logoContainer}>
        <Image source={logo} style={styles.logo} />
        <Text style={styles.logoText}>ASAC</Text>
        <Text style={styles.tagline}>Aprendendo juntos</Text>
      </View>

      {/* Description Section */}
      <View style={styles.descriptionContainer}>
        <Text style={styles.description}>
          Aplicativo educacional voltado aos assistidos da ASAC
        </Text>
      </View>

      {/* Button Section */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("Tutorial")}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>Começar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFC700",
    paddingHorizontal: 24,
  },
  logoContainer: {
    flex: 2,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: height * 0.08,
  },
  logo: {
    width: width * 0.55,
    height: width * 0.55,
    resizeMode: "contain",
  },
  logoText: {
    fontSize: 52,
    fontWeight: "bold",
    color: "#000080",
    marginTop: 16,
    letterSpacing: 4,
  },
  tagline: {
    fontSize: 16,
    color: "#000080",
    opacity: 0.7,
    marginTop: 8,
    fontWeight: "600",
  },
  descriptionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  description: {
    fontSize: 18,
    color: "#000080",
    textAlign: "center",
    fontWeight: "600",
    lineHeight: 26,
  },
  buttonContainer: {
    flex: 0.8,
    justifyContent: "flex-start",
    alignItems: "center",
    paddingBottom: 40,
  },
  button: {
    backgroundColor: "#191970",
    paddingVertical: 18,
    paddingHorizontal: 60,
    borderRadius: 30,
    width: "85%",
    alignItems: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "bold",
    letterSpacing: 1,
  },
});
