// src/screens/contractions/ContractionsHomeScreen.tsx
import React, { useState, useCallback } from "react";
import { StyleSheet, Platform, StatusBar, View } from "react-native"; // ✅ View IMPORTADA
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { RootStackParamList } from "../../navigation/types";
import { useContrast } from "../../hooks/useContrast";
import { useSettings } from "../../hooks/useSettings";
import { Theme } from "../../types/contrast";
import {
  AccessibleView, // Ainda usamos para os filhos
  AccessibleText,
  AccessibleButton,
  AccessibleHeader,
} from "../../components/AccessibleComponents";

type ScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "ContractionsHome"
>;

const LESSON_COMPLETED_KEY = "contractions_lesson_completed";

export default function ContractionsHomeScreen({ navigation }: ScreenProps) {
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

  const [isChallengeUnlocked, setIsChallengeUnlocked] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Verifica o status da lição sempre que a tela entra em foco
  useFocusEffect(
    useCallback(() => {
      const checkLessonStatus = async () => {
        try {
          setIsLoading(true);
          const status = await AsyncStorage.getItem(LESSON_COMPLETED_KEY);
          setIsChallengeUnlocked(status === "true");
        } catch (e) {
          console.error("Failed to fetch lesson status from async storage", e);
          setIsChallengeUnlocked(false); // Mantém bloqueado em caso de erro
        } finally {
          setIsLoading(false);
        }
      };
      checkLessonStatus();
    }, [])
  );

  return (
    // ✅ CORREÇÃO AQUI: Mudado de AccessibleView para View
    <View style={styles.container}>
      <MaterialCommunityIcons
        name="school-outline"
        size={100 * fontSizeMultiplier}
        color={theme.text}
      />
      <AccessibleHeader style={styles.title}>
        Contrações (Grau 2)
      </AccessibleHeader>
      <AccessibleText style={styles.description} baseSize={18}>
        Aprenda a ler e escrever de forma fluente com as abreviações do Braille
        Grau 2.
      </AccessibleText>

      {/* Botão de Aprender */}
      <AccessibleButton
        style={styles.button}
        onPress={() => navigation.navigate("ContractionsLesson")}
        accessibilityText="Aprender o Conteúdo. Toque para iniciar a lição."
      >
        <MaterialCommunityIcons
          name="book-open-page-variant-outline"
          size={24 * fontSizeMultiplier}
          color={theme.buttonText}
        />
        <AccessibleText style={styles.buttonText} baseSize={20}>
          Aprender Conteúdo
        </AccessibleText>
      </AccessibleButton>

      {/* Botão de Desafio (condicional) */}
      <AccessibleButton
        style={[
          styles.button,
          styles.challengeButton,
          !isChallengeUnlocked && styles.buttonDisabled,
        ]}
        onPress={() => navigation.navigate("ContractionsRoullete")}
        disabled={!isChallengeUnlocked || isLoading}
        accessibilityText={`Desafio de Escrita. ${isChallengeUnlocked ? "Toque para jogar." : "Bloqueado. Complete a lição primeiro."}`}
      >
        {!isChallengeUnlocked && (
          <MaterialCommunityIcons
            name="lock-outline"
            size={24 * fontSizeMultiplier}
            color={theme.buttonText}
          />
        )}
        <AccessibleText style={styles.buttonText} baseSize={20}>
          Desafio de Escrita
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
      padding: 30,
      paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
    },
    title: {
      fontSize: 28 * fontMultiplier,
      fontWeight: isBold ? "bold" : "700",
      color: theme.text,
      marginVertical: 20,
      fontFamily: isDyslexiaFontEnabled ? "OpenDyslexic-Regular" : undefined,
      textAlign: "center",
    },
    description: {
      fontSize: 18 * fontMultiplier,
      color: theme.text,
      opacity: 0.9,
      textAlign: "center",
      marginBottom: 30,
      fontFamily: isDyslexiaFontEnabled ? "OpenDyslexic-Regular" : undefined,
    },
    button: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.button ?? "#191970",
      paddingVertical: 15,
      paddingHorizontal: 30,
      borderRadius: 30,
      elevation: 3,
      width: "100%",
      marginBottom: 20,
    },
    buttonText: {
      color: theme.buttonText ?? "#FFFFFF",
      fontSize: 20 * fontMultiplier,
      fontWeight: isBold ? "bold" : "700",
      fontFamily: isDyslexiaFontEnabled ? "OpenDyslexic-Regular" : undefined,
      marginLeft: 10,
    },
    challengeButton: {
      backgroundColor: "#006400", // Um verde para diferenciar
    },
    buttonDisabled: {
      backgroundColor: theme.card, // Cor de desabilitado
      opacity: 0.6,
    },
  });
