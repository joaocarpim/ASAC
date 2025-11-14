import React from "react";
import { StyleSheet, View, ActivityIndicator, Platform } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../../navigation/types";
import { useContrast } from "../../hooks/useContrast";
import { useSettings } from "../../hooks/useSettings";
import { Theme } from "../../types/contrast";

import {
  AccessibleView,
  AccessibleText,
  AccessibleHeader,
  AccessibleButton,
} from "../../components/AccessibleComponents";

type ScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "WritingChallengeIntro"
>;

export default function WritingChallengeIntroScreen({
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

  const [loading, setLoading] = React.useState(false);

  function handleStart() {
    console.log("🎯 handleStart chamado");
    setLoading(true);

    setTimeout(() => {
      console.log("✅ Navegando para WritingChallengeRoullete");
      setLoading(false);
      navigation.navigate("WritingChallengeRoullete");
    }, 900);
  }

  return (
    <View style={styles.container}>
      <MaterialCommunityIcons
        name="keyboard-variant"
        size={100 * fontSizeMultiplier}
        color={theme.text}
      />

      <AccessibleHeader style={styles.title}>
        Desafio de Escrita
      </AccessibleHeader>

      <AccessibleText
        style={[styles.description, { marginHorizontal: -50 }]}
        baseSize={18}
      >
        Gire a roleta para sortear uma palavra e teste sua velocidade de escrita
        em Braille!
      </AccessibleText>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.text} />
          <AccessibleText style={styles.loadingText} baseSize={18}>
            Carregando...
          </AccessibleText>
        </View>
      ) : (
        <AccessibleButton
          style={styles.button}
          onPress={handleStart}
          accessibilityText="Começar o desafio"
        >
          <AccessibleText style={styles.buttonText} baseSize={20}>
            Começar
          </AccessibleText>
        </AccessibleButton>
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
      padding: 125,
    },
    title: {
      fontSize: 28 * fontMultiplier,
      fontWeight: isBold ? "bold" : "700",
      color: theme.text,
      marginVertical: 20,
      fontFamily: isDyslexiaFontEnabled ? "OpenDyslexic-Regular" : undefined,
      lineHeight: 28 * fontMultiplier * lineHeightMultiplier,
      letterSpacing,
      textAlign: "center",
    },
    description: {
      fontSize: 18 * fontMultiplier,
      color: theme.text,
      opacity: 0.9,
      textAlign: "center",
      marginBottom: 40,
      fontFamily: isDyslexiaFontEnabled ? "OpenDyslexic-Regular" : undefined,
      lineHeight: 18 * fontMultiplier * lineHeightMultiplier,
      letterSpacing,
    },

    loadingContainer: {
      alignItems: "center",
      justifyContent: "center",
      gap: 15,
    },
    loadingText: {
      color: theme.text,
      fontWeight: isBold ? "bold" : "600",
      fontFamily: isDyslexiaFontEnabled ? "OpenDyslexic-Regular" : undefined,
      textAlign: "center",
    },

    button: {
      backgroundColor: theme.button ?? "#191970",
      paddingVertical: 15,
      paddingHorizontal: 60,
      borderRadius: 30,
      elevation: 3,
    },
    buttonText: {
      color: theme.buttonText ?? "#FFFFFF",
      fontSize: 20 * fontMultiplier,
      fontWeight: isBold ? "bold" : "700",
      fontFamily: isDyslexiaFontEnabled ? "OpenDyslexic-Regular" : undefined,
    },
  });
