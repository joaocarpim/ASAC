// src/screens/contractions/ContractionsRoulleteScreen.tsx
import React, { useState } from "react";
import {
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
  StatusBar,
  View, // ✅ View IMPORTADA
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { RootStackParamList } from "../../navigation/types";
import { useContrast } from "../../hooks/useContrast";
import { useSettings } from "../../hooks/useSettings";
import { Theme } from "../../types/contrast";
import {
  AccessibleView,
  AccessibleText,
  AccessibleButton,
} from "../../components/AccessibleComponents";
// ✅ CAMINHO CORRIGIDO
import {
  CONTRACTION_LIST,
  Contraction,
} from "../../navigation/contractionsData";

function shuffleArray(array: any[]) {
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

// ✅ REMOVIDO o "introItem" da lista de embaralhar
let sessionWordList: Contraction[] = [];

type ScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "ContractionsRoullete"
>;

export default function ContractionsRoulleteScreen({
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
    isDyslexiaFontEnabled
  );

  const [isSpinning, setIsSpinning] = useState(false);
  const [wordsLeft, setWordsLeft] = useState(sessionWordList.length);

  useFocusEffect(
    React.useCallback(() => {
      if (sessionWordList.length === 0) {
        sessionWordList = shuffleArray([...CONTRACTION_LIST]);
      }
      setWordsLeft(sessionWordList.length);
    }, [])
  );

  const handleSpin = () => {
    setIsSpinning(true);
    setTimeout(() => {
      if (sessionWordList.length === 0) {
        sessionWordList = shuffleArray([...CONTRACTION_LIST]);
      }

      const challenge = sessionWordList.pop() as Contraction;
      setWordsLeft(sessionWordList.length);
      setIsSpinning(false);

      navigation.navigate("ContractionsGame", {
        word: challenge.word,
        dots: challenge.dots, // Passa os pontos corretos
      });
    }, 1500);
  };

  return (
    // ✅ CORREÇÃO: "Botão dentro de botão"
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.navigate("ContractionsHome")} // Volta para a Home da Sessão
      >
        <MaterialCommunityIcons
          name="arrow-left"
          size={30}
          color={theme.text}
        />
      </TouchableOpacity>

      {isSpinning ? (
        <>
          <ActivityIndicator size="large" color={theme.text} />
          <AccessibleText style={styles.spinText} baseSize={20}>
            Sorteando desafio...
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
            {wordsLeft} desafios restantes
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
  isDyslexiaFontEnabled: boolean
) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
      alignItems: "center",
      justifyContent: "center",
      paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    },
    backButton: {
      position: "absolute",
      top: Platform.OS === "android" ? StatusBar.currentHeight : 0 + 15,
      left: 15,
      zIndex: 10,
      padding: 5,
    },
    title: {
      fontSize: 24 * fontMultiplier,
      color: theme.text,
      fontWeight: isBold ? "bold" : "600",
      marginBottom: 40,
      fontFamily: isDyslexiaFontEnabled ? "OpenDyslexic-Regular" : undefined,
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
