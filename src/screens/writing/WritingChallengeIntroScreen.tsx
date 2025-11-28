import React, { useState } from "react";
import {
  StyleSheet,
  View,
  ActivityIndicator,
  Platform,
  StatusBar,
  Dimensions,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { useNavigation } from "@react-navigation/native";

import { RootStackParamList } from "../../navigation/types";
import { useContrast } from "../../hooks/useContrast";
import { useSettings } from "../../hooks/useSettings";
import { Theme } from "../../types/contrast";

import {
  AccessibleText,
  AccessibleHeader,
  AccessibleButton,
} from "../../components/AccessibleComponents";
import ScreenHeader from "../../components/layout/ScreenHeader";

const { width, height } = Dimensions.get("window");

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

  const [loading, setLoading] = useState(false);

  const handleStart = () => {
    setLoading(true);
    // Pequeno delay para feedback visual
    setTimeout(() => {
      setLoading(false);
      navigation.navigate("WritingChallengeRoullete");
    }, 500);
  };

  const handleGoBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  // Gesto para voltar arrastando para a direita
  const panGesture = Gesture.Pan()
    .activeOffsetX([-20, 20])
    .onEnd((e) => {
      if (e.translationX > 50) {
        handleGoBack();
      }
    });

  return (
    <GestureDetector gesture={panGesture}>
      <View style={styles.container}>
        <StatusBar
          barStyle={theme.statusBarStyle}
          backgroundColor={theme.background}
        />

        {/* Header simples para navegação */}
        <ScreenHeader title="Desafio" onBackPress={handleGoBack} />

        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons
              name="keyboard-variant"
              size={100 * fontSizeMultiplier}
              color={theme.text}
            />
          </View>

          <AccessibleHeader style={styles.title} level={1}>
            Desafio de Escrita
          </AccessibleHeader>

          <AccessibleText style={styles.description} baseSize={18}>
            Gire a roleta para sortear uma palavra e teste sua velocidade e
            precisão de escrita em Braille!
          </AccessibleText>

          <View style={styles.footer}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.text} />
                <AccessibleText style={styles.loadingText} baseSize={16}>
                  Carregando...
                </AccessibleText>
              </View>
            ) : (
              <AccessibleButton
                style={styles.button}
                onPress={handleStart}
                accessibilityText="Começar o desafio. Toque para ir para a roleta."
              >
                <AccessibleText style={styles.buttonText} baseSize={20}>
                  Começar
                </AccessibleText>
                <MaterialCommunityIcons
                  name="arrow-right"
                  size={24 * fontSizeMultiplier}
                  color={theme.buttonText ?? "#FFFFFF"}
                  style={{ marginLeft: 10 }}
                />
              </AccessibleButton>
            )}
          </View>
        </View>
      </View>
    </GestureDetector>
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
    },
    content: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 30,
      paddingBottom: 40, // Espaço extra para o rodapé
    },
    iconContainer: {
      marginBottom: 30,
      padding: 20,
      borderRadius: 100,
      backgroundColor: theme.card,
      elevation: 5,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
    },
    title: {
      fontSize: 28 * fontMultiplier,
      fontWeight: isBold ? "bold" : "700",
      color: theme.text,
      marginBottom: 16,
      textAlign: "center",
      fontFamily: isDyslexiaFontEnabled ? "OpenDyslexic-Bold" : undefined,
      lineHeight: 34 * lineHeightMultiplier * fontMultiplier,
      letterSpacing,
    },
    description: {
      fontSize: 18 * fontMultiplier,
      color: theme.text,
      opacity: 0.8,
      textAlign: "center",
      marginBottom: 50,
      maxWidth: 500, // Limita a largura em telas grandes
      fontFamily: isDyslexiaFontEnabled ? "OpenDyslexic-Regular" : undefined,
      lineHeight: 26 * lineHeightMultiplier * fontMultiplier,
      letterSpacing,
    },
    footer: {
      width: "100%",
      alignItems: "center",
      minHeight: 60, // Reserva espaço para evitar pulo de layout
    },
    loadingContainer: {
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      gap: 12,
    },
    loadingText: {
      color: theme.text,
      fontWeight: "600",
      fontFamily: isDyslexiaFontEnabled ? "OpenDyslexic-Regular" : undefined,
    },
    button: {
      flexDirection: "row",
      backgroundColor: theme.button ?? "#191970",
      paddingVertical: 16,
      paddingHorizontal: 50,
      borderRadius: 30,
      elevation: 4,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 6,
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
      maxWidth: 350,
    },
    buttonText: {
      color: theme.buttonText ?? "#FFFFFF",
      fontWeight: isBold ? "bold" : "700",
      fontFamily: isDyslexiaFontEnabled ? "OpenDyslexic-Regular" : undefined,
      textAlign: "center",
    },
  });
