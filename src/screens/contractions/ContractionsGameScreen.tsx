// src/screens/contractions/ContractionsGameScreen.tsx

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  Vibration,
  View,
  Animated,
  Platform,
  StatusBar,
  Alert,
  Dimensions,
  SafeAreaView,
  Text,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Audio } from "expo-av";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { RootStackParamList } from "../../navigation/types";
import { useContrast } from "../../hooks/useContrast";
import { useSettings } from "../../hooks/useSettings";
import { Theme } from "../../types/contrast";
import {
  AccessibleView,
  AccessibleText,
  AccessibleButton,
  AccessibleHeader,
} from "../../components/AccessibleComponents";

import { ContractionSubject } from "../../services/ContractionSubject";
import { GameNotificationObserver } from "../../observers/GameNotificationObserver";

const { width, height } = Dimensions.get("window");

type ScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "ContractionsGame"
>;

// ✅ 1. NOVA FUNÇÃO DE CORES ESPECÍFICA PARA O JOGO
const getGameColors = (contrastMode: string) => {
  // --- MODO AZUL E AMARELO (CORRIGIDO) ---
  if (contrastMode === "blue_yellow") {
    return {
      cardBg: "#191970", // Fundo da cela e cards: Azul Escuro
      cellBorder: "#FFD700", // Borda da cela: AMARELO

      dotActive: "#FFD700", // Ponto Clicado: AMARELO
      dotInactive: "transparent",
      dotBorder: "#FFD700", // Borda do ponto: AMARELO

      textActive: "#191970", // Número dentro do ponto ativo (Azul para ler no amarelo)
      textInactive: "#FFD700", // Número dentro do ponto vazio

      mainText: "#FFFFFF", // Texto geral dentro dos cards: BRANCO
    };
  }

  // --- MODO SÉPIA ---
  if (contrastMode === "sepia") {
    return {
      cardBg: "#FFFFFF",
      cellBorder: "#3E2723",
      dotActive: "#3E2723",
      dotInactive: "rgba(62, 39, 35, 0.1)",
      dotBorder: "#3E2723",
      textActive: "#FFFFFF",
      textInactive: "#3E2723",
      mainText: "#3E2723",
    };
  }

  // --- MONOCROMÁTICO / CLARO ---
  if (contrastMode === "grayscale" || contrastMode === "white_black") {
    return {
      cardBg: "#FFFFFF",
      cellBorder: "#000000",
      dotActive: "#000000",
      dotInactive: "rgba(0, 0, 0, 0.1)",
      dotBorder: "#000000",
      textActive: "#FFFFFF",
      textInactive: "#000000",
      mainText: "#000000",
    };
  }

  // --- PADRÃO / DARK ---
  return {
    cardBg: "#1C1C1C",
    cellBorder: "#FFFFFF",
    dotActive: "#FFFFFF",
    dotInactive: "rgba(255, 255, 255, 0.1)",
    dotBorder: "#FFFFFF",
    textActive: "#000000",
    textInactive: "#FFFFFF",
    mainText: "#FFFFFF",
  };
};

export default function ContractionsGameScreen({
  route,
  navigation,
}: ScreenProps) {
  const { word, dots } = route.params;
  const [pressedDots, setPressedDots] = useState<number[]>([]);
  const shakeAnimation = useRef(new Animated.Value(0)).current;

  // ✅ Pegamos também o contrastMode
  const { theme, contrastMode } = useContrast();

  const {
    fontSizeMultiplier,
    isBoldTextEnabled,
    isDyslexiaFontEnabled,
    lineHeightMultiplier,
    letterSpacing,
  } = useSettings();

  // ✅ Calculamos as cores do jogo
  const gameColors = useMemo(() => getGameColors(contrastMode), [contrastMode]);

  const styles = createStyles(
    theme,
    fontSizeMultiplier,
    isBoldTextEnabled,
    isDyslexiaFontEnabled,
    lineHeightMultiplier,
    letterSpacing
  );

  const soundCorrect = useRef<Audio.Sound | null>(null);
  const soundIncorrect = useRef<Audio.Sound | null>(null);

  useEffect(() => {
    async function loadSounds() {
      try {
        const { sound: correct } = await Audio.Sound.createAsync(
          require("../../../assets/som/correct.mp3")
        );
        soundCorrect.current = correct;

        const { sound: incorrect } = await Audio.Sound.createAsync(
          require("../../../assets/som/incorrect.mp3")
        );
        soundIncorrect.current = incorrect;
      } catch (error) {
        console.log("Erro ao carregar sons:", error);
      }
    }
    loadSounds();

    return () => {
      soundCorrect.current?.unloadAsync();
      soundIncorrect.current?.unloadAsync();
    };
  }, []);

  const handleDotToggle = (dotNumber: number) => {
    setPressedDots((prev) => {
      const isPressed = prev.includes(dotNumber);
      if (isPressed) {
        return prev.filter((d) => d !== dotNumber);
      } else {
        return [...prev, dotNumber].sort((a, b) => a - b);
      }
    });
  };

  const triggerShake = () => {
    shakeAnimation.setValue(0);
    Animated.sequence([
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: -10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleCheckAnswer = async () => {
    const correctDots = dots;
    const isCorrect =
      pressedDots.length === correctDots.length &&
      pressedDots
        .sort()
        .every((value, index) => value === correctDots.sort()[index]);

    if (isCorrect) {
      await soundCorrect.current?.replayAsync();
      ContractionSubject.notify({
        message: "Correto! Muito bem!",
        type: "success",
      });
      setTimeout(() => {
        navigation.replace("ContractionsSuccess", { word });
      }, 1500);
    } else {
      await soundIncorrect.current?.replayAsync();
      if (Platform.OS !== "web") Vibration.vibrate(100);
      triggerShake();
      ContractionSubject.notify({
        message: "Incorreto. Tente novamente!",
        type: "error",
      });
    }
  };

  const handleGoBack = () => {
    if (Platform.OS === "web") {
      navigation.navigate("ContractionsRoullete");
    } else {
      Alert.alert(
        "Sair do Desafio?",
        "Tem certeza que quer voltar para a roleta?",
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Sair",
            style: "destructive",
            onPress: () => navigation.navigate("ContractionsRoullete"),
          },
        ]
      );
    }
  };

  // ✅ COMPONENTE DE PONTO (BrailleDot) COM CORES CORRIGIDAS
  const BrailleDot = ({ number }: { number: number }) => {
    const isPressed = pressedDots.includes(number);
    return (
      <TouchableOpacity
        style={[
          styles.dot,
          {
            // Usa as cores definidas no getGameColors
            backgroundColor: isPressed
              ? gameColors.dotActive
              : gameColors.dotInactive,
            borderColor: gameColors.dotBorder,
            borderWidth: 3, // Borda mais grossa para visibilidade
          },
          isPressed && styles.dotPressed,
        ]}
        onPress={() => handleDotToggle(number)}
        accessibilityLabel={`Ponto ${number}, ${
          isPressed ? "selecionado" : "não selecionado"
        }`}
        accessibilityRole="togglebutton"
      >
        <Text
          style={[
            styles.dotNumber,
            {
              color: isPressed
                ? gameColors.textActive
                : gameColors.textInactive,
            },
          ]}
        >
          {number}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.background }]}
    >
      <StatusBar barStyle="light-content" backgroundColor={theme.background} />

      <GameNotificationObserver />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleGoBack}
          style={[styles.backButton, { backgroundColor: theme.card }]}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={theme.text}
          />
        </TouchableOpacity>
        <AccessibleHeader
          style={[styles.headerTitle, { color: theme.text }]}
          level={1}
        >
          Desafio
        </AccessibleHeader>
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.container}>
        {/* 1. Palavra Alvo */}
        <View style={styles.infoCard}>
          <AccessibleText
            style={[styles.instructionText, { color: theme.text }]}
            baseSize={16}
          >
            Escreva a contração para:
          </AccessibleText>
          <View
            style={[
              styles.wordBadge,
              // ✅ Fundo do card corrigido para Azul Escuro no tema blue_yellow
              {
                backgroundColor: gameColors.cardBg,
                borderColor: gameColors.cellBorder,
              },
            ]}
          >
            <AccessibleText
              style={[
                styles.currentWord,
                {
                  color: gameColors.mainText, // ✅ Texto Branco/Amarelo para contraste
                  fontSize: 32 * fontSizeMultiplier,
                  fontFamily: isDyslexiaFontEnabled
                    ? "OpenDyslexic-Regular"
                    : undefined,
                  letterSpacing: letterSpacing,
                },
              ]}
              baseSize={32}
            >
              {word}
            </AccessibleText>
          </View>
        </View>

        {/* 2. Cela Braille (Agora com borda amarela no tema azul) */}
        <Animated.View
          style={[
            styles.brailleCellOutline,
            {
              transform: [{ translateX: shakeAnimation }],
              backgroundColor: gameColors.cardBg, // ✅ Fundo Azul Escuro
              borderColor: gameColors.cellBorder, // ✅ Borda Amarela
              borderWidth: 5, // Borda grossa
            },
          ]}
        >
          <View style={styles.dotColumn}>
            <BrailleDot number={1} />
            <BrailleDot number={2} />
            <BrailleDot number={3} />
          </View>
          <View style={styles.dotColumn}>
            <BrailleDot number={4} />
            <BrailleDot number={5} />
            <BrailleDot number={6} />
          </View>
        </Animated.View>

        {/* 3. Botão de Confirmar */}
        <AccessibleButton
          style={[
            styles.checkButton,
            { backgroundColor: theme.button ?? "#28a745" },
          ]}
          onPress={handleCheckAnswer}
          accessibilityText="Verificar resposta"
        >
          <MaterialCommunityIcons
            name="check-bold"
            size={24}
            color={theme.buttonText ?? "#FFFFFF"}
            style={{ marginRight: 10 }}
          />
          <AccessibleText
            style={[
              styles.checkButtonText,
              {
                color: theme.buttonText ?? "#FFFFFF",
                fontSize: 18 * fontSizeMultiplier,
                fontWeight: isBoldTextEnabled ? "bold" : "700",
                fontFamily: isDyslexiaFontEnabled
                  ? "OpenDyslexic-Regular"
                  : undefined,
              },
            ]}
            baseSize={18}
          >
            CONFIRMAR
          </AccessibleText>
        </AccessibleButton>
      </View>
    </SafeAreaView>
  );
}

function createStyles(
  theme: Theme,
  fontMultiplier: number,
  isBold: boolean,
  isDyslexiaFontEnabled: boolean,
  lineHeightMultiplier: number,
  letterSpacing: number
) {
  return StyleSheet.create({
    safeArea: {
      flex: 1,
    },
    container: {
      flex: 1,
      paddingHorizontal: 20,
      alignItems: "center",
      justifyContent: "space-evenly",
      paddingBottom: 20,
      maxWidth: 600,
      alignSelf: "center",
      width: "100%",
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingVertical: 10,
      width: "100%",
    },
    backButton: {
      padding: 8,
      borderRadius: 8,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: "bold",
    },
    infoCard: {
      width: "100%",
      alignItems: "center",
      marginBottom: 10,
    },
    instructionText: {
      opacity: 0.8,
      marginBottom: 10,
      textAlign: "center",
    },
    wordBadge: {
      paddingVertical: 15,
      paddingHorizontal: 40,
      borderRadius: 20,
      borderWidth: 2,
      width: "90%",
      alignItems: "center",
      elevation: 3,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 3,
    },
    currentWord: {
      fontWeight: "bold",
      textAlign: "center",
    },
    brailleCellOutline: {
      flexDirection: "row",
      justifyContent: "space-between",
      width: width * 0.45,
      maxWidth: 180,
      height: width * 0.45 * 1.5,
      maxHeight: 270,
      borderRadius: 20,
      padding: 15,
      elevation: 5,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 5,
      marginBottom: 10,
    },
    dotColumn: {
      justifyContent: "space-between",
      height: "100%",
      alignItems: "center",
    },
    dot: {
      width: 45,
      height: 45,
      borderRadius: 22.5,
      justifyContent: "center",
      alignItems: "center",
    },
    dotPressed: {
      transform: [{ scale: 1.1 }],
      elevation: 3,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 3,
    },
    dotNumber: {
      fontSize: 16,
      fontWeight: "bold",
    },
    checkButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 18,
      paddingHorizontal: 30,
      borderRadius: 20,
      width: "100%",
      elevation: 4,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
    },
    checkButtonText: {
      marginLeft: 10,
    },
  });
}
