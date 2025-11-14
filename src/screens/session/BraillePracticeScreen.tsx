// src/screens/session/BraillePracticeScreen.tsx (CORRIGIDO PARA WEB)
import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  StatusBar,
  AccessibilityInfo,
  Platform,
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

const { width, height } = Dimensions.get("window");

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
  const styles = useMemo(
    () =>
      createStyles(
        theme,
        fontSizeMultiplier,
        isBoldTextEnabled,
        isDyslexiaFontEnabled
      ),
    [theme, fontSizeMultiplier, isBoldTextEnabled, isDyslexiaFontEnabled]
  );

  console.log("🔵 [BraillePractice] Tela renderizada - Index:", currentIndex);

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
        console.log("🔊 [BraillePractice] Sons carregados");
      } catch (error) {
        console.warn("❌ [BraillePractice] Erro ao carregar sons:", error);
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
        console.log(`🔊 [BraillePractice] Som tocado: ${soundType}`);
      } catch (error) {
        console.warn(`❌ [BraillePractice] Erro ao tocar ${soundType}:`, error);
      }
    },
    [soundObjects]
  );

  const setupNewChallenge = useCallback(() => {
    if (currentIndex >= initialShuffledChars.length) {
      console.log("🎉 [BraillePractice] Sessão completa!");
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
    console.log(
      `🔄 [BraillePractice] Novo desafio: ${initialShuffledChars[currentIndex]}`
    );
  }, [
    currentIndex,
    initialShuffledChars.length,
    initialShuffledChars,
    playSound,
  ]);

  useEffect(() => {
    setupNewChallenge();
  }, [currentIndex, setupNewChallenge]);

  const handleNext = useCallback(() => {
    console.log("➡️ [BraillePractice] Avançando para próximo");
    setCurrentIndex((prevIndex) => prevIndex + 1);
  }, []);

  const handleDotPress = useCallback(
    (dotNumber: number) => {
      if (isCorrect) return;
      console.log(`👆 [BraillePractice] Dot ${dotNumber} pressionado`);
      setActiveDots((prev) =>
        prev.includes(dotNumber)
          ? prev.filter((d) => d !== dotNumber)
          : [...prev, dotNumber]
      );
    },
    [isCorrect]
  );

  const checkAnswer = useCallback(() => {
    const currentCharacter = initialShuffledChars[currentIndex];
    if (!currentCharacter) return;
    const correctPattern =
      ALL_BRAILLE_CHARS[currentCharacter as keyof typeof ALL_BRAILLE_CHARS];
    const sortedUserPattern = [...activeDots].sort();
    const sortedCorrectPattern = [...correctPattern].sort();

    console.log(`🔍 [BraillePractice] Verificando resposta:`);
    console.log(`   User: [${sortedUserPattern}]`);
    console.log(`   Correct: [${sortedCorrectPattern}]`);

    if (
      JSON.stringify(sortedUserPattern) === JSON.stringify(sortedCorrectPattern)
    ) {
      console.log("✅ [BraillePractice] Resposta CORRETA!");
      setFeedback("Correto! 🎉");
      setIsCorrect(true);
      playSound("correct");
      AccessibilityInfo.announceForAccessibility("Correto!");
    } else {
      console.log("❌ [BraillePractice] Resposta INCORRETA");
      setFeedback("Tente Novamente. 🤔");
      setIsCorrect(false);
      playSound("incorrect");
      AccessibilityInfo.announceForAccessibility("Incorreto, tente novamente.");
    }
  }, [initialShuffledChars, currentIndex, activeDots, playSound]);

  // ✅ Gesture só para mobile
  const panGesture = useMemo(
    () =>
      Platform.OS !== "web"
        ? Gesture.Pan()
            .onStart(() => {
              console.log("👆 [BraillePractice] Pan gesture iniciado");
            })
            .onEnd((event) => {
              console.log(
                `✅ [BraillePractice] Pan finalizado - X: ${event.translationX.toFixed(0)}, Y: ${event.translationY.toFixed(0)}`
              );
              if (
                event.translationX > 50 &&
                Math.abs(event.translationX) > Math.abs(event.translationY)
              ) {
                console.log("🔙 [BraillePractice] Swipe RIGHT → Voltando");
                navigation.goBack();
              }
            })
        : Gesture.Pan(), // Gesture vazio para web
    [navigation]
  );

  const renderContent = () => {
    if (sessionComplete) {
      return (
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
            size={60}
            color="#FFD700"
            importantForAccessibility="no"
          />
          <Text
            style={styles.completionTitle}
            accessible={true}
            accessibilityRole="header"
          >
            Parabéns!
          </Text>
          <Text style={styles.completionSubtitle} accessible={true}>
            Você concluiu a sessão "{title}"!
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              console.log("🔙 [BraillePractice] Voltando para jornada");
              navigation.goBack();
            }}
            accessible={true}
            accessibilityLabel="Voltar para a Jornada"
            accessibilityRole="button"
          >
            <Text
              style={[styles.buttonText, { color: theme.buttonText ?? "#FFF" }]}
            >
              Voltar para a Jornada
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    const currentCharacter = initialShuffledChars[currentIndex];

    return (
      <View style={styles.container}>
        <StatusBar
          barStyle={theme.statusBarStyle}
          backgroundColor={theme.background}
        />
        <View style={styles.header}>
          <Text
            style={styles.titleHeader}
            accessible={true}
            accessibilityRole="header"
          >
            {title}
          </Text>
          <Text
            style={styles.progressIndicator}
            accessible={true}
            accessibilityLabel={`Progresso: ${currentIndex + 1} de ${initialShuffledChars.length}`}
          >
            {currentIndex + 1} / {initialShuffledChars.length}
          </Text>
        </View>
        <Text style={styles.prompt} accessible={true}>
          Forme: <Text style={styles.letter}>{currentCharacter}</Text>
        </Text>
        <View
          style={styles.brailleCell}
          accessible={true}
          accessibilityLabel="Cela Braille com 6 pontos interativos"
        >
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
                accessibilityRole="button"
              >
                <View
                  style={[
                    styles.dot,
                    isActive ? styles.dotActive : styles.dotInactive,
                  ]}
                >
                  <Text style={styles.dotNumber} importantForAccessibility="no">
                    {dotNumber}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
        <View style={styles.feedbackContainer}>
          <Text
            style={[
              styles.feedback,
              { color: isCorrect ? "#28a745" : "#dc3545" },
            ]}
            accessible={true}
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
              accessible={true}
              accessibilityLabel="Ir para o próximo caractere"
              accessibilityRole="button"
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
              accessible={true}
              accessibilityLabel="Verificar resposta"
              accessibilityRole="button"
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
    );
  };

  console.log(`🎨 [BraillePractice] Platform: ${Platform.OS}`);

  // ✅ Só usar GestureDetector em mobile
  if (Platform.OS !== "web" && panGesture) {
    return (
      <GestureDetector gesture={panGesture}>{renderContent()}</GestureDetector>
    );
  }

  return renderContent();
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
      justifyContent: "space-evenly",
      alignItems: "center",
      backgroundColor: theme.background,
      paddingVertical: height * 0.02,
      paddingHorizontal: 16,
    },
    header: {
      alignItems: "center",
      marginTop: 40,
    },
    titleHeader: {
      fontSize: 20 * fontMultiplier,
      fontWeight: isBold ? "bold" : "700",
      color: theme.text,
      fontFamily: isDyslexia ? "OpenDyslexic-Regular" : undefined,
      marginBottom: 4,
    },
    progressIndicator: {
      fontSize: 14 * fontMultiplier,
      color: theme.text,
      opacity: 0.7,
      fontFamily: isDyslexia ? "OpenDyslexic-Regular" : undefined,
    },
    prompt: {
      fontSize: 20 * fontMultiplier,
      fontWeight: isBold ? "bold" : "600",
      color: theme.text,
      textAlign: "center",
      fontFamily: isDyslexia ? "OpenDyslexic-Regular" : undefined,
    },
    letter: {
      color: theme.button ?? "#005a9c",
      fontSize: 24 * fontMultiplier,
      fontWeight: "bold",
    },
    brailleCell: {
      width: width * 0.35,
      height: width * 0.35 * 1.6,
      backgroundColor: theme.card,
      borderRadius: 20,
      flexDirection: "column",
      flexWrap: "wrap",
      alignContent: "center",
      justifyContent: "space-around",
      paddingVertical: 8,
      elevation: 4,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 3,
    },
    dotContainer: {
      width: "50%",
      height: "33%",
      justifyContent: "center",
      alignItems: "center",
    },
    dot: {
      width: 38,
      height: 38,
      borderRadius: 19,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 2,
    },
    dotInactive: {
      backgroundColor: theme.background,
      borderColor: "#c0c8d0",
    },
    dotActive: {
      backgroundColor: theme.button ?? "#005a9c",
      borderColor: "#003d69",
    },
    dotNumber: {
      fontSize: 12 * fontMultiplier,
      color: "rgba(0,0,0,0.4)",
      fontWeight: "bold",
      fontFamily: isDyslexia ? "OpenDyslexic-Regular" : undefined,
    },
    feedbackContainer: {
      height: 28,
      justifyContent: "center",
    },
    feedback: {
      fontSize: 18 * fontMultiplier,
      fontWeight: isBold ? "bold" : "700",
      textAlign: "center",
      fontFamily: isDyslexia ? "OpenDyslexic-Regular" : undefined,
    },
    actionContainer: {
      width: "85%",
      maxWidth: 400,
    },
    button: {
      paddingVertical: 14,
      borderRadius: 16,
      alignItems: "center",
      backgroundColor: theme.button ?? "#007bff",
      width: "100%",
    },
    buttonText: {
      fontSize: 18 * fontMultiplier,
      fontWeight: isBold ? "bold" : "700",
      fontFamily: isDyslexia ? "OpenDyslexic-Regular" : undefined,
    },
    completionTitle: {
      fontSize: 32 * fontMultiplier,
      fontWeight: "bold",
      color: theme.text,
      marginTop: 16,
      marginBottom: 8,
      fontFamily: isDyslexia ? "OpenDyslexic-Regular" : undefined,
    },
    completionSubtitle: {
      fontSize: 18 * fontMultiplier,
      color: theme.text,
      opacity: 0.8,
      textAlign: "center",
      marginBottom: 32,
      paddingHorizontal: 20,
      fontFamily: isDyslexia ? "OpenDyslexic-Regular" : undefined,
    },
  });
