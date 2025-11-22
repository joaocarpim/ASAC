// src/screens/contractions/ContractionsSuccessScreen.tsx

import React, { useEffect, useState } from "react";
import { StyleSheet, Platform, StatusBar, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import ConfettiCannon from "react-native-confetti-cannon";
import { Audio } from "expo-av";
import { RootStackParamList } from "../../navigation/types";
import { useContrast } from "../../hooks/useContrast";
import { useSettings } from "../../hooks/useSettings";
import { Theme } from "../../types/contrast";
import {
  AccessibleText,
  AccessibleHeader,
  AccessibleButton,
} from "../../components/AccessibleComponents";

type ScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "ContractionsSuccess"
>;

export default function ContractionsSuccessScreen({
  route,
  navigation,
}: ScreenProps) {
  // Se 'word' não for passado (ex: vindo do menu), usa um valor padrão
  const word = route.params?.word || "Parabéns!";

  const { theme } = useContrast();
  const {
    fontSizeMultiplier,
    isBoldTextEnabled,
    isDyslexiaFontEnabled,
    lineHeightMultiplier,
    letterSpacing,
  } = useSettings();

  const styles = createStyles(
    theme,
    fontSizeMultiplier,
    isBoldTextEnabled,
    isDyslexiaFontEnabled,
    lineHeightMultiplier,
    letterSpacing
  );

  const [sound, setSound] = useState<Audio.Sound | null>(null);

  useEffect(() => {
    const playSound = async () => {
      try {
        // ✅ Caminho corrigido para sair de screens/contractions/
        const { sound: soundObject } = await Audio.Sound.createAsync(
          require("../../../assets/som/happy.mp3")
        );
        setSound(soundObject);
        await soundObject.playAsync();
      } catch (error) {
        console.log("Erro ao carregar som de sucesso", error);
      }
    };

    playSound();

    return () => {
      sound?.unloadAsync();
    };
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={theme.background} />
      <ConfettiCannon count={200} origin={{ x: -10, y: 0 }} fadeOut={true} />

      <AccessibleHeader style={styles.title}>Parabéns! 🥳</AccessibleHeader>

      <AccessibleText style={styles.subtitle} baseSize={18}>
        Você escreveu a contração para:
      </AccessibleText>

      <AccessibleText style={styles.word} baseSize={40}>
        {word}
      </AccessibleText>

      <AccessibleButton
        style={styles.buttonPrimary}
        onPress={() => navigation.replace("ContractionsRoullete")}
        accessibilityText="Girar próximo desafio"
      >
        <AccessibleText style={styles.buttonTextPrimary} baseSize={18}>
          Girar Próximo
        </AccessibleText>
      </AccessibleButton>

      <AccessibleButton
        style={styles.buttonSecondary}
        onPress={() => navigation.popToTop()} // Volta para a Home
        accessibilityText="Voltar ao Início"
      >
        <AccessibleText style={styles.buttonTextSecondary} baseSize={16}>
          Voltar ao Início
        </AccessibleText>
      </AccessibleButton>
    </View>
  );
}

const createStyles = (
  theme: Theme,
  fontMultiplier: number,
  isBold: boolean,
  isDyslexiaFontEnabled: boolean,
  lineHeightMultiplier: number,
  letterSpacing: number
) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
      alignItems: "center",
      justifyContent: "center",
      paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    },
    title: {
      fontSize: 36 * fontMultiplier,
      fontWeight: isBold ? "bold" : "700",
      color: theme.text,
      fontFamily: isDyslexiaFontEnabled ? "OpenDyslexic-Regular" : undefined,
      textAlign: "center",
    },
    subtitle: {
      fontSize: 18 * fontMultiplier,
      color: theme.text,
      opacity: 0.9,
      marginTop: 30,
      fontFamily: isDyslexiaFontEnabled ? "OpenDyslexic-Regular" : undefined,
      textAlign: "center",
    },
    word: {
      fontSize: 40 * fontMultiplier,
      fontWeight: isBold ? "bold" : "700",
      color: theme.text,
      letterSpacing: letterSpacing + 4,
      marginVertical: 10,
      fontFamily: isDyslexiaFontEnabled ? "OpenDyslexic-Regular" : undefined,
      textAlign: "center",
    },
    buttonPrimary: {
      backgroundColor: theme.button ?? "#191970",
      paddingVertical: 15,
      paddingHorizontal: 40,
      borderRadius: 30,
      marginTop: 40,
      elevation: 3,
      alignItems: "center",
    },
    buttonTextPrimary: {
      color: theme.buttonText ?? "#FFFFFF",
      fontSize: 18 * fontMultiplier,
      fontWeight: isBold ? "bold" : "700",
      fontFamily: isDyslexiaFontEnabled ? "OpenDyslexic-Regular" : undefined,
    },
    buttonSecondary: {
      marginTop: 20,
      padding: 10,
      alignItems: "center",
    },
    buttonTextSecondary: {
      color: theme.text,
      opacity: 0.8,
      fontSize: 16 * fontMultiplier,
      fontFamily: isDyslexiaFontEnabled ? "OpenDyslexic-Regular" : undefined,
    },
  });
