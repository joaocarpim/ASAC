// src/screens/writing/WritingChallengeRoulleteScreen.tsx (CORRIGIDO)

import React, { useState } from "react";
import { StyleSheet, ActivityIndicator, View } from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";
import { RootStackParamList } from "../../navigation/types";
import { useContrast } from "../../hooks/useContrast";
import { useSettings } from "../../hooks/useSettings";
import { Theme } from "../../types/contrast";
import {
  AccessibleView,
  AccessibleText,
  AccessibleButton,
} from "../../components/AccessibleComponents";

// ... (resto do seu código, MASTER_WORD_LIST, shuffleArray, etc.) ...
const MASTER_WORD_LIST = [
  "BOLA",
  "GATO",
  "MESA",
  "FOGO",
  "DEDO",
  "PATO",
  "RATO",
  "LUA",
  "SOL",
  "VIDA",
  "AMOR",
  "PAI",
  "MAE",
  "AGUA",
  "LIVRO",
  "CASA",
  "JOGO",
  "PEIXE",
  "FLOR",
  "REI",
  "CAFE",
  "PAO",
  "CEU",
  "MAR",
  "RUA",
  "VOVO",
  "SAPO",
  "FACA",
  "COPO",
  "LUVA",
  "RODA",
  "FOCA",
  "NAVE",
  "REDE",
  "SINO",
  "UVA",
  "VELA",
  "SOFA",
  "DADO",
  "BEBE",
  "DEZ",
  "UM",
  "DOIS",
  "SEIS",
  "NOVE",
  "ZERO",
  "OITO",
  "SETE",
  "TRES",
  "VAI",
];

function shuffleArray(array: string[]) {
  let currentIndex = array.length,
    randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex],
      array[currentIndex],
    ];
  }
  return array;
}

let sessionWordList: string[] = [];

type ScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "WritingChallengeRoullete"
>;

export default function WritingChallengeRoulleteScreen({
  navigation,
}: ScreenProps) {
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

  const [isSpinning, setIsSpinning] = useState(false);
  const [wordsLeft, setWordsLeft] = useState(sessionWordList.length);

  useFocusEffect(
    React.useCallback(() => {
      if (sessionWordList.length === 0) {
        console.log("🎲 Embaralhando nova lista de palavras...");
        sessionWordList = shuffleArray([...MASTER_WORD_LIST]);
      }
      setWordsLeft(sessionWordList.length);
    }, [])
  );

  const handleSpin = () => {
    console.log("🎯 handleSpin chamado");
    setIsSpinning(true);

    setTimeout(() => {
      if (sessionWordList.length === 0) {
        console.log("🔄 Lista acabou! Re-embaralhando...");
        sessionWordList = shuffleArray([...MASTER_WORD_LIST]);
      }

      const word = sessionWordList.pop() as string;
      console.log(`✅ Palavra sorteada: ${word}`);
      setWordsLeft(sessionWordList.length);
      setIsSpinning(false);

      navigation.navigate("WritingChallengeGame", { word: word });
    }, 1500); // 1.5 segundos de "giro"
  };

  return (
    <View style={styles.container}>
      {isSpinning ? (
        <>
          <ActivityIndicator size="large" color={theme.text} />
          <AccessibleText
            baseSize={20}
            style={[styles.spinText, { textAlign: "center", padding: 200 }]}
          >
            Sorteando palavra...
          </AccessibleText>
        </>
      ) : (
        <>
          <AccessibleText style={styles.title} baseSize={24}>
            Pronto para o desafio?
          </AccessibleText>
          <AccessibleButton
            style={styles.spinButton}
            onPress={handleSpin}
            accessibilityText="Girar roleta"
          >
            <AccessibleText style={styles.spinButtonText} baseSize={40}>
              GIRAR!
            </AccessibleText>
          </AccessibleButton>
          <AccessibleText style={styles.wordsLeftText} baseSize={16}>
            {wordsLeft} palavras restantes
          </AccessibleText>
        </>
      )}
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
      // ✅ CORREÇÃO AQUI:
      paddingVertical: 125, // Mantém o espaçamento vertical
      paddingHorizontal: 20, // Define um espaçamento horizontal razoável
    },
    title: {
      fontSize: 24 * fontMultiplier,
      color: theme.text,
      fontWeight: isBold ? "bold" : "600",
      marginBottom: 40,
      fontFamily: isDyslexiaFontEnabled ? "OpenDyslexic-Regular" : undefined,
      lineHeight: 24 * fontMultiplier * lineHeightMultiplier,
      letterSpacing,
    },
    spinButton: {
      width: 250,
      height: 250,
      borderRadius: 125,
      backgroundColor: theme.button ?? "#191970",
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 10,
      borderColor: theme.card,
      elevation: 10,
    },
    spinButtonText: {
      color: theme.buttonText ?? "#FFFFFF",
      fontSize: 40 * fontMultiplier,
      fontWeight: isBold ? "bold" : "700",
      fontFamily: isDyslexiaFontEnabled ? "OpenDyslexic-Regular" : undefined,
    },
    spinText: {
      fontSize: 20 * fontMultiplier,
      color: theme.text,
      marginTop: 20,
      fontFamily: isDyslexiaFontEnabled ? "OpenDyslexic-Regular" : undefined,
    },
    wordsLeftText: {
      fontSize: 16 * fontMultiplier,
      color: theme.text,
      opacity: 0.8,
      marginTop: 30,
      fontFamily: isDyslexiaFontEnabled ? "OpenDyslexic-Regular" : undefined,
    },
  });
