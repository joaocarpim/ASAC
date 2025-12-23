import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  Vibration,
  View,
  Animated,
  SafeAreaView,
  StatusBar,
  AccessibilityInfo,
  findNodeHandle,
  Platform,
  Text, // Importante: Usaremos Text nativo dentro dos grupos
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Audio } from "expo-av";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { RootStackParamList } from "../../navigation/types";
import { useContrast } from "../../hooks/useContrast";
import { useSettings } from "../../hooks/useSettings";
import { Theme } from "../../types/contrast";
import { AccessibleText } from "../../components/AccessibleComponents"; // Usado apenas onde não há agrupamento

//

const BRAILLE_MAP: { [key: string]: number[] } = {
  A: [1],
  B: [1, 2],
  C: [1, 4],
  D: [1, 4, 5],
  E: [1, 5],
  F: [1, 2, 4],
  G: [1, 2, 4, 5],
  H: [1, 2, 5],
  I: [2, 4],
  J: [2, 4, 5],
  K: [1, 3],
  L: [1, 2, 3],
  M: [1, 3, 4],
  N: [1, 3, 4, 5],
  O: [1, 3, 5],
  P: [1, 2, 3, 4],
  Q: [1, 2, 3, 4, 5],
  R: [1, 2, 3, 5],
  S: [2, 3, 4],
  T: [2, 3, 4, 5],
  U: [1, 3, 6],
  V: [1, 2, 3, 6],
  W: [2, 4, 5, 6],
  X: [1, 3, 4, 6],
  Y: [1, 3, 4, 5, 6],
  Z: [1, 3, 5, 6],
  "0": [2, 4, 5],
  "1": [1],
  "2": [1, 2],
  "3": [1, 4],
  "4": [1, 4, 5],
  "5": [1, 5],
  "6": [1, 2, 4],
  "7": [1, 2, 4, 5],
  "8": [1, 2, 5],
  "9": [2, 4],
};

let soundCorrect: Audio.Sound | null = null;
let soundIncorrect: Audio.Sound | null = null;

async function loadSounds() {
  try {
    if (!soundCorrect) {
      const { sound } = await Audio.Sound.createAsync(
        require("../../../assets/som/correct.mp3")
      );
      soundCorrect = sound;
    }
    if (!soundIncorrect) {
      const { sound } = await Audio.Sound.createAsync(
        require("../../../assets/som/incorrect.mp3")
      );
      soundIncorrect = sound;
    }
  } catch (error) {
    console.log("Erro ao carregar sons", error);
  }
}

type ScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "WritingChallengeGame"
>;

export default function WritingChallengeGameScreen({
  route,
  navigation,
}: ScreenProps) {
  const { word } = route.params;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [pressedDots, setPressedDots] = useState<number[]>([]);
  const [completedCells, setCompletedCells] = useState<string[]>([]);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);

  const shakeAnimation = useRef(new Animated.Value(0)).current;
  const flashAnimation = useRef(new Animated.Value(0)).current;
  const firstDotRef = useRef<View>(null);

  const { theme } = useContrast();
  const { fontSizeMultiplier, isBoldTextEnabled, isDyslexiaFontEnabled } =
    useSettings();

  const styles = createStyles(
    theme,
    fontSizeMultiplier,
    isBoldTextEnabled,
    isDyslexiaFontEnabled
  );

  useEffect(() => {
    loadSounds();
    return () => {
      soundCorrect?.unloadAsync();
      soundIncorrect?.unloadAsync();
      soundCorrect = null;
      soundIncorrect = null;
    };
  }, []);

  useEffect(() => {
    if (Platform.OS !== "web" && firstDotRef.current) {
      const reactTag = findNodeHandle(firstDotRef.current);
      if (reactTag) {
        setTimeout(
          () => AccessibilityInfo.setAccessibilityFocus(reactTag),
          200
        );
      }
    }
  }, [currentIndex]);

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

  const triggerFlash = (isCorrect: boolean) => {
    flashAnimation.setValue(0);
    Animated.sequence([
      Animated.timing(flashAnimation, {
        toValue: isCorrect ? 1 : 2,
        duration: 200,
        useNativeDriver: false,
      }),
      Animated.timing(flashAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const handleCheckAnswer = async () => {
    const currentLetter = word[currentIndex];
    const correctDots = BRAILLE_MAP[currentLetter];

    if (!correctDots) return;

    const isCorrect =
      pressedDots.length === correctDots.length &&
      pressedDots.every((value, index) => value === correctDots[index]);

    if (isCorrect) {
      await soundCorrect?.replayAsync();
      setFeedbackMessage("✓ Correto!");
      setShowFeedback(true);
      triggerFlash(true);

      if (Platform.OS === "android")
        AccessibilityInfo.announceForAccessibility("Correto! Próxima letra.");

      setTimeout(() => {
        setShowFeedback(false);
        setCompletedCells((prev) => [...prev, currentLetter]);
        const nextIndex = currentIndex + 1;

        if (nextIndex === word.length) {
          navigation.replace("WritingChallengeSuccess", { word });
        } else {
          setCurrentIndex(nextIndex);
          setPressedDots([]);
        }
      }, 800);
    } else {
      await soundIncorrect?.replayAsync();
      setFeedbackMessage("✗ Tente novamente!");
      setShowFeedback(true);
      Vibration.vibrate(100);
      triggerShake();
      triggerFlash(false);

      if (Platform.OS === "android")
        AccessibilityInfo.announceForAccessibility(
          "Incorreto. Tente novamente."
        );

      setTimeout(() => {
        setShowFeedback(false);
      }, 1500);
    }
  };

  // Renderiza a palavra alvo.
  // IMPORTANTE: Use Text NATIVO aqui, não AccessibleText, para não quebrar o agrupamento do pai.
  const renderChallengeWord = () => {
    return word.split("").map((letter, index) => {
      const isCurrent = index === currentIndex;
      return (
        <Text
          key={index}
          style={[styles.letter, isCurrent && styles.currentLetter]}
          importantForAccessibility="no" // O pai vai ler tudo
        >
          {letter}
        </Text>
      );
    });
  };

  const BrailleDot = ({ number }: { number: number }) => {
    const isPressed = pressedDots.includes(number);
    return (
      <TouchableOpacity
        ref={number === 1 ? (firstDotRef as any) : undefined}
        style={[
          styles.dot,
          isPressed && {
            backgroundColor: theme.button ?? "#191970",
            borderColor: theme.buttonText ?? "#FFFFFF",
          },
        ]}
        onPress={() => handleDotToggle(number)}
        accessibilityLabel={`Ponto ${number}`}
        accessibilityRole="togglebutton"
        accessibilityState={{ checked: isPressed }}
        accessibilityHint={
          isPressed
            ? "Toque duas vezes para desmarcar"
            : "Toque duas vezes para marcar"
        }
      />
    );
  };

  const backgroundColor = flashAnimation.interpolate({
    inputRange: [0, 1, 2],
    outputRange: [
      theme.background,
      "rgba(76, 217, 100, 0.3)",
      "rgba(255, 59, 48, 0.3)",
    ],
  });

  return (
    <Animated.View style={[styles.container, { backgroundColor }]}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar
          barStyle={theme.statusBarStyle}
          backgroundColor={theme.background}
        />

        {/* 1. Box de Instrução (Topo) */}
        {/* accessible={true} AGRUPA tudo dentro. focusable={true} permite TAB. */}
        <View
          style={styles.instructionBox}
          accessible={true}
          focusable={true}
          accessibilityRole="text"
          accessibilityLabel="Instrução: Escreva as letras para formar a palavra"
        >
          <MaterialCommunityIcons
            name="information-outline"
            size={24}
            color={theme.text}
            style={{ marginRight: 8 }}
            importantForAccessibility="no"
          />
          <Text style={styles.instructionText} importantForAccessibility="no">
            Escreva as letras para formar a palavra
          </Text>
        </View>

        {/* 2. Container da Palavra Alvo (Logo abaixo) */}
        <View
          style={styles.wordContainer}
          accessible={true} // Agrupa as letras em um único foco
          focusable={true} // Permite TAB
          accessibilityRole="text" // Leitor entende como texto
          accessibilityLabel={`Palavra alvo: ${word}. Letra atual: ${word[currentIndex]}`}
        >
          {renderChallengeWord()}
        </View>

        {/* 3. Letras Completadas (Aparece conforme acerta) */}
        <View
          style={styles.completedContainer}
          accessible={true}
          focusable={completedCells.length > 0}
          // Se não houver letras, não foca
          accessibilityLabel={
            completedCells.length > 0
              ? `Letras completadas: ${completedCells.join(", ")}`
              : ""
          }
        >
          {completedCells.map((cell, index) => (
            <Text
              key={index}
              style={styles.completedCell}
              importantForAccessibility="no"
            >
              {cell}
            </Text>
          ))}
        </View>

        {/* Feedback Visual/Sonoro */}
        {showFeedback && (
          <View
            style={styles.feedbackContainer}
            accessibilityLiveRegion="assertive"
          >
            <Text
              style={[
                styles.feedbackText,
                feedbackMessage.includes("✓")
                  ? styles.feedbackCorrect
                  : styles.feedbackIncorrect,
              ]}
            >
              {feedbackMessage}
            </Text>
          </View>
        )}

        {/* Área Braille */}
        <View style={styles.brailleInputArea}>
          <Animated.View
            style={[
              styles.brailleCellOutline,
              { transform: [{ translateX: shakeAnimation }] },
            ]}
          >
            {/* Colunas ignoradas (NO) para permitir foco direto nos botões */}
            <View style={styles.dotColumn} importantForAccessibility="no">
              <BrailleDot number={1} />
              <BrailleDot number={2} />
              <BrailleDot number={3} />
            </View>
            <View style={styles.dotColumn} importantForAccessibility="no">
              <BrailleDot number={4} />
              <BrailleDot number={5} />
              <BrailleDot number={6} />
            </View>
          </Animated.View>

          {/* Botão Verificar (Nativo) */}
          <TouchableOpacity
            style={styles.checkButton}
            onPress={handleCheckAnswer}
            activeOpacity={0.8}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel="Verificar resposta"
            accessibilityHint="Confirma os pontos selecionados"
            focusable={true}
          >
            <MaterialCommunityIcons
              name="check-circle-outline"
              size={22 * fontSizeMultiplier}
              color={theme.buttonText ?? "#FFFFFF"}
              importantForAccessibility="no"
            />
            <Text style={styles.checkButtonText} importantForAccessibility="no">
              Verificar
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </Animated.View>
  );
}

const createStyles = (
  theme: Theme,
  fontMultiplier: number,
  isBold: boolean,
  isDyslexiaFontEnabled: boolean
) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    safeArea: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 16,
    },
    // Estilo da Box de Instrução
    instructionBox: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.card,
      paddingVertical: 12,
      paddingHorizontal: 20,
      borderRadius: 12,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: `${theme.button}30`,
      maxWidth: "90%",
    },
    instructionText: {
      fontSize: 16 * fontMultiplier,
      color: theme.text,
      fontFamily: isDyslexiaFontEnabled ? "OpenDyslexic-Regular" : undefined,
      fontWeight: isBold ? "bold" : "500",
      flexShrink: 1,
    },
    wordContainer: {
      flexDirection: "row",
      marginBottom: 10,
      padding: 10,
      borderRadius: 8,
      backgroundColor: "transparent", // Garante que a área de toque/foco englobe o texto
    },
    letter: {
      fontSize: 36 * fontMultiplier,
      color: theme.text,
      opacity: 0.5,
      marginHorizontal: 3,
      fontFamily: isDyslexiaFontEnabled ? "OpenDyslexic-Regular" : undefined,
    },
    currentLetter: {
      fontSize: 48 * fontMultiplier,
      fontWeight: "bold",
      color: theme.text,
      opacity: 1,
      transform: [{ translateY: -4 * fontMultiplier }],
    },
    completedContainer: {
      flexDirection: "row",
      height: 50,
      marginBottom: 5,
    },
    completedCell: {
      fontSize: 26 * fontMultiplier,
      fontWeight: isBold ? "bold" : "600",
      color: theme.text,
      opacity: 0.7,
      marginHorizontal: 8,
      fontFamily: isDyslexiaFontEnabled ? "OpenDyslexic-Regular" : undefined,
    },
    feedbackContainer: {
      position: "absolute",
      top: "90%",
      alignSelf: "center",
      backgroundColor: theme.card,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 16,
      elevation: 6,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.3,
      shadowRadius: 4,
      zIndex: 10,
    },
    feedbackText: {
      fontSize: 20 * fontMultiplier,
      fontWeight: "bold",
      fontFamily: isDyslexiaFontEnabled ? "OpenDyslexic-Regular" : undefined,
    },
    feedbackCorrect: { color: "#4CD964" },
    feedbackIncorrect: { color: "#FF3B30" },
    brailleInputArea: {
      justifyContent: "flex-start",
      alignItems: "center",
      width: "100%",
      marginTop: 10,
    },
    brailleCellOutline: {
      flexDirection: "row",
      justifyContent: "space-around",
      alignItems: "center",
      width: 200,
      height: 290,
      borderRadius: 20,
      borderWidth: 4,
      borderColor: theme.button ?? "#191970",
      backgroundColor: theme.card,
      paddingVertical: 10,
      paddingHorizontal: 10,
      elevation: 6,
      marginBottom: 20,
    },
    dotColumn: { justifyContent: "space-around", height: "100%" },
    dot: {
      width: 54,
      height: 54,
      borderRadius: 27,
      backgroundColor: theme.background,
      borderWidth: 2,
      borderColor: theme.button ?? "#191970",
      marginVertical: 8,
    },
    checkButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.button ?? "#191970",
      paddingVertical: 12,
      paddingHorizontal: 28,
      borderRadius: 24,
      elevation: 4,
    },
    checkButtonText: {
      color: theme.buttonText ?? "#FFFFFF",
      fontSize: 16 * fontMultiplier,
      fontWeight: isBold ? "bold" : "700",
      marginLeft: 8,
      fontFamily: isDyslexiaFontEnabled ? "OpenDyslexic-Regular" : undefined,
    },
  });
