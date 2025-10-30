// src/screens/session/BraillePracticeScreen.tsx

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  AccessibilityInfo,
} from "react-native";
import { useRoute, useNavigation, RouteProp } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import ConfettiCannon from "react-native-confetti-cannon";
import { ALL_BRAILLE_CHARS } from "../../navigation/brailleLetters";
import { useContrast } from "../../hooks/useContrast";
import { useSettings } from "../../hooks/useSettings";
import { RootStackParamList } from "../../navigation/types";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";

const { width } = Dimensions.get("window");

type BraillePracticeRouteProp = RouteProp<
  RootStackParamList,
  "BraillePractice"
>;
type NavigationProps = NativeStackNavigationProp<RootStackParamList>;

const shuffleArray = (array: string[]) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export default function BraillePracticeScreen() {
  const route = useRoute<BraillePracticeRouteProp>();
  const navigation = useNavigation<NavigationProps>();
  const { title, characters } = route.params;

  const initialShuffledChars = useMemo(
    () => shuffleArray(characters),
    [characters]
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [activeDots, setActiveDots] = useState<number[]>([]);
  const [feedback, setFeedback] = useState("");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [sessionComplete, setSessionComplete] = useState(false);
  const { theme } = useContrast();
  const { fontSizeMultiplier, isBoldTextEnabled, isDyslexiaFontEnabled } =
    useSettings();
  const styles = createStyles(
    theme,
    fontSizeMultiplier,
    isBoldTextEnabled,
    isDyslexiaFontEnabled
  );

  const soundObjects = useMemo(
    () => ({
      correct: new Audio.Sound(),
      incorrect: new Audio.Sound(),
      happy: new Audio.Sound(),
    }),
    []
  );

  useEffect(() => {
    const loadSounds = async () => {
      try {
        await soundObjects.correct.loadAsync(
          require("../../../assets/som/correct.mp3")
        );
        await soundObjects.incorrect.loadAsync(
          require("../../../assets/som/incorrect.mp3")
        );
        await soundObjects.happy.loadAsync(
          require("../../../assets/som/happy.mp3")
        );
      } catch (error) {
        console.warn("Erro ao carregar sons:", error);
      }
    };
    loadSounds();
    return () => {
      Object.values(soundObjects).forEach((sound) => sound.unloadAsync());
    };
  }, [soundObjects]);

  const playSound = useCallback(
    async (soundType: "correct" | "incorrect" | "happy") => {
      try {
        await soundObjects[soundType].replayAsync();
      } catch (error) {
        console.warn(`Não foi possível tocar o som ${soundType}:`, error);
      }
    },
    [soundObjects]
  );

  const setupNewChallenge = useCallback(() => {
    if (currentIndex >= initialShuffledChars.length) {
      setSessionComplete(true);
      playSound("happy");
      AccessibilityInfo.announceForAccessibility(
        "Parabéns! Você concluiu a sessão!"
      );
      return;
    }
    setActiveDots([]);
    setFeedback("");
    setIsCorrect(null);
  }, [currentIndex, initialShuffledChars.length, playSound]);

  useEffect(() => {
    setupNewChallenge();
  }, [currentIndex]);

  const handleNext = () => {
    setCurrentIndex((prevIndex) => prevIndex + 1);
  };

  const handleDotPress = (dotNumber: number) => {
    if (isCorrect) return;
    setActiveDots((prev) =>
      prev.includes(dotNumber)
        ? prev.filter((d) => d !== dotNumber)
        : [...prev, dotNumber]
    );
  };

  const checkAnswer = () => {
    const currentCharacter = initialShuffledChars[currentIndex];
    if (!currentCharacter) return;
    const correctPattern =
      ALL_BRAILLE_CHARS[currentCharacter as keyof typeof ALL_BRAILLE_CHARS];
    const sortedUserPattern = [...activeDots].sort();
    const sortedCorrectPattern = [...correctPattern].sort();
    if (
      JSON.stringify(sortedUserPattern) === JSON.stringify(sortedCorrectPattern)
    ) {
      setFeedback("Correto! 🎉");
      setIsCorrect(true);
      playSound("correct");
      AccessibilityInfo.announceForAccessibility("Correto!");
    } else {
      setFeedback("Tente Novamente. 🤔");
      setIsCorrect(false);
      playSound("incorrect");
      AccessibilityInfo.announceForAccessibility("Incorreto, tente novamente.");
    }
  };

  const panGesture = Gesture.Pan().onEnd((event) => {
    if (
      event.translationX > 50 &&
      Math.abs(event.translationX) > Math.abs(event.translationY)
    ) {
      navigation.goBack();
    }
  });

  if (sessionComplete) {
    return (
      <GestureDetector gesture={panGesture}>
        <View style={styles.container}>
          <ConfettiCannon
            count={200}
            origin={{ x: -10, y: 0 }}
            fallSpeed={2500}
            fadeOut={true}
          />
          <StatusBar
            barStyle={theme.statusBarStyle}
            backgroundColor={theme.background}
          />
          <MaterialCommunityIcons
            name="party-popper"
            size={80}
            color="#FFD700"
          />
          <Text style={styles.completionTitle} accessibilityRole="header">
            Parabéns!
          </Text>
          <Text style={styles.completionSubtitle}>
            Você concluiu a sessão "{title}"!
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.goBack()}
            accessibilityLabel="Voltar para a Jornada"
          >
            <Text
              style={[styles.buttonText, { color: theme.buttonText ?? "#FFF" }]}
            >
              Voltar para a Jornada
            </Text>
          </TouchableOpacity>
        </View>
      </GestureDetector>
    );
  }

  const currentCharacter = initialShuffledChars[currentIndex];

  return (
    <GestureDetector gesture={panGesture}>
      <View style={styles.container}>
        <StatusBar
          barStyle={theme.statusBarStyle}
          backgroundColor={theme.background}
        />
        <Text style={styles.titleHeader} accessibilityRole="header">
          {title}
        </Text>
        <Text
          style={styles.progressIndicator}
          accessibilityLabel={`Progresso: ${currentIndex + 1} de ${initialShuffledChars.length}`}
        >
          {currentIndex + 1} / {initialShuffledChars.length}
        </Text>
        <Text style={styles.prompt}>
          Forme o caractere:{" "}
          <Text style={styles.letter}>{currentCharacter}</Text>
        </Text>
        <View
          style={styles.brailleCell}
          accessibilityLabel="Cela Braille com 6 pontos interativos"
        >
          {/* ✅ CORREÇÃO APLICADA AQUI */}
          {/* A lógica que desenha os botões foi colocada de volta dentro do .map() */}
          {[1, 2, 3, 4, 5, 6].map((dotNumber) => {
            const isActive = activeDots.includes(dotNumber);
            return (
              <TouchableOpacity
                key={dotNumber}
                style={styles.dotContainer}
                onPress={() => handleDotPress(dotNumber)}
                disabled={!!isCorrect}
                accessible={true}
                accessibilityLabel={`Ponto ${dotNumber}`}
                accessibilityState={{ selected: isActive }}
                accessibilityHint={`Toque para ${isActive ? "desativar" : "ativar"}`}
              >
                <View
                  style={[
                    styles.dot,
                    isActive ? styles.dotActive : styles.dotInactive,
                  ]}
                >
                  <Text style={styles.dotNumber}>{dotNumber}</Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
        <View
          style={styles.feedbackPlaceholder}
          accessibilityLiveRegion="polite"
        >
          <Text
            style={[
              styles.feedback,
              { color: isCorrect ? "#28a745" : "#dc3545" },
            ]}
          >
            {feedback}
          </Text>
        </View>
        <View style={styles.actionContainer}>
          {isCorrect ? (
            <TouchableOpacity
              style={[
                styles.button,
                { backgroundColor: theme.button ?? "#28a745" },
              ]}
              onPress={handleNext}
              accessibilityLabel="Ir para o próximo caractere"
            >
              <Text
                style={[
                  styles.buttonText,
                  { color: theme.buttonText ?? "#FFF" },
                ]}
              >
                Próximo
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[
                styles.button,
                { backgroundColor: theme.button ?? "#007bff" },
              ]}
              onPress={checkAnswer}
              accessibilityLabel="Verificar resposta"
            >
              <Text
                style={[
                  styles.buttonText,
                  { color: theme.buttonText ?? "#FFF" },
                ]}
              >
                Verificar
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </GestureDetector>
  );
}

const createStyles = (
  theme: any,
  fontMultiplier: number,
  isBold: boolean,
  isDyslexia: boolean
) =>
  StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.background,
      padding: 10,
    },
    titleHeader: {
      position: "absolute",
      top: 50,
      fontSize: 22 * fontMultiplier,
      fontWeight: isBold ? "bold" : "700",
      color: theme.text,
      fontFamily: isDyslexia ? "OpenDyslexic-Regular" : undefined,
    },
    progressIndicator: {
      position: "absolute",
      top: 85,
      fontSize: 16 * fontMultiplier,
      color: theme.text,
      opacity: 0.7,
      fontFamily: isDyslexia ? "OpenDyslexic-Regular" : undefined,
    },
    prompt: {
      fontSize: 24 * fontMultiplier,
      fontWeight: isBold ? "bold" : "700",
      color: theme.text,
      marginBottom: 20,
      textAlign: "center",
      fontFamily: isDyslexia ? "OpenDyslexic-Regular" : undefined,
    },
    letter: { color: theme.button ?? "#005a9c", fontSize: 28 * fontMultiplier },
    brailleCell: {
      width: width * 0.45,
      height: width * 0.45 * 1.6,
      backgroundColor: theme.card,
      borderRadius: 25,
      flexDirection: "column",
      flexWrap: "wrap",
      alignContent: "center",
      justifyContent: "space-around",
      paddingVertical: 5,
      elevation: 5,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
    },
    dotContainer: {
      width: "50%",
      height: "33%",
      justifyContent: "center",
      alignItems: "center",
    },
    dot: {
      width: 50,
      height: 50,
      borderRadius: 25,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 2,
    },
    dotInactive: { backgroundColor: theme.background, borderColor: "#c0c8d0" },
    dotActive: {
      backgroundColor: theme.button ?? "#005a9c",
      borderColor: "#003d69",
    },
    dotNumber: {
      fontSize: 14 * fontMultiplier,
      color: "rgba(0,0,0,0.4)",
      fontWeight: "bold",
      fontFamily: isDyslexia ? "OpenDyslexic-Regular" : undefined,
    },
    feedbackPlaceholder: {
      height: 30,
      marginTop: 20,
      justifyContent: "center",
    },
    feedback: {
      fontSize: 20 * fontMultiplier,
      fontWeight: isBold ? "bold" : "700",
      textAlign: "center",
      fontFamily: isDyslexia ? "OpenDyslexic-Regular" : undefined,
    },
    actionContainer: { marginTop: 20, width: "80%" },
    button: {
      paddingVertical: 18,
      borderRadius: 20,
      alignItems: "center",
      backgroundColor: theme.button ?? "#007bff",
      width: "100%",
    },
    buttonText: {
      fontSize: 20 * fontMultiplier,
      fontWeight: isBold ? "bold" : "700",
      fontFamily: isDyslexia ? "OpenDyslexic-Regular" : undefined,
    },
    completionTitle: {
      fontSize: 36 * fontMultiplier,
      fontWeight: "bold",
      color: theme.text,
      marginTop: 20,
      marginBottom: 10,
      fontFamily: isDyslexia ? "OpenDyslexic-Regular" : undefined,
    },
    completionSubtitle: {
      fontSize: 20 * fontMultiplier,
      color: theme.text,
      opacity: 0.8,
      textAlign: "center",
      marginBottom: 40,
      paddingHorizontal: 20,
      fontFamily: isDyslexia ? "OpenDyslexic-Regular" : undefined,
    },
  });
