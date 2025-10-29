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

export default function TutorialStep1Screen({
  navigation,
}: RootStackScreenProps<"TutorialStep1">) {
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
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate("TutorialStep2")}
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
    fontSize: 34,
    fontWeight: "bold",
    color: "#FFA500",
    maxWidth: "60%",
  },
  logo: { width: 140, height: 140, resizeMode: "contain", marginTop: -20 },
  middleSection: { flex: 1, justifyContent: "center", alignItems: "center" },
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
    width: "100%",
    elevation: 5,
  },
  buttonText: { color: "#FFFFFF", fontSize: 20, fontWeight: "bold" },
});
