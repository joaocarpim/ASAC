import React, { useState, useEffect, useRef } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  Vibration,
  View,
  Animated,
  SafeAreaView,
  StatusBar,
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
} from "../../components/AccessibleComponents";

// Mapeamento Braille
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

    if (!correctDots) {
      console.error(`Letra "${currentLetter}" não encontrada no BRAILLE_MAP!`);
      return;
    }

    const isCorrect =
      pressedDots.length === correctDots.length &&
      pressedDots.every((value, index) => value === correctDots[index]);

    if (isCorrect) {
      await soundCorrect?.replayAsync();
      setFeedbackMessage("✓ Correto!");
      setShowFeedback(true);
      triggerFlash(true);

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

      setTimeout(() => {
        setShowFeedback(false);
      }, 1500);
    }
  };

  const renderChallengeWord = () => {
    return word.split("").map((letter, index) => {
      const isCurrent = index === currentIndex;
      return (
        <AccessibleText
          key={index}
          style={[styles.letter, isCurrent && styles.currentLetter]}
          accessibilityHint={isCurrent ? "Letra atual" : ""}
          baseSize={isCurrent ? 48 : 36}
        >
          {letter}
        </AccessibleText>
      );
    });
  };

  const BrailleDot = ({ number }: { number: number }) => {
    const isPressed = pressedDots.includes(number);
    return (
      <TouchableOpacity
        style={[
          styles.dot,
          isPressed && {
            backgroundColor: theme.button ?? "#191970",
            borderColor: theme.buttonText ?? "#FFFFFF",
          },
        ]}
        onPress={() => handleDotToggle(number)}
        accessibilityLabel={`Ponto ${number}`}
        accessibilityState={{ selected: isPressed }}
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

        <AccessibleView
          style={styles.wordContainer}
          accessibilityLabel={`Palavra: ${word}`}
          accessibilityText="Palavra a ser escrita"
        >
          {renderChallengeWord()}
        </AccessibleView>

        <AccessibleView
          style={styles.completedContainer}
          accessibilityText="Letras já completadas"
        >
          {completedCells.map((cell, index) => (
            <AccessibleText
              key={index}
              style={styles.completedCell}
              accessibilityLabel={`Letra ${cell} completa`}
              baseSize={26}
            >
              {cell}
            </AccessibleText>
          ))}
        </AccessibleView>

        {showFeedback && (
          <View style={styles.feedbackContainer}>
            <AccessibleText
              style={[
                styles.feedbackText,
                feedbackMessage.includes("✓")
                  ? styles.feedbackCorrect
                  : styles.feedbackIncorrect,
              ]}
              baseSize={20}
            >
              {feedbackMessage}
            </AccessibleText>
          </View>
        )}

        <View style={styles.brailleInputArea}>
          <Animated.View
            style={[
              styles.brailleCellOutline,
              { transform: [{ translateX: shakeAnimation }] },
            ]}
          >
            <AccessibleView
              style={styles.dotColumn}
              accessibilityText="Coluna esquerda dos pontos Braille, 1, 2, 3"
            >
              <BrailleDot number={1} />
              <BrailleDot number={2} />
              <BrailleDot number={3} />
            </AccessibleView>
            <AccessibleView
              style={styles.dotColumn}
              accessibilityText="Coluna direita dos pontos Braille, 4, 5, 6"
            >
              <BrailleDot number={4} />
              <BrailleDot number={5} />
              <BrailleDot number={6} />
            </AccessibleView>
          </Animated.View>

          <AccessibleButton
            style={styles.checkButton}
            onPress={handleCheckAnswer}
            accessibilityText="Verificar resposta"
          >
            <MaterialCommunityIcons
              name="check-circle-outline"
              size={22 * fontSizeMultiplier}
              color={theme.buttonText ?? "#FFFFFF"}
            />
            <AccessibleText style={styles.checkButtonText} baseSize={16}>
              Verificar
            </AccessibleText>
          </AccessibleButton>
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
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    safeArea: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center", // 👈 LIBERA O MOVIMENTO
      paddingVertical: 16,
    },
    wordContainer: {
      flexDirection: "row",
      marginBottom: 12,
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
      height: 100,
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
    },
    feedbackText: {
      fontSize: 20 * fontMultiplier,
      fontWeight: "bold",
      fontFamily: isDyslexiaFontEnabled ? "OpenDyslexic-Regular" : undefined,
    },
    feedbackCorrect: {
      color: "#4CD964",
    },
    feedbackIncorrect: {
      color: "#FF3B30",
    },

    // 🔼 SUBINDO TUDO
    brailleInputArea: {
      justifyContent: "flex-start",
      alignItems: "center",
      width: "100%",
      marginTop: -40, // 🔼 sobe o conjunto inteiro
    },

    // 🔼 SUBINDO A CÉLULA BRAILLE
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
      marginBottom: 4, // 🔼 diminui espaço e puxa pra cima
      marginTop: -20, // 🔼 sobe ainda mais a sela
    },

    dotColumn: {
      justifyContent: "space-around",
      height: "100%",
    },
    dot: {
      width: 54,
      height: 54,
      borderRadius: 27,
      backgroundColor: theme.background,
      borderWidth: 2,
      borderColor: theme.button ?? "#191970",
      marginVertical: 8,
    },

    // 🔼 SUBINDO O BOTÃO
    checkButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.button ?? "#191970",
      paddingVertical: 12,
      paddingHorizontal: 28,
      borderRadius: 24,
      elevation: 4,
      marginTop: 10, // 🔼 botão mais próximo da célula
    },

    checkButtonText: {
      color: theme.buttonText ?? "#FFFFFF",
      fontSize: 16 * fontMultiplier,
      fontWeight: isBold ? "bold" : "700",
      marginLeft: 8,
      fontFamily: isDyslexiaFontEnabled ? "OpenDyslexic-Regular" : undefined,
    },
  });
