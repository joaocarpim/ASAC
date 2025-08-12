// src/screens/BemVindoScreen.tsx
import React from "react";
import { View, Text, StyleSheet } from "react-native";

const BemVindoScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bem-vindo ao App!</Text>
      <Text style={styles.subtitle}>
        Sua conexão com o Amplify funcionou. 🎉
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 18,
    color: "gray",
  },
});

export default BemVindoScreen;
