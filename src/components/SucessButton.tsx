import React from "react";
import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { Audio, AVPlaybackStatusSuccess } from "expo-av";

export default function SuccessButton() {
  const playSuccessSound = async () => {
    try {
      const { sound } = await Audio.Sound.createAsync(
        {
          uri: "https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg",
        },
        { shouldPlay: true }
      );

      await sound.playAsync();

      // ✅ Correção do erro TypeScript
      sound.setOnPlaybackStatusUpdate((status) => {
        if ((status as AVPlaybackStatusSuccess).didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (error) {
      console.log("Erro ao tocar o som:", error);
    }
  };

  return (
    <TouchableOpacity style={styles.button} onPress={playSuccessSound}>
      <Text style={styles.text}>Acertou! 🎯</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: "#4CAF50",
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
});
